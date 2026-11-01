<?php
declare(strict_types=1);
require_once __DIR__.'/../backend-ionos/test-download/FitsZip.php';
function check(bool $ok,string $why):void {if(!$ok)throw new RuntimeException($why);}
function hdu(array $v,string $data=''):string {
    $cards='';foreach($v as $k=>$x)$cards.=str_pad(str_pad($k,8).'= '.str_pad((string)$x,20,' ',STR_PAD_LEFT),80);
    $cards.=str_pad('END',80);return str_pad($cards,(int)(ceil(strlen($cards)/2880)*2880)).$data.str_repeat("\0",(2880-strlen($data)%2880)%2880);
}
$primary=['SIMPLE'=>'T','BITPIX'=>8,'NAXIS'=>0,'TELESCOP'=>"'HST'",'INSTRUME'=>"'WFPC2'",'FILTNAM1'=>"'F814W'",'TARGNAME'=>"'NGC2685'"];
$values=['XTENSION'=>"'IMAGE'",'BITPIX'=>-32,'NAXIS'=>2,'NAXIS1'=>2,'NAXIS2'=>2,'PCOUNT'=>0,'GCOUNT'=>1,'EXTNAME'=>"'SCI'",'CTYPE1'=>"'RA---TAN'",'CTYPE2'=>"'DEC--TAN'",'CRVAL1'=>133.89,'CRVAL2'=>58.74,'CRPIX1'=>1,'CRPIX2'=>1,'CD1_1'=>-0.00001,'CD1_2'=>0,'CD2_1'=>0,'CD2_2'=>0.00001,'CHECKSUM'=>"'obsolete'"];
$pixels=hex2bin('3f80000040000000404000007fc00000');
$fits=hdu($primary).hdu($values,$pixels).hdu(array_merge($values,['EXTNAME'=>"'WHT'"]),str_repeat("\0",16));
$read=fn($start,$length)=>[substr($fits,$start,$length),strlen($fits)];$im=ScienceFits::inspect($read);
check($im['size']===16,'SCI length');check(ScienceFits::filters($im['values'])===['F814W'],'WFPC2 uses FILTNAM1, not numeric FILTER1');check(count($im['layouts'])===3,'All extensions inspected');check(!str_contains($im['header'],'CHECKSUM'),'Obsolete checksum stripped');
$fp=ScienceFits::footprint($im['values']);check(ScienceFits::overlaps($fp,$fp),'Same WCS overlaps');
$shift=$im['values'];$shift['CRVAL1']='170';check(!ScienceFits::overlaps($fp,ScienceFits::footprint($shift)),'Disjoint WCS rejected');
$name=ScienceFits::filename('Helix Nebula','BLUE','F502N','u39s0401r_drw.fits');check(str_starts_with($name,'Helix_Nebula_Blue_F502N__'),'Readable safe filename');
$multi=$fits.hdu($values,$pixels);try{ScienceFits::inspect(fn($s,$l)=>[substr($multi,$s,$l),strlen($multi)]);throw new RuntimeException('Failed to reject multiple SCI');}catch(RuntimeException $e){check(str_contains($e->getMessage(),'Multiple SCI'),'Multiple SCI rejected');}
$truncated=substr($fits,0,-1);try{ScienceFits::inspect(fn($s,$l)=>[substr($truncated,$s,$l),strlen($truncated)]);throw new RuntimeException('Failed to reject truncation');}catch(RuntimeException $e){check(str_contains($e->getMessage(),'Truncated'),'Truncation rejected');}
$weight=hdu(['SIMPLE'=>'T','BITPIX'=>16,'NAXIS'=>2,'NAXIS1'=>2,'NAXIS2'=>2,'FILETYPE'=>"'WHT'"],str_repeat("\0",8));try{ScienceFits::inspect(fn($s,$l)=>[substr($weight,$s,$l),strlen($weight)]);throw new RuntimeException('Failed to reject weight map');}catch(RuntimeException $e){check(str_contains($e->getMessage(),'No unique'),'Weight map rejected');}
// The same preparation rules work for JWST metadata and blocking filters.
check(ScienceFits::filters(['FILTER'=>'F444W','PUPIL'=>'F405N'])===['F405N'],'NIRCam blocking filter not a colour channel');
check(str_starts_with(ScienceFits::filename('M51','RED','F770W','jw00001_i2d.fits'),'M51_Red_F770W__'),'Generic target naming');
check(ScienceFits::overlaps($fp,ScienceFits::footprint(array_merge($im['values'],['CRVAL1'=>'133.890001']))),'Close fields overlap');
$actual=json_decode((string)file_get_contents(__DIR__.'/fixtures/wfpc2-drw-headers.json'),true);
foreach($actual['files'] as $row){
    check(ScienceFits::filters($row['scienceValues'])===$row['filters'],'Actual WFPC2 filter metadata');
    check(array_column($row['extensions'],'name')===['PRIMARY','SCI','WHT','CTX','HDRTAB'],'Actual WFPC2 HDUs distinguish science from support maps');
    check($row['sourceTarget']==='NGC2685','Helix Galaxy must not be labelled Helix Nebula');
    $actualFoot=ScienceFits::footprint($row['scienceValues']);
    if(isset($firstActualFoot))check(ScienceFits::overlaps($actualFoot,$firstActualFoot),'Actual WFPC2 three-filter field overlap');
    $firstActualFoot=$actualFoot;
}
$out=fopen($argv[1]??'php://temp','w+b');$zip=new FitsZipWriter(fn($s)=>fwrite($out,$s));$zip->file($name,strlen($im['header'])+2880,function($emit)use($im,$pixels){$emit($im['header']);$emit($pixels);$emit(str_repeat("\0",2880-16));});$zip->text('FILES_AND_FILTERS.json',json_encode(['filter'=>'F814W']));$zip->finish();fclose($out);
echo "FITS preflight and streaming ZIP tests passed\n";
