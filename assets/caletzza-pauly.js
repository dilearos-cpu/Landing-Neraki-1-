(function () {
  'use strict';

  function initTabs() {
    document.querySelectorAll('[data-cz-tabs]').forEach(function (root) {
      var tabs = root.querySelectorAll('[data-cz-tab]');
      var panels = root.querySelectorAll('[data-cz-panel]');
      if (!tabs.length) return;

      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          var target = tab.getAttribute('data-cz-tab');
          tabs.forEach(function (t) {
            t.classList.toggle('is-active', t === tab);
            t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
          });
          panels.forEach(function (panel) {
            var active = panel.getAttribute('data-cz-panel') === target;
            panel.classList.toggle('is-active', active);
            panel.hidden = !active;
          });
        });
      });
    });
  }

  function initMobileToolbar() {
    var toolbar = document.querySelector('.cz-mobile-toolbar');
    if (!toolbar) return;

    var path = window.location.pathname;
    toolbar.querySelectorAll('[data-cz-nav]').forEach(function (link) {
      var href = link.getAttribute('href') || '';
      if (href === path || (href !== '/' && path.startsWith(href))) {
        link.classList.add('is-active');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initTabs();
      initMobileToolbar();
    });
  } else {
    initTabs();
    initMobileToolbar();
  }
})();
