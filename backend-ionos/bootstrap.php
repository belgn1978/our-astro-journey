<?php
declare(strict_types=1);

/**
 * Shared bootstrap: loads config and library classes, sends CORS headers,
 * and hides PHP notices/warnings from API consumers.
 */
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');

require_once __DIR__ . '/lib/Response.php';
require_once __DIR__ . '/lib/Cache.php';
require_once __DIR__ . '/lib/MastClient.php';
require_once __DIR__ . '/lib/TargetResolver.php';
require_once __DIR__ . '/lib/ProductRanker.php';

$configFile = __DIR__ . '/config.php';
if (!is_file($configFile)) {
    $configFile = __DIR__ . '/config.example.php';
}
require_once $configFile;

/** @var array<string, mixed> $OAJ_CONFIG */
Response::sendCorsHeaders($OAJ_CONFIG['allowed_origins'] ?? []);

function oaj_cache(): Cache
{
    global $OAJ_CONFIG;
    static $cache = null;
    if ($cache === null) {
        $cache = new Cache(
            (string) ($OAJ_CONFIG['cache_dir'] ?? __DIR__ . '/cache'),
            (int) ($OAJ_CONFIG['cache_ttl_search'] ?? 21600)
        );
    }
    return $cache;
}

function oaj_client(): MastClient
{
    global $OAJ_CONFIG;
    return new MastClient(
        (int) ($OAJ_CONFIG['mast_timeout'] ?? 30),
        (int) ($OAJ_CONFIG['mast_retries'] ?? 2)
    );
}

/** Basic per-IP rate limit. Sends a 429 JSON error and stops when exceeded. */
function oaj_rate_limit(): void
{
    global $OAJ_CONFIG;
    $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $allowed = oaj_cache()->rateLimit(
        'ip:' . $ip,
        (int) ($OAJ_CONFIG['rate_limit_max'] ?? 60),
        (int) ($OAJ_CONFIG['rate_limit_window'] ?? 300)
    );
    if (!$allowed) {
        Response::error('RATE_LIMITED', 'Too many requests. Please wait a few minutes and try again.', 429);
    }
}
