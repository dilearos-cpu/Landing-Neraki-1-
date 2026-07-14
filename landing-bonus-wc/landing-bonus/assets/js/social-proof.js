(function () {
  'use strict';

  function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pickRandom(list, fallback) {
    if (!Array.isArray(list) || !list.length) {
      return fallback;
    }
    return list[Math.floor(Math.random() * list.length)];
  }

  function buildMessage(settings) {
    var name = pickRandom(settings.names, 'María');
    var city = pickRandom(settings.cities, 'Bogotá');
    var time = pickRandom(settings.timePhrases, 'hace unos minutos');
    return name + ' ha comprado un ' + (settings.packLabel || 'pack') + ' ' + time + ' en ' + city;
  }

  function createToast(settings) {
    var toast = document.createElement('div');
    toast.className = 'landing-bonus-social-proof-toast landing-bonus-social-proof-toast--' + (settings.position || 'bottom-left');
    toast.innerHTML = '<button type="button" class="landing-bonus-social-proof-toast__close" aria-label="Cerrar">&times;</button><span data-message></span>';
    document.body.appendChild(toast);

    toast.querySelector('.landing-bonus-social-proof-toast__close').addEventListener('click', function () {
      toast.hidden = true;
    });

    return toast;
  }

  function shouldRun(settings) {
    var isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile && !settings.enableMobile) {
      return false;
    }
    if (!isMobile && !settings.enableDesktop) {
      return false;
    }
    return true;
  }

  function initCampaign(section) {
    var settingsNode = section.querySelector('[data-social-proof-settings]');
    var settings = {};

    try {
      settings = JSON.parse(settingsNode.textContent);
    } catch (error) {
      settings = {};
    }

    if (!shouldRun(settings)) {
      return;
    }

    var toast = createToast(settings);
    var messageNode = toast.querySelector('[data-message]');

    function showToast() {
      if (messageNode) {
        messageNode.textContent = buildMessage(settings);
      }
      toast.hidden = false;

      window.setTimeout(function () {
        toast.hidden = true;
        scheduleNext();
      }, (Number(settings.displayDuration) || 5) * 1000);
    }

    function scheduleNext() {
      var min = Number(settings.intervalMin) || 8;
      var max = Number(settings.intervalMax) || 15;
      window.setTimeout(showToast, randomBetween(min, max) * 1000);
    }

    window.setTimeout(showToast, (Number(settings.initialDelay) || 5) * 1000);
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-landing-bonus-social-proof]').forEach(initCampaign);
  });
})();
