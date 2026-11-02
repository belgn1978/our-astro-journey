<?php
declare(strict_types=1);
/** Conservative coverage gate: never fills, interpolates or resamples pixels. */
final class FitsCoverage {
    public static function targetPixel(array $v, float $ra, float $dec): array {
        ScienceFits::footprint($v);
        if (($v['CTYPE1']??'')!=='RA---TAN'||($v['CTYPE2']??'')!=='DEC--TAN') throw new RuntimeException('Distorted or non-TAN coordinates need desktop verification.');
        foreach(array_keys($v) as $key)if(preg_match('/^(CPDIS[12]|DP[12](\.|$)|D2IMDIS[12]|D2IM[12](\.|$)|PV[12]_)/',$key))throw new RuntimeException('External distortion corrections are unsupported.');
        $n=fn($k,$default=0)=>(float)str_replace('D','E',(string)($v[$k]??$default));
        $r=deg2rad($ra-$n('CRVAL1'));$d=deg2rad($dec);$d0=deg2rad($n('CRVAL2'));$den=sin($d)*sin($d0)+cos($d)*cos($d0)*cos($r);
        if($den<=0)throw new RuntimeException('The target is outside the image sky projection.');
        $x=rad2deg(cos($d)*sin($r)/$den);$y=rad2deg((sin($d)*cos($d0)-cos($d)*sin($d0)*cos($r))/$den);
        $a=$n('CD1_1',$n('CDELT1')*$n('PC1_1',1));$b=$n('CD1_2',$n('CDELT1')*$n('PC1_2'));$c=$n('CD2_1',$n('CDELT2')*$n('PC2_1'));$e=$n('CD2_2',$n('CDELT2')*$n('PC2_2',1));$det=$a*$e-$b*$c;
        return [($e*$x-$b*$y)/$det+$n('CRPIX1')-1,(-$c*$x+$a*$y)/$det+$n('CRPIX2')-1];
    }
    public static function crop(array $im, callable $read, float $ra, float $dec, int $tile=64, int $minimum=256): array {
        $v=$im['values'];$w=(int)$v['NAXIS1'];$h=(int)$v['NAXIS2'];[$px,$py]=self::targetPixel($v,$ra,$dec);
        if($px<-.5||$py<-.5||$px>=$w-.5||$py>=$h-.5)throw new RuntimeException('The requested target is outside the science image.');
        $tx=(int)floor(($px+.5)/$tile);$ty=(int)floor(($py+.5)/$tile);
        $weights=array_values(array_filter($im['planes'],fn($p)=>($p['values']['EXTNAME']??'')==='WHT'&&($p['values']['NAXIS1']??0)==$w&&($p['values']['NAXIS2']??0)==$h));
        if(count($weights)!==1)throw new RuntimeException('No unique matching WHT coverage map; gap-free coverage cannot be verified.');
        foreach(['CRVAL1','CRVAL2','CRPIX1','CRPIX2','CD1_1','CD1_2','CD2_1','CD2_2','CDELT1','CDELT2','PC1_1','PC1_2','PC2_1','PC2_2','CTYPE1','CTYPE2'] as $key){
            if(isset($weights[0]['values'][$key])&&($weights[0]['values'][$key]!==($v[$key]??null)))throw new RuntimeException('Science and coverage coordinate grids disagree.');
        }
        $cols=(int)ceil($w/$tile);$rows=(int)ceil($h/$tile);if($cols*$rows>1000000||$rows>2048)throw new RuntimeException('Coverage grid exceeds the test limit.');
        $valid=array_fill(0,$rows,str_repeat("\1",$cols));
        foreach([[$im,false],[$weights[0],true]] as [$plane,$weight]){
            $pv=$plane['values'];$bp=(int)$pv['BITPIX'];if(!in_array($bp,[-32,-64],true))throw new RuntimeException('Coverage scan requires floating-point SCI and WHT planes.');
            $bytes=abs($bp)/8;$num=fn($s)=>(float)str_replace('D','E',(string)$s);$scale=$num($pv['BSCALE']??1);$zero=$num($pv['BZERO']??0);
            if(!is_finite($scale)||!is_finite($zero))throw new RuntimeException('Invalid FITS scaling.');
            for($offset=0;$offset<$plane['size'];$offset+=$length){
                $length=min(4194304,$plane['size']-$offset);[$chunk]=$read($plane['dataStart']+$offset,$length);if(strlen($chunk)!==$length)throw new RuntimeException('Incomplete coverage scan.');
                foreach(unpack(($bp===-32?'G':'E').'*',$chunk) as $i=>$value){$idx=intdiv($offset,$bytes)+$i-1;$value=$value*$scale+$zero;
                    if(!is_finite($value)||($weight&&$value<=0)){$cy=intdiv(intdiv($idx,$w),$tile);$cx=intdiv($idx%$w,$tile);$valid[$cy][$cx]="\0";}
                }
            }
        }
        if($valid[$ty][$tx]!=="\1")throw new RuntimeException('The requested target lies on missing/invalid pixels or too close to a detector gap.');
        $left=[];$right=[];
        for($y=0;$y<$rows;$y++){
            if($valid[$y][$tx]!=="\1"){$left[$y]=$cols;$right[$y]=-1;continue;}
            $l=$tx;$r=$tx;while($l>0&&$valid[$y][$l-1]==="\1")$l--;while($r+1<$cols&&$valid[$y][$r+1]==="\1")$r++;$left[$y]=$l;$right[$y]=$r;
        }
        $best=null;$area=0;$upperL=0;$upperR=$cols-1;
        for($top=$ty;$top>=0;$top--){
            $upperL=max($upperL,$left[$top]);$upperR=min($upperR,$right[$top]);if($upperL>$tx||$upperR<$tx)break;$l=$upperL;$r=$upperR;
            for($bottom=$ty;$bottom<$rows;$bottom++){
                $l=max($l,$left[$bottom]);$r=min($r,$right[$bottom]);if($l>$tx||$r<$tx)break;
                $cw=min($w,($r+1)*$tile)-$l*$tile;$ch=min($h,($bottom+1)*$tile)-$top*$tile;
                if($cw>=$minimum&&$ch>=$minimum&&$cw*$ch>$area){$area=$cw*$ch;$best=['x'=>$l*$tile,'y'=>$top*$tile,'width'=>$cw,'height'=>$ch];}
            }
        }
        if(!$best||$area<$w*$h*.05)throw new RuntimeException('No sufficiently large gap-free rectangle containing the target. Choose another dataset.');
        $header=$im['header'];$changes=['NAXIS1'=>$best['width'],'NAXIS2'=>$best['height'],'CRPIX1'=>(float)str_replace('D','E',$v['CRPIX1'])-$best['x'],'CRPIX2'=>(float)str_replace('D','E',$v['CRPIX2'])-$best['y']];
        for($i=0;$i<strlen($header);$i+=80){$key=ScienceFits::key(substr($header,$i,80));if(array_key_exists($key,$changes))$header=substr_replace($header,str_pad(str_pad($key,8).'= '.str_pad(sprintf('%.14G',$changes[$key]),20,' ',STR_PAD_LEFT),80),$i,80);}
        $best['header']=$header;$best['size']=(int)($best['width']*$best['height']*abs((int)$v['BITPIX'])/8);$best['sourceWidth']=$w;$best['bytesPerPixel']=(int)(abs((int)$v['BITPIX'])/8);return $best;
    }
    public static function stream(array $p, callable $read, callable $emit): void {
        $crop=$p['crop'];$b=$crop['bytesPerPixel'];$rowBytes=$crop['width']*$b;$batch=max(1,(int)floor(1048576/($crop['sourceWidth']*$b)));
        for($y=0;$y<$crop['height'];$y+=$n){$n=min($batch,$crop['height']-$y);$offset=$p['start']+(($crop['y']+$y)*$crop['sourceWidth']+$crop['x'])*$b;$length=(($n-1)*$crop['sourceWidth']+$crop['width'])*$b;[$chunk]=$read($offset,$length);
            if(strlen($chunk)!==$length)throw new RuntimeException('Incomplete crop download.');for($j=0;$j<$n;$j++)$emit(substr($chunk,$j*$crop['sourceWidth']*$b,$rowBytes));
        }
    }
}
