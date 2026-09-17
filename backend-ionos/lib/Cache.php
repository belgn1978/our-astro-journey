<?php
declare(strict_types=1);

/**
 * Filesystem cache and a simple file-based rate limiter.
 * Both work on plain shared hosting with no database.
 */
final class Cache
{
    private string $dir;
    private int $defaultTtl;

    public function __construct(string $dir, int $defaultTtl = 21600)
    {
        $this->dir = rtrim($dir, '/');
        $this->defaultTtl = $defaultTtl;
        if (!is_dir($this->dir)) {
            @mkdir($this->dir, 0755, true);
        }
    }

    private function pathFor(string $key): string
    {
        return $this->dir . '/' . hash('sha256', $key) . '.json';
    }

    /**
     * Return cached value for $key, or null when missing/expired/unreadable.
     * @return mixed
     */
    public function get(string $key)
    {
        $path = $this->pathFor($key);
        if (!is_file($path)) {
            return null;
        }
        $raw = @file_get_contents($path);
        if ($raw === false) {
            return null;
        }
        $entry = json_decode($raw, true);
        if (!is_array($entry) || !isset($entry['expires'], $entry['value'])) {
            return null;
        }
        if ($entry['expires'] < time()) {
            @unlink($path);
            return null;
        }
        return $entry['value'];
    }

    /** Store a JSON-serialisable value. */
    public function set(string $key, $value, ?int $ttl = null): void
    {
        $path = $this->pathFor($key);
        $entry = [
            'expires' => time() + ($ttl ?? $this->defaultTtl),
            'value' => $value,
        ];
        @file_put_contents($path, json_encode($entry), LOCK_EX);
    }

    /**
     * Get a cached value, or compute, store and return it.
     * @template T
     * @param callable():T $producer
     * @return T
     */
    public function remember(string $key, callable $producer, ?int $ttl = null)
    {
        $cached = $this->get($key);
        if ($cached !== null) {
            return $cached;
        }
        $value = $producer();
        $this->set($key, $value, $ttl);
        return $value;
    }

    /**
     * Simple fixed-window rate limiter.
     * Returns true when the request is allowed, false when the limit is exceeded.
     */
    public function rateLimit(string $bucket, int $maxRequests, int $windowSeconds): bool
    {
        $path = $this->dir . '/rl_' . hash('sha256', $bucket) . '.json';
        $now = time();
        $state = ['start' => $now, 'count' => 0];

        $raw = is_file($path) ? @file_get_contents($path) : false;
        if ($raw !== false) {
            $decoded = json_decode($raw, true);
            if (is_array($decoded) && isset($decoded['start'], $decoded['count'])) {
                $state = $decoded;
            }
        }

        if ($state['start'] + $windowSeconds < $now) {
            $state = ['start' => $now, 'count' => 0];
        }

        $state['count']++;
        @file_put_contents($path, json_encode($state), LOCK_EX);

        return $state['count'] <= $maxRequests;
    }
}
