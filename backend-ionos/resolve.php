<?php
declare(strict_types=1);

/**
 * Resolve a target name to sky coordinates without running a full search.
 * Useful for debugging and for the advanced mode.
 *
 * GET parameters:
 *   target - object name or "ra, dec"
 */
require_once __DIR__ . '/bootstrap.php';

oaj_rate_limit();

$target = trim((string) ($_GET['target'] ?? ''));
if ($target === '') {
    Response::error('BAD_REQUEST', 'Please provide a target.', 400);
}

try {
    $resolved = new TargetResolver(oaj_client());
    $result = oaj_cache()->remember(
        'resolve:' . mb_strtolower($target),
        static function () use ($resolved, $target): array {
            return $resolved->resolve($target);
        },
        (int) ($OAJ_CONFIG['cache_ttl_resolve'] ?? 86400)
    );
    Response::ok(['query' => ['target' => $target], 'resolved' => $result]);
} catch (InvalidArgumentException $e) {
    Response::error('BAD_REQUEST', $e->getMessage(), 400);
} catch (RuntimeException $e) {
    Response::error('UPSTREAM_ERROR', $e->getMessage(), 502);
} catch (Throwable $e) {
    error_log('resolve.php unexpected: ' . $e->getMessage());
    Response::error('SERVER_ERROR', 'Something went wrong while resolving the target.', 500);
}
