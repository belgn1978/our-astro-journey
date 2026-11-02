<?php
require __DIR__.'/../backend-ionos/test-download/FitsZip.php';
require __DIR__.'/../backend-ionos/test-download/Coverage.php';
$f=$argv[1];$fp=fopen($f,'rb');$total=filesize($f);$read=function($start,$length)use($fp,$total){fseek($fp,$start);return [fread($fp,$length),$total];};
try{
 $im=ScienceFits::inspect($read);echo json_encode(['values'=>$im['values'],'layouts'=>$im['layouts']],JSON_PRETTY_PRINT)."\n";
 $crop=FitsCoverage::crop($im,$read,274.7196666666667,-13.83943611111111);$summary=$crop;unset($summary['header']);echo json_encode($summary,JSON_PRETTY_PRINT)."\n";
 $out=fopen($argv[2],'wb');fwrite($out,$crop['header']);FitsCoverage::stream(['crop'=>$crop,'start'=>$im['dataStart']],$read,fn($s)=>fwrite($out,$s));fwrite($out,str_repeat("\0",(2880-$crop['size']%2880)%2880));fclose($out);
}catch(Throwable $e){echo 'REJECTED: '.$e->getMessage()."\n";exit(2);}
