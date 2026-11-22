<?php
declare(strict_types=1);
require_once __DIR__.'/../backend-ionos/test-download/FitsZip.php';
$filters=['F502N','F657N','F673N'];$footprints=[];$seen=[];$instrument='';
foreach($filters as $filter){
    $filename='hst_13926_06_wfc3_uvis_'.strtolower($filter).'_ick906_drc.fits';
    $reader=new MastRanges('mast:HST/product/'.$filename);
    $science=ScienceFits::inspect(fn(int $start,int $length)=>[$reader->range($start,$length),$reader->total]);
    $actual=ScienceFits::filters($science['values']);
    ColourSetSelection::validateActualFilter($actual,[$filter],$seen);
    $v=$science['values'];
    $identity=($v['TELESCOP']??'').'/'.($v['INSTRUME']??'');
    if($instrument!==''&&$identity!==$instrument)throw new RuntimeException('Incompatible instruments');
    $instrument=$identity;
    $footprint=ScienceFits::footprint($v);
    foreach($footprints as $other)if(!ScienceFits::overlaps($footprint,$other))throw new RuntimeException('No sky overlap for '.$filter);
    $footprints[]=$footprint;
    if((int)$v['NAXIS1']!==6420||(int)$v['NAXIS2']!==6555)throw new RuntimeException('Unexpected SCI dimensions');
    if((int)$science['size']!==6420*6555*4)throw new RuntimeException('Unexpected SCI payload size');
    echo $filter.' actual filter confirmed; '.$identity.'; SCI '. $v['NAXIS1'].'x'.$v['NAXIS2'].'; '.count($science['layouts'])." HDUs; overlap confirmed\n";
}
echo "Backend PHP inspection of all three live MAST science products passed.\n";
