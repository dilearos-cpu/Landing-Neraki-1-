(function (global) {
  var instances = [];

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function readSettings(section) {
    var node = section.querySelector("[data-promo-settings]");
    var defaults = {
      unitsToComplete: 4,
      progressPrefix: "Llevas",
      progressSuffix: "completado",
      completionMessage: "¡Pack completo! Ya puedes darle en Comprar ahora.",
      colorLow: "#E53935",
      colorMid: "#F9A825",
      colorHigh: "#2E7D32"
    };

    if (!node) {
      return defaults;
    }

    try {
      return Object.assign({}, defaults, JSON.parse(node.textContent));
    } catch (error) {
      return defaults;
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

  function getProgressColor(percent, settings) {
    if (percent >= 100) {
      return settings.colorHigh;
    }
    if (percent >= 50) {
      return settings.colorMid;
    }
    return settings.colorLow;
  }

  function initCountdown(section) {
    if (!section || section.dataset.initialized === "true") {
      return;
    }

    section.dataset.initialized = "true";

    var hoursNode = section.querySelector("[data-hours]");
    var minutesNode = section.querySelector("[data-minutes]");
    var secondsNode = section.querySelector("[data-seconds]");
    var progressWrapNode = section.querySelector("[data-progress-wrap]");
    var barTrackNode = section.querySelector("[data-bar-track]");
    var barFillNode = section.querySelector("[data-bar-fill]");
    var progressPercentNode = section.querySelector("[data-progress-percent]");
    var progressCopyNode = section.querySelector("[data-progress-copy]");
    var completeCopyNode = section.querySelector("[data-complete-copy]");
    var settings = readSettings(section);
    var unitsToComplete = Math.max(Number(settings.unitsToComplete) || 4, 1);
    var durationHours = Number(section.dataset.durationHours || 24);
    var storageKey = section.dataset.storageKey || "promo-countdown-default";
    var timerId = null;
    var filledSlots = 0;
    var lastPercent = 0;

    function updateProgress() {
      var percent = Math.min(Math.round((filledSlots / unitsToComplete) * 100), 100);
      var isComplete = percent >= 100;
      var barColor = getProgressColor(percent, settings);

      section.style.setProperty("--promo-fill-width", percent + "%");
      section.style.setProperty("--promo-fill-color", barColor);

      if (barTrackNode) {
        barTrackNode.style.setProperty("--promo-fill-width", percent + "%");
        barTrackNode.style.setProperty("--promo-fill-color", barColor);
      }

      if (barFillNode) {
        barFillNode.style.width = percent + "%";
        barFillNode.style.backgroundColor = barColor;
      }

      if (progressPercentNode) {
        progressPercentNode.textContent = percent + "%";
      }

      if (progressCopyNode) {
        progressCopyNode.hidden = isComplete;
      }

      if (completeCopyNode) {
        completeCopyNode.hidden = !isComplete;
        completeCopyNode.textContent = settings.completionMessage;
      }

      section.classList.toggle("promo-countdown--complete", isComplete);
      section.classList.toggle("promo-countdown--started", percent > 0);

      if (percent > lastPercent) {
        if (progressWrapNode) {
          progressWrapNode.classList.remove("promo-countdown__progress-bump");
          void progressWrapNode.offsetWidth;
          progressWrapNode.classList.add("promo-countdown__progress-bump");
        }
      }

      lastPercent = percent;
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
        updateProgress();
      },
      resetSlots: function () {
        filledSlots = 0;
        lastPercent = 0;
        updateProgress();
      }
    };

    instances.push(instance);
    updateProgress();
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
