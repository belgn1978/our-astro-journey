<?php
declare(strict_types=1);

/**
 * Turns a user's free-text target into sky coordinates.
 * Accepts decimal coordinates ("202.47, 47.20" or "202.47 47.20") or an
 * object name resolved through the official MAST name resolver.
 *
 * A tiny curated alias map covers famous features that generic name
 * resolvers (SIMBAD/NED) often do not know, e.g. "Pillars of Creation".
 */
final class TargetResolver
{
    /**
     * Famous features with no reliable resolver entry.
     * Coordinates are J2000 degrees from the published MAST press-release
     * pointings.
     */
    private const TARGET_ALIASES = [
        'pillars of creation' => [274.7000, -13.8067, 'Pillars of Creation (M16, Eagle Nebula)'],
        'pillars' => [274.7000, -13.8067, 'Pillars of Creation (M16, Eagle Nebula)'],
        'cosmic cliffs' => [161.2625, -59.6083, 'Cosmic Cliffs (NGC 3324, Carina Nebula)'],
        'tarantula nebula' => [85.05, -69.10, 'Tarantula Nebula (30 Doradus)'],
        'ring nebula' => [283.396, 33.029, 'Ring Nebula (M57)'],
    ];

    private MastClient $client;

    public function __construct(MastClient $client)
    {
        $this->client = $client;
    }

    /**
     * @return array{ra: float, dec: float, label: string, source: string}
     */
    public function resolve(string $input): array
    {
        $input = trim($input);
        if ($input === '') {
            throw new InvalidArgumentException('Please enter a target name or coordinates.');
        }
        if (mb_strlen($input) > 120) {
            throw new InvalidArgumentException('Target text is too long (120 characters maximum).');
        }

        $coords = $this->parseCoordinates($input);
        if ($coords !== null) {
            return [
                'ra' => $coords[0],
                'dec' => $coords[1],
                'label' => sprintf('%.5f, %.5f', $coords[0], $coords[1]),
                'source' => 'coordinates',
            ];
        }

        // Reject anything with obviously unsafe characters before resolving.
        if (!preg_match('/^[\p{L}\p{N}\s\-\+\.,_()\']+$/u', $input)) {
            throw new InvalidArgumentException('The target contains characters that are not supported.');
        }

        $aliasKey = mb_strtolower(preg_replace('/\s+/', ' ', $input) ?? $input);
        if (isset(self::TARGET_ALIASES[$aliasKey])) {
            [$ra, $dec, $label] = self::TARGET_ALIASES[$aliasKey];
            return [
                'ra' => $ra,
                'dec' => $dec,
                'label' => $label,
                'source' => 'curated alias',
            ];
        }

        $resolved = $this->client->resolveName($input);
        return [
            'ra' => $resolved['ra'],
            'dec' => $resolved['dec'],
            'label' => $resolved['canonicalName'] !== '' ? $resolved['canonicalName'] : $input,
            'source' => $resolved['resolver'] !== '' ? $resolved['resolver'] : 'MAST',
        ];
    }

    /**
     * @return array{0: float, 1: float}|null [ra, dec] or null when not coordinates
     */
    private function parseCoordinates(string $input): ?array
    {
        if (!preg_match('/^\s*([+-]?\d+(?:\.\d+)?)[\s,]+([+-]?\d+(?:\.\d+)?)\s*$/', $input, $m)) {
            return null;
        }
        $ra = (float) $m[1];
        $dec = (float) $m[2];
        if ($ra < 0.0 || $ra > 360.0 || $dec < -90.0 || $dec > 90.0) {
            throw new InvalidArgumentException('Coordinates must be RA 0–360 and Dec −90 to +90 degrees.');
        }
        return [$ra, $dec];
    }
}
