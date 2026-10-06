(function () {
  'use strict';
  document.addEventListener('click', function (event) {
    var link = event.target.closest('[data-oaj-support]');
    if (!link) return;
    if (typeof window.gtag === 'function' && window.__OAJ_ANALYTICS_DISABLED__ !== true) {
      window.gtag('event', 'support_click', {
        link_url: link.href,
        link_text: (link.textContent || '').trim(),
        page_path: window.location.pathname
      });
    }
  });
})();
