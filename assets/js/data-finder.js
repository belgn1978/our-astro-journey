/* ============================================================
   Hubble & JWST Image Data Downloader
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
  var basketSizeNote = document.getElementById('basket-size-note');
  var basketPowerShellBtn = document.getElementById('basket-powershell');
  var basketScriptBtn = document.getElementById('basket-script');
  var basketManifestBtn = document.getElementById('basket-manifest');
  var basketCopyBtn = document.getElementById('basket-copy');
  var basketClearBtn = document.getElementById('basket-clear');
  var downloadHelpButtons = Array.prototype.slice.call(document.querySelectorAll('[data-download-help]'));
  var downloadHelpPanels = Array.prototype.slice.call(document.querySelectorAll('[data-download-help-panel]'));
  var toastEl = document.getElementById('finder-toast');

  /* ---------- Analytics ---------- */

  function track(eventName, params) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params || {});
    }
  }

  /* ---------- Toast confirmation ---------- */

  var toastTimer = null;

  function showToast(message) {
    if (!toastEl) {
      toastEl = document.getElementById('finder-toast');
    }
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.hidden = false;
    toastEl.classList.remove('finder-toast-visible');
    void toastEl.offsetWidth;
    toastEl.classList.add('finder-toast-visible');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('finder-toast-visible');
      setTimeout(function () { toastEl.hidden = true; }, 300);
    }, 2600);
  }

  /* ---------- Download method help ---------- */

  function showDownloadHelp(method) {
    downloadHelpButtons.forEach(function (button) {
      var active = button.dataset.downloadHelp === method;
      button.setAttribute('aria-pressed', String(active));
      button.classList.toggle('button-secondary', !active);
    });
    downloadHelpPanels.forEach(function (panel) {
      panel.hidden = panel.dataset.downloadHelpPanel !== method;
    });
    track('download_help_selected', { method: method });
  }

  downloadHelpButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      showDownloadHelp(button.dataset.downloadHelp);
    });
  });

  /* ---------- Basket visibility ---------- */

  var basketOpenedOnce = false;

  function openBasket() {
    if (!basketEl.hidden) return;
    basketEl.hidden = false;
    basketToggle.setAttribute('aria-expanded', 'true');
    renderBasket();
    if (typeof basketEl.scrollIntoView === 'function') {
      basketEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function highlightBasketToggle() {
    basketToggle.classList.remove('basket-pulse');
    void basketToggle.offsetWidth;
    basketToggle.classList.add('basket-pulse');
  }

  function setButtonAdded(button) {
    if (!button) return;
    var original = button.textContent;
    button.textContent = 'Added ✓';
    button.classList.add('btn-added');
    button.disabled = true;
    setTimeout(function () {
      button.textContent = original;
      button.classList.remove('btn-added');
      button.disabled = false;
    }, 1600);
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
      var totalBytes = basketTotalBytes(items);
      basketSummary.textContent = items.length + (items.length === 1 ? ' file' : ' files') +
        ' · about ' + formatBytes(totalBytes) + ' total';
      basketList.innerHTML = items.map(function (item, index) {
        var meta = [item.telescope, item.instrument, (item.filters || []).join(', ')]
          .filter(Boolean).join(' · ');
        return '<li class="basket-item">' +
          '<div class="basket-item-info">' +
            '<span class="basket-item-name">' + escapeHtml(item.filename) + '</span>' +
            '<span class="basket-item-meta">' + escapeHtml(meta) + ' · ' + escapeHtml(item.sizeLabel || formatBytes(item.sizeBytes)) + '</span>' +
          '</div>' +
          '<div class="product-actions basket-item-actions">' +
            '<a class="product-download" href="' + escapeHtml(item.downloadUrl) + '" rel="noopener noreferrer" target="_blank" aria-label="Download ' + escapeHtml(item.filename) + ' from the MAST archive">Download</a>' +
            '<button type="button" class="basket-remove" data-index="' + index + '" aria-label="Remove ' + escapeHtml(item.filename) + ' from basket">&times;</button>' +
          '</div>' +
        '</li>';
      }).join('');
    }

    var disabled = items.length === 0;
    if (basketPowerShellBtn) basketPowerShellBtn.disabled = disabled;
    basketScriptBtn.disabled = disabled;
    basketManifestBtn.disabled = disabled;
    basketCopyBtn.disabled = disabled;
    basketClearBtn.disabled = disabled;

    if (basketSizeNote) {
      var GB = 1024 * 1024 * 1024;
      if (disabled) {
        basketSizeNote.hidden = true;
      } else if (basketTotalBytes(items) > 10 * GB) {
        basketSizeNote.hidden = false;
        basketSizeNote.classList.add('basket-size-xl');
        basketSizeNote.textContent = 'Very large dataset. Check available disk space before starting.';
      } else if (basketTotalBytes(items) > GB) {
        basketSizeNote.hidden = false;
        basketSizeNote.classList.remove('basket-size-xl');
        basketSizeNote.textContent = 'Large download. A desktop/laptop connection is recommended.';
      } else {
        basketSizeNote.hidden = true;
      }
    }
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

  function powerShellQuote(value) {
    return "'" + String(value).replace(/'/g, "''") + "'";
  }

  function downloadPowerShellScript() {
    var items = loadBasket();
    if (items.length === 0) return;

    var lines = [
      "# Hubble/JWST download script generated by Our Astro Journey.",
      "# Files download directly from the official STScI MAST archive.",
      "$ErrorActionPreference = 'Stop'",
      "$ProgressPreference = 'SilentlyContinue'",
      ""
    ];

    items.forEach(function (item) {
      var channelLabel = (item.filters && item.filters.length) ? item.filters.join(', ') + ': ' : '';
      lines.push("Write-Host " + powerShellQuote("Downloading " + channelLabel + item.filename));
      lines.push("Invoke-WebRequest -Uri " + powerShellQuote(item.downloadUrl) + " -OutFile " + powerShellQuote(item.filename));
      lines.push("");
    });
    lines.push('Write-Host "Downloads complete."');

    downloadTextFile('mast-downloads.ps1', lines.join('\r\n') + '\r\n', 'text/plain');
    track('manifest_generated', { format: 'ps1', file_count: items.length });
    setStatus('Your Windows PowerShell download script has been generated.');
  }

  function downloadUrlList() {
    var items = loadBasket();
    if (items.length === 0) return;
    var text = items.map(function (item) { return item.downloadUrl; }).join('\n') + '\n';
    downloadTextFile('mast-downloads.txt', text, 'text/plain');
    track('manifest_generated', { format: 'txt', file_count: items.length });
    setStatus('Your download-link list has been generated.');
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

  function filterWavelengthMicrons(filter, telescope) {
    var match = /^F(\d{3,4})/.exec(normaliseFilterName(filter));
    if (!match) return null;
    var n = Number(match[1]);
    if (!Number.isFinite(n)) return null;
    if (String(telescope || '').toUpperCase() === 'HST') {
      return n / 1000;
    }
    return n / 100;
  }

  function filterIsNarrow(filter) {
    return /N(?:\d+)?$/.test(normaliseFilterName(filter));
  }

  function chooseThreeByWavelength(filters, telescope) {
    var usable = filters.map(function (f) {
      return { filter: normaliseFilterName(f), wave: filterWavelengthMicrons(f, telescope) };
    }).filter(function (x) { return x.filter && x.wave; });

    // Prefer wide/medium bands for a general colour set. Narrowband remains
    // available through View products, but should not silently replace a
    // continuum channel in the beginner recommendation.
    var nonNarrow = usable.filter(function (x) { return !filterIsNarrow(x.filter); });
    if (nonNarrow.length >= 3) usable = nonNarrow;
    if (usable.length < 3) return null;

    usable.sort(function (a, b) { return a.wave - b.wave; });
    var blue = usable[0];
    var red = usable[usable.length - 1];
    var midpoint = (blue.wave + red.wave) / 2;
    var middle = usable.slice(1, -1).sort(function (a, b) {
      return Math.abs(a.wave - midpoint) - Math.abs(b.wave - midpoint);
    })[0];
    if (!middle) return null;
    return [blue.filter, middle.filter, red.filter];
  }

  function buildSafeColourPlan(group) {
    var filters = ((group && group.filters) || []).map(normaliseFilterName).filter(Boolean);
    var telescope = String((group && group.telescope) || '').toUpperCase();
    var instrument = String((group && group.instrumentFull) || (group && group.instrument) || '').toUpperCase();
    if (filters.length < 3) return null;

    var chosen = null;
    var type = 'Matched colour set';
    var channel = '';

    if (telescope === 'JWST' && instrument.indexOf('NIRCAM') !== -1) {
      var sw = [];
      var lw = [];
      filters.forEach(function (filter) {
        var wave = filterWavelengthMicrons(filter, telescope);
        if (!wave) return;
        if (wave <= 2.3) sw.push(filter);
        else if (wave <= 5.1) lw.push(filter);
      });

      var swSet = chooseThreeByWavelength(sw, telescope);
      var lwSet = chooseThreeByWavelength(lw, telescope);

      // Prefer the long-wave channel when both are viable because one LW
      // detector covers each module, avoiding the four-detector SW patchwork.
      if (lwSet) {
        chosen = lwSet;
        channel = 'NIRCam long-wavelength';
      } else if (swSet) {
        chosen = swSet;
        channel = 'NIRCam short-wavelength';
      }
    }

    if (!chosen) {
      chosen = chooseThreeByWavelength(filters, telescope);
    }
    if (!chosen) return null;

    return {
      filters: chosen,
      type: type,
      channel: channel,
      mapping: 'Blue: ' + chosen[0] + '  •  Green: ' + chosen[1] + '  •  Red: ' + chosen[2],
      note: channel
        ? 'Chosen from the same ' + channel + ' channel to make alignment and field matching easier.'
        : 'Chosen as three separated wavelengths from the same dataset; field matching is checked before download.'
    };
  }

  function angularDistanceDeg(a, b) {
    var ra1 = Number(a.ra || 0) * Math.PI / 180;
    var dec1 = Number(a.dec || 0) * Math.PI / 180;
    var ra2 = Number(b.ra || 0) * Math.PI / 180;
    var dec2 = Number(b.dec || 0) * Math.PI / 180;
    var dRa = ra1 - ra2;
    var dDec = dec1 - dec2;
    var h = Math.sin(dDec / 2) ** 2 +
      Math.cos(dec1) * Math.cos(dec2) * Math.sin(dRa / 2) ** 2;
    return (2 * Math.asin(Math.min(1, Math.sqrt(h)))) * 180 / Math.PI;
  }

  function matchedColourObservations(group, plan) {
    var observations = (group && group.observations) || [];
    if (!plan || !plan.filters || plan.filters.length !== 3 || !observations.length) return null;

    var candidates = observations.filter(function (obs) {
      var obsFilters = (obs.filters || []).map(normaliseFilterName).filter(Boolean);
      return plan.filters.some(function (filter) { return obsFilters.indexOf(filter) !== -1; });
    });
    if (!candidates.length) return null;

    // 0.01° is ~36 arcsec. This is deliberately much tighter than the broad
    // dataset grouping radius: colour channels should be the same pointing,
    // not merely in the same part of a nebula.
    var maxSepDeg = 0.01;
    var best = null;

    candidates.forEach(function (anchor) {
      var selected = [];
      var totalExposure = 0;
      var maxSep = 0;

      plan.filters.forEach(function (filter) {
        var options = observations.filter(function (obs) {
          var obsFilters = (obs.filters || []).map(normaliseFilterName).filter(Boolean);
          return obsFilters.indexOf(filter) !== -1 && angularDistanceDeg(anchor, obs) <= maxSepDeg;
        }).sort(function (a, b) {
          var da = angularDistanceDeg(anchor, a);
          var db = angularDistanceDeg(anchor, b);
          if (da !== db) return da - db;
          return Number(b.exposureSeconds || 0) - Number(a.exposureSeconds || 0);
        });

        if (options.length) {
          selected.push(options[0]);
          totalExposure += Number(options[0].exposureSeconds || 0);
          maxSep = Math.max(maxSep, angularDistanceDeg(anchor, options[0]));
        }
      });

      var uniqueFilters = {};
      selected.forEach(function (obs) {
        (obs.filters || []).map(normaliseFilterName).forEach(function (f) {
          if (plan.filters.indexOf(f) !== -1) uniqueFilters[f] = true;
        });
      });

      if (Object.keys(uniqueFilters).length === 3) {
        var candidate = { observations: selected, maxSep: maxSep, totalExposure: totalExposure };
        if (!best || candidate.maxSep < best.maxSep ||
            (candidate.maxSep === best.maxSep && candidate.totalExposure > best.totalExposure)) {
          best = candidate;
        }
      }
    });

    return best;
  }

  function renderGroupCard(group, index) {
    var telescopeClass = group.telescope === 'JWST' ? 'badge-jwst' : 'badge-hst';
    var filterChips = group.filters.map(function (f) {
      return '<span class="filter-chip">' + escapeHtml(f) + '</span>';
    }).join('');

    var safePlan = buildSafeColourPlan(group);
    var matched = safePlan ? matchedColourObservations(group, safePlan) : null;
    var suggestions = '';
    if (safePlan && matched) {
      suggestions = '<div class="colour-suggestions">' +
        '<p><strong>' + escapeHtml(safePlan.type) + ':</strong> ' + escapeHtml(safePlan.mapping) + '</p>' +
        '<p class="finder-note">' + escapeHtml(safePlan.note) + '</p>' +
      '</div>';
    } else if (safePlan) {
      suggestions = '<p class="finder-warning" role="note"><i class="fas fa-triangle-exclamation" aria-hidden="true"></i> ' +
        'This dataset has useful filters, but no three-filter set was found on the same pointing. Use View products rather than combining mismatched fields.' +
      '</p>';
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
        '<button type="button" class="button group-add-recommended" data-group="' + index + '">' +
          '<i class="fas fa-plus" aria-hidden="true"></i> ' +
          ((safePlan && matched) ? 'Add matched colour set' : 'Add recommended files') +
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

    var html = '<p class="finder-note">' + result.totalScienceProducts + ' science products checked; ' +
      result.recommendedCount + ' selected as separate colour-filter channels for image processing. Download links go directly to the official MAST archive.</p>';
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

  function normaliseFilterName(value) {
    var filter = String(value || '').trim().toUpperCase();
    if (!filter || filter === 'CLEAR' || filter === 'NONE' || filter.indexOf('CLEAR') === 0) return '';
    return filter;
  }

  function selectColourObsids(group) {
    var plan = buildSafeColourPlan(group);
    var matched = plan ? matchedColourObservations(group, plan) : null;
    if (!matched) return [];

    var selected = [];
    plan.filters.forEach(function (filter) {
      var best = matched.observations.find(function (obs) {
        return (obs.filters || []).map(normaliseFilterName).indexOf(filter) !== -1;
      });
      if (best && selected.indexOf(String(best.obsid)) === -1) {
        selected.push(String(best.obsid));
      }
    });
    return selected;
  }

  function nircamModuleFromFilename(filename) {
    var match = /_nrc([ab])(?:long|[1-4])_/i.exec(String(filename || ''));
    return match ? match[1].toUpperCase() : '';
  }

  function productPreferenceScore(product) {
    var subgroup = String(product.subGroup || '').toUpperCase();
    var filename = String(product.filename || '').toLowerCase();
    var category = String(product.category || '').toLowerCase();

    if (subgroup === 'I2D' || subgroup === 'DRC' || subgroup === 'DRZ' ||
        /_(i2d|drc|drz)\.fits(?:\.gz)?$/.test(filename)) return 100;
    if (category === 'combined') return subgroup === 'DRW' || /_drw\.fits(?:\.gz)?$/.test(filename) ? 78 : 88;
    if (subgroup === 'FLC' || subgroup === 'FLT' || subgroup === 'CAL') return 65;
    if (category === 'calibrated') return 55;
    return 0;
  }

  function normaliseProductResults(data, obsids, group) {
    var merged = [];
    var totalScienceProducts = 0;
    var obsById = {};

    ((group && group.observations) || []).forEach(function (obs) {
      obsById[String(obs.obsid)] = obs;
    });

    (data.results || []).forEach(function (result) {
      totalScienceProducts += Number(result.totalScienceProducts || (result.products || []).length || 0);
      (result.products || []).forEach(function (p) {
        p._obsid = String(result.obsid);
        var obs = obsById[p._obsid];
        if ((!p.filters || !p.filters.length) && obs && obs.filters) {
          p.filters = obs.filters.map(normaliseFilterName).filter(Boolean);
        }
        p.recommended = false;
        p.recommendReasons = [];
      });
      merged = merged.concat(result.products || []);
    });

    // The site recommendation is a colour-processing set, not simply the
    // highest-level science products. Pick one strong image product for each
    // selected observation/filter, and for NIRCam keep every channel on the
    // same module (A or B) so the sky footprint is coherent.
    var selectedIds = String(obsids || '').split(',').map(function (id) { return id.trim(); }).filter(Boolean);
    var perId = {};
    selectedIds.forEach(function (id) {
      perId[id] = merged.filter(function (p) {
        return String(p._obsid) === id && productPreferenceScore(p) > 0;
      }).sort(function (a, b) {
        var scoreDiff = productPreferenceScore(b) - productPreferenceScore(a);
        if (scoreDiff) return scoreDiff;
        return Number(b.sizeBytes || 0) - Number(a.sizeBytes || 0);
      });
    });

    var commonModule = '';
    ['A', 'B'].some(function (moduleName) {
      var availableForAll = selectedIds.length > 0 && selectedIds.every(function (id) {
        return (perId[id] || []).some(function (p) {
          return nircamModuleFromFilename(p.filename) === moduleName;
        });
      });
      if (availableForAll) {
        commonModule = moduleName;
        return true;
      }
      return false;
    });

    selectedIds.forEach(function (id) {
      var candidates = perId[id] || [];
      var chosen = null;
      if (commonModule) {
        chosen = candidates.find(function (p) {
          return nircamModuleFromFilename(p.filename) === commonModule;
        }) || null;
      } else {
        // HST and non-NIRCam products do not use NIRCam A/B module names.
        var hasNircamModules = candidates.some(function (p) { return nircamModuleFromFilename(p.filename); });
        if (!hasNircamModules) chosen = candidates[0] || null;
      }

      if (chosen) {
        chosen.recommended = true;
        var filterText = (chosen.filters || []).join(', ');
        chosen.recommendReasons = [
          filterText ? 'Selected colour channel: ' + filterText : 'Selected as one channel of the colour set',
          commonModule ? 'Matched NIRCam module ' + commonModule + ' across all colour channels' : 'Matched pointing colour product'
        ];
      }
    });

    var recommended = merged.filter(function (p) { return p.recommended; });
    return {
      obsid: obsids,
      products: merged,
      recommended: recommended,
      totalScienceProducts: totalScienceProducts || merged.length,
      recommendedCount: recommended.length
    };
  }

  function fetchProductResults(obsids, mode) {
    var ids = String(obsids || '').split(',').map(function (id) { return id.trim(); }).filter(Boolean);
    if (ids.length === 0) {
      return Promise.reject(new Error('No observation ids were available for this dataset.'));
    }

    var requests = ids.map(function (id) {
      return apiFetch('/products.php?obsid=' + encodeURIComponent(id) + '&mode=' + encodeURIComponent(mode))
        .then(function (data) { return { ok: true, data: data }; })
        .catch(function (error) { return { ok: false, error: error }; });
    });

    return Promise.all(requests).then(function (responses) {
      var results = [];
      var failures = [];
      responses.forEach(function (response) {
        if (response.ok) {
          results = results.concat(response.data.results || []);
        } else {
          failures.push(response.error);
        }
      });

      if (results.length === 0) {
        throw failures[0] || new Error('No product data was returned by the archive.');
      }

      return {
        success: true,
        results: results,
        partialFailures: failures.length
      };
    });
  }

  function loadProductsForGroup(groupIndex, container, button) {
    if (!currentSearch) return Promise.reject(new Error('Run a search first.'));
    var group = currentSearch.groups[groupIndex];
    if (!group) return Promise.reject(new Error('That dataset is no longer available.'));
    var mode = modeSelect.value;
    var obsids = selectColourObsids(group).join(',');
    if (!obsids) {
      return Promise.reject(new Error('No three-filter colour set with a matching sky pointing was found in this dataset.'));
    }

    button.disabled = true;
    container.hidden = false;
    container.innerHTML = '<p class="finder-note">Loading products from the archive…</p>';

    return fetchProductResults(obsids, mode)
      .then(function (data) {
        var combined = normaliseProductResults(data, obsids, group);
        renderProducts(container, group, combined, mode);
        button.disabled = false;
        button.setAttribute('aria-expanded', 'true');

        var addBtn = document.querySelector('.group-add-recommended[data-group="' + groupIndex + '"]');
        if (addBtn) {
          addBtn.disabled = false;
          addBtn.dataset.ready = combined.recommendedCount > 0 ? '1' : '';
        }
        if (data.partialFailures > 0) {
          setStatus('Products loaded, but part of the archive response was unavailable. Available files are shown.', false);
        }
        return combined;
      })
      .catch(function (error) {
        container.innerHTML = '<p class="finder-status-error">' + escapeHtml(error.message) + ' Please try again.</p>';
        button.disabled = false;
        throw error;
      });
  }

  function finishRecommendedAdd(groupIndex, addBtn, box) {
    if (!box || !box.dataset.products || !currentSearch) return;
    var products = JSON.parse(box.dataset.products).filter(function (p) { return p.recommended; });
    var group = currentSearch.groups[groupIndex];
    if (!group) return;

    if (products.length === 0) {
      setStatus('No recommended image-processing files were found for this dataset. Try View products to inspect the available files.', false);
      showToast('No recommended files found');
      return;
    }

    var added = addToBasket(products, { telescope: group.telescope, instrument: group.instrument });
    var skipped = products.length - added;
    var message;
    if (added > 0 && skipped > 0) {
      message = added + ' file' + (added === 1 ? '' : 's') + ' added, ' + skipped + ' already in your basket';
    } else if (added > 0) {
      message = added + ' file' + (added === 1 ? '' : 's') + ' added to your download basket';
    } else {
      message = 'Those files are already in your basket';
    }
    setStatus(message + '.', false);
    showToast(message);
    if (added > 0) {
      setButtonAdded(addBtn);
      if (!basketOpenedOnce) { basketOpenedOnce = true; openBasket(); } else { highlightBasketToggle(); }
    } else {
      highlightBasketToggle();
    }
    track('dataset_added', { count: added, telescope: group.telescope });
  }

  function addRecommendedForGroup(groupIndex, addBtn) {
    if (!currentSearch) return;
    var group = currentSearch.groups[groupIndex];
    var box = document.getElementById('group-products-' + groupIndex);
    if (!group || !box) return;

    if (box.dataset.products) {
      finishRecommendedAdd(groupIndex, addBtn, box);
      return;
    }

    var originalHtml = addBtn.innerHTML;
    var mode = modeSelect.value;
    var obsids = selectColourObsids(group).join(',');
    if (!obsids) {
      setStatus('No three-filter colour set with a matching sky pointing was found in this dataset. Use View products to inspect it manually.', true);
      showToast('No matched colour set found');
      return;
    }
    addBtn.disabled = true;
    addBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Loading recommended files…';
    setStatus('Loading recommended files from the MAST archive…', false);

    fetchProductResults(obsids, mode)
      .then(function (data) {
        var combined = normaliseProductResults(data, obsids, group);
        renderProducts(box, group, combined, mode);
        box.hidden = true;
        addBtn.disabled = false;
        addBtn.innerHTML = originalHtml;
        addBtn.dataset.ready = combined.recommendedCount > 0 ? '1' : '';
        if (data.partialFailures > 0) {
          setStatus('Some archive requests were unavailable, so the available recommended files were used.', false);
        }
        finishRecommendedAdd(groupIndex, addBtn, box);
      })
      .catch(function (error) {
        addBtn.disabled = false;
        addBtn.innerHTML = originalHtml;
        setStatus(error.message + ' Please try again.', true);
        showToast('Could not load recommended files');
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
      loadProductsForGroup(index, container, productsBtn).catch(function () { /* UI already shows the error */ });
      return;
    }

    var addBtn = event.target.closest('.group-add-recommended');
    if (addBtn) {
      addRecommendedForGroup(parseInt(addBtn.dataset.group, 10), addBtn);
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
      if (addedOne > 0) {
        setStatus('Added ' + product.filename + ' to your download basket.', false);
        showToast('Added to download basket');
        setButtonAdded(singleAdd);
        if (!basketOpenedOnce) { basketOpenedOnce = true; openBasket(); } else { highlightBasketToggle(); }
      } else {
        setStatus(product.filename + ' is already in your basket.', false);
        showToast('Already in your basket');
        highlightBasketToggle();
      }
      track('file_added', { filename: product.filename, added: addedOne });
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
      var removed = loadBasket()[parseInt(btn.dataset.index, 10)];
      removeFromBasket(parseInt(btn.dataset.index, 10));
      setStatus(removed ? 'Removed ' + removed.filename + ' from your basket.' : 'Item removed.');
      return;
    }

    var directDownload = event.target.closest('.product-download');
    if (directDownload) {
      showDownloadHelp('direct');
      track('download_clicked', { url: directDownload.href, source: 'basket' });
    }
  });

  basketClearBtn.addEventListener('click', function () {
    saveBasket([]);
    renderBasket();
    setStatus('Basket cleared.');
  });

  if (basketPowerShellBtn) {
    basketPowerShellBtn.addEventListener('click', function () {
      showDownloadHelp('powershell');
      downloadPowerShellScript();
    });
  }

  basketScriptBtn.addEventListener('click', function () {
    showDownloadHelp('shell');
    requestManifest('sh');
  });

  basketManifestBtn.addEventListener('click', function () {
    showDownloadHelp('links');
    downloadUrlList();
  });

  basketCopyBtn.addEventListener('click', function () {
    showDownloadHelp('links');
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