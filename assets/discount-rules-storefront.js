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

  function setPriceNode(priceRoot, unitPrice, originalUnitPrice, quantity) {
    if (!priceRoot) {
      return;
    }

    var qty = toNumber(quantity, 1);
    var hasDiscount = originalUnitPrice > unitPrice;
    var displayTotal = unitPrice * qty;
    var originalTotal = originalUnitPrice * qty;

    priceRoot.classList.toggle("price--on-sale", hasDiscount);
    priceRoot.classList.toggle("discount-rules--active", hasDiscount);

    var regularItem = priceRoot.querySelector(".price__regular .price-item--regular");
    var saleCompare = priceRoot.querySelector(".price__sale .price-item--regular");
    var saleItem = priceRoot.querySelector(".price-item--sale");

    if (hasDiscount) {
      if (saleCompare) {
        saleCompare.textContent = formatMoney(originalTotal);
      }
      if (saleItem) {
        saleItem.textContent = formatMoney(displayTotal);
      } else if (regularItem) {
        regularItem.textContent = formatMoney(displayTotal);
      }
    } else if (regularItem) {
      regularItem.textContent = formatMoney(displayTotal);
    }
  }

  function toNumber(value, fallback) {
    var parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback || 0;
  }

  function enhanceCard(cardNode, engine) {
    var productContext = engine.getProductContextFromNode(cardNode);
    var originalPrice = toNumber(cardNode.dataset.variantPrice, productContext.variantPrice);
    if (!originalPrice) {
      return;
    }

    var lowest = engine.getLowestTierPrice(originalPrice, productContext, { scope: "storefront" });
    if (!lowest.appliedTier || lowest.unitPrice >= originalPrice) {
      return;
    }

    var priceRoot = cardNode.querySelector(".price");
    setPriceNode(priceRoot, lowest.unitPrice, originalPrice, 1);

    var badge = cardNode.querySelector("[data-discount-rules-badge]");
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "discount-rules__badge badge price__badge-sale color-accent-1";
      badge.setAttribute("data-discount-rules-badge", "");
      badge.textContent = lowest.appliedTier.label || "Descuento por cantidad";
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
        refresh();
      });

      subscribe(PUB_SUB_EVENTS.quantityUpdate, refresh);
    }
  }

  function init(engine) {
    if (!engine) {
      return;
    }

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
  document.addEventListener("discount-rules:ready", function () {
    waitForEngine(init);
  });
})();
