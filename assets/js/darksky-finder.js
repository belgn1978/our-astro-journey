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
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const distanceKm = (a, b, c, d) => {
    const rad = n => n * Math.PI / 180;
    const dl = rad(c - a), dn = rad(d - b);
    const h = Math.sin(dl / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(dn / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
  };
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
    status('Checking modeled sky brightness at 13 locations. This may take a few seconds…');
    if (list()) list().replaceChildren();
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
        .sort((a, b) => Number(a.bortleClass) - Number(b.bortleClass) || a.distance - b.distance);
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
          article.innerHTML = '<strong>Estimated Bortle ' + escapeHtml(Math.round(Number(p.bortleClass))) +
            '</strong><span>' + escapeHtml(Number(p.sqm).toFixed(2)) + ' mag/arcsec² (modeled SQM)</span>' +
            '<span>' + escapeHtml((p.distance / KM_PER_MILE).toFixed(1)) + ' miles from search centre</span>' +
            '<span>Sample coordinates: ' + escapeHtml(lat.toFixed(4)) + ', ' + escapeHtml(lon.toFixed(4)) + '</span>' +
            '<a href="' + mapUrl + '" target="_blank" rel="noopener noreferrer">Inspect area on map</a>';
          host.appendChild(article);
        });
      }
      status('Found ' + results.length + ' matching sampled estimates near ' + label +
        '. These are approximate sky-brightness readings, not confirmed public observing sites.');
    } catch (error) {
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
