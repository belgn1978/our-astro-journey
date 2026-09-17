/* ============================================================
   Hubble & JWST Data Finder
   Searches the Our Astro Journey API (which proxies the official
   MAST/STScI archive) and manages a client-side download basket.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Configuration ---------- */

  function resolveApiBase() {
    var params = new URLSearchParams(window.location.search);
    var override = params.get('api');
    if (override && /^https?:\/\//.test(override)) {
      return override.replace(/\/$/, '');
    }
    var host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '') {
      return 'http://127.0.0.1:8000';
    }
    return 'https://api.ourastrojourney.co.uk';
  }

  var API_BASE = resolveApiBase();
  var BASKET_KEY = 'oaj-data-finder-basket';

  /* ---------- DOM references ---------- */

  var form = document.getElementById('finder-form');
  var targetInput = document.getElementById('finder-target');
  var modeSelect = document.getElementById('finder-mode');
  var statusEl = document.getElementById('finder-status');
  var resultsEl = document.getElementById('finder-results');
  var basketEl = document.getElementById('finder-basket');
  var basketToggle = document.getElementById('finder-basket-toggle');
  var basketList = document.getElementById('basket-list');
  var basketCount = document.getElementById('basket-count');
  var basketSummary = document.getElementById('basket-summary');
  var basketScriptBtn = document.getElementById('basket-script');
  var basketManifestBtn = document.getElementById('basket-manifest');
  var basketCopyBtn = document.getElementById('basket-copy');
  var basketClearBtn = document.getElementById('basket-clear');

  /* ---------- Analytics ---------- */

  function track(eventName, params) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params || {});
    }
  }

  /* ---------- Helpers ---------- */

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setStatus(message, isError) {
    statusEl.textContent = message;
    statusEl.classList.toggle('finder-status-error', Boolean(isError));
  }

  function formatBytes(bytes) {
    if (!bytes || bytes <= 0) return '—';
    var units = ['B', 'KB', 'MB', 'GB', 'TB'];
    var i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    var value = bytes / Math.pow(1024, i);
    return (i === 0 ? Math.round(value) : value.toFixed(1)) + ' ' + units[i];
  }

  function apiFetch(path, options) {
    return fetch(API_BASE + path, options).then(function (response) {
      return response.json().catch(function () {
        throw new Error('The API returned an unreadable response.');
      }).then(function (data) {
        if (!response.ok || !data.success) {
          var message = data && data.error && data.error.message
            ? data.error.message
            : 'The archive service returned an error (' + response.status + ').';
          throw new Error(message);
        }
        return data;
      });
    });
  }

  /* ---------- Basket ---------- */

  function loadBasket() {
    try {
      var raw = window.localStorage.getItem(BASKET_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveBasket(items) {
    try {
      window.localStorage.setItem(BASKET_KEY, JSON.stringify(items));
    } catch (e) {
      /* storage full or unavailable; basket still works in memory */
    }
  }

  function basketTotalBytes(items) {
    return items.reduce(function (sum, item) { return sum + (item.sizeBytes || 0); }, 0);
  }

  function renderBasket() {
    var items = loadBasket();
    basketCount.textContent = String(items.length);

    if (items.length === 0) {
      basketSummary.textContent = 'No files yet. Add files from the search results below.';
      basketList.innerHTML = '';
    } else {
      basketSummary.textContent = items.length + (items.length === 1 ? ' file' : ' files') +
        ' · about ' + formatBytes(basketTotalBytes(items)) + ' total';
      basketList.innerHTML = items.map(function (item, index) {
        var meta = [item.telescope, item.instrument, (item.filters || []).join(', ')]
          .filter(Boolean).join(' · ');
        return '<li class="basket-item">' +
          '<div class="basket-item-info">' +
            '<span class="basket-item-name">' + escapeHtml(item.filename) + '</span>' +
            '<span class="basket-item-meta">' + escapeHtml(meta) + ' · ' + escapeHtml(item.sizeLabel || formatBytes(item.sizeBytes)) + '</span>' +
          '</div>' +
          '<button type="button" class="basket-remove" data-index="' + index + '" aria-label="Remove ' + escapeHtml(item.filename) + ' from basket">&times;</button>' +
        '</li>';
      }).join('');
    }

    var disabled = items.length === 0;
    basketScriptBtn.disabled = disabled;
    basketManifestBtn.disabled = disabled;
    basketCopyBtn.disabled = disabled;
    basketClearBtn.disabled = disabled;
  }

  function addToBasket(products, context) {
    var items = loadBasket();
    var seen = {};
    items.forEach(function (item) { seen[item.dataUri] = true; });
    var added = 0;
    products.forEach(function (p) {
      if (!p.dataUri || seen[p.dataUri]) return;
      seen[p.dataUri] = true;
      items.push({
        filename: p.filename,
        dataUri: p.dataUri,
        downloadUrl: p.downloadUrl,
        sizeBytes: p.sizeBytes,
        sizeLabel: p.sizeLabel,
        telescope: context.telescope || '',
        instrument: context.instrument || '',
        filters: p.filters || [],
        categoryLabel: p.categoryLabel || ''
      });
      added++;
    });
    saveBasket(items);
    renderBasket();
    return added;
  }

  function removeFromBasket(index) {
    var items = loadBasket();
    items.splice(index, 1);
    saveBasket(items);
    renderBasket();
  }

  function downloadTextFile(filename, text, mime) {
    var blob = new Blob([text], { type: mime || 'text/plain' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
  }

  function requestManifest(format) {
    var items = loadBasket();
    if (items.length === 0) return;
    var payload = {
      format: format,
      items: items.map(function (item) {
        return { uri: item.dataUri, filename: item.filename };
      })
    };

    apiFetch('/download-manifest.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (data) {
      if (format === 'sh') {
        downloadTextFile('mast-downloads.sh', data.script, 'text/x-sh');
      } else {
        downloadTextFile('mast-downloads.txt', data.script, 'text/plain');
      }
      track('manifest_generated', { format: format, file_count: items.length });
      setStatus('Your download ' + (format === 'sh' ? 'script' : 'list') + ' has been generated.');
    }).catch(function () {
      // Offline fallback: build the file in the browser from stored URLs.
      var lines;
      if (format === 'sh') {
        lines = ['#!/usr/bin/env bash', '# Downloads come directly from the official STScI MAST archive.', 'set -euo pipefail', ''];
        items.forEach(function (item) {
          lines.push('curl -fL --retry 2 -o ' + JSON.stringify(item.filename) + ' ' + JSON.stringify(item.downloadUrl));
        });
        downloadTextFile('mast-downloads.sh', lines.join('\n') + '\n', 'text/x-sh');
      } else {
        lines = items.map(function (item) { return item.downloadUrl + '  # ' + item.filename; });
        downloadTextFile('mast-downloads.txt', lines.join('\n') + '\n', 'text/plain');
      }
      setStatus('The API was unreachable, so the file was generated in your browser instead.');
    });
  }

  /* ---------- Results rendering ---------- */

  function renderSearchResults(data) {
    var html = '';
    html += '<div class="finder-summary feature-card">';
    html += '<h2>Search results</h2>';
    html += '<p><strong>' + escapeHtml(data.resolved.label) + '</strong> — position ' +
      data.resolved.ra.toFixed(5) + ', ' + data.resolved.dec.toFixed(5) +
      ' (resolved by ' + escapeHtml(data.resolved.source) + '). ';
    html += data.resultCount + ' observations, grouped into ' + data.groupCount +
      (data.groupCount === 1 ? ' dataset.' : ' datasets.') + '</p>';
    if (data.truncated) {
      html += '<p class="finder-note">This is a very busy part of the sky, so only the ' + data.groupsShown +
        ' most useful datasets are shown out of ' + data.groupCount + '. Try a more specific target or one telescope at a time.</p>';
    }
    html += '<p class="finder-note">' + escapeHtml(data.overlapApproximation) + '</p>';
    html += '</div>';

    if (data.groups.length === 0) {
      html += '<div class="feature-card"><p>No public Hubble or JWST images were found for this search. Try a nearby name, a wider spelling (for example "Orion Nebula" instead of "M 42"), or coordinates.</p></div>';
      resultsEl.innerHTML = html;
      return;
    }

    html += '<div class="finder-group-list">';
    data.groups.forEach(function (group, index) {
      html += renderGroupCard(group, index);
    });
    html += '</div>';
    resultsEl.innerHTML = html;
    track('dataset_recommendation_view', { groups: data.groupCount, results: data.resultCount });
  }

  function renderGroupCard(group, index) {
    var telescopeClass = group.telescope === 'JWST' ? 'badge-jwst' : 'badge-hst';
    var filterChips = group.filters.map(function (f) {
      return '<span class="filter-chip">' + escapeHtml(f) + '</span>';
    }).join('');

    var suggestions = '';
    if (group.colourSuggestions && group.colourSuggestions.length > 0) {
      suggestions = '<div class="colour-suggestions">' +
        group.colourSuggestions.map(function (s) {
          return '<p><strong>' + escapeHtml(s.type) + ':</strong> ' + escapeHtml(s.mapping) + '</p>';
        }).join('') +
        '<p class="finder-note">' + escapeHtml(group.colourSuggestions[0].note) + '</p>' +
      '</div>';
    }

    var warning = group.overlapWarning
      ? '<p class="finder-warning" role="note"><i class="fas fa-triangle-exclamation" aria-hidden="true"></i> ' + escapeHtml(group.overlapWarning) + '</p>'
      : '';

    var meta = [
      group.instrumentFull ? escapeHtml(group.instrumentFull) : '',
      group.proposalId ? 'Programme ' + escapeHtml(group.proposalId) : '',
      group.date ? 'Observed ' + escapeHtml(group.date) : '',
      group.observationCount + (group.observationCount === 1 ? ' observation' : ' observations'),
      group.totalExposureSeconds > 0 ? 'Total exposure ' + escapeHtml(group.totalExposureLabel) : ''
    ].filter(Boolean).join(' · ');

    return '<article class="finder-group feature-card" data-group-index="' + index + '">' +
      '<div class="group-header">' +
        '<span class="telescope-badge ' + telescopeClass + '">' + escapeHtml(group.telescope) + '</span>' +
        '<h3 class="group-title">' + escapeHtml(group.instrument) + (group.proposalId ? ' · Programme ' + escapeHtml(group.proposalId) : '') + '</h3>' +
      '</div>' +
      '<p class="group-meta">' + meta + '</p>' +
      (filterChips ? '<div class="filter-chips" aria-label="Filters">' + filterChips + '</div>' : '') +
      suggestions +
      warning +
      '<div class="group-actions">' +
        '<button type="button" class="button button-secondary group-products-btn" data-group="' + index + '" aria-expanded="false">' +
          '<i class="fas fa-folder-open" aria-hidden="true"></i> View products' +
        '</button>' +
        '<button type="button" class="button group-add-recommended" data-group="' + index + '" disabled>' +
          '<i class="fas fa-plus" aria-hidden="true"></i> Add recommended files' +
        '</button>' +
      '</div>' +
      '<div class="group-products" id="group-products-' + index + '" hidden></div>' +
    '</article>';
  }

  function renderProducts(container, group, result, mode) {
    var products = result.products || [];
    if (products.length === 0) {
      container.innerHTML = '<p>No useful public science products were found for this observation set.</p>';
      return;
    }

    var html = '<p class="finder-note">' + result.totalScienceProducts + ' science products in the archive for this observation; ' +
      result.recommendedCount + ' recommended for image processing. Download links go directly to the official MAST archive.</p>';
    html += '<ul class="product-list">';
    products.forEach(function (p, i) {
      var recommended = p.recommended ? ' product-recommended' : '';
      var reasons = (p.recommendReasons && p.recommendReasons.length)
        ? '<span class="product-reasons">' + escapeHtml(p.recommendReasons.join('; ')) + '</span>'
        : '';
      var advanced = (mode === 'advanced' || mode === 'all')
        ? '<span class="product-advanced">' +
          (p.subGroup ? 'Type ' + escapeHtml(p.subGroup) + ' · ' : '') +
          escapeHtml(p.calibLabel || '') +
          (p.description ? ' · ' + escapeHtml(p.description) : '') +
          '</span>'
        : '';
      html += '<li class="product-item' + recommended + '">' +
        '<div class="product-info">' +
          '<span class="product-name">' + escapeHtml(p.filename) + '</span>' +
          '<span class="product-meta">' + escapeHtml(p.categoryLabel) +
            (p.filters && p.filters.length ? ' · ' + escapeHtml(p.filters.join(', ')) : '') +
            ' · ' + escapeHtml(p.sizeLabel) + '</span>' +
          reasons + advanced +
        '</div>' +
        '<div class="product-actions">' +
          '<button type="button" class="product-add" data-obsid="' + escapeHtml(result.obsid) + '" data-index="' + i + '"' +
            ' aria-label="Add ' + escapeHtml(p.filename) + ' to download basket">Add</button>' +
          '<a class="product-download" href="' + escapeHtml(p.downloadUrl) + '" rel="noopener noreferrer" target="_blank"' +
            ' aria-label="Download ' + escapeHtml(p.filename) + ' from the MAST archive">Download</a>' +
        '</div>' +
      '</li>';
    });
    html += '</ul>';
    container.innerHTML = html;
    container.dataset.products = JSON.stringify(products.map(function (p) {
      return {
        filename: p.filename, dataUri: p.dataUri, downloadUrl: p.downloadUrl,
        sizeBytes: p.sizeBytes, sizeLabel: p.sizeLabel, filters: p.filters,
        categoryLabel: p.categoryLabel, recommended: p.recommended
      };
    }));
  }

  /* ---------- Search flow ---------- */

  var currentSearch = null;

  function runSearch(target, telescope, mode) {
    setStatus('Resolving target and searching the MAST archive… this can take a minute or two for busy regions of the sky.', false);
    resultsEl.innerHTML = '';
    document.querySelectorAll('.group-add-recommended').forEach(function (btn) { btn.disabled = true; });

    var query = '?target=' + encodeURIComponent(target) +
      '&telescope=' + encodeURIComponent(telescope) +
      '&mode=' + encodeURIComponent(mode);

    apiFetch('/search.php' + query).then(function (data) {
      currentSearch = data;
      renderSearchResults(data);
      setStatus('Search complete: ' + data.groupCount + ' dataset' + (data.groupCount === 1 ? '' : 's') + ' found.', false);
      track('archive_search', { target: data.resolved.label, telescope: telescope, mode: mode, results: data.resultCount });
      var url = new URL(window.location.href);
      url.searchParams.set('target', target);
      url.searchParams.set('telescope', telescope);
      url.searchParams.set('mode', mode);
      window.history.replaceState({}, '', url.toString());
    }).catch(function (error) {
      setStatus(error.message + ' You can retry — the archive is sometimes slow or briefly unavailable.', true);
    });
  }

  function loadProductsForGroup(groupIndex, container, button) {
    if (!currentSearch) return;
    var group = currentSearch.groups[groupIndex];
    if (!group) return;
    var mode = modeSelect.value;
    var obsids = group.obsids.slice(0, 4).join(',');

    button.disabled = true;
    container.hidden = false;
    container.innerHTML = '<p class="finder-note">Loading products from the archive…</p>';

    apiFetch('/products.php?obsid=' + encodeURIComponent(obsids) + '&mode=' + encodeURIComponent(mode))
      .then(function (data) {
        var merged = [];
        data.results.forEach(function (result) {
          (result.products || []).forEach(function (p) { p._obsid = result.obsid; });
          merged = merged.concat(result.products || []);
        });
        var combined = { obsid: obsids, products: merged };
        renderProducts(container, group, combined, mode);
        button.disabled = false;
        button.setAttribute('aria-expanded', 'true');

        var recommended = merged.filter(function (p) { return p.recommended; });
        var addBtn = document.querySelector('.group-add-recommended[data-group="' + groupIndex + '"]');
        if (addBtn) {
          addBtn.disabled = recommended.length === 0;
          addBtn.dataset.ready = recommended.length > 0 ? '1' : '';
        }
      })
      .catch(function (error) {
        container.innerHTML = '<p class="finder-status-error">' + escapeHtml(error.message) + ' Please try again.</p>';
        button.disabled = false;
      });
  }

  /* ---------- Event wiring ---------- */

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var target = targetInput.value.trim();
    if (!target) {
      setStatus('Please enter a target name or coordinates first.', true);
      targetInput.focus();
      return;
    }
    var telescope = (form.querySelector('input[name="telescope"]:checked') || {}).value || 'both';
    runSearch(target, telescope, modeSelect.value);
  });

  resultsEl.addEventListener('click', function (event) {
    var productsBtn = event.target.closest('.group-products-btn');
    if (productsBtn) {
      var index = parseInt(productsBtn.dataset.group, 10);
      var container = document.getElementById('group-products-' + index);
      if (!container) return;
      if (!container.hidden && container.dataset.products) {
        container.hidden = true;
        productsBtn.setAttribute('aria-expanded', 'false');
        return;
      }
      if (container.dataset.products) {
        container.hidden = false;
        productsBtn.setAttribute('aria-expanded', 'true');
        return;
      }
      loadProductsForGroup(index, container, productsBtn);
      return;
    }

    var addBtn = event.target.closest('.group-add-recommended');
    if (addBtn && addBtn.dataset.ready === '1') {
      var gi = parseInt(addBtn.dataset.group, 10);
      var box = document.getElementById('group-products-' + gi);
      if (!box || !box.dataset.products || !currentSearch) return;
      var products = JSON.parse(box.dataset.products).filter(function (p) { return p.recommended; });
      var group = currentSearch.groups[gi];
      var added = addToBasket(products, { telescope: group.telescope, instrument: group.instrument });
      setStatus(added > 0
        ? added + ' recommended file' + (added === 1 ? '' : 's') + ' added to your basket.'
        : 'Those files are already in your basket.');
      track('dataset_added', { count: added, telescope: group.telescope });
      return;
    }

    var singleAdd = event.target.closest('.product-add');
    if (singleAdd) {
      var list = singleAdd.closest('.group-products');
      if (!list || !list.dataset.products || !currentSearch) return;
      var all = JSON.parse(list.dataset.products);
      var product = all[parseInt(singleAdd.dataset.index, 10)];
      var groupCard = singleAdd.closest('.finder-group');
      var gIndex = groupCard ? parseInt(groupCard.dataset.groupIndex, 10) : -1;
      var g = gIndex >= 0 ? currentSearch.groups[gIndex] : {};
      var addedOne = addToBasket([product], { telescope: g.telescope || '', instrument: g.instrument || '' });
      setStatus(addedOne > 0 ? 'Added ' + product.filename + ' to your basket.' : 'That file is already in your basket.');
      track('file_added', { filename: product.filename });
      return;
    }

    var downloadLink = event.target.closest('.product-download');
    if (downloadLink) {
      track('download_clicked', { url: downloadLink.href });
    }
  });

  basketToggle.addEventListener('click', function () {
    var isHidden = basketEl.hidden;
    basketEl.hidden = !isHidden;
    basketToggle.setAttribute('aria-expanded', String(isHidden));
    if (isHidden) {
      renderBasket();
      if (typeof basketEl.scrollIntoView === 'function') {
        basketEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  });

  basketList.addEventListener('click', function (event) {
    var btn = event.target.closest('.basket-remove');
    if (btn) {
      removeFromBasket(parseInt(btn.dataset.index, 10));
    }
  });

  basketClearBtn.addEventListener('click', function () {
    saveBasket([]);
    renderBasket();
    setStatus('Basket cleared.');
  });

  basketScriptBtn.addEventListener('click', function () { requestManifest('sh'); });
  basketManifestBtn.addEventListener('click', function () { requestManifest('txt'); });

  basketCopyBtn.addEventListener('click', function () {
    var items = loadBasket();
    if (items.length === 0) return;
    var text = items.map(function (item) { return item.downloadUrl; }).join('\n');
    function done() {
      setStatus('Copied ' + items.length + ' download URL' + (items.length === 1 ? '' : 's') + ' to the clipboard.');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  });

  function fallbackCopy(text, done) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'absolute';
    area.style.left = '-9999px';
    document.body.appendChild(area);
    area.select();
    try { document.execCommand('copy'); } catch (e) { /* ignore */ }
    document.body.removeChild(area);
    done();
  }

  /* ---------- Init: restore basket, support shareable URLs ---------- */

  renderBasket();

  var params = new URLSearchParams(window.location.search);
  var initialTarget = params.get('target');
  var initialTelescope = params.get('telescope');
  var initialMode = params.get('mode');
  if (initialTelescope && ['hst', 'jwst', 'both'].indexOf(initialTelescope) !== -1) {
    var radio = form.querySelector('input[name="telescope"][value="' + initialTelescope + '"]');
    if (radio) radio.checked = true;
  }
  if (initialMode && ['recommended', 'processed', 'exposures', 'all', 'advanced'].indexOf(initialMode) !== -1) {
    modeSelect.value = initialMode;
  }
  if (initialTarget) {
    targetInput.value = initialTarget;
    runSearch(initialTarget, initialTelescope || 'both', initialMode || 'recommended');
  }
})();
