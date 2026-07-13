(function () {
  function initPackCta(section) {
    if (!section || section.dataset.initialized === "true") {
      return;
    }

    section.dataset.initialized = "true";

    var mode = section.dataset.positionMode || "fixed";
    var anchorNode = section.querySelector("[data-cta-anchor]");
    var buttonNode = section.querySelector("[data-cta-button]");
    var placeholderNode = section.querySelector("[data-cta-placeholder]");

    if (!anchorNode || !buttonNode) {
      return;
    }

    function getAnchorTop() {
      return anchorNode.getBoundingClientRect().top + window.scrollY;
    }

    function setFloating(active) {
      var isFloating = Boolean(active);

      section.classList.toggle("pack-cta--floating-active", isFloating);
      buttonNode.classList.toggle("pack-cta__button--floating", isFloating);

      if (placeholderNode) {
        placeholderNode.style.height = isFloating ? buttonNode.offsetHeight + "px" : "0px";
      }
    }

    function updateFloatingState() {
      if (mode !== "fixed_floating") {
        setFloating(false);
        return;
      }

      var anchorRect = anchorNode.getBoundingClientRect();
      var viewportHeight = window.innerHeight;

      if (anchorRect.top >= viewportHeight) {
        setFloating(false);
        return;
      }

      if (anchorRect.bottom <= 0) {
        setFloating(true);
        return;
      }

      setFloating(false);
    }

    function handleButtonAction(event) {
      var action = buttonNode.dataset.ctaAction;
      if (!action || action === "link") {
        return;
      }

      event.preventDefault();

      if (action === "trigger_buy") {
        if (window.PackCheckout && typeof window.PackCheckout.triggerBuy === "function") {
          window.PackCheckout.triggerBuy();
          return;
        }

        var buyButton = document.querySelector(".pack-button--buy");
        if (buyButton) {
          buyButton.click();
        }
        return;
      }

      if (action === "scroll_pack") {
        var packSection = document.querySelector(".pack-ui");
        if (packSection) {
          packSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }

    if (buttonNode.tagName === "BUTTON") {
      buttonNode.addEventListener("click", handleButtonAction);
    }

    if (mode === "fixed_floating") {
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
