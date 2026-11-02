<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/bootstrap.php';
require_once __DIR__ . '/FitsZip.php';
require_once __DIR__ . '/Coverage.php';
header('Cache-Control: no-store');
$method=$_SERVER['REQUEST_METHOD']??'GET';
if($method==='GET'&&($_GET['health']??'')==='1')Response::ok(['version'=>8,'streamingZip'=>true,'pixelCoverage'=>true]);
oaj_rate_limit();
$dir=rtrim((string)($OAJ_CONFIG['cache_dir']??dirname(__DIR__).'/cache'),'/').'/fits-test-plans';
if(!is_dir($dir)&&!mkdir($dir,0700,true)&&!is_dir($dir))Response::error('SERVER_ERROR','Download preparation is unavailable.',503);
try {
    if($method==='POST') {
        @set_time_limit(900);
        $raw=(string)file_get_contents('php://input');if(strlen($raw)>32000)throw new RuntimeException('Download selection is too large.');
        $body=json_decode($raw,true,32,JSON_THROW_ON_ERROR);$items=$body['items']??[];
        if(!is_array($items)||!count($items)||count($items)>12)throw new RuntimeException('Choose between 1 and 12 combined image files for one ZIP.');
        $prepared=[];$names=[];$footprints=[];$seen=[];$target=trim((string)($body['targetLabel']??''));
        if($target===''||strlen($target)>200)throw new RuntimeException('Choose a target before preparing the ZIP.');
        $query=trim((string)($body['targetQuery']??''));
        if($query==='')throw new RuntimeException('Search again and rebuild the basket to verify the target coordinates.');
        // Verified ESA/Hubble heic1501a field centre; do not reuse the old shared alias.
        $resolved=preg_match('/^pillars(?: of creation)?$/i',$query)
            ? ['ra'=>274.7196666666667,'dec'=>-13.83943611111111,'source'=>'ESA/Hubble heic1501a']
            : (new TargetResolver(oaj_client()))->resolve($query);
        $instrument='';$programme='';$filterClass='';$usedFilters=[];$total=0;
        foreach($items as $item) {
            $uri=(string)($item['dataUri']??'');$filename=basename($uri);
            if(isset($seen[$uri]))continue;$seen[$uri]=true;
            if(!preg_match('/_(drc|drz|drw|i2d)\.fits$/i',$filename))throw new RuntimeException($filename.': choose a combined/calibrated image, rather than raw exposures or support files.');
            $reader=new MastRanges($uri);
            $image=ScienceFits::inspect(function(int $start,int $length)use($reader){return [$reader->range($start,$length),$reader->total];});
            $crop=FitsCoverage::crop($image,fn($start,$length)=>[$reader->range($start,$length),$reader->total],(float)$resolved['ra'],(float)$resolved['dec']);
            $v=$image['values'];$filters=ScienceFits::filters($v);$expected=array_map('strtoupper',$item['filters']??[]);
            if(count($filters)!==1||count($expected)!==1||$filters[0]!==$expected[0])throw new RuntimeException($filename.': the actual FITS filter does not match the selected channel. No ZIP was created.');
            $scope=strtoupper(trim($v['TELESCOP']??''));$inst=strtoupper(trim($v['INSTRUME']??''));
            if(!in_array($scope,['HST','JWST'],true)||$inst==='')throw new RuntimeException('Missing telescope/instrument metadata in the science product.');
            $pid=trim($v['PROPOSID']??$v['PROGRAM']??'');
            if($pid==='')throw new RuntimeException('Missing programme metadata; a compatible colour set cannot be verified.');
            if($programme!==''&&$programme!==$pid)throw new RuntimeException('Choose one observing programme per colour set.');$programme=$pid;
            $class=str_ends_with($filters[0],'N')?'narrowband':'continuum';
            if($filterClass!==''&&$class!==$filterClass)throw new RuntimeException('Do not mix narrowband emission-line and continuum filters in an automatic colour set.');$filterClass=$class;
            if(isset($usedFilters[$filters[0]]))throw new RuntimeException('Select distinct filters for the colour set.');$usedFilters[$filters[0]]=true;
            $identity=$scope.'/'.$inst.'/'.($v['DETECTOR']??'');
            if($instrument!==''&&$instrument!==$identity)throw new RuntimeException('Choose files from the same telescope and instrument for one colour set.');$instrument=$identity;
            if(($scope==='HST'&&!str_starts_with($uri,'mast:HST/'))||($scope==='JWST'&&!str_starts_with($uri,'mast:JWST/')))throw new RuntimeException('Archive mission and FITS telescope do not match.');
            foreach(['FILTER1','FILTER2'] as $k)if(str_starts_with(strtoupper($v[$k]??''),'POL'))throw new RuntimeException('Polarised data needs specialist processing; select a normal combined image.');
            $foot=ScienceFits::footprint($v);foreach($footprints as $other)if(!ScienceFits::overlaps($foot,$other))throw new RuntimeException('These science images cover different sky fields. Select an overlapping colour set.');$footprints[]=$foot;
            $colour=strtoupper((string)($item['channelColor']??''));if(!in_array($colour,['BLUE','GREEN','RED'],true))$colour='Channel';
            $name=ScienceFits::filename($target,$colour,$filters[0],$filename);if(isset($names[$name]))throw new RuntimeException('Duplicate output names; remove duplicate channels.');$names[$name]=true;
            $prepared[]=['uri'=>$uri,'original'=>$filename,'filename'=>$name,'filter'=>$filters[0],'colour'=>$colour,'target'=>$v['TARGNAME']??$v['OBJECT']??'', 'width'=>$crop['width'],'height'=>$crop['height'],'crop'=>array_diff_key($crop,['header'=>true]),'verifiedTarget'=>$resolved,'instrument'=>$identity,'footprint'=>$foot,'header'=>$crop['header'],'start'=>$image['dataStart'],'size'=>$crop['size'],'sourceSize'=>$image['total']];
            $total+=strlen($crop['header'])+$crop['size']+(2880-$crop['size']%2880)%2880;
            if($total>8*1024**3)throw new RuntimeException('This selection exceeds the 8 GiB test ZIP limit. Download fewer channels at once.');
        }
        if(!$prepared)throw new RuntimeException('No image files were selected.');
        $token=bin2hex(random_bytes(24));$path=$dir.'/'.hash('sha256',$token).'.json';
        $zipName=preg_replace('/[^A-Za-z0-9_-]+/','_',substr($target,0,80)).'_Processing_FITS.zip';
        $plan=['version'=>8,'expires'=>time()+1800,'target'=>$target,'zipName'=>$zipName,'items'=>$prepared];
        if(file_put_contents($path,json_encode($plan,JSON_THROW_ON_ERROR),LOCK_EX)===false)throw new RuntimeException('Could not prepare a download.');chmod($path,0600);
        foreach(glob($dir.'/*.json')?:[] as $old)if(filemtime($old)<time()-3600)@unlink($old);
        Response::ok(['token'=>$token,'filename'=>$zipName,'totalBytes'=>$total,'files'=>array_map(fn($p)=>['filename'=>$p['filename'],'filter'=>$p['filter'],'width'=>$p['width'],'height'=>$p['height']],$prepared)]);
    }
    if($method!=='GET')Response::error('METHOD_NOT_ALLOWED','Use POST to prepare the ZIP, then its returned download link.',405);
    $token=(string)($_GET['token']??'');if(!preg_match('/^[a-f0-9]{48}$/',$token))throw new RuntimeException('Prepare a ZIP from the test page first.');
    $path=$dir.'/'.hash('sha256',$token).'.json';$plan=is_file($path)?json_decode((string)file_get_contents($path),true):null;
    if(!$plan||($plan['version']??0)!==8||($plan['expires']??0)<time())throw new RuntimeException('This download link expired. Prepare the ZIP again.');
    $lock=fopen($dir.'/stream-'.hash('sha256',(string)($_SERVER['REMOTE_ADDR']??'')).'.lock','c');
    if(!$lock||!flock($lock,LOCK_EX|LOCK_NB))Response::error('BUSY','A ZIP is already downloading. Wait for it to finish before starting another.',429);
    @set_time_limit(900);ini_set('zlib.output_compression','0');while(ob_get_level()>0)ob_end_clean();
    header('Content-Type: application/zip');header('Content-Disposition: attachment; filename="'.$plan['zipName'].'"');header('X-Accel-Buffering: no');header('X-Content-Type-Options: nosniff');
    $zip=new FitsZipWriter(function(string $s){echo $s;flush();if(connection_aborted())throw new RuntimeException('Download cancelled.');});
    $manifest=[];
    foreach($plan['items'] as $p){
        $padding=(2880-$p['size']%2880)%2880;$size=strlen($p['header'])+$p['size']+$padding;
        $zip->file($p['filename'],$size,function($emit)use($p,$padding){$emit($p['header']);$r=new MastRanges($p['uri']);FitsCoverage::stream($p,fn($start,$length)=>[$r->range($start,$length),$r->total],$emit);if($r->total!==$p['sourceSize'])throw new RuntimeException('Archive product changed; prepare the ZIP again.');if($padding)$emit(str_repeat("\0",$padding));});
        unset($p['header']);$manifest[]=$p;
    }
    $zip->text('FILES_AND_FILTERS.json',json_encode(['selectedTarget'=>$plan['target'],'files'=>$manifest],JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));
    $zip->text('READ_ME.txt',"Our Astro Journey — ".$plan['target']."\n\nEach FITS contains one calibrated science image. Only existing pixels inside a verified gap-free rectangular crop are included. CRPIX is shifted to preserve sky coordinates. No missing data is filled or invented. Weight/error/context planes are excluded. These images are ready to OPEN and PROCESS, not pre-stretched or pre-registered.\n\nIn Siril: open each FITS individually, do not debayer. Register the filters, crop to their common overlap, then combine Blue/Green/Red as labelled. Broadband/infrared colour assignments are suggestions; this does not imply a true-colour or SHO dataset.\n\nEvery SCI and WHT pixel was scanned. The crop contains the resolved target, finite science values and strictly positive finite coverage throughout. Crops may differ between filters; registration and common-overlap cropping are still required. This verifies a target position, not that an entire extended object fits inside the crop.\n\nThe manifest records every original archive URI, filter and output name. Credit the original HST/JWST programme and archive. Keep original multi-extension data for scientific analysis.\n");
    $zip->finish();flock($lock,LOCK_UN);fclose($lock);exit;
} catch(Throwable $e) {
    if(headers_sent()){error_log('OAJ test ZIP interrupted: '.$e->getMessage());exit;}
    Response::error('ZIP_NOT_READY',$e->getMessage(),422);
}
