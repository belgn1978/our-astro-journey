# Our Astro Journey API (backend-ionos)

PHP backend for the **Hubble & JWST Data Finder**. It queries the official
STScI MAST archive so the website can offer a beginner-friendly search for
public Hubble and JWST data.

- Live API base: `https://api.ourastrojourney.co.uk`
- IONOS destination directory: `/astro-api`
- Frontend page: `hubble-jwst-data-finder.html` (calls this API)

No database and no API keys are required: the MAST archive is accessed
anonymously.

## Files to upload

Upload the **contents** of this directory into `/astro-api` on IONOS:

```
/astro-api/
    .htaccess
    index.php              health check
    search.php             target search (groups observations)
    products.php           product lists for observations
    resolve.php            name-to-coordinates resolver
    download-manifest.php  generates URL lists / curl scripts
    config.php             created from config.example.php (see below)
    config.example.php     configuration template
    bootstrap.php          shared loader (CORS, config, rate limit)
    lib/
        Response.php       JSON envelope + CORS helpers
        Cache.php          filesystem cache + rate limiter
        MastClient.php     official MAST API client (cURL)
        TargetResolver.php target name / coordinate parsing
        ProductRanker.php  recommendation + grouping logic
```

Do **not** upload: this README, `.gitignore`, or any local test files.

## Requirements

- PHP 8.0 or newer (tested on PHP 8.4)
- PHP cURL extension
- PHP SimpleXML extension (for the MAST name resolver's XML response)
- A writable `cache/` directory (created automatically; on IONOS the default
  permissions of the webspace user are normally sufficient — no chmod 777)

## Configuration

1. Upload `config.example.php`.
2. On the server, copy it to `config.php`.
3. In `config.php`, set `allowed_origins` to exactly:

```php
'allowed_origins' => [
    'https://ourastrojourney.co.uk',
    'https://www.ourastrojourney.co.uk',
],
```

Remove the localhost entries for production. No passwords, tokens or keys
are needed anywhere.

## Endpoints

### `GET /index.php`
Health check.

```bash
curl https://api.ourastrojourney.co.uk/index.php
```

### `GET /search.php`
Search for HST/JWST observations of a target.

Parameters: `target` (name or `ra, dec`), `telescope` (`hst|jwst|both`),
`mode` (`recommended|processed|exposures|all|advanced`), `radius`
(degrees, 0.02–1.0, default 0.2).

```bash
curl "https://api.ourastrojourney.co.uk/search.php?target=M51&telescope=both&mode=recommended"
curl "https://api.ourastrojourney.co.uk/search.php?target=202.47%2C%2047.20&telescope=jwst"
```

### `GET /products.php`
List downloadable products for 1–4 observation ids.

```bash
curl "https://api.ourastrojourney.co.uk/products.php?obsid=146078318&mode=recommended"
```

### `GET /resolve.php`
Resolve a name to coordinates without a full search.

```bash
curl "https://api.ourastrojourney.co.uk/resolve.php?target=Pillars%20of%20Creation"
```

### `POST /download-manifest.php`
Generate a download URL list (`format=txt`) or curl script (`format=sh`).
Only official `mast:HST/…` and `mast:JWST/…` URIs are accepted; this is not
a general URL proxy.

```bash
curl -X POST https://api.ourastrojourney.co.uk/download-manifest.php \
  -H 'Content-Type: application/json' \
  -d '{"format":"sh","items":[{"uri":"mast:JWST/product/jw01783-o003_20260705t145039_image2_00259_asn.json","filename":"asn.json"}]}'
```

## Response format

All endpoints return JSON:

```json
{ "success": true, "query": { "…": "…" }, "results": [] }
```

Errors:

```json
{ "success": false, "error": { "code": "BAD_REQUEST", "message": "…" } }
```

HTTP status codes: 200 ok, 400 bad input, 405 wrong method, 429 rate
limited, 502 MAST unreachable/error, 500 unexpected server error.

## MAST services used (verified September 2026)

| Purpose | Service |
|---|---|
| Name resolution | `Mast.Name.Lookup` via `GET /api/v0/invoke?request=…` (returns XML) |
| Observation search | `Mast.Caom.Filtered.Position` (`position` = `"ra, dec, radiusDeg"`) |
| Product lists | `Mast.Caom.Products` (`obsid` parameter) |
| Downloads | `https://mast.stsci.edu/api/v0.1/Download/file?uri=<dataURI>` |

Collections are filtered with `obs_collection` = `HST` and/or `JWST`,
`dataproduct_type=image`, `intentType=science`. Fields used include
`calib_level`, `dataRights`, `productType`, `productSubGroupDescription`,
`size`, `filters`, `instrument_name`, `proposal_id`, `t_min`, `t_exptime`,
`s_ra`, `s_dec`.

The MAST archive is occasionally slow or returns transient errors; the
client retries with backoff and endpoints return a friendly 502 JSON
error when it is unavailable.

## Local development

```bash
php -S 127.0.0.1:8000 -t backend-ionos
```

The frontend automatically calls `http://127.0.0.1:8000` when the site
itself is opened from localhost. You can also force an API base with the
`?api=http://127.0.0.1:8000` page query parameter.

## Diagnosing common errors

- **CORS error in the browser console**: the request's `Origin` is not in
  `allowed_origins` in `config.php`. Add it, or check you uploaded
  `config.php` (not only `config.example.php`).
- **500 with an empty response**: check the IONOS PHP error log; PHP
  notices are suppressed from output by `bootstrap.php`.
- **502 UPSTREAM_ERROR**: the MAST archive is slow or down. Retry later;
  cached results keep working for their TTL (6–24 h).
- **404 on all endpoints**: the files were uploaded to the wrong directory,
  or the `api.ourastrojourney.co.uk` subdomain does not point to
  `/astro-api` yet.
- **Cache errors**: make sure PHP can create `cache/` inside `/astro-api`.
  If not, create it manually with the webspace user (e.g. via SFTP) with
  normal 755 permissions.

## Security notes

- Input is validated and length-limited; observation ids are numeric only.
- `download-manifest.php` only accepts `mast:HST/` and `mast:JWST/` URIs.
- Simple per-IP rate limiting (file-based) is enabled.
- `.htaccess` disables directory listing and blocks HTTP access to `cache/`.
- Never add credentials to this directory. If SFTP deployment automation
  is added later, store the credentials as GitHub Actions secrets
  (`IONOS_HOST`, `IONOS_USERNAME`, `IONOS_SSH_PRIVATE_KEY`,
  `IONOS_API_TARGET_DIR`), never in the repository.
