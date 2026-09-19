(function () {
  'use strict';

  var MEASUREMENT_ID = 'G-J4NC85BT9H';
  var OWNER_KEY = 'oaj_analytics_owner';
  var TEST_KEY = 'oaj_analytics_test';
  var CONSENT_KEY = 'oaj_cookie_consent_v1';
  var analyticsLoaded = false;

  function safeStorage(storage, action, key, value) {
    try {
      if (action === 'get') return storage.getItem(key);
      if (action === 'set') storage.setItem(key, value);
      if (action === 'remove') storage.removeItem(key);
    } catch (e) {
      return null;
    }
    return null;
  }

  function disableAnalytics() {
    window['ga-disable-' + MEASUREMENT_ID] = true;
    window.__OAJ_ANALYTICS_DISABLED__ = true;
  }

  function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;
    window['ga-disable-' + MEASUREMENT_ID] = false;
    window.__OAJ_ANALYTICS_DISABLED__ = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID);

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
    document.head.appendChild(script);
  }

  function removeBanner() {
    var current = document.getElementById('oaj-cookie-banner');
    if (current) current.remove();
  }

  function setConsent(value) {
    safeStorage(window.localStorage, 'set', CONSENT_KEY, value);
    removeBanner();
    if (value === 'granted') {
      loadAnalytics();
    } else {
      disableAnalytics();
    }
  }

  function showConsentBanner() {
    if (!document.body) return;
    removeBanner();

    var banner = document.createElement('aside');
    banner.id = 'oaj-cookie-banner';
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'false');
    banner.setAttribute('aria-label', 'Analytics cookie choice');
    banner.innerHTML =
      '<div class="cookie-banner-copy">' +
        '<strong>Optional analytics</strong>' +
        '<p>We use Google Analytics only if you allow it. It helps us understand which astronomy pages and tools are useful. Necessary site storage still works if you reject analytics.</p>' +
        '<a href="/privacy.html">Privacy policy</a>' +
      '</div>' +
      '<div class="cookie-banner-actions">' +
        '<button type="button" class="cookie-reject">Reject optional</button>' +
        '<button type="button" class="cookie-accept">Allow analytics</button>' +
      '</div>';

    banner.querySelector('.cookie-reject').addEventListener('click', function () {
      setConsent('denied');
    });
    banner.querySelector('.cookie-accept').addEventListener('click', function () {
      setConsent('granted');
    });
    document.body.appendChild(banner);
  }

  var params = new URLSearchParams(window.location.search);
  var ownerParam = params.get('oaj_owner');
  var testParam = params.get('oaj_test');

  if (ownerParam === '1') {
    safeStorage(window.localStorage, 'set', OWNER_KEY, '1');
  } else if (ownerParam === '0') {
    safeStorage(window.localStorage, 'remove', OWNER_KEY);
  }

  if (testParam === '1') {
    safeStorage(window.sessionStorage, 'set', TEST_KEY, '1');
  } else if (testParam === '0') {
    safeStorage(window.sessionStorage, 'remove', TEST_KEY);
  }

  var isOwner = safeStorage(window.localStorage, 'get', OWNER_KEY) === '1';
  var isTestSession = safeStorage(window.sessionStorage, 'get', TEST_KEY) === '1';
  var isAutomatedBrowser = navigator.webdriver === true;
  var disabled = isOwner || isTestSession || isAutomatedBrowser;
  var consent = safeStorage(window.localStorage, 'get', CONSENT_KEY);

  window.OAJCookiePreferences = {
    show: function () {
      if (disabled) return;
      if (document.body) {
        showConsentBanner();
      } else {
        document.addEventListener('DOMContentLoaded', showConsentBanner, { once: true });
      }
    },
    get: function () {
      return safeStorage(window.localStorage, 'get', CONSENT_KEY);
    }
  };

  if (disabled) {
    disableAnalytics();
  } else if (consent === 'granted') {
    loadAnalytics();
  } else {
    disableAnalytics();
    if (consent !== 'denied') {
      if (document.body) {
        showConsentBanner();
      } else {
        document.addEventListener('DOMContentLoaded', showConsentBanner, { once: true });
      }
    }
  }

  if (ownerParam !== null || testParam !== null) {
    params.delete('oaj_owner');
    params.delete('oaj_test');

    var cleanUrl = window.location.pathname;
    var remainingQuery = params.toString();
    if (remainingQuery) cleanUrl += '?' + remainingQuery;
    cleanUrl += window.location.hash;

    try {
      window.history.replaceState({}, document.title, cleanUrl);
    } catch (e) {
      // URL cleanup is optional; analytics control still works.
    }
  }
})();