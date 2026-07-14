(function () {
  'use strict';

  function getTriggerElement(settings) {
    if (settings.floatTrigger === 'cta_section') {
      return document.querySelector('[data-landing-bonus-float-inline]');
    }
    return document.querySelector('[data-landing-bonus-pack-buy], .landing-bonus-pack-buy, .pack-buy');
  }

  function initFloatingButton(section) {
    var settingsNode = section.querySelector('[data-float-settings]');
    var settings = {};

    try {
      settings = JSON.parse(settingsNode.textContent);
    } catch (error) {
      settings = {};
    }

    if (settings.positionMode !== 'fixed_floating') {
      return;
    }

    var dock = document.querySelector('[data-float-dock-for="' + settings.id + '"]');
    var trigger = getTriggerElement(settings);

    if (!dock || !trigger || !('IntersectionObserver' in window)) {
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        dock.hidden = entry.isIntersecting;
      });
    }, { threshold: 0.1 });

    observer.observe(trigger);
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-landing-bonus-floating-button]').forEach(initFloatingButton);
  });
})();
