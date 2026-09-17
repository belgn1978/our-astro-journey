<?php
declare(strict_types=1);

/**
 * Client for the official STScI MAST public API.
 *
 * Verified endpoints (September 2026):
 *  - Invoke:  GET https://mast.stsci.edu/api/v0/invoke?request=<json>
 *  - Name resolution service: Mast.Name.Lookup (returns XML)
 *  - Observation search:      Mast.Caom.Filtered.Position
 *  - Product lists:           Mast.Caom.Products
 *  - Download URL:            https://mast.stsci.edu/api/v0.1/Download/file?uri=<dataURI>
 *
 * Only anonymous, public archive access is used. No API token is required.
 */
final class MastClient
{
    public const INVOKE_URL = 'https://mast.stsci.edu/api/v0/invoke';
    public const DOWNLOAD_URL = 'https://mast.stsci.edu/api/v0.1/Download/file';

    private int $timeoutSeconds;
    private int $maxRetries;
    private string $userAgent;

    public function __construct(int $timeoutSeconds = 30, int $maxRetries = 2)
    {
        $this->timeoutSeconds = $timeoutSeconds;
        $this->maxRetries = $maxRetries;
        $this->userAgent = 'OurAstroJourney-DataFinder/1.0 (+https://ourastrojourney.co.uk)';
    }

    /**
     * Invoke a MAST service. Returns the decoded JSON envelope as an array.
     * Throws RuntimeException on transport or API errors.
     */
    public function invoke(string $service, array $params = [], ?string $columns = null): array
    {
        $request = [
            'service' => $service,
            'format' => 'json',
            'params' => $params,
        ];

        $url = self::INVOKE_URL . '?request=' . rawurlencode((string) json_encode($request));

        $attempt = 0;
        $lastError = 'Unknown error';
        while ($attempt <= $this->maxRetries) {
            $attempt++;
            [$status, $body, $curlError] = $this->httpGet($url);

            // MAST occasionally returns transient 404/5xx responses; retry those.
            $transient = $curlError !== '' || $status === 0 || $status === 404 || $status >= 500;
            if (!$transient) {
                $decoded = json_decode($body, true);
                if (!is_array($decoded)) {
                    throw new RuntimeException('MAST returned a response that was not valid JSON.');
                }
                if (($decoded['status'] ?? '') === 'ERROR') {
                    $msg = trim((string) ($decoded['msg'] ?? 'MAST reported an error.'));
                    throw new RuntimeException('MAST error: ' . $this->truncate($msg, 300));
                }
                return $decoded;
            }

            $lastError = $curlError !== '' ? $curlError : ('HTTP ' . $status);
            if ($attempt <= $this->maxRetries) {
                usleep(400000 * $attempt); // simple backoff: 0.4s, 0.8s
            }
        }

        throw new RuntimeException('The MAST archive could not be reached (' . $lastError . ').');
    }

    /**
     * Resolve an object name (e.g. "M51", "Pillars of Creation") to sky
     * coordinates using the official MAST name resolver.
     *
     * The resolver returns XML even when JSON is requested, so both formats
     * are handled.
     *
     * @return array{ra: float, dec: float, canonicalName: string, resolver: string, radius: float}
     */
    public function resolveName(string $name): array
    {
        $request = [
            'service' => 'Mast.Name.Lookup',
            'format' => 'json',
            'params' => ['input' => $name],
        ];
        $url = self::INVOKE_URL . '?request=' . rawurlencode((string) json_encode($request));

        [$status, $body, $curlError] = $this->httpGet($url);
        if ($curlError !== '' || $status !== 200) {
            throw new RuntimeException('The MAST name resolver could not be reached.');
        }

        // Try JSON first in case the service honours the format.
        $decoded = json_decode($body, true);
        if (is_array($decoded) && isset($decoded['resolvedCoordinate'][0])) {
            $coord = $decoded['resolvedCoordinate'][0];
            return $this->normaliseResolved($coord, $name);
        }

        // XML response (observed behaviour of Mast.Name.Lookup). The child
        // elements are in no namespace, so query them without a prefix.
        $xml = @simplexml_load_string($body);
        if ($xml === false) {
            throw new RuntimeException('The name resolver returned an unreadable response.');
        }
        $nodes = $xml->xpath('//resolvedCoordinate') ?: [];
        if (count($nodes) === 0) {
            throw new RuntimeException('Target "' . $name . '" could not be resolved to a sky position.');
        }
        $node = $nodes[0];
        $coord = [
            'ra' => (float) $node->ra,
            'dec' => (float) $node->dec,
            'canonicalName' => (string) $node->canonicalName,
            'resolver' => (string) $node->resolver,
            'radius' => isset($node->radius) ? (float) $node->radius : 0.0,
        ];
        if ($coord['ra'] == 0.0 && $coord['dec'] == 0.0) {
            throw new RuntimeException('Target "' . $name . '" could not be resolved to a sky position.');
        }
        return $coord;
    }

    /** @param array<string, mixed> $coord */
    private function normaliseResolved(array $coord, string $fallbackName): array
    {
        return [
            'ra' => (float) ($coord['ra'] ?? 0.0),
            'dec' => (float) ($coord['dec'] ?? 0.0),
            'canonicalName' => (string) ($coord['canonicalName'] ?? $fallbackName),
            'resolver' => (string) ($coord['resolver'] ?? ''),
            'radius' => (float) ($coord['radius'] ?? 0.0),
        ];
    }

    /**
     * Cone search for HST/JWST science observations.
     *
     * Note: this MAST service currently ignores pagesize/page and returns all
     * matching rows in one response, so a single request is made.
     *
     * @param string[] $collections e.g. ['HST', 'JWST']
     */
    public function searchObservations(float $ra, float $dec, float $radiusDeg, array $collections): array
    {
        $filters = [
            ['paramName' => 'dataproduct_type', 'values' => ['image']],
            ['paramName' => 'intentType', 'values' => ['science']],
        ];
        if (count($collections) > 0) {
            $filters[] = ['paramName' => 'obs_collection', 'values' => $collections];
        }

        $params = [
            'columns' => 'obsid,obs_collection,instrument_name,proposal_id,target_name,'
                . 's_ra,s_dec,t_min,t_exptime,filters,dataproduct_type,calib_level,'
                . 'dataRights,obs_id,project',
            'filters' => $filters,
            'position' => $ra . ', ' . $dec . ', ' . $radiusDeg,
        ];

        return $this->invoke('Mast.Caom.Filtered.Position', $params);
    }

    /**
     * Fetch the product list for one observation id (obsid).
     * @return array<int, array<string, mixed>>
     */
    public function getProducts(string $obsid): array
    {
        if (!preg_match('/^\d{1,12}$/', $obsid)) {
            throw new InvalidArgumentException('Invalid observation id.');
        }
        $result = $this->invoke('Mast.Caom.Products', ['obsid' => $obsid]);
        $rows = $result['data'] ?? [];
        return is_array($rows) ? $rows : [];
    }

    /** Build the official archive download URL for a product dataURI. */
    public static function downloadUrl(string $dataUri): string
    {
        return self::DOWNLOAD_URL . '?uri=' . rawurlencode($dataUri);
    }

    /**
     * Minimal GET wrapper around cURL.
     * @return array{0: int, 1: string, 2: string} [http status, body, curl error]
     */
    private function httpGet(string $url): array
    {
        $ch = curl_init($url);
        if ($ch === false) {
            return [0, '', 'Failed to initialise HTTP client'];
        }
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 3,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => $this->timeoutSeconds,
            CURLOPT_USERAGENT => $this->userAgent,
            CURLOPT_HTTPHEADER => ['Accept: application/json'],
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
        ]);
        $body = curl_exec($ch);
        $error = curl_error($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        curl_close($ch);

        if ($body === false) {
            return [$status, '', $error !== '' ? $error : 'HTTP request failed'];
        }
        return [$status, (string) $body, ''];
    }

    private function truncate(string $text, int $max): string
    {
        return strlen($text) > $max ? substr($text, 0, $max) . '…' : $text;
    }
}
