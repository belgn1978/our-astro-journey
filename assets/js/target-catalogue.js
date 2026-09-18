(function () {
  'use strict';

  const data = window.OAJ_TARGET_CATALOGUE;
  if (!data) return;

  const STORAGE_KEY = 'oaj-target-location-v1';
  const view = document.body.dataset.catalogueView;
  let locationProfile = readProfile();

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  }

  function parseRa(value) {
    const bits = value.split(':').map(Number);
    return bits[0] + bits[1] / 60 + (bits[2] || 0) / 3600;
  }

  function readProfile() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && Number.isFinite(saved.lat) && Number.isFinite(saved.lon)) return saved;
    } catch (_) { /* Ignore invalid local preferences. */ }
    return { lat: 53, lon: -2, label: 'General northern-sky view', bortle: 6, precision: 'broad', saved: false };
  }

  function saveProfile(profile) {
    locationProfile = profile;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    updateLocationLabels();
    renderCurrentView();
  }

  function maxAltitude(target) {
    return Math.max(-90, Math.min(90, 90 - Math.abs(locationProfile.lat - target.dec)));
  }

  function suitableFromLatitude(target) {
    return maxAltitude(target) >= 15;
  }

  function bestMonths(target) {
    const ra = parseRa(target.ra);
    const middleMonth = ((Math.round(((ra - 8) / 2)) % 12) + 12) % 12;
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return [-1, 0, 1].map(offset => monthNames[(middleMonth + offset + 12) % 12]);
  }

  function integrationEstimate(target) {
    const bortleFactors = {1:0.55,2:0.7,3:0.85,4:1,5:1.25,6:1.6,7:2.1,8:2.8,9:3.6};
    const altitude = maxAltitude(target);
    const altitudeFactor = altitude >= 60 ? 1 : altitude >= 40 ? 1.15 : altitude >= 25 ? 1.4 : altitude >= 15 ? 1.8 : 2.4;
    const midpoint = Math.max(10, Math.round(target.integration * (bortleFactors[locationProfile.bortle] || 1.6) * altitudeFactor / 5) * 5);
    return { minimum: Math.max(10, Math.round(midpoint * 0.45 / 5) * 5), recommended: midpoint, deep: Math.round(midpoint * 2 / 15) * 15 };
  }

  function duration(minutes) {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins ? `${hours} hr ${mins} min` : `${hours} hr`;
  }

  function difficultyLabel(level) {
    return ['','Very easy','Easy','Moderate','Hard','Very hard'][level];
  }

  function imageUrl(target, width, height) {
    const ra = parseRa(target.ra) * 15;
    const fov = Math.max(0.18, Math.min(4, imageFov(target.size)));
    const params = new URLSearchParams({hips:'CDS/P/DSS2/color',width:String(width || 640),height:String(height || 420),fov:String(fov),projection:'TAN',coordsys:'icrs',ra:String(ra),dec:String(target.dec),format:'jpg'});
    return `https://alasky.cds.unistra.fr/hips-image-services/hips2fits?${params.toString()}`;
  }

  function imageFov(size) {
    const match = String(size).match(/[\d.]+/);
    return match ? Math.max(Number(match[0]) / 60 * 1.35, 0.18) : 1;
  }

  function difficultyDots(level) {
    return `<span class="difficulty-dots" aria-label="Difficulty ${level} out of 5">${[1,2,3,4,5].map(n => `<i class="${n <= level ? 'active' : ''}"></i>`).join('')}</span>`;
  }

  function useLabel(target) {
    if (/imaging only/i.test(target.visibility)) return 'Imaging only';
    if (/primarily an imaging/i.test(target.visibility)) return 'Primarily imaging';
    if (/difficult|challenging/i.test(target.visibility)) return 'Visual: challenging';
    return 'Visual + imaging';
  }

  function targetCard(target) {
    const estimate = integrationEstimate(target);
    const altitude = Math.round(maxAltitude(target));
    const altitudeText = altitude > 0 ? `${altitude}° maximum` : 'Below your horizon';
    return `<article class="target-card">
      <a class="target-card-image" href="./target.html?id=${encodeURIComponent(target.id)}" aria-label="Open ${escapeHtml(target.name)} guide">
        <img src="${imageUrl(target, 600, 390)}" alt="Sky survey view centred on ${escapeHtml(target.name)}" width="600" height="390" loading="lazy" decoding="async" />
      </a>
      <div class="target-card-body"><div class="target-card-topline"><span>${escapeHtml(data.categories[target.category].name)}</span><span>${escapeHtml(target.constellation)}</span></div>
      <h2><a href="./target.html?id=${encodeURIComponent(target.id)}">${escapeHtml(target.name)}</a></h2><p class="catalogue-code">${escapeHtml(target.catalogue)}</p><span class="target-use-badge">${useLabel(target)}</span>
      <div class="target-card-stats"><span>${difficultyDots(target.difficulty)} ${difficultyLabel(target.difficulty)}</span><span><i class="fa-regular fa-clock" aria-hidden="true"></i> ${duration(estimate.minimum)} minimum</span><span><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${altitudeText}</span></div>
      <p>${escapeHtml(target.description)}</p><a class="text-link" href="./target.html?id=${encodeURIComponent(target.id)}">View target guide <span aria-hidden="true">→</span></a></div>
    </article>`;
  }

  function updateLocationLabels() {
    document.querySelectorAll('#location-summary').forEach(node => {
      node.textContent = locationProfile.saved ? `${locationProfile.label} · Bortle ${locationProfile.bortle}` : 'No location set. Results currently use a general northern-sky view.';
    });
  }

  function buildLocationDialog() {
    const host = document.getElementById('location-dialog-host');
    if (!host) return;
    host.innerHTML = `<dialog id="location-dialog" class="location-dialog"><form method="dialog" id="location-form">
      <div class="dialog-heading"><div><p class="eyebrow">Private and adjustable</p><h2>Set your observing location</h2></div><button class="dialog-close" value="cancel" aria-label="Close location settings">×</button></div>
      <p>Your choice is saved only in this browser. Precise device coordinates are not stored by Our Astro Journey.</p>
      <fieldset><legend>How precise should it be?</legend>
        <label class="location-choice"><input type="radio" name="precision" value="broad" checked /><span><strong>Broad region</strong><small>Choose a latitude band. Enough for broad visibility and season guidance.</small></span></label>
        <label class="location-choice"><input type="radio" name="precision" value="manual" /><span><strong>Town or manual coordinates</strong><small>Enter approximate coordinates. Rounding them protects your exact location.</small></span></label>
        <label class="location-choice"><input type="radio" name="precision" value="device" /><span><strong>Precise device location</strong><small>Your browser asks permission. Coordinates remain in this browser.</small></span></label>
      </fieldset>
      <div id="broad-location-fields"><label>Region<select id="broad-region"><option value="53,-2,United Kingdom">United Kingdom</option><option value="45,10,Central Europe">Central Europe</option><option value="38,-97,Central United States">Central United States</option><option value="-25,134,Australia">Australia</option><option value="-30,25,Southern Africa">Southern Africa</option><option value="0,0,Equatorial region">Equatorial region</option></select></label></div>
      <div id="manual-location-fields" hidden><label>Town, city or postcode<span class="location-search-row"><input id="place-search" type="search" maxlength="100" placeholder="e.g. Stoke-on-Trent" /><button id="search-place" type="button" class="button button-secondary">Find</button></span></label><p id="place-search-status" class="form-note" role="status">Place searches are sent to OpenStreetMap. You can round or edit the result below before saving.</p><div class="coordinate-grid"><label>Latitude<input id="manual-lat" type="number" min="-90" max="90" step="0.01" value="${locationProfile.lat}" /></label><label>Longitude<input id="manual-lon" type="number" min="-180" max="180" step="0.01" value="${locationProfile.lon}" /></label></div><label>Location label<input id="manual-label" type="text" maxlength="50" value="${escapeHtml(locationProfile.label)}" placeholder="e.g. Stoke-on-Trent area" /></label></div>
      <div id="device-location-fields" hidden><button id="get-device-location" type="button" class="button button-secondary">Use my device location</button><p id="device-location-status" role="status"></p></div>
      <label>Bortle level<select id="bortle-level">${[1,2,3,4,5,6,7,8,9].map(n=>`<option value="${n}" ${n===locationProfile.bortle?'selected':''}>Bortle ${n}${n===1?' — exceptionally dark':n===4?' — rural/suburban transition':n===6?' — bright suburban':n===9?' — inner city':''}</option>`).join('')}</select></label>
      <p class="form-note">Bortle level has a large effect on broadband integration estimates. Use your real local experience if it differs from regional maps.</p>
      <div class="dialog-actions"><button value="cancel" class="button button-secondary">Cancel</button><button id="save-location" value="default" class="button">Save location</button></div>
    </form></dialog>`;
    const dialog = document.getElementById('location-dialog');
    let deviceCoords = null;
    const precisionInputs = dialog.querySelectorAll('input[name="precision"]');
    precisionInputs.forEach(input => input.addEventListener('change', () => {
      ['broad','manual','device'].forEach(mode => { document.getElementById(`${mode}-location-fields`).hidden = input.value !== mode; });
    }));
    document.getElementById('get-device-location').addEventListener('click', () => {
      const status = document.getElementById('device-location-status');
      if (!navigator.geolocation) { status.textContent = 'This browser does not support location access.'; return; }
      status.textContent = 'Waiting for location permission…';
      navigator.geolocation.getCurrentPosition(position => {
        deviceCoords = {lat: position.coords.latitude, lon: position.coords.longitude};
        status.textContent = `Location ready (approximately ${deviceCoords.lat.toFixed(2)}°, ${deviceCoords.lon.toFixed(2)}°).`;
      }, () => { status.textContent = 'Location was unavailable or permission was not granted.'; }, {enableHighAccuracy:false,timeout:10000,maximumAge:600000});
    });
    document.getElementById('search-place').addEventListener('click', async () => {
      const query = document.getElementById('place-search').value.trim();
      const status = document.getElementById('place-search-status');
      if (!query) { status.textContent = 'Enter a town, city or postcode first.'; return; }
      status.textContent = 'Searching OpenStreetMap…';
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`, {headers:{'Accept':'application/json'}});
        if (!response.ok) throw new Error('Search unavailable');
        const results = await response.json();
        if (!results.length) { status.textContent = 'No matching place found. Try a nearby town or enter coordinates manually.'; return; }
        const result = results[0];
        document.getElementById('manual-lat').value = Number(result.lat).toFixed(2);
        document.getElementById('manual-lon').value = Number(result.lon).toFixed(2);
        document.getElementById('manual-label').value = query;
        status.textContent = `Found ${result.display_name}. Coordinates have been rounded to about 1 km.`;
      } catch (_) { status.textContent = 'Place search is unavailable. You can still enter coordinates manually.'; }
    });
    document.getElementById('save-location').addEventListener('click', event => {
      event.preventDefault();
      const precision = dialog.querySelector('input[name="precision"]:checked').value;
      const bortle = Number(document.getElementById('bortle-level').value);
      let profile;
      if (precision === 'broad') {
        const [lat, lon, label] = document.getElementById('broad-region').value.split(',');
        profile = {lat:Number(lat),lon:Number(lon),label,bortle,precision,saved:true};
      } else if (precision === 'manual') {
        const lat = Number(document.getElementById('manual-lat').value), lon = Number(document.getElementById('manual-lon').value);
        if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat)>90 || Math.abs(lon)>180) return;
        profile = {lat,lon,label:document.getElementById('manual-label').value.trim() || 'Saved observing location',bortle,precision,saved:true};
      } else {
        if (!deviceCoords) { document.getElementById('device-location-status').textContent = 'Choose “Use my device location” first.'; return; }
        profile = {...deviceCoords,label:'Precise device location',bortle,precision,saved:true};
      }
      saveProfile(profile); dialog.close();
    });
    document.querySelectorAll('[data-open-location]').forEach(button => button.addEventListener('click', () => dialog.showModal()));
  }

  function renderCategories() {
    const grid = document.getElementById('category-grid');
    if (!grid) return;
    grid.innerHTML = Object.entries(data.categories).map(([key, category]) => {
      const target = data.targets.find(item => item.id === category.representative);
      const count = data.targets.filter(item => item.category === key).length;
      return `<article class="catalogue-category-card"><a class="category-image" href="./target-category.html?category=${key}"><img src="${imageUrl(target,640,360)}" alt="${escapeHtml(target.name)}, representing ${escapeHtml(category.name)}" width="640" height="360" loading="lazy" /></a><div><p class="category-count">${count} targets</p><h2><a href="./target-category.html?category=${key}">${escapeHtml(category.name)}</a></h2><p>${escapeHtml(category.description)}</p><a class="text-link" href="./target-category.html?category=${key}">Explore ${escapeHtml(category.name.toLowerCase())} <span aria-hidden="true">→</span></a></div></article>`;
    }).join('');
    const recommended = data.targets.filter(suitableFromLatitude).sort((a,b) => (a.difficulty-b.difficulty) || (maxAltitude(b)-maxAltitude(a))).slice(0,3);
    document.getElementById('recommended-targets').innerHTML = recommended.map(targetCard).join('');
  }

  function renderListing() {
    const params = new URLSearchParams(location.search);
    const categoryKey = params.get('category') || 'all';
    const category = data.categories[categoryKey];
    const baseTargets = category ? data.targets.filter(item => item.category === categoryKey) : data.targets;
    document.getElementById('category-title').textContent = category ? category.name : 'All targets';
    document.getElementById('category-breadcrumb').textContent = category ? category.name : 'All targets';
    document.getElementById('category-description').textContent = category ? category.description : 'Search the complete catalogue or filter it by difficulty and suitability.';
    document.title = `${category ? category.name : 'All Astrophotography Targets'} | Our Astro Journey`;
    const render = () => {
      const search = document.getElementById('target-search').value.toLowerCase().trim();
      const difficulty = document.getElementById('difficulty-filter').value;
      const use = document.getElementById('use-filter').value;
      const visibleOnly = document.getElementById('visible-filter').checked;
      let targets = baseTargets.filter(target => {
        const haystack = `${target.name} ${target.catalogue} ${target.constellation} ${target.aliases || ''}`.toLowerCase();
        const useMatch = use === 'all' || (use === 'visual' && !/primarily|only/i.test(target.visibility)) || (use === 'imaging' && /imaging/i.test(target.visibility)) || (use === 'imaging-primary' && /primarily|only/i.test(target.visibility));
        return (!search || haystack.includes(search)) && (difficulty === 'all' || target.difficulty === Number(difficulty)) && useMatch && (!visibleOnly || suitableFromLatitude(target));
      });
      const sort = document.getElementById('sort-targets').value;
      targets.sort((a,b) => sort === 'name' ? a.name.localeCompare(b.name) : sort === 'difficulty' ? a.difficulty-b.difficulty : sort === 'altitude' ? maxAltitude(b)-maxAltitude(a) : (suitableFromLatitude(b)-suitableFromLatitude(a)) || (a.difficulty-b.difficulty));
      document.getElementById('target-grid').innerHTML = targets.map(targetCard).join('');
      document.getElementById('result-count').textContent = `${targets.length} target${targets.length === 1 ? '' : 's'}`;
      document.getElementById('no-results').hidden = targets.length !== 0;
    };
    document.querySelectorAll('#target-filters input, #target-filters select, #sort-targets').forEach(control => control.addEventListener('input', render));
    render();
  }

  function renderDetail() {
    const target = data.targets.find(item => item.id === new URLSearchParams(location.search).get('id'));
    const host = document.getElementById('target-detail');
    if (!target) { host.innerHTML = '<section class="page-hero"><div class="content-wrapper"><h1>Target not found</h1><p><a href="./targets.html">Return to the target catalogue</a>.</p></div></section>'; return; }
    const category = data.categories[target.category], estimate = integrationEstimate(target), altitude = Math.round(maxAltitude(target)), months = bestMonths(target);
    document.title = `${target.name} Astrophotography Guide | Our Astro Journey`;
    host.innerHTML = `<section class="target-detail-hero"><div class="target-hero-image"><img src="${imageUrl(target,1400,850)}" alt="Sky survey view centred on ${escapeHtml(target.name)}" width="1400" height="850" /></div><div class="target-hero-overlay"><div class="content-wrapper"><nav class="catalogue-breadcrumbs" aria-label="Breadcrumb"><a href="./targets.html">Catalogue</a><span>/</span><a href="./target-category.html?category=${target.category}">${escapeHtml(category.name)}</a><span>/</span><span>${escapeHtml(target.name)}</span></nav><p class="eyebrow">${escapeHtml(category.name)} · ${escapeHtml(target.constellation)}</p><h1>${escapeHtml(target.name)}</h1><p class="target-catalogue-code">${escapeHtml(target.catalogue)}</p><p class="target-hero-copy">${escapeHtml(target.description)}</p></div></div></section>
      <section><div class="content-wrapper target-detail-grid"><article class="target-main-column"><div class="target-facts"><div><span>Object type</span><strong>${escapeHtml(category.name)}</strong></div><div><span>Distance</span><strong>${escapeHtml(target.distance)}</strong></div><div><span>Apparent size</span><strong>${escapeHtml(target.size)}</strong></div><div><span>Magnitude</span><strong>${target.magnitude == null ? 'Not meaningful / not listed' : target.magnitude}</strong></div><div><span>Coordinates (J2000)</span><strong>RA ${escapeHtml(target.ra)} · Dec ${target.dec.toFixed(2)}°</strong></div><div><span>Best evening months</span><strong>${months.join('–')}</strong></div></div>
      <h2>What to expect</h2><p>${escapeHtml(target.visibility)}.</p><p>${escapeHtml(target.description)}</p><h2>How to find it</h2><p>${escapeHtml(target.finding)}</p><h2>Imaging guidance</h2><dl class="guidance-list"><div><dt>Difficulty</dt><dd>${difficultyDots(target.difficulty)} ${difficultyLabel(target.difficulty)}</dd></div><div><dt>Suggested filters</dt><dd>${escapeHtml(target.filters)}</dd></div><div><dt>Framing</dt><dd>${escapeHtml(target.focal)}</dd></div></dl>
      <div class="estimate-explainer"><h3>About these time estimates</h3><p>These are rough total-integration starting points, not guarantees. Transparency, moonlight, camera sensitivity, focal ratio, sub length and processing all matter. The estimate changes with the Bortle level and maximum altitude saved in this browser.</p></div></article>
      <aside class="target-planner-card"><p class="eyebrow">From your location</p><h2>Your target plan</h2><p id="detail-location-label">${escapeHtml(locationProfile.saved ? locationProfile.label : 'General northern-sky view')}</p><div class="planner-score ${altitude < 15 ? 'poor' : altitude < 30 ? 'fair' : 'good'}"><strong>${altitude > 0 ? `${altitude}°` : 'Not visible'}</strong><span>${altitude > 0 ? 'maximum altitude' : 'from this latitude'}</span></div><dl><div><dt>Latitude suitability</dt><dd>${altitude >= 30 ? 'Good' : altitude >= 15 ? 'Low but possible' : 'Not recommended'}</dd></div><div><dt>Sky setting</dt><dd>Bortle ${locationProfile.bortle}</dd></div><div><dt>Detectable result</dt><dd>${duration(estimate.minimum)}</dd></div><div><dt>Recommended</dt><dd>${duration(estimate.recommended)}</dd></div><div><dt>Deep project</dt><dd>${duration(estimate.deep)}+</dd></div></dl><button type="button" class="button" data-open-location>Change location or sky</button></aside></div></section>
      <section aria-labelledby="related-heading"><div class="content-wrapper"><h2 id="related-heading" class="section-heading">Similar targets</h2><div class="target-card-grid">${data.targets.filter(item=>item.category===target.category&&item.id!==target.id).slice(0,3).map(targetCard).join('')}</div></div></section>`;
    document.querySelectorAll('[data-open-location]').forEach(button => button.addEventListener('click', () => document.getElementById('location-dialog').showModal()));
  }

  function renderCurrentView() {
    if (view === 'categories') renderCategories();
    if (view === 'listing') renderListing();
    if (view === 'detail') renderDetail();
  }

  updateLocationLabels();
  renderCurrentView();
  buildLocationDialog();
}());
