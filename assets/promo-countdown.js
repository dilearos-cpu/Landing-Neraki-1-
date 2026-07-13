(function (global) {
  var instances = [];

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function readSettings(section) {
    var node = section.querySelector("[data-promo-settings]");
    if (!node) {
      return {
        promosAvailable: 5,
        promosTotal: 25,
        unitsLabel: "unds"
      };
    }

    try {
      return JSON.parse(node.textContent);
    } catch (error) {
      return {
        promosAvailable: 5,
        promosTotal: 25,
        unitsLabel: "unds"
      };
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

    if (!stored || !stored.startedAt || !stored.deadline || stored.deadline <= now) {
      stored = {
        startedAt: now,
        deadline: now + durationMs
      };
      localStorage.setItem(storageKey, JSON.stringify(stored));
    }

    return stored.deadline;
  }

  function initCountdown(section) {
    if (!section || section.dataset.initialized === "true") {
      return;
    }

    section.dataset.initialized = "true";

    var hoursNode = section.querySelector("[data-hours]");
    var minutesNode = section.querySelector("[data-minutes]");
    var secondsNode = section.querySelector("[data-seconds]");
    var promosCountNode = section.querySelector("[data-promos-count]");
    var promosBarNode = section.querySelector("[data-promos-bar]");
    var barFillNode = section.querySelector("[data-bar-fill]");
    var settings = readSettings(section);
    var baseAvailable = Math.max(Number(settings.promosAvailable) || 0, 1);
    var durationHours = Number(section.dataset.durationHours || 24);
    var storageKey = section.dataset.storageKey || "promo-countdown-default";
    var timerId = null;
    var filledSlots = 0;
    var lastDisplayed = baseAvailable;

    function updateBar() {
      var available = Math.max(baseAvailable - filledSlots, 0);
      var percent = Math.min((available / baseAvailable) * 100, 100);

      if (promosCountNode) {
        promosCountNode.textContent = String(available);
      }

      if (barFillNode) {
        barFillNode.style.width = Math.max(percent, available > 0 ? 28 : 0) + "%";
      }

      if (available < lastDisplayed) {
        section.classList.add("promo-countdown--slots-updated");
        if (promosBarNode) {
          promosBarNode.classList.remove("promo-countdown__promos-bump");
          void promosBarNode.offsetWidth;
          promosBarNode.classList.add("promo-countdown__promos-bump");
        }
        window.setTimeout(function () {
          section.classList.remove("promo-countdown--slots-updated");
        }, 500);
      }

      lastDisplayed = available;
    }

    function renderTime() {
      var deadline = getDeadline(storageKey, durationHours);
      var remaining = Math.max(deadline - Date.now(), 0);
      var totalSeconds = Math.floor(remaining / 1000);
      var hours = Math.floor(totalSeconds / 3600);
      var minutes = Math.floor((totalSeconds % 3600) / 60);
      var seconds = totalSeconds % 60;

      if (hoursNode) {
        hoursNode.textContent = pad(hours);
      }
      if (minutesNode) {
        minutesNode.textContent = pad(minutes);
      }
      if (secondsNode) {
        secondsNode.textContent = pad(seconds);
      }

      if (remaining === 0) {
        localStorage.removeItem(storageKey);
      }
    }

    var instance = {
      section: section,
      setFilledSlots: function (count) {
        filledSlots = Math.max(0, Number(count) || 0);
        updateBar();
      },
      resetSlots: function () {
        filledSlots = 0;
        lastDisplayed = baseAvailable;
        updateBar();
      }
    };

    instances.push(instance);
    updateBar();
    renderTime();
    timerId = setInterval(renderTime, 1000);

    section.addEventListener("shopify:section:unload", function () {
      if (timerId) {
        clearInterval(timerId);
      }
      instances = instances.filter(function (item) {
        return item.section !== section;
      });
    });
  }

  function initAllCountdowns() {
    document.querySelectorAll(".promo-countdown").forEach(initCountdown);
  }

  global.PromoCountdown = {
    setSlotsFilled: function (count) {
      instances.forEach(function (instance) {
        instance.setFilledSlots(count);
      });
    },
    resetSlots: function () {
      instances.forEach(function (instance) {
        instance.resetSlots();
      });
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAllCountdowns);
  } else {
    initAllCountdowns();
  }

  document.addEventListener("shopify:section:load", function (event) {
    initCountdown(event.target.querySelector(".promo-countdown"));
  });
})(window);
