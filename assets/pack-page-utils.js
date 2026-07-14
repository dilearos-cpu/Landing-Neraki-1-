(function (global) {
  function getPackSection() {
    return document.querySelector('.pack-ui:not([data-empty="true"])');
  }

  function getPackBuyButton(packSection) {
    var pack = packSection || getPackSection();
    if (!pack) {
      return null;
    }

    var actionsBuy = pack.querySelector(".pack-actions .pack-button--buy");
    if (actionsBuy) {
      return actionsBuy;
    }

    return pack.querySelector('.pack-button--buy:not([data-select-variant])');
  }

  function getPackSlots(packSection) {
    var pack = packSection || getPackSection();
    return pack ? pack.querySelector(".pack-slots") : null;
  }

  function getPackTriggerNode(triggerMode) {
    if (triggerMode === "pack_slots") {
      return getPackSlots() || getPackBuyButton();
    }

    if (triggerMode === "pack_buy") {
      return getPackBuyButton() || getPackSlots();
    }

    return null;
  }

  function triggerPackBuy() {
    if (global.PackCheckout && typeof global.PackCheckout.triggerBuy === "function") {
      global.PackCheckout.triggerBuy();
      return true;
    }

    var buyButton = getPackBuyButton();
    if (buyButton) {
      buyButton.click();
      return true;
    }

    return false;
  }

  function scrollToPack() {
    var pack = getPackSection();
    if (!pack) {
      return false;
    }

    pack.scrollIntoView({ behavior: "smooth", block: "start" });
    return true;
  }

  global.PackPage = {
    getPackSection: getPackSection,
    getPackBuyButton: getPackBuyButton,
    getPackSlots: getPackSlots,
    getPackTriggerNode: getPackTriggerNode,
    triggerPackBuy: triggerPackBuy,
    scrollToPack: scrollToPack
  };
})(window);
