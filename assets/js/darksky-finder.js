/* Dark Sky Finder: modeled sampling, not verified observing locations. */
(() => {
  'use strict';
  const API = 'https://oaj-darksky-proxy.matt-f77.workers.dev/';
  const KM_PER_MILE = 1.609344;
  const status = (message, error = false) => {
    const node = document.getElementById('darksky-status');
    if (node) {
      node.textContent = message;
      node.style.color = error ? '#ffb3b3' : '';
    }
  };
  const list = () => document.getElementById('darksky-list');
  const summary = () => document.getElementById('darksky-summary');
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const distanceKm = (a, b, c, d) => {
    const rad = n => n * Math.PI / 180;
    const dl = rad(c - a), dn = rad(d - b);
    const h = Math.sin(dl / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(dn / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
  };
  // Public Nominatim permits low-volume reverse lookups (maximum 1 request/second).
  // Cache results locally to avoid repeating lookups during subsequent searches.
  const placeCache = new Map();
  const PLACE_CACHE_PREFIX = 'oaj_place_v1_';
  const PLACE_CACHE_TTL = 30 * 24 * 60 * 60 * 1000;
  let lookupQueue = Promise.resolve();
  let lastLookupAt = 0;
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  function nearbyName(lat, lon) {
    const key = lat.toFixed(4) + ',' + lon.toFixed(4);
    if (placeCache.has(key)) return Promise.resolve(placeCache.get(key));
    try {
      const cached = JSON.parse(localStorage.getItem(PLACE_CACHE_PREFIX + key) || 'null');
      if (cached && cached.expires > Date.now() && cached.label) {
        placeCache.set(key, cached.label);
        return Promise.resolve(cached.label);
      }
    } catch (_) { /* Storage can be unavailable. */ }
    const task = lookupQueue.catch(() => {}).then(async () => {
      if (placeCache.has(key)) return placeCache.get(key);
      await delay(Math.max(0, 1100 - (Date.now() - lastLookupAt)));
      lastLookupAt = Date.now();
      const url = 'https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=12&addressdetails=1&lat=' +
        encodeURIComponent(lat) + '&lon=' + encodeURIComponent(lon);
      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Place name lookup unavailable');
      const data = await response.json();
      const a = data.address || {};
      const name = [a.village || a.town || a.city || a.hamlet || a.suburb || a.municipality || a.county,
        a.county, a.state].filter((part, i, parts) => part && parts.indexOf(part) === i).slice(0, 2).join(', ');
      const label = name || data.name || 'Remote or unnamed area';
      placeCache.set(key, label);
      try { localStorage.setItem(PLACE_CACHE_PREFIX + key, JSON.stringify({ label, expires: Date.now() + PLACE_CACHE_TTL })); } catch (_) { /* Storage optional. */ }
      return label;
    });
    lookupQueue = task.catch(() => {});
    return task;
  }
  let busy = false;
  async function searchAt(latitude, longitude, label) {
    if (busy) return;
    const radiusMiles = Number(document.getElementById('darksky-radius')?.value || 25);
    const bortle = document.getElementById('darksky-bortle')?.value || 'any';
    const radiusKm = radiusMiles * KM_PER_MILE;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !Number.isFinite(radiusKm)) {
      status('Invalid search location or radius.', true);
      return;
    }
    busy = true;
    const button = document.getElementById('darksky-search-btn');
    const locationButton = document.getElementById('darksky-location-btn');
    if (button) button.disabled = true;
    if (locationButton) locationButton.disabled = true;
    status('Checking modeled sky brightness at sampled locations. This may take a few seconds…');
    if (list()) list().replaceChildren();
    if (summary()) summary().hidden = true;
    try {
      const response = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude, radiusKm })
      });
      const data = await response.json();
      if (!response.ok || !data.success || !Array.isArray(data.points)) {
        throw new Error(data?.error?.message || 'Sky quality lookup failed.');
      }
      const results = data.points
        .filter(p => Number.isFinite(Number(p.latitude)) && Number.isFinite(Number(p.longitude))
          && Number.isFinite(Number(p.bortleClass)) && Number.isFinite(Number(p.sqm)))
        .map(p => ({ ...p, distance: distanceKm(latitude, longitude, Number(p.latitude), Number(p.longitude)) }))
        .filter(p => bortle === 'any' || Math.round(Number(p.bortleClass)) === Number(bortle))
        .sort((a, b) => Number(b.sqm) - Number(a.sqm) || a.distance - b.distance);
      const overview = summary();
      if (overview) {
        overview.hidden = false;
        overview.textContent = results.length + ' of ' + data.points.length + ' sampled points match your selection. Sorted by darkest estimated sky first (higher SQM = darker sky).';
      }
      const host = list();
      if (host) {
        if (!results.length) {
          const empty = document.createElement('p');
          empty.className = 'darksky-empty';
          empty.textContent = 'No sampled points matched that Bortle level. Try a wider radius or another level.';
          host.appendChild(empty);
        }
        results.forEach(p => {
          const article = document.createElement('article');
          article.className = 'darksky-site';
          const lat = Number(p.latitude), lon = Number(p.longitude);
          const mapUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(lat.toFixed(5) + ',' + lon.toFixed(5));
          const sqm = Number(p.sqm).toFixed(2);
          const bortleLabel = Math.round(Number(p.bortleClass));
          article.innerHTML =
            '<div class="darksky-result-heading"><div class="darksky-result-title">' +
            '<span class="darksky-result-eyebrow">Estimated sky quality</span>' +
            '<h3>Bortle ' + escapeHtml(bortleLabel) + '</h3>' +
            '<span class="darksky-result-subtitle">Modeled light pollution level</span></div>' +
            '<div class="darksky-sqm-display"><strong>' + escapeHtml(sqm) + '</strong>' +
            '<span>mag/arcsec² · SQM</span><small>Higher = darker</small></div></div>' +
            '<div class="darksky-nearby-place"><span>Nearby named area</span><strong class="darksky-place-name">Looking up nearby place…</strong><small>Approximate place name, not the exact sampling point</small></div>' +
            '<div class="darksky-result-details">' +
            '<span><strong>Distance from search centre</strong><b>' + escapeHtml((p.distance / KM_PER_MILE).toFixed(1)) + ' miles</b></span>' +
            '<span><strong>Sample coordinates</strong><b>' + escapeHtml(lat.toFixed(4)) + ', ' + escapeHtml(lon.toFixed(4)) + '</b></span></div>' +
            '<div class="darksky-card-actions"><button class="button darksky-preview-button" type="button" aria-expanded="false">Show mini map</button>' +
            '<a class="button darksky-map-button" href="' + mapUrl + '" target="_blank" rel="noopener noreferrer">Open in Google Maps ↗</a></div>' +
            '<div class="darksky-mini-map" hidden></div>';
          const previewButton = article.querySelector('.darksky-preview-button');
          const preview = article.querySelector('.darksky-mini-map');
          previewButton.addEventListener('click', () => {
            const opening = preview.hidden;
            preview.hidden = !opening;
            previewButton.setAttribute('aria-expanded', String(opening));
            previewButton.textContent = opening ? 'Hide mini map' : 'Show mini map';
            if (opening && !preview.firstChild) {
              const bounds = [Math.max(-90, lat - .025), Math.max(-180, lon - .04), Math.min(90, lat + .025), Math.min(180, lon + .04)];
              const bbox = [bounds[1], bounds[0], bounds[3], bounds[2]].join(',');
              const iframe = document.createElement('iframe');
              iframe.title = 'Map showing sampled location at ' + lat.toFixed(4) + ', ' + lon.toFixed(4);
              iframe.loading = 'lazy';
              iframe.referrerPolicy = 'strict-origin-when-cross-origin';
              iframe.src = 'https://www.openstreetmap.org/export/embed.html?bbox=' +
                encodeURIComponent(bbox) + '&layer=mapnik&marker=' +
                encodeURIComponent(lat.toFixed(5) + ',' + lon.toFixed(5));
              preview.appendChild(iframe);
              const credit = document.createElement('p');
              credit.className = 'darksky-map-credit';
              credit.textContent = 'Map © OpenStreetMap contributors. A marker is not confirmation of public access.';
              preview.appendChild(credit);
            }
          });
          host.appendChild(article);
          const nameNode = article.querySelector('.darksky-place-name');
          const loadName = () => nearbyName(lat, lon).then(name => {
            if (article.isConnected) nameNode.textContent = name;
          }).catch(() => {
            if (article.isConnected) nameNode.textContent = 'Place name unavailable · view map';
          });
          loadName();
        });
      }
      status('Found ' + results.length + ' matching sampled estimates near ' + label +
        '. These are approximate sky-brightness readings, not confirmed public observing sites.');
    } catch (error) {
      if (summary()) summary().hidden = true;
      console.error('Dark sky lookup:', error);
      status(error.message || 'Unable to retrieve sky-quality estimates right now.', true);
    } finally {
      busy = false;
      if (button) button.disabled = false;
      if (locationButton) locationButton.disabled = false;
    }
  }
  window.oajDarkSkySearch = async function () {
    const input = document.getElementById('darksky-location-input');
    const country = document.getElementById('darksky-country-select');
    const query = input?.value.trim() || '';
    if (!query) return status('Please enter a town, city, or postcode, or use device location.', true);
    status('Finding location…');
    try {
      const place = await geocodePlaceByCountry(query, country?.value || '');
      if (!place) return status('Location not found. Try another town or postcode.', true);
      await searchAt(Number(place.latitude), Number(place.longitude), formatLocationName(place));
    } catch (error) {
      console.error(error);
      status('Unable to find that location right now.', true);
    }
  };
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('darksky-location-btn');
    btn?.addEventListener('click', () => {
      if (!navigator.geolocation) return status('Device location is not available in this browser.', true);
      status('Requesting location permission…');
      navigator.geolocation.getCurrentPosition(
        position => searchAt(position.coords.latitude, position.coords.longitude, 'your device location'),
        () => status('Location permission was denied or unavailable. Use a town or postcode instead.', true),
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
      );
    });
  });
})();
