<?php
declare(strict_types=1);

/**
 * Search for HST/JWST observations of a target.
 *
 * GET parameters:
 *   target    - object name ("M51", "Pillars of Creation") or "ra, dec"
 *   telescope - hst | jwst | both (default: both)
 *   mode      - recommended | processed | exposures | all | advanced
 *   radius    - search radius in degrees, 0.02–1.0 (default 0.2)
 */
require_once __DIR__ . '/bootstrap.php';

oaj_rate_limit();

$target = trim((string) ($_GET['target'] ?? ''));
$telescope = strtolower(trim((string) ($_GET['telescope'] ?? 'both')));
$mode = strtolower(trim((string) ($_GET['mode'] ?? 'recommended')));
$radius = (float) ($_GET['radius'] ?? 0.2);

if (!in_array($telescope, ['hst', 'jwst', 'both'], true)) {
    Response::error('BAD_REQUEST', 'telescope must be one of: hst, jwst, both.', 400);
}
if (!in_array($mode, ['recommended', 'processed', 'exposures', 'all', 'advanced'], true)) {
    Response::error('BAD_REQUEST', 'Unsupported mode.', 400);
}
if ($radius < 0.02 || $radius > 1.0) {
    Response::error('BAD_REQUEST', 'radius must be between 0.02 and 1.0 degrees.', 400);
}
if ($target === '') {
    Response::error('BAD_REQUEST', 'Please provide a target name or coordinates.', 400);
}

$collections = $telescope === 'both' ? ['HST', 'JWST'] : [strtoupper($telescope)];

try {
    $client = oaj_client();
    $resolver = new TargetResolver($client);
    $ranker = new ProductRanker();
    $cache = oaj_cache();

    $resolved = $cache->remember(
        'resolve:' . mb_strtolower($target),
        static function () use ($resolver, $target): array {
            return $resolver->resolve($target);
        },
        (int) ($OAJ_CONFIG['cache_ttl_resolve'] ?? 86400)
    );

    $cacheKey = 'search:' . md5(json_encode([
        $resolved['ra'], $resolved['dec'], $radius, $collections,
    ]));

    $searchResult = $cache->remember(
        $cacheKey,
        static function () use ($client, $resolved, $radius, $collections): array {
            $result = $client->searchObservations(
                (float) $resolved['ra'],
                (float) $resolved['dec'],
                $radius,
                $collections
            );
            $rows = $result['data'] ?? [];
            $total = $result['paging']['rowsTotal'] ?? (is_array($rows) ? count($rows) : 0);
            return ['rows' => is_array($rows) ? $rows : [], 'total' => (int) $total];
        },
        (int) ($OAJ_CONFIG['cache_ttl_search'] ?? 21600)
    );

    $rows = $searchResult['rows'] ?? [];
    $groups = $ranker->groupObservations(is_array($rows) ? $rows : []);

    // Keep the response usable on mobile connections: send the most useful
    // groups first and cap the payload.
    $maxGroups = 60;
    $groupsShown = array_slice($groups, 0, $maxGroups);

    Response::ok([
        'query' => [
            'target' => $target,
            'telescope' => $telescope,
            'mode' => $mode,
            'radiusDeg' => $radius,
        ],
        'resolved' => $resolved,
        'resultCount' => $searchResult['total'] ?? count($rows),
        'groupCount' => count($groups),
        'groupsShown' => count($groupsShown),
        'truncated' => count($groups) > $maxGroups,
        'overlapApproximation' => 'Grouping and overlap use approximate field-centre distances, not exact footprint polygons.',
        'groups' => $groupsShown,
    ]);
} catch (InvalidArgumentException $e) {
    Response::error('BAD_REQUEST', $e->getMessage(), 400);
} catch (RuntimeException $e) {
    Response::error('UPSTREAM_ERROR', $e->getMessage(), 502);
} catch (Throwable $e) {
    error_log('search.php unexpected: ' . $e->getMessage());
    Response::error('SERVER_ERROR', 'Something went wrong while searching the archive.', 500);
}
