<?php
declare(strict_types=1);

/**
 * Recommendation and grouping logic for MAST HST/JWST products.
 *
 * The logic is deliberately transparent: every recommended item carries a
 * plain-English "reasons" list so users can see why it was picked. Nothing is
 * labelled "best" without an explanation.
 */
final class ProductRanker
{
    /**
     * Approximate central wavelengths (microns) for common HST/JWST filters.
     * Used only to order filters for suggested colour mappings, never for
     * science decisions.
     */
    private const FILTER_WAVELENGTHS = [
        // JWST NIRCam / NIRISS / MIRI
        'F070W' => 0.70, 'F090W' => 0.90, 'F115W' => 1.15, 'F140M' => 1.40,
        'F150W' => 1.50, 'F162M' => 1.62, 'F164N' => 1.64, 'F182M' => 1.82,
        'F187N' => 1.87, 'F200W' => 2.00, 'F210M' => 2.10, 'F212N' => 2.12,
        'F250M' => 2.50, 'F277W' => 2.77, 'F300M' => 3.00, 'F322W2' => 3.22,
        'F323N' => 3.23, 'F335M' => 3.35, 'F356W' => 3.56, 'F360M' => 3.60,
        'F405N' => 4.05, 'F410M' => 4.10, 'F430M' => 4.30, 'F444W' => 4.44,
        'F460M' => 4.60, 'F466N' => 4.66, 'F470N' => 4.70, 'F480M' => 4.80,
        'F560W' => 5.60, 'F770W' => 7.70, 'F1000W' => 10.0, 'F1130W' => 11.3,
        'F1280W' => 12.8, 'F1500W' => 15.0, 'F1800W' => 18.0, 'F2100W' => 21.0,
        'F2550W' => 25.5,
        // HST WFC3/ACS/WFPC2 (UV, optical, near-IR)
        'F218W' => 0.218, 'F225W' => 0.225, 'F275W' => 0.275, 'F300X' => 0.300,
        'F336W' => 0.336, 'F350LP' => 0.350, 'F373N' => 0.373, 'F390M' => 0.390,
        'F390W' => 0.390, 'F395N' => 0.395, 'F410M' => 0.410, 'F438W' => 0.438,
        'F467M' => 0.467, 'F469N' => 0.469, 'F475W' => 0.475, 'F487N' => 0.487,
        'F502N' => 0.502, 'F547M' => 0.547, 'F555W' => 0.555, 'F569W' => 0.569,
        'F600LP' => 0.600, 'F606W' => 0.606, 'F621M' => 0.621, 'F625W' => 0.625,
        'F631N' => 0.631, 'F645N' => 0.645, 'F656N' => 0.656, 'F657N' => 0.657,
        'F658N' => 0.658, 'F665N' => 0.665, 'F673N' => 0.673, 'F674N' => 0.674,
        'F675W' => 0.675, 'F680N' => 0.680, 'F689M' => 0.689, 'F702W' => 0.702,
        'F763M' => 0.763, 'F775W' => 0.775, 'F814W' => 0.814, 'F845M' => 0.845,
        'F850LP' => 0.850, 'F953N' => 0.953, 'F105W' => 1.05, 'F110W' => 1.10,
        'F125W' => 1.25, 'F126N' => 1.26, 'F128N' => 1.28, 'F130N' => 1.30,
        'F132N' => 1.32, 'F139M' => 1.39, 'F140W' => 1.40, 'F153M' => 1.53,
        'F160W' => 1.60, 'F164N' => 1.64, 'F167N' => 1.67,
    ];

    /** Narrowband / emission-line filters commonly used in astrophotography. */
    private const NARROWBAND_HINT = 'N';

    /** Subgroups that represent combined / mosaicked science images. */
    private const COMBINED_SUBGROUPS = ['I2D', 'DRC', 'DRZ', 'DRZMEM', 'MOS'];

    /** Subgroups that represent individual calibrated exposures. */
    private const CALIBRATED_SUBGROUPS = ['CAL', 'FLT', 'RATE', 'CRF', 'CALINTS', 'RATEINTS'];

    /** Subgroups that represent raw or lightly-processed exposures. */
    private const RAW_SUBGROUPS = ['RAW', 'UNCAL', 'RAMP', 'GS-ACQ1', 'GS-ACQ2'];

    /**
     * Filter, label and rank the product list for one observation.
     *
     * @param array<int, array<string, mixed>> $products raw MAST product rows
     * @param string $mode recommended|processed|exposures|all|advanced
     * @return array<string, mixed>
     */
    public function rankProducts(array $products, string $mode): array
    {
        $labelled = [];
        foreach ($products as $row) {
            $item = $this->labelProduct($row);
            if ($item === null) {
                continue; // not useful science data (non-public, auxiliary, etc.)
            }
            $labelled[] = $item;
        }

        // Demote redundant combined products: for each filter set, only the
        // largest combined image stays "recommended" (per-detector repeats of
        // the same mosaic are usually unnecessary for beginners).
        $bestByFilter = [];
        foreach ($labelled as $i => $item) {
            if ($item['category'] !== 'combined') {
                continue;
            }
            $key = implode(',', $item['filters']) . '|' . $item['subGroup'];
            if (!isset($bestByFilter[$key])
                || $item['sizeBytes'] > $labelled[$bestByFilter[$key]]['sizeBytes']) {
                $bestByFilter[$key] = $i;
            }
        }
        $recommendedIndexes = array_fill_keys(array_values($bestByFilter), true);
        foreach ($labelled as $i => &$item) {
            if ($item['category'] === 'combined' && !isset($recommendedIndexes[$i])) {
                $item['recommended'] = false;
                $item['recommendReasons'] = ['Duplicate of a recommended combined image for the same filter'];
            }
        }
        unset($item);

        $recommended = [];
        $included = [];
        foreach ($labelled as $item) {
            $include = $this->includeInMode($item, $mode);
            if ($include) {
                $included[] = $item;
            }
            if ($item['recommended']) {
                $recommended[] = $item;
            }
        }

        // Sort: recommended first, then combined before exposures, then size desc.
        usort($included, static function (array $a, array $b): int {
            if ($a['recommended'] !== $b['recommended']) {
                return $a['recommended'] ? -1 : 1;
            }
            if ($a['rankGroup'] !== $b['rankGroup']) {
                return $a['rankGroup'] <=> $b['rankGroup'];
            }
            return $b['sizeBytes'] <=> $a['sizeBytes'];
        });

        // Cap the payload so one observation cannot flood the page.
        $included = array_slice($included, 0, 250);

        return [
            'products' => $included,
            'recommendedCount' => count($recommended),
            'totalScienceProducts' => count($labelled),
        ];
    }

    /**
     * Turn a raw MAST product row into a labelled item, or null to exclude it.
     * @param array<string, mixed> $row
     */
    private function labelProduct(array $row): ?array
    {
        $filename = (string) ($row['productFilename'] ?? '');
        $dataUri = (string) ($row['dataURI'] ?? '');
        if ($filename === '' || $dataUri === '') {
            return null;
        }
        if (strtoupper((string) ($row['dataRights'] ?? '')) !== 'PUBLIC') {
            return null;
        }
        // 'S' = science, 'A' = auxiliary, 'C' = calibration reference.
        $type = strtoupper((string) ($row['type'] ?? 'S'));
        if ($type !== 'S') {
            return null;
        }

        $subGroup = strtoupper((string) ($row['productSubGroupDescription'] ?? ''));
        $calibLevel = (int) ($row['calib_level'] ?? 0);
        $sizeBytes = (int) ($row['size'] ?? 0);
        $isFits = (bool) preg_match('/\.fits(\.gz)?$/i', $filename);
        $isPreview = (bool) preg_match('/\.(jpe?g|png|gif)$/i', $filename);

        if ($isPreview) {
            $category = 'preview';
            $rankGroup = 90;
        } elseif (in_array($subGroup, self::COMBINED_SUBGROUPS, true) || ($calibLevel >= 3 && $isFits)) {
            $category = 'combined';
            $rankGroup = 10;
        } elseif (in_array($subGroup, self::CALIBRATED_SUBGROUPS, true) || ($calibLevel === 2 && $isFits)) {
            $category = 'calibrated';
            $rankGroup = 20;
        } elseif (in_array($subGroup, self::RAW_SUBGROUPS, true) || ($calibLevel <= 1 && $isFits)) {
            $category = 'raw';
            $rankGroup = 40;
        } elseif ($isFits) {
            $category = 'other-fits';
            $rankGroup = 50;
        } else {
            // JSON association tables, CSV pools, text logs: metadata.
            $category = 'metadata';
            $rankGroup = 80;
        }

        $reasons = [];
        $recommended = false;
        if ($category === 'combined') {
            $recommended = true;
            $reasons[] = 'Combined, calibrated image — the usual starting point for processing';
            if ($subGroup === 'I2D') {
                $reasons[] = 'JWST pipeline-combined mosaic (i2d)';
            }
            if (in_array($subGroup, ['DRC', 'DRZ'], true)) {
                $reasons[] = 'Hubble drizzle-combined image';
            }
        } elseif ($category === 'calibrated') {
            $reasons[] = 'Individually calibrated exposure';
        } elseif ($category === 'raw') {
            $reasons[] = 'Raw exposure — needs full calibration before use';
        }

        $labels = [
            'combined' => 'Combined / calibrated image',
            'calibrated' => 'Calibrated exposure',
            'raw' => 'Raw exposure',
            'preview' => 'Preview image',
            'metadata' => 'Metadata / table',
            'other-fits' => 'FITS data file',
        ];

        return [
            'filename' => $filename,
            'description' => $this->cleanDescription((string) ($row['description'] ?? '')),
            'category' => $category,
            'categoryLabel' => $labels[$category],
            'subGroup' => $subGroup !== '' && $subGroup !== 'NONE' ? $subGroup : null,
            'calibLevel' => $calibLevel,
            'calibLabel' => $this->calibLabel($calibLevel),
            'filters' => $this->splitFilters((string) ($row['filters'] ?? '')),
            'sizeBytes' => $sizeBytes,
            'sizeLabel' => $this->formatBytes($sizeBytes),
            'dataUri' => $dataUri,
            'downloadUrl' => MastClient::downloadUrl($dataUri),
            'recommended' => $recommended,
            'recommendReasons' => $reasons,
            'rankGroup' => $rankGroup,
        ];
    }

    /** Should this item appear in the result for the requested mode? */
    private function includeInMode(array $item, string $mode): bool
    {
        switch ($mode) {
            case 'recommended':
                return in_array($item['category'], ['combined', 'calibrated', 'preview'], true);
            case 'processed':
                return in_array($item['category'], ['combined', 'calibrated', 'preview'], true);
            case 'exposures':
                return in_array($item['category'], ['combined', 'calibrated', 'raw', 'preview'], true);
            case 'all':
            case 'advanced':
            default:
                return true;
        }
    }

    /**
     * Group observation rows (from a CAOM search) into visit-like groups that
     * belong together: same collection, instrument, programme and nearly the
     * same pointing. Pointing comparison uses a simple angular-distance
     * approximation on the field centres and is clearly labelled approximate.
     *
     * @param array<int, array<string, mixed>> $rows
     * @return array<int, array<string, mixed>>
     */
    public function groupObservations(array $rows): array
    {
        // Pointing cluster threshold: ~4 arcmin. Covers NIRCam/WFC3 fields.
        $clusterThresholdDeg = 0.066;

        $groups = [];
        foreach ($rows as $row) {
            $collection = (string) ($row['obs_collection'] ?? 'UNKNOWN');
            $instrument = $this->baseInstrument((string) ($row['instrument_name'] ?? 'UNKNOWN'));
            $proposal = (string) ($row['proposal_id'] ?? '');
            $ra = (float) ($row['s_ra'] ?? 0.0);
            $dec = (float) ($row['s_dec'] ?? 0.0);
            $baseKey = $collection . '|' . $instrument . '|' . $proposal;

            $assigned = false;
            foreach ($groups as $key => &$group) {
                if ($group['baseKey'] !== $baseKey) {
                    continue;
                }
                $dist = $this->angularDistance($ra, $dec, $group['ra'], $group['dec']);
                if ($dist <= $clusterThresholdDeg) {
                    $group['observations'][] = $this->summariseObservation($row);
                    $group['filters'] = array_values(array_unique(array_merge(
                        $group['filters'],
                        $this->splitFilters((string) ($row['filters'] ?? ''))
                    )));
                    $group['totalExposureSeconds'] += (float) ($row['t_exptime'] ?? 0);
                    $tMin = (float) ($row['t_min'] ?? 0);
                    if ($tMin > 0 && ($group['tMin'] === 0.0 || $tMin < $group['tMin'])) {
                        $group['tMin'] = $tMin;
                    }
                    $assigned = true;
                    break;
                }
            }
            unset($group);

            if (!$assigned) {
                $key = $baseKey . '|' . count($groups);
                $groups[$key] = [
                    'baseKey' => $baseKey,
                    'telescope' => $collection,
                    'instrument' => $instrument,
                    'instrumentFull' => (string) ($row['instrument_name'] ?? ''),
                    'proposalId' => $proposal,
                    'targetName' => (string) ($row['target_name'] ?? ''),
                    'ra' => $ra,
                    'dec' => $dec,
                    'tMin' => (float) ($row['t_min'] ?? 0),
                    'filters' => $this->splitFilters((string) ($row['filters'] ?? '')),
                    'totalExposureSeconds' => (float) ($row['t_exptime'] ?? 0),
                    'observations' => [$this->summariseObservation($row)],
                ];
            }
        }

        $out = [];
        foreach ($groups as $group) {
            unset($group['baseKey']);
            $group['filterCount'] = count($group['filters']);
            $group['observationCount'] = count($group['observations']);
            // Products are fetched for at most 4 observations at a time.
            $group['obsids'] = array_slice(array_values(array_unique(array_map(
                static fn (array $o): string => (string) $o['obsid'],
                $group['observations']
            ))), 0, 4);
            $group['obsidsCapped'] = $group['observationCount'] > count($group['obsids']);
            $group['date'] = $group['tMin'] > 0 ? $this->mjdToDate($group['tMin']) : null;
            unset($group['tMin']);
            $group['totalExposureLabel'] = $this->formatExposure($group['totalExposureSeconds']);
            $group['pointingSpreadArcmin'] = $this->pointingSpread($group['observations']);
            $group['overlapWarning'] = $group['pointingSpreadArcmin'] > 1.0
                ? 'These observations point at slightly different positions (about '
                    . number_format($group['pointingSpreadArcmin'], 1)
                    . ' arcminutes apart), so the filters may not cover exactly the same field. Check the footprints before combining them. This is an approximate field-centre check, not an exact footprint comparison.'
                : null;
            $group['colourSuggestions'] = $this->suggestColourSets($group['filters'], $group['telescope']);
            $out[] = $group;
        }

        // Most useful first: more filters and more exposure.
        usort($out, static function (array $a, array $b): int {
            if ($a['filterCount'] !== $b['filterCount']) {
                return $b['filterCount'] <=> $a['filterCount'];
            }
            return $b['totalExposureSeconds'] <=> $a['totalExposureSeconds'];
        });

        return $out;
    }

    /**
     * Warn (via flag) when groups within the same programme+instrument use
     * filters that suggest different pointings. The frontend shows the
     * approximation warning text.
     */
    public function fieldOverlapNote(array $groupA, array $groupB): ?string
    {
        $dist = $this->angularDistance(
            (float) $groupA['ra'], (float) $groupA['dec'],
            (float) $groupB['ra'], (float) $groupB['dec']
        );
        if ($dist > 0.03) {
            return 'These observations use useful filters but their field centres differ by about '
                . number_format($dist * 60, 1)
                . ' arcminutes, so they may not cover exactly the same patch of sky. Check the footprints before combining them.';
        }
        return null;
    }

    /**
     * Suggest colour mappings from the available filters. Suggestions are
     * illustrative, not definitive.
     * @param string[] $filters
     * @return array<int, array<string, string>>
     */
    public function suggestColourSets(array $filters, string $telescope): array
    {
        $suggestions = [];
        $broad = [];
        $narrow = [];
        foreach ($filters as $f) {
            $upper = strtoupper($f);
            if (preg_match('/N$/', $upper) === 1 && isset(self::FILTER_WAVELENGTHS[$upper])) {
                $narrow[] = $upper;
            } elseif (isset(self::FILTER_WAVELENGTHS[$upper])) {
                $broad[] = $upper;
            }
        }
        $byWavelength = function (string $a, string $b): int {
            return (self::FILTER_WAVELENGTHS[$a] ?? 0) <=> (self::FILTER_WAVELENGTHS[$b] ?? 0);
        };
        usort($broad, $byWavelength);
        usort($narrow, $byWavelength);

        if (count($broad) >= 3) {
            $suggestions[] = [
                'type' => 'Broadband colour set',
                'mapping' => 'Blue: ' . $broad[0] . '  •  Green: ' . $broad[intdiv(count($broad), 2)] . '  •  Red: ' . $broad[count($broad) - 1],
                'note' => 'Assign the shortest-wavelength filter to blue and the longest to red. Other orderings are valid; this is only a starting point.',
            ];
        }
        if (count($narrow) >= 2) {
            $mapping = [];
            $channels = ['Red', 'Green', 'Blue'];
            // Classic Hubble palette puts the longest wavelength in red.
            $reversed = array_reverse($narrow);
            foreach (array_slice($reversed, 0, 3) as $i => $f) {
                $mapping[] = $channels[$i] . ': ' . $f;
            }
            $suggestions[] = [
                'type' => 'Emission-line / narrowband set',
                'mapping' => implode('  •  ', $mapping),
                'note' => 'Narrowband filters isolate glowing gas. A common starting point is the "Hubble palette" (longest wavelength as red), but any mapping that looks good is fine.',
            ];
        }
        return $suggestions;
    }

    /** @return string[] */
    private function splitFilters(string $filters): array
    {
        $filters = trim($filters);
        if ($filters === '') {
            return [];
        }
        $parts = preg_split('/[;,\s]+/', $filters) ?: [];
        $out = [];
        foreach ($parts as $p) {
            $p = strtoupper(trim($p));
            if ($p !== '' && $p !== 'CLEAR' && $p !== 'NONE') {
                $out[] = $p;
            }
        }
        return array_values(array_unique($out));
    }

    /** "NIRCAM/IMAGE" → "NIRCam", "WFC3/UVIS" → "WFC3/UVIS". */
    private function baseInstrument(string $instrument): string
    {
        $instrument = trim($instrument);
        if ($instrument === '') {
            return 'Unknown';
        }
        $parts = explode('/', $instrument);
        $base = ucfirst(strtolower($parts[0]));
        if (isset($parts[1]) && $parts[1] !== '' && strtoupper($parts[1]) !== 'IMAGE') {
            return $base . '/' . strtoupper($parts[1]);
        }
        return $base;
    }

    /** @param array<string, mixed> $row */
    private function summariseObservation(array $row): array
    {
        return [
            'obsid' => (string) ($row['obsid'] ?? ''),
            'obsId' => (string) ($row['obs_id'] ?? ''),
            'ra' => (float) ($row['s_ra'] ?? 0.0),
            'dec' => (float) ($row['s_dec'] ?? 0.0),
            'filters' => $this->splitFilters((string) ($row['filters'] ?? '')),
            'exposureSeconds' => (float) ($row['t_exptime'] ?? 0),
            'calibLevel' => (int) ($row['calib_level'] ?? 0),
            'dataRights' => (string) ($row['dataRights'] ?? ''),
        ];
    }

    /**
     * Largest angular distance (arcminutes) between any observation and the
     * first observation in the group. Zero for single-observation groups.
     * @param array<int, array<string, mixed>> $observations
     */
    private function pointingSpread(array $observations): float
    {
        if (count($observations) < 2) {
            return 0.0;
        }
        $first = $observations[0];
        $max = 0.0;
        foreach ($observations as $obs) {
            $dist = $this->angularDistance(
                (float) $first['ra'], (float) $first['dec'],
                (float) $obs['ra'], (float) $obs['dec']
            );
            $max = max($max, $dist);
        }
        return $max * 60.0;
    }

    private function angularDistance(float $ra1, float $dec1, float $ra2, float $dec2): float
    {
        $dRa = deg2rad($ra1 - $ra2);
        $dDec = deg2rad($dec1 - $dec2);
        $a = sin($dDec / 2) ** 2
            + cos(deg2rad($dec1)) * cos(deg2rad($dec2)) * sin($dRa / 2) ** 2;
        return rad2deg(2 * asin(min(1.0, sqrt($a))));
    }

    private function mjdToDate(float $mjd): string
    {
        // MJD 0 = 1858-11-17T00:00:00Z
        $unix = (int) round(($mjd - 40587.0) * 86400.0);
        return gmdate('Y-m-d', $unix);
    }

    private function formatExposure(float $seconds): string
    {
        if ($seconds <= 0) {
            return '—';
        }
        if ($seconds < 120) {
            return round($seconds) . ' s';
        }
        if ($seconds < 7200) {
            return round($seconds / 60, 1) . ' min';
        }
        return round($seconds / 3600, 1) . ' h';
    }

    private function calibLabel(int $level): string
    {
        switch ($level) {
            case 0: return 'Raw data (level 0)';
            case 1: return 'Raw / uncalibrated (level 1)';
            case 2: return 'Calibrated exposure (level 2)';
            case 3: return 'Combined / calibrated image (level 3)';
            case 4: return 'High-level combined product (level 4)';
            default: return 'Calibration level unknown';
        }
    }

    private function cleanDescription(string $description): string
    {
        $description = trim(preg_replace('/\s+/', ' ', $description) ?? '');
        if ($description === '' || strtolower($description) === 'none') {
            return '';
        }
        return $description;
    }

    private function formatBytes(int $bytes): string
    {
        if ($bytes <= 0) {
            return '—';
        }
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $i = (int) floor(log($bytes, 1024));
        $i = min($i, count($units) - 1);
        return round($bytes / (1024 ** $i), $i === 0 ? 0 : 1) . ' ' . $units[$i];
    }
}
