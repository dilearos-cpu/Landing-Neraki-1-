(function (global) {
  var HIDDEN_PROP = "_caletzza_effi_hidden";
  var FLOW_ATTR = "Pack Effi Flow";

  function isEffiCartItem(item) {
    if (!item || !item.properties) {
      return false;
    }
    return Boolean(item.properties[HIDDEN_PROP] || item.properties._caletzza_effi_flow_source === "pack");
  }

  function cartHasEffiFlow(cart) {
    if (!cart) {
      return false;
    }
    if (cart.attributes && (cart.attributes[FLOW_ATTR] === "yes" || cart.attributes.pack_effi_flow === "yes")) {
      return true;
    }
    return (cart.items || []).some(isEffiCartItem);
  }

  function fetchCart() {
    return fetch("/cart.js", { headers: { Accept: "application/json" } }).then(function (response) {
      if (!response.ok) {
        throw new Error("No se pudo leer el carrito.");
      }
      return response.json();
    });
  }

  function markEffiRows(cart) {
    (cart.items || []).forEach(function (item) {
      if (!isEffiCartItem(item)) {
        return;
      }
      var key = String(item.key || "");
      var nodes = document.querySelectorAll(
        [
          'tr[id*="' + key + '"]',
          '.cart-item[id*="' + key + '"]',
          '[id="CartDrawer-Item-' + item.index + '"]',
          '[id="CartItem-' + item.index + '"]',
          '[data-variant-id="' + item.variant_id + '"]'
        ].join(",")
      );
      nodes.forEach(function (node) {
        var row = node.closest("tr, .cart-item, .cart-notification-product, [id^='CartDrawer-Item'], [id^='CartItem-']") || node;
        row.classList.add("caletzza-effi-hidden-cart-row");
      });
    });
  }

  function applyCartUi(cart) {
    var active = cartHasEffiFlow(cart);
    document.documentElement.classList.toggle("caletzza-pack-effi-flow", active);
    document.body.classList.toggle("caletzza-pack-effi-flow", active);
    if (active) {
      markEffiRows(cart);
    }
  }

  function refreshCartUi() {
    return fetchCart()
      .then(applyCartUi)
      .catch(function () {
        /* ignore */
      });
  }

  function init() {
    refreshCartUi();

    if (typeof subscribe === "function" && typeof PUB_SUB_EVENTS !== "undefined") {
      subscribe(PUB_SUB_EVENTS.cartUpdate, function () {
        window.setTimeout(refreshCartUi, 120);
      });
    }

    document.addEventListener("shopify:section:load", function () {
      window.setTimeout(refreshCartUi, 120);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  global.PackEffiCart = {
    refresh: refreshCartUi,
    cartHasEffiFlow: cartHasEffiFlow,
    isEffiCartItem: isEffiCartItem
  };
})(window);
