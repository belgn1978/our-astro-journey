<?php
declare(strict_types=1);
require_once __DIR__.'/../backend-ionos/test-download/FitsZip.php';
$path=$argv[1]??'/tmp/pillars-live-processing.zip';
$stream=fopen($path,'wb');
if(!$stream)throw new RuntimeException('Cannot create temporary ZIP.');
$zip=new FitsZipWriter(function(string $chunk)use($stream){if(fwrite($stream,$chunk)!==strlen($chunk))throw new RuntimeException('Incomplete ZIP output');});
$manifest=[];$footprints=[];$seen=[];
foreach(['F502N'=>'BLUE','F657N'=>'GREEN','F673N'=>'RED'] as $filter=>$colour) {
    $original='hst_13926_06_wfc3_uvis_'.strtolower($filter).'_ick906_drc.fits';
    $uri='mast:HST/product/'.$original;
    $reader=new MastRanges($uri);
    $image=ScienceFits::inspect(fn(int $start,int $length)=>[$reader->range($start,$length),$reader->total]);
    $v=$image['values'];
    ColourSetSelection::validateActualFilter(ScienceFits::filters($v),[$filter],$seen);
    $foot=ScienceFits::footprint($v);
    foreach($footprints as $other)if(!ScienceFits::overlaps($foot,$other))throw new RuntimeException('No overlapping science fields');
    $footprints[]=$foot;
    $padding=(2880-$image['size']%2880)%2880;
    $name=ScienceFits::filename('Pillars of Creation',$colour,$filter,$original);
    $length=strlen($image['header'])+$image['size']+$padding;
    $zip->file($name,$length,function(callable $emit)use($image,$uri,$padding){
        $emit($image['header']);
        $reader=new MastRanges($uri);
        $reader->range($image['dataStart'],$image['size'],$emit);
        if($reader->total!==$image['total'])throw new RuntimeException('Source size changed');
        if($padding)$emit(str_repeat("\0",$padding));
    });
    $manifest[]=['filter'=>$filter,'filename'=>$name,'source'=>$uri,'scienceBytes'=>$image['size']];
    echo $filter.' full science plane streamed: '.$image['size']." bytes\n";
}
$zip->text('FILES_AND_FILTERS.json',json_encode(['files'=>$manifest],JSON_PRETTY_PRINT));
$zip->finish();
fclose($stream);
echo 'Completed ZIP: '.filesize($path)." bytes\n";
