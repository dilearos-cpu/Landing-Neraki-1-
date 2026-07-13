(function () {
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
    var barFillNode = section.querySelector("[data-bar-fill]");
    var barLabelNode = section.querySelector("[data-bar-label]");
    var settings = readSettings(section);
    var durationHours = Number(section.dataset.durationHours || 24);
    var storageKey = section.dataset.storageKey || "promo-countdown-default";
    var timerId = null;

    function updateBar() {
      var total = Math.max(Number(settings.promosTotal) || 1, 1);
      var available = Math.max(Number(settings.promosAvailable) || 0, 0);
      var percent = Math.min((available / total) * 100, 100);

      if (promosCountNode) {
        promosCountNode.textContent = String(available);
      }

      if (barFillNode) {
        barFillNode.style.width = percent + "%";
      }

      if (barLabelNode) {
        barLabelNode.textContent = available + " " + (settings.unitsLabel || "unds");
      }
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

    updateBar();
    renderTime();
    timerId = setInterval(renderTime, 1000);

    section.addEventListener("shopify:section:unload", function () {
      if (timerId) {
        clearInterval(timerId);
      }
    });
  }

  function initAllCountdowns() {
    document.querySelectorAll(".promo-countdown").forEach(initCountdown);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAllCountdowns);
  } else {
    initAllCountdowns();
  }

  document.addEventListener("shopify:section:load", function (event) {
    initCountdown(event.target.querySelector(".promo-countdown"));
  });
})();