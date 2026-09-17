<?php
/**
 * Configuration template for the Our Astro Journey API.
 *
 * Copy this file to config.php and adjust for the environment.
 * config.php is what the endpoints actually load. No secrets are needed:
 * the MAST archive is accessed anonymously.
 */
$OAJ_CONFIG = [
    // Origins allowed to call the API from a browser.
    'allowed_origins' => [
        'https://ourastrojourney.co.uk',
        'https://www.ourastrojourney.co.uk',
    ],

    // Filesystem cache directory (must be writable by PHP).
    'cache_dir' => __DIR__ . '/cache',

    // Cache lifetimes in seconds.
    'cache_ttl_search' => 21600,   // 6 hours for observation searches
    'cache_ttl_products' => 21600, // 6 hours for product lists
    'cache_ttl_resolve' => 86400,  // 24 hours for name resolution

    // Simple per-IP rate limiting.
    'rate_limit_max' => 60,        // requests
    'rate_limit_window' => 300,    // per 5 minutes

    // MAST HTTP timeouts / retries. The archive can take over a minute for
    // crowded regions of the sky, so the timeout is generous.
    'mast_timeout' => 120,
    'mast_retries' => 0,
];
