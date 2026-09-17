<?php
/**
 * Local development configuration.
 *
 * The production copy on IONOS should be created from config.example.php
 * with only the https origins listed. This repository copy also allows
 * localhost so the tool can be tested with a local PHP server:
 *
 *   php -S localhost:8000 -t backend-ionos
 */
$OAJ_CONFIG = [
    'allowed_origins' => [
        'https://ourastrojourney.co.uk',
        'https://www.ourastrojourney.co.uk',
        'http://localhost:8000',
        'http://127.0.0.1:8000',
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'http://localhost:8092',
        'http://127.0.0.1:8092',
        'null', // local file:// testing sends Origin: null
    ],

    'cache_dir' => __DIR__ . '/cache',

    'cache_ttl_search' => 21600,
    'cache_ttl_products' => 21600,
    'cache_ttl_resolve' => 86400,

    'rate_limit_max' => 120,
    'rate_limit_window' => 300,

    'mast_timeout' => 120,
    'mast_retries' => 0,
];
