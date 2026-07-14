(function () {
  'use strict';

  var instances = [];

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function readSettings(section) {
    var node = section.querySelector('[data-countdown-settings]');
    if (!node) {
      return {};
    }
    try {
      return JSON.parse(node.textContent);
    } catch (error) {
      return {};
    }
  }

  function getDeadline(storageKey, durationHours) {
    var now = Date.now();
    var durationMs = durationHours * 60 * 60 * 1000;
    var stored = null;

    try {
      stored = JSON.parse(localStorage.getItem(storageKey));
    } catch (error) {
      stored = null;
    }

    if (!stored || !stored.deadline || stored.deadline <= now) {
      stored = {
        startedAt: now,
        deadline: now + durationMs
      };
      localStorage.setItem(storageKey, JSON.stringify(stored));
    }

    return stored.deadline;
  }

  function getProgressColor(percent, settings) {
    if (percent >= 100) {
      return settings.colorHigh;
    }
    if (percent >= 50) {
      return settings.colorMid;
    }
    return settings.colorLow;
  }

  function CountdownInstance(section) {
    this.section = section;
    this.settings = readSettings(section);
    this.slotsFilled = 0;
    this.storageKey = 'landing_bonus_countdown_' + (this.settings.id || 'default');
    this.deadline = getDeadline(this.storageKey, Number(this.settings.durationHours) || 24);
    this.timer = null;
  }

  CountdownInstance.prototype.setSlotsFilled = function (value) {
    this.slotsFilled = Math.max(0, Number(value) || 0);
    this.renderProgress();
  };

  CountdownInstance.prototype.resetSlots = function () {
    this.setSlotsFilled(0);
  };

  CountdownInstance.prototype.getPercent = function () {
    var units = Number(this.settings.unitsToComplete) || 1;
    return Math.min(100, Math.round((this.slotsFilled / units) * 100));
  };

  CountdownInstance.prototype.renderTimer = function () {
    var remaining = Math.max(0, this.deadline - Date.now());
    var hours = Math.floor(remaining / 3600000);
    var minutes = Math.floor((remaining % 3600000) / 60000);
    var seconds = Math.floor((remaining % 60000) / 1000);

    setText(this.section, '[data-hours]', pad(hours));
    setText(this.section, '[data-minutes]', pad(minutes));
    setText(this.section, '[data-seconds]', pad(seconds));
  };

  CountdownInstance.prototype.renderProgress = function () {
    var percent = this.getPercent();
    var fill = this.section.querySelector('[data-progress-fill]');
    var text = this.section.querySelector('[data-progress-text]');
    var message = percent >= 100
      ? this.settings.completionMessage
      : this.settings.progressPrefix + ' ' + percent + '% ' + this.settings.progressSuffix;

    if (text) {
      text.textContent = message;
    }
    if (fill) {
      fill.style.width = percent + '%';
      fill.style.backgroundColor = getProgressColor(percent, this.settings);
    }
  };

  CountdownInstance.prototype.bindProgressClick = function () {
    var bar = this.section.querySelector('[data-progress-bar]');
    if (!bar) {
      return;
    }

    bar.addEventListener('click', function () {
      if (window.LandingBonus && typeof window.LandingBonus.triggerPackBuy === 'function') {
        window.LandingBonus.triggerPackBuy();
      }
    });
  };

  CountdownInstance.prototype.start = function () {
    var self = this;
    this.renderTimer();
    this.renderProgress();
    this.bindProgressClick();

    this.timer = window.setInterval(function () {
      self.renderTimer();
      if (self.deadline <= Date.now()) {
        window.clearInterval(self.timer);
      }
    }, 1000);
  };

  function setText(root, selector, value) {
    var node = root.querySelector(selector);
    if (node) {
      node.textContent = value;
    }
  }

  function initAll() {
    document.querySelectorAll('[data-landing-bonus-countdown]').forEach(function (section) {
      var instance = new CountdownInstance(section);
      instance.start();
      instances.push(instance);
    });
  }

  window.LandingBonusCountdown = {
    setSlotsFilled: function (value) {
      instances.forEach(function (instance) {
        instance.setSlotsFilled(value);
      });
    },
    resetSlots: function () {
      instances.forEach(function (instance) {
        instance.resetSlots();
      });
    }
  };

  document.addEventListener('DOMContentLoaded', initAll);
})();
