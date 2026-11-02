<?php
declare(strict_types=1);
require_once __DIR__.'/fits-zip.test.php';
require_once __DIR__.'/../backend-ionos/test-download/Coverage.php';
function fixture(array $bad=[],bool $nan=false):array {
    global $primary,$values;
    $v=array_merge($values,['NAXIS1'=>8,'NAXIS2'=>8,'CRPIX1'=>4,'CRPIX2'=>4]);$s='';$w='';
    for($y=0;$y<8;$y++)for($x=0;$x<8;$x++){
        $invalid=in_array([$x,$y],$bad,true);$s.=pack('G',$nan&&$invalid?NAN:($x===3?0:-1));$w.=pack('G',$invalid?0:1);
    }
    $fits=hdu($primary).hdu($v,$s).hdu(array_merge($v,['EXTNAME'=>"'WHT'"]),$w);
    $read=fn($start,$length)=>[substr($fits,$start,$length),strlen($fits)];return [ScienceFits::inspect($read),$read];
}
[$im,$read]=fixture();$crop=FitsCoverage::crop($im,$read,133.89,58.74,1,2);
check($crop['width']===8&&$crop['height']===8,'All valid pixels, including zero and negative SCI, retained');
$bad=[];for($i=0;$i<8;$i++){$bad[]=[0,$i];$bad[]=[$i,0];}
[$im,$read]=fixture($bad,true);$crop=FitsCoverage::crop($im,$read,133.89,58.74,1,2);
check($crop['x']===1&&$crop['y']===1&&$crop['width']===7&&$crop['height']===7,'Invalid border cropped without filling');
$bytes='';FitsCoverage::stream(['crop'=>$crop,'start'=>$im['dataStart']],$read,function($s)use(&$bytes){$bytes.=$s;});
check(strlen($bytes)===196,'Only rectangle bytes streamed');
$fits=$crop['header'].$bytes.str_repeat("\0",(2880-strlen($bytes)%2880)%2880);
$out=ScienceFits::inspect(fn($s,$l)=>[substr($fits,$s,$l),strlen($fits)]);
check($out['values']['CRPIX1']==='3'&&$out['values']['CRPIX2']==='3','Crop preserves sky location by shifting CRPIX');
[$x,$y]=FitsCoverage::targetPixel($out['values'],133.89,58.74);check(abs($x-2)<1e-6&&abs($y-2)<1e-6,'Target coordinate remains correct after crop');
foreach([[3,3],[4,3]] as $hole){
    [$im,$read]=fixture([$hole]);
    try{$c=FitsCoverage::crop($im,$read,133.89,58.74,1,2);check(!($hole[0]>=$c['x']&&$hole[0]<$c['x']+$c['width']&&$hole[1]>=$c['y']&&$hole[1]<$c['y']+$c['height']),'Interior gap excluded');}
    catch(RuntimeException $e){check(str_contains($e->getMessage(),'target'),'Target on gap rejected');}
}
[$im,$read]=fixture();
try{FitsCoverage::crop($im,$read,170,58.74,1,2);throw new RuntimeException('Accepted wrong target');}catch(RuntimeException $e){check(str_contains($e->getMessage(),'outside'),'Wrong target rejected');}
unset($im['planes']);$im['planes']=[];
try{FitsCoverage::crop($im,$read,133.89,58.74,1,2);throw new RuntimeException('Accepted missing WHT');}catch(RuntimeException $e){check(str_contains($e->getMessage(),'WHT'),'Missing coverage rejected');}
echo "Pixel coverage, crop streaming and target WCS tests passed\n";
require_once __DIR__.'/../backend-ionos/lib/MastClient.php';
require_once __DIR__.'/../backend-ionos/test-download/ProductRanker.php';
$r=new TestProductRanker();
foreach(['SCIENCE','DERIVED'] as $type){
    $set=$r->rankProducts([['productFilename'=>'sample_drc.fits','dataURI'=>'mast:HST/product/sample_drc.fits','dataRights'=>'PUBLIC','type'=>'A','productType'=>$type,'productSubGroupDescription'=>'DRC','calib_level'=>3,'size'=>100]],'all');
    check(count($set['products'])===1,'MAST science and derived products retained despite legacy A type');
}
echo "Test-only MAST product classification passed\n";
$raw=json_decode(file_get_contents(__DIR__.'/fixtures/pillars-derived-products.json'),true);
$set=$r->rankProducts($raw,'all');check(count($set['products'])===count($raw),'Actual MAST type D SCIENCE products retained');
echo "Actual Pillars MAST product fixture passed\n";

[$im,$read]=fixture();$im['planes'][1]['values']['CRPIX1']='999';
try{FitsCoverage::crop($im,$read,133.89,58.74,1,2);throw new RuntimeException('Accepted shifted coverage');}catch(RuntimeException $e){check(str_contains($e->getMessage(),'grids'),'Shifted coverage rejected');}
[$im,$read]=fixture();$im['values']['D2IMFILE']='N/A';
check(FitsCoverage::crop($im,$read,133.89,58.74,1,2)['width']===8,'Inactive D2IMFILE provenance does not imply active distortion');
$im['values']['CPDIS1']='LOOKUP';
try{FitsCoverage::crop($im,$read,133.89,58.74,1,2);throw new RuntimeException('Accepted distortion');}catch(RuntimeException $e){check(str_contains($e->getMessage(),'distortion'),'Active distortion rejected');}
echo "Coverage grid and distortion tests passed\n";
