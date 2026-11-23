(() => {
  const menuButton = document.getElementById('mobile-menu-button');
  const closeButton = document.getElementById('mobile-menu-close');
  const menu = document.getElementById('mobile-navigation-main');
  const backdrop = document.getElementById('mobile-nav-backdrop');

  if (menuButton && closeButton && menu && backdrop) {
    let previousFocus = null;
    const closeMenu = (restoreFocus = true) => {
      const wasOpen = menu.classList.contains('open');
      menu.classList.remove('open');
      backdrop.classList.remove('active');
      document.body.classList.remove('mobile-nav-open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation menu');
      menu.setAttribute('aria-hidden', 'true');
      menu.setAttribute('inert', '');
      backdrop.setAttribute('aria-hidden', 'true');
      if (restoreFocus && wasOpen && previousFocus instanceof HTMLElement) previousFocus.focus();
    };
    const openMenu = () => {
      if (!window.matchMedia('(max-width: 600px)').matches) return;
      previousFocus = document.activeElement;
      menu.classList.add('open');
      backdrop.classList.add('active');
      document.body.classList.add('mobile-nav-open');
      menuButton.setAttribute('aria-expanded', 'true');
      menuButton.setAttribute('aria-label', 'Close navigation menu');
      menu.setAttribute('aria-hidden', 'false');
      menu.removeAttribute('inert');
      backdrop.setAttribute('aria-hidden', 'false');
      requestAnimationFrame(() => closeButton.focus());
    };

    menuButton.addEventListener('click', () => menu.classList.contains('open') ? closeMenu() : openMenu());
    closeButton.addEventListener('click', () => closeMenu());
    backdrop.addEventListener('click', () => closeMenu());
    menu.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu(false);
    });
    document.addEventListener('keydown', (event) => {
      if (!menu.classList.contains('open')) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu();
      } else if (event.key === 'Tab') {
        const focusable = [...menu.querySelectorAll('a[href], button:not([disabled])')];
        if (!focusable.length) return;
        if (event.shiftKey && document.activeElement === focusable[0]) {
          event.preventDefault();
          focusable.at(-1).focus();
        } else if (!event.shiftKey && document.activeElement === focusable.at(-1)) {
          event.preventDefault();
          focusable[0].focus();
        }
      }
    });
    window.addEventListener('resize', () => {
      if (!window.matchMedia('(max-width: 600px)').matches) closeMenu(false);
    });
  }

  document.querySelectorAll('[data-cookie-settings]').forEach((button) => {
    button.addEventListener('click', () => window.OAJCookiePreferences?.show?.());
  });
})();
