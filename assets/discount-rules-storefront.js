(function (global) {
  function formatMoney(cents, currency) {
    var amount = Number(cents || 0) / 100;
    try {
      return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: currency || (window.Shopify && window.Shopify.currency && window.Shopify.currency.active) || "COP",
        maximumFractionDigits: 0
      }).format(amount);
    } catch (error) {
      return "$" + Math.round(amount).toLocaleString("es-CO");
    }
  }

  function toNumber(value, fallback) {
    var parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback || 0;
  }

  function getEngine() {
    return global.DiscountRules || global.PackDiscountRules || null;
  }

  function waitForEngine(callback) {
    var engine = getEngine();
    if (engine) {
      callback(engine);
      return;
    }

    document.addEventListener("discount-rules:ready", function handler() {
      document.removeEventListener("discount-rules:ready", handler);
      callback(getEngine());
    });
  }

  function ensureSaleMarkup(priceRoot, regularText, saleText) {
    var saleWrap = priceRoot.querySelector(".price__sale");
    if (!saleWrap) {
      saleWrap = document.createElement("div");
      saleWrap.className = "price__sale";
      priceRoot.querySelector(".price__container").appendChild(saleWrap);
    }

    var compareNode = saleWrap.querySelector(".price-item--regular");
    if (!compareNode) {
      compareNode = document.createElement("s");
      compareNode.className = "price-item price-item--regular";
      saleWrap.appendChild(compareNode);
    }

    var saleNode = saleWrap.querySelector(".price-item--sale");
    if (!saleNode) {
      saleNode = document.createElement("span");
      saleNode.className = "price-item price-item--sale price-item--last";
      saleWrap.appendChild(saleNode);
    }

    compareNode.textContent = regularText;
    saleNode.textContent = saleText;
  }

  function setPriceNode(priceRoot, unitPrice, originalUnitPrice, quantity, options) {
    if (!priceRoot) {
      return;
    }

    options = options || {};
    var qty = toNumber(quantity, 1);
    var hasDiscount = originalUnitPrice > unitPrice;
    var displayTotal = unitPrice * qty;
    var originalTotal = originalUnitPrice * qty;
    var prefix = options.fromPrefix ? "Desde " : "";

    priceRoot.classList.toggle("price--on-sale", hasDiscount);
    priceRoot.classList.toggle("discount-rules--active", hasDiscount);

    var regularItem = priceRoot.querySelector(".price__regular .price-item--regular");

    if (hasDiscount) {
      ensureSaleMarkup(
        priceRoot,
        formatMoney(originalTotal),
        prefix + formatMoney(displayTotal)
      );
      if (regularItem) {
        regularItem.textContent = prefix + formatMoney(displayTotal);
      }
    } else if (regularItem) {
      regularItem.textContent = formatMoney(displayTotal);
    }
  }

  function enhanceCard(cardNode, engine) {
    var productContext = engine.getProductContextFromNode(cardNode);
    var originalPrice = toNumber(cardNode.dataset.variantPrice, productContext.variantPrice);
    if (!originalPrice) {
      return;
    }

    var pricing = engine.getBestCardPrice
      ? engine.getBestCardPrice(originalPrice, productContext, { scope: "storefront" })
      : engine.getLowestTierPrice(originalPrice, productContext, { scope: "storefront" });

    if (!pricing.appliedTier || pricing.unitPrice >= originalPrice) {
      return;
    }

    var priceRoot = cardNode.querySelector(".price");
    setPriceNode(priceRoot, pricing.unitPrice, originalPrice, 1, {
      fromPrefix: Boolean(pricing.fromPrice)
    });

    var badge = cardNode.querySelector("[data-discount-rules-badge]");
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "discount-rules__badge badge price__badge-sale color-accent-1";
      badge.setAttribute("data-discount-rules-badge", "");
      badge.textContent = pricing.appliedTier.label || "Descuento por cantidad";
      if (priceRoot) {
        priceRoot.appendChild(badge);
      }
    }
  }

  function enhanceCards(engine) {
    document.querySelectorAll("[data-discount-rules-card]").forEach(function (cardNode) {
      enhanceCard(cardNode, engine);
    });
  }

  function updateProductPrice(engine, productRoot) {
    var productContext = engine.getProductContextFromNode(productRoot);
    var quantityInput = document.querySelector(productRoot.dataset.quantityInput || "input[name='quantity']");
    var quantity = quantityInput ? toNumber(quantityInput.value, 1) : 1;
    var originalPrice = toNumber(productRoot.dataset.variantPrice, productContext.variantPrice);
    if (!originalPrice) {
      return;
    }

    productContext.variantPrice = originalPrice;
    var result = engine.getUnitPriceForQuantity(originalPrice, quantity, productContext, {
      scope: "storefront",
      paymentMethod: "online"
    });

    var priceRoot = productRoot.querySelector(".price") || productRoot;
    setPriceNode(priceRoot, result.unitPrice, result.originalUnitPrice, quantity);
    updateTierTableActiveRow(productRoot, quantity);
  }

  function updateTierTableActiveRow(productRoot, quantity) {
    var table = productRoot.parentElement
      ? productRoot.parentElement.querySelector("[data-discount-rules-tier-table]")
      : document.querySelector("[data-discount-rules-tier-table]");

    if (!table) {
      return;
    }

    var qty = toNumber(quantity, 1);
    table.querySelectorAll("[data-tier-row]").forEach(function (row) {
      var min = toNumber(row.dataset.min, 0);
      var max = toNumber(row.dataset.max, 999999);
      row.classList.toggle("discount-rules-tier-table__row--active", qty >= min && qty <= max);
    });
  }

  function bindProductPage(engine) {
    var productRoot = document.querySelector("[data-discount-rules-product]");
    if (!productRoot) {
      return;
    }

    var quantityInput = document.querySelector(
      productRoot.dataset.quantityInput || "#Quantity-" + (productRoot.dataset.sectionId || "")
    );

    if (!quantityInput) {
      quantityInput = document.querySelector("input[name='quantity']");
    }

    function refresh() {
      updateProductPrice(engine, productRoot);
    }

    refresh();

    if (quantityInput) {
      quantityInput.addEventListener("change", refresh);
      quantityInput.addEventListener("input", refresh);
    }

    if (typeof subscribe === "function" && typeof PUB_SUB_EVENTS !== "undefined") {
      subscribe(PUB_SUB_EVENTS.variantChange, function (event) {
        if (!event || !event.data || !event.data.variant) {
          return;
        }
        productRoot.dataset.variantPrice = String(event.data.variant.price || "");
        window.setTimeout(refresh, 0);
      });

      subscribe(PUB_SUB_EVENTS.quantityUpdate, function () {
        window.setTimeout(refresh, 0);
      });
    }

    document.addEventListener("product-info:loaded", refresh);

    if (typeof MutationObserver !== "undefined") {
      var observer = new MutationObserver(function () {
        refresh();
      });
      observer.observe(productRoot, { childList: true, subtree: true, characterData: true });
    }
  }

  function logDesignMode(engine) {
    if (!window.Shopify || !window.Shopify.designMode) {
      return;
    }

    var rules = engine.getRules("storefront");
    if (!rules.length) {
      console.warn(
        "DiscountRules: no hay reglas activas para tienda. Revisa que la regla este en Activa y tenga filtro/coleccion/producto configurado."
      );
      return;
    }

    console.info("DiscountRules: reglas de tienda cargadas", rules.length, rules);
  }

  function init(engine) {
    if (!engine) {
      return;
    }

    logDesignMode(engine);
    enhanceCards(engine);
    bindProductPage(engine);
  }

  function boot() {
    waitForEngine(init);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  document.addEventListener("shopify:section:load", boot);
  document.addEventListener("discount-rules:ready", boot);
})();
