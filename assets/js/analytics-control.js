(function () {
  'use strict';

  var MEASUREMENT_ID = 'G-J4NC85BT9H';
  var OWNER_KEY = 'oaj_analytics_owner';
  var TEST_KEY = 'oaj_analytics_test';

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

  if (disabled) {
    window['ga-disable-' + MEASUREMENT_ID] = true;
    window.__OAJ_ANALYTICS_DISABLED__ = true;
  } else {
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
