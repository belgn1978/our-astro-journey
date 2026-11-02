<?php
declare(strict_types=1);

/** Bounded MAST range reader: no archive files are stored on this host. */
final class MastRanges {
    public string $url;
    public int $total = 0;
    public function __construct(string $uri) {
        if (!preg_match('~^mast:(HST|JWST)/product/[A-Za-z0-9._-]+\.fits$~', $uri)) throw new RuntimeException('Only public HST/JWST FITS archive products are supported.');
        $this->url = 'https://mast.stsci.edu/api/v0.1/Download/file?uri=' . rawurlencode($uri);
    }
    public function range(int $start, int $length, ?callable $sink = null): string {
        $out = ''; $received = 0; $status = 0; $rangeStart = -1; $rangeEnd = -1;
        $ch = curl_init($this->url);
        curl_setopt_array($ch, [CURLOPT_RANGE => $start . '-' . ($start + $length - 1), CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_CONNECTTIMEOUT => 20, CURLOPT_TIMEOUT => $sink ? 600 : 60,
            CURLOPT_USERAGENT => 'OurAstroJourney-FITS-test/7', CURLOPT_BUFFERSIZE => 65536,
            CURLOPT_HEADERFUNCTION => function ($ch, string $line) use (&$status, &$rangeStart, &$rangeEnd): int {
                if (preg_match('~^HTTP/\S+ (\d+)~', $line, $m)) $status = (int)$m[1];
                if (preg_match('~^Content-Range:\s*bytes (\d+)-(\d+)/(\d+)~i', $line, $m)) {
                    $rangeStart=(int)$m[1]; $rangeEnd=(int)$m[2]; $this->total=(int)$m[3];
                }
                return strlen($line);
            }, CURLOPT_WRITEFUNCTION => function ($ch, string $chunk) use (&$out, &$received, &$status, &$rangeStart, &$rangeEnd, $start, $length, $sink): int {
                if ($status !== 206 || $rangeStart !== $start || $rangeEnd < $start || $rangeEnd >= $start + $length || $received + strlen($chunk) > $length) return 0;
                $received += strlen($chunk);
                if ($sink) $sink($chunk); else $out .= $chunk;
                return strlen($chunk);
            }]);
        $ok = curl_exec($ch); $error=curl_error($ch); curl_close($ch);
        if ($ok === false || $status !== 206 || $rangeStart !== $start || $received !== min($length, $this->total - $start)) throw new RuntimeException('Archive range download failed; retry later. ' . ($error ? 'The archive connection was interrupted.' : ''));
        return $out;
    }
}

final class ScienceFits {
    public static function key(string $card): string { return trim(substr($card,0,8)); }
    public static function value(string $card): string {
        $s=trim(substr($card,10));
        if (str_starts_with($s,"'")) { preg_match("/^'((?:[^']|'')*)'/",$s,$m);return trim(str_replace("''", "'",$m[1]??'')); }
        return trim(explode('/',$s,2)[0]);
    }
    /** Reader is injectable so the exact remote-header logic is tested on fixtures. */
    public static function inspect(callable $read): array {
        $offset=0; $primary=[]; $primaryValues=[]; $images=[]; $layouts=[]; $total=PHP_INT_MAX;
        for ($hdu=0; $hdu<64 && $offset<$total; $hdu++) {
            $header='';$cards=[];$values=[];$ended=false;
            for ($part=0;$part<8&&!$ended;$part++) {
                [$block,$total]=$read($offset+strlen($header),32768*5); // 160 KiB, always multiple of 80
                $begin=strlen($header);$header.=$block;
                for ($i=$begin;$i+80<=strlen($header);$i+=80) {
                    $card=substr($header,$i,80);$k=self::key($card);
                    if ($k==='END') { $headerLength=(int)(ceil(($i+80)/2880)*2880);$ended=true;break; }
                    $cards[]=$card;if (substr($card,8,2)==='= ') $values[$k]=self::value($card);
                }
            }
            if (!$ended) throw new RuntimeException('Incomplete or excessively large FITS header.');
            if (!$hdu && ($values['SIMPLE']??'')!=='T') throw new RuntimeException('The archive returned something other than FITS.');
            $axes=(int)($values['NAXIS']??-1);$bitpix=(int)($values['BITPIX']??0);
            if ($axes<0||$axes>9||!in_array($bitpix,[8,16,32,64,-32,-64],true)) throw new RuntimeException('Unsupported FITS layout.');
            if (($values['GROUPS']??'')==='T') throw new RuntimeException('Random-group FITS is not supported.');
            $pixels=$axes?1:0;
            for ($n=1;$n<=$axes;$n++) { $dim=(int)($values['NAXIS'.$n]??-1);if ($dim<0||$dim>1000000)throw new RuntimeException('Invalid image dimensions.');$pixels*=$dim; }
            $size=($pixels+(int)($values['PCOUNT']??0))*(int)($values['GCOUNT']??1)*abs($bitpix)/8;
            if (!is_finite((float)$size)||$size<0||$size>8*1024**3) throw new RuntimeException('Image exceeds the supported 8 GiB plane limit.');
            $size=(int)$size;$dataStart=$offset+$headerLength;$next=$dataStart+(int)(ceil($size/2880)*2880);
            if ($next>$total||$next<=$offset) throw new RuntimeException('Truncated FITS product.');
            $name=strtoupper($values['EXTNAME']??'');
            $layouts[]=['hdu'=>$hdu,'name'=>$name?:'PRIMARY','naxis'=>$axes,'size'=>$size,'dataStart'=>$dataStart];
            if (!$hdu) { $primary=$cards;$primaryValues=$values; }
            if ($axes===2&&$pixels>0&&(!$hdu||($values['XTENSION']??'')==='IMAGE')&&($values['ZIMAGE']??'F')!=='T') {
                $images[]=['cards'=>$cards,'values'=>$values,'dataStart'=>$dataStart,'size'=>$size,'primary'=>$hdu===0];
            }
            $offset=$next;
        }
        if ($offset!==$total) throw new RuntimeException('Unsupported number of FITS extensions.');
        $science=array_values(array_filter($images,fn($im)=>strtoupper($im['values']['EXTNAME']??'')==='SCI'));
        if (count($science)>1) throw new RuntimeException('Multiple SCI detectors: this product needs a detector choice in desktop software. Choose a combined mosaic instead.');
        $image=$science[0]??null;
        if (!$image) {
            $prim=array_values(array_filter($images,fn($im)=>$im['primary']));
            // Explicitly reject primary quality/weight maps, not merely any 2-D array.
            if (count($prim)===1&&!preg_match('/WHT|WEIGHT|CONTEXT|QUALITY|ERR|DQ/i',($primaryValues['FILETYPE']??'').' '.($primaryValues['EXTNAME']??''))) $image=$prim[0];
        }
        if (!$image) throw new RuntimeException('No unique uncompressed 2-D science image. Choose a combined SCI product instead.');
        $v=$image['values'];
        $skip='/^(SIMPLE|XTENSION|BITPIX|NAXIS\d*|PCOUNT|GCOUNT|EXTEND|EXTNAME|EXTVER|CHECKSUM|DATASUM|THEAP|END)$/';
        $make=fn($k,$v)=>str_pad(str_pad($k,8).'= '.str_pad((string)$v,20,' ',STR_PAD_LEFT),80);
        $out=[$make('SIMPLE','T'),$make('BITPIX',$v['BITPIX']),$make('NAXIS',2),$make('NAXIS1',$v['NAXIS1']),$make('NAXIS2',$v['NAXIS2'])];
        foreach ($image['cards'] as $c) if (!preg_match($skip,self::key($c))) $out[]=$c;
        foreach (['TELESCOP','INSTRUME','FILTER','FILTER1','FILTER2','FILTNAM1','FILTNAM2','PUPIL','OBJECT','TARGNAME','PROPOSID','PROGRAM','DETECTOR','EXPTIME','DATE-OBS'] as $k) {
            if (isset($v[$k])) continue;
            foreach ($primary as $c) if (self::key($c)===$k) { $out[]=$c;$v[$k]=self::value($c);break; }
        }
        $out[]=str_pad('HISTORY OAJ: one science image extracted; original pixel bytes unchanged.',80);
        $out[]=str_pad('END',80);$h=implode('',$out);$image['header']=str_pad($h,(int)(ceil(strlen($h)/2880)*2880));
        $image['values']=$v;$image['planes']=$images;$image['layouts']=$layouts;$image['total']=$total;
        return $image;
    }
    public static function filters(array $v): array {
        $out=[];
        foreach (['FILTER','FILTNAM1','FILTNAM2','FILTER1','FILTER2','PUPIL'] as $k) {
            $f=strtoupper(trim($v[$k]??''));if(preg_match('/^F\d{3,4}(?:W2|W|M|N|LP|X)$/',$f))$out[]=$f;
        }
        // NIRCam blocking filters are not separate science channels.
        if(array_intersect($out,['F162M','F164N']))$out=array_diff($out,['F150W2']);
        if(in_array('F323N',$out,true))$out=array_diff($out,['F322W2']);
        if(array_intersect($out,['F405N','F466N','F470N']))$out=array_diff($out,['F444W']);
        return array_values(array_unique($out));
    }
    public static function filename(string $target,string $colour,string $filter,string $original): string {
        $clean=fn($s)=>trim(preg_replace('/[^A-Za-z0-9]+/','_',$s)??'','_');
        return substr($clean($target)?:'Target',0,70).'_'.($clean(ucfirst(strtolower($colour)))?:'Channel').'_'.$clean($filter).'__'.$clean(preg_replace('/\.fits$/i','',$original)).'.fits';
    }
    /** Bounding overlap check in a common tangent plane; no pixel resampling. */
    public static function footprint(array $v): array {
        foreach(['CRVAL1','CRVAL2','CRPIX1','CRPIX2','NAXIS1','NAXIS2'] as $k) if(!isset($v[$k])||!is_numeric(str_replace('D','E',$v[$k])))throw new RuntimeException('Missing image coordinates; cannot verify that these filters cover the same field.');
        $num=fn($k,$d=0)=>(float)str_replace('D','E',$v[$k]??(string)$d);
        if(!str_contains($v['CTYPE1']??'','RA---TAN')||!str_contains($v['CTYPE2']??'','DEC--TAN'))throw new RuntimeException('Unsupported sky projection; cannot verify colour-field overlap.');
        $a=$num('CD1_1',$num('CDELT1',0)*$num('PC1_1',1));$b=$num('CD1_2',$num('CDELT1',0)*$num('PC1_2',0));
        $c=$num('CD2_1',$num('CDELT2',0)*$num('PC2_1',0));$d=$num('CD2_2',$num('CDELT2',0)*$num('PC2_2',1));
        if(abs($a*$d-$b*$c)<1e-18)throw new RuntimeException('Invalid image coordinate matrix.');
        $r=deg2rad($num('CRVAL1'));$dec=deg2rad($num('CRVAL2'));$points=[];
        foreach([[0.5,0.5],[$num('NAXIS1')+0.5,0.5],[$num('NAXIS1')+0.5,$num('NAXIS2')+0.5],[0.5,$num('NAXIS2')+0.5]] as [$px,$py]){
            $x=deg2rad($a*($px-$num('CRPIX1'))+$b*($py-$num('CRPIX2')));$y=deg2rad($c*($px-$num('CRPIX1'))+$d*($py-$num('CRPIX2')));
            $den=cos($dec)-$y*sin($dec);$points[]=[rad2deg($r+atan2($x,$den)),rad2deg(atan2(sin($dec)+$y*cos($dec),sqrt($den*$den+$x*$x)))];
        }
        return $points;
    }
    public static function overlaps(array $a,array $b): bool {
        $ref=$a[0];$project=function($p)use($ref){$ra=fmod($p[0]-$ref[0]+540,360)-180;return [$ra*cos(deg2rad($ref[1])),$p[1]-$ref[1]];};
        $a=array_map($project,$a);$b=array_map($project,$b);
        foreach([$a,$b] as $poly)for($i=0;$i<4;$i++){
            $j=($i+1)%4;$axis=[$poly[$j][1]-$poly[$i][1],$poly[$i][0]-$poly[$j][0]];
            $dot=fn($p)=>$p[0]*$axis[0]+$p[1]*$axis[1];$pa=array_map($dot,$a);$pb=array_map($dot,$b);
            if(max($pa)<=min($pb)||max($pb)<=min($pa))return false;
        }
        return true;
    }
}

/** Store-only ZIP64 writer. O(64 KiB) payload memory, CRC checked by unzip. */
final class FitsZipWriter {
    private $sink;private int $offset=0;private array $central=[];
    public function __construct(callable $sink){$this->sink=$sink;}
    private function write(string $s):void {($this->sink)($s);$this->offset+=strlen($s);}
    public function file(string $name,int $size,callable $produce):void {
        $start=$this->offset;$extra=pack('vvPP',1,16,$size,$size);$flags=0x808;
        $this->write(pack('VvvvvvVVVvv',0x04034b50,45,$flags,0,0,33,0,0xffffffff,0xffffffff,strlen($name),strlen($extra)).$name.$extra);
        $crc=hash_init('crc32b');$written=0;
        $produce(function(string $chunk)use($crc,&$written,$size){$written+=strlen($chunk);if($written>$size)throw new RuntimeException('Archive returned too many image bytes.');hash_update($crc,$chunk);$this->write($chunk);});
        if($written!==$size)throw new RuntimeException('Incomplete science image download.');
        $sum=(int)hexdec(hash_final($crc));$this->write(pack('VVPP',0x08074b50,$sum,$size,$size));
        $extra=pack('vvPPP',1,24,$size,$size,$start);
        $this->central[]=pack('VvvvvvvVVVvvvvvVV',0x02014b50,45,45,$flags,0,0,33,$sum,0xffffffff,0xffffffff,strlen($name),strlen($extra),0,0,0,0,0xffffffff).$name.$extra;
    }
    public function text(string $name,string $text):void{$this->file($name,strlen($text),fn($emit)=>$emit($text));}
    public function finish():void{
        $start=$this->offset;foreach($this->central as $entry)$this->write($entry);$size=$this->offset-$start;$end=$this->offset;$n=count($this->central);
        $this->write(pack('VPvvVVPPPP',0x06064b50,44,45,45,0,0,$n,$n,$size,$start));
        $this->write(pack('VVPV',0x07064b50,0,$end,1));
        $this->write(pack('VvvvvVVv',0x06054b50,0,0,0xffff,0xffff,0xffffffff,0xffffffff,0));
    }
}
