<?php
declare(strict_types=1);

/** Health check endpoint. */
require_once __DIR__ . '/bootstrap.php';

Response::ok([
    'status' => 'ok',
    'service' => 'Our Astro Journey API',
    'endpoints' => [
        '/search.php?target=M51&telescope=both&mode=recommended',
        '/products.php?obsid=146078318&mode=recommended',
        '/resolve.php?target=M42',
        '/download-manifest.php (POST)',
    ],
]);
