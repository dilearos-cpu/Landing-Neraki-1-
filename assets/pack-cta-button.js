(function () {
  function bindButtonAction(buttonNode) {
    if (!buttonNode || buttonNode.dataset.bound === "true") {
      return;
    }

    buttonNode.dataset.bound = "true";

    if (buttonNode.dataset.ctaAction === "link") {
      return;
    }

    buttonNode.addEventListener("click", function (event) {
      var action = buttonNode.dataset.ctaAction;
      if (!action) {
        return;
      }

      event.preventDefault();

      if (action === "trigger_buy") {
        if (window.PackPage && window.PackPage.triggerPackBuy()) {
          return;
        }

        if (window.PackCheckout && typeof window.PackCheckout.triggerBuy === "function") {
          window.PackCheckout.triggerBuy();
          return;
        }

        var buyButton = window.PackPage ? window.PackPage.getPackBuyButton() : null;
        if (!buyButton) {
          buyButton = document.querySelector(".pack-actions .pack-button--buy");
        }
        if (!buyButton) {
          buyButton = document.querySelector('.pack-button--buy:not([data-select-variant])');
        }
        if (buyButton) {
          buyButton.click();
        }
        return;
      }

      if (action === "scroll_pack") {
        if (window.PackPage && window.PackPage.scrollToPack()) {
          return;
        }

        var packSection = document.querySelector(".pack-ui");
        if (packSection) {
          packSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  }

  function initPackCta(section) {
    if (!section || section.dataset.initialized === "true") {
      return;
    }

    section.dataset.initialized = "true";

    var mode = section.dataset.positionMode || "fixed";
    var triggerMode = section.dataset.floatTrigger || "pack_buy";
    var anchorNode = section.querySelector("[data-cta-anchor]");
    var floatingNode = section.querySelector("[data-cta-floating]");
    var inlineButton = section.querySelector("[data-cta-button-inline]");
    var floatingButton = section.querySelector("[data-cta-button-floating]");

    if (!anchorNode) {
      return;
    }

    bindButtonAction(inlineButton);
    bindButtonAction(floatingButton);

    function getTriggerNode() {
      if (triggerMode === "pack_buy" || triggerMode === "pack_slots") {
        if (window.PackPage && typeof window.PackPage.getPackTriggerNode === "function") {
          var packTrigger = window.PackPage.getPackTriggerNode(triggerMode);
          if (packTrigger) {
            return packTrigger;
          }
        }

        if (triggerMode === "pack_slots") {
          var slotsNode = document.querySelector(".pack-ui .pack-slots");
          if (slotsNode) {
            return slotsNode;
          }
        }

        var scopedBuy = document.querySelector(".pack-actions .pack-button--buy");
        if (scopedBuy) {
          return scopedBuy;
        }

        return document.querySelector('.pack-button--buy:not([data-select-variant])');
      }

      return anchorNode;
    }

    function setFloatingVisible(visible) {
      if (!floatingNode) {
        return;
      }

      floatingNode.classList.toggle("pack-cta__floating--visible", Boolean(visible));
      floatingNode.setAttribute("aria-hidden", visible ? "false" : "true");
    }

    function updateFloatingState() {
      if (mode !== "fixed_floating") {
        setFloatingVisible(false);
        return;
      }

      var triggerNode = getTriggerNode();
      if (!triggerNode) {
        setFloatingVisible(false);
        return;
      }

      var triggerRect = triggerNode.getBoundingClientRect();
      var viewportHeight = window.innerHeight;

      if (triggerRect.top >= viewportHeight) {
        setFloatingVisible(false);
        return;
      }

      if (triggerRect.bottom <= 0) {
        setFloatingVisible(true);
        return;
      }

      setFloatingVisible(false);
    }

    if (mode === "fixed_floating" && floatingNode) {
      updateFloatingState();
      window.addEventListener("scroll", updateFloatingState, { passive: true });
      window.addEventListener("resize", updateFloatingState);

      section.addEventListener("shopify:section:unload", function () {
        window.removeEventListener("scroll", updateFloatingState);
        window.removeEventListener("resize", updateFloatingState);
      });
    }
  }

  function initAllPackCtas() {
    document.querySelectorAll(".pack-cta").forEach(initPackCta);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAllPackCtas);
  } else {
    initAllPackCtas();
  }

  document.addEventListener("shopify:section:load", function (event) {
    initPackCta(event.target.querySelector(".pack-cta"));
  });
})();
