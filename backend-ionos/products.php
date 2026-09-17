<?php
declare(strict_types=1);

/**
 * Fetch and rank the downloadable products for one or more observations.
 *
 * GET parameters:
 *   obsid - numeric MAST obsid, or a comma-separated list (max 4)
 *   mode  - recommended | processed | exposures | all | advanced
 */
require_once __DIR__ . '/bootstrap.php';

oaj_rate_limit();

$obsidParam = trim((string) ($_GET['obsid'] ?? ''));
$mode = strtolower(trim((string) ($_GET['mode'] ?? 'recommended')));

if (!in_array($mode, ['recommended', 'processed', 'exposures', 'all', 'advanced'], true)) {
    Response::error('BAD_REQUEST', 'Unsupported mode.', 400);
}
if ($obsidParam === '') {
    Response::error('BAD_REQUEST', 'Please provide an obsid.', 400);
}

$obsids = array_values(array_filter(array_map('trim', explode(',', $obsidParam))));
if (count($obsids) === 0 || count($obsids) > 4) {
    Response::error('BAD_REQUEST', 'Provide between 1 and 4 observation ids.', 400);
}
foreach ($obsids as $obsid) {
    if (!preg_match('/^\d{1,12}$/', $obsid)) {
        Response::error('BAD_REQUEST', 'Observation ids must be numeric.', 400);
    }
}

try {
    $client = oaj_client();
    $ranker = new ProductRanker();
    $cache = oaj_cache();

    $results = [];
    foreach ($obsids as $obsid) {
        // Never cache an empty product list: an empty response usually means a
        // transient MAST problem, and caching it would hide real data for hours.
        $ranked = $cache->rememberUnlessEmpty(
            'products:' . $obsid . ':' . $mode,
            static function () use ($client, $ranker, $obsid, $mode): array {
                $rows = $client->getProducts($obsid);
                return $ranker->rankProducts($rows, $mode);
            },
            static function (array $r): bool {
                return ($r['totalScienceProducts'] ?? 0) === 0;
            },
            (int) ($OAJ_CONFIG['cache_ttl_products'] ?? 21600)
        );
        $results[] = [
            'obsid' => $obsid,
            'products' => $ranked['products'],
            'recommendedCount' => $ranked['recommendedCount'],
            'totalScienceProducts' => $ranked['totalScienceProducts'],
        ];
    }

    Response::ok([
        'query' => ['obsid' => $obsids, 'mode' => $mode],
        'results' => $results,
    ]);
} catch (InvalidArgumentException $e) {
    Response::error('BAD_REQUEST', $e->getMessage(), 400);
} catch (RuntimeException $e) {
    Response::error('UPSTREAM_ERROR', $e->getMessage(), 502);
} catch (Throwable $e) {
    error_log('products.php unexpected: ' . $e->getMessage());
    Response::error('SERVER_ERROR', 'Something went wrong while listing products.', 500);
}
