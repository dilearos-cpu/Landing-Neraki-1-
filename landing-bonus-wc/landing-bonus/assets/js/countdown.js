(function () {
  'use strict';

  var instances = [];
  var slotObservers = [];

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

  function isSlotFilled(slot) {
    if (!slot) {
      return false;
    }
    if (slot.querySelector('img')) {
      return true;
    }
    var text = (slot.textContent || '').trim();
    return text !== '' && text !== '+';
  }

  function countFilledSlots(settings) {
    var packSelector = settings.packSelector || '.pack-ui';
    var slotSelector = settings.slotSelector || '.slot';
    var packs = document.querySelectorAll(packSelector);
    var total = 0;

    if (!packs.length) {
      packs = document.querySelectorAll('.pack-slots');
    }

    packs.forEach(function (pack) {
      pack.querySelectorAll(slotSelector).forEach(function (slot) {
        if (isSlotFilled(slot)) {
          total += 1;
        }
      });
    });

    return total;
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

  CountdownInstance.prototype.syncFromDom = function () {
    this.setSlotsFilled(countFilledSlots(this.settings));
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

    if (percent >= 100) {
      this.section.classList.add('landing-bonus-countdown--complete');
    } else {
      this.section.classList.remove('landing-bonus-countdown--complete');
    }
  };

  CountdownInstance.prototype.bindProgressClick = function () {
    var bar = this.section.querySelector('[data-progress-bar]');
    var section = this.section;
    if (!bar) {
      return;
    }

    bar.setAttribute('tabindex', '0');
    bar.setAttribute('role', 'button');

    bar.addEventListener('click', function () {
      if (!section.classList.contains('landing-bonus-countdown--complete')) {
        return;
      }
      if (window.LandingBonus && typeof window.LandingBonus.triggerPackBuy === 'function') {
        window.LandingBonus.triggerPackBuy();
      }
    });

    bar.addEventListener('keydown', function (event) {
      if (!section.classList.contains('landing-bonus-countdown--complete')) {
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (window.LandingBonus && typeof window.LandingBonus.triggerPackBuy === 'function') {
          window.LandingBonus.triggerPackBuy();
        }
      }
    });
  };

  CountdownInstance.prototype.start = function () {
    var self = this;
    this.syncFromDom();
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

  function getPackRoots(settings) {
    var packSelector = settings.packSelector || '.pack-ui';
    var roots = Array.prototype.slice.call(document.querySelectorAll(packSelector));
    if (!roots.length) {
      roots = Array.prototype.slice.call(document.querySelectorAll('.pack-slots'));
    }
    return roots;
  }

  function observePackSlots(settings) {
    var slotSelector = settings.slotSelector || '.slot';
    var roots = getPackRoots(settings);

    roots.forEach(function (root) {
      var observer = new MutationObserver(function () {
        instances.forEach(function (instance) {
          instance.syncFromDom();
        });
      });

      observer.observe(root, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true
      });

      slotObservers.push(observer);

      root.querySelectorAll(slotSelector).forEach(function (slot) {
        slot.addEventListener('click', function () {
          window.setTimeout(function () {
            instances.forEach(function (instance) {
              instance.syncFromDom();
            });
          }, 50);
        });
      });
    });
  }

  function bindPackReset() {
    var resetSelectors = ['#pack-reset', '.pack-reset', '[data-landing-bonus-pack-reset]'];
    resetSelectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (button) {
        button.addEventListener('click', function () {
          window.setTimeout(function () {
            instances.forEach(function (instance) {
              instance.resetSlots();
            });
          }, 50);
        });
      });
    });
  }

  function bindPackSelectionEvents() {
    var selectors = [
      '#select-variation',
      '#landing-bonus-select-variation',
      '#pack-modal .prod',
      '.pack-modal .prod',
      '#pack-variations-modal .botoncito'
    ];

    document.addEventListener('click', function (event) {
      var target = event.target;
      if (!target || !target.closest) {
        return;
      }

      var matched = selectors.some(function (selector) {
        return target.closest(selector);
      });

      if (matched) {
        window.setTimeout(function () {
          instances.forEach(function (instance) {
            instance.syncFromDom();
          });
        }, 120);
      }
    });
  }

  function initAll() {
    document.querySelectorAll('[data-landing-bonus-countdown]').forEach(function (section) {
      var instance = new CountdownInstance(section);
      instance.start();
      instances.push(instance);
    });

    if (instances.length) {
      var settings = instances[0].settings;
      observePackSlots(settings);
      bindPackReset();
      bindPackSelectionEvents();

      window.setInterval(function () {
        instances.forEach(function (instance) {
          instance.syncFromDom();
        });
      }, 2000);
    }
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
    },
    syncFromDom: function () {
      instances.forEach(function (instance) {
        instance.syncFromDom();
      });
    }
  };

  document.addEventListener('DOMContentLoaded', initAll);
})();
