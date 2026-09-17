<?php
declare(strict_types=1);

/**
 * Response helper: consistent JSON output, HTTP status codes and CORS handling
 * for the Our Astro Journey API.
 */
final class Response
{
    /**
     * Send CORS headers. Allowed origins come from config.php
     * ($OAJ_CONFIG['allowed_origins']). Requests from other origins simply get
     * no CORS headers, which makes browsers block the response.
     */
    public static function sendCorsHeaders(array $allowedOrigins): void
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        if ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Vary: Origin');
            header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Accept');
            header('Access-Control-Max-Age: 600');
        }

        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }

    /** Send a success JSON envelope and stop. */
    public static function ok(array $payload, int $status = 200): void
    {
        self::send(array_merge(['success' => true], $payload), $status);
    }

    /** Send an error JSON envelope and stop. */
    public static function error(string $code, string $message, int $status = 400): void
    {
        self::send([
            'success' => false,
            'error' => [
                'code' => $code,
                'message' => $message,
            ],
        ], $status);
    }

    /** Send JSON with no PHP notices/warnings leaking into output. */
    public static function send(array $payload, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('X-Content-Type-Options: nosniff');
        echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }
}
