(function (global) {
  var productTagCache = {};
  var lastSummary = null;
  var checkoutBusy = false;

  function getEngine() {
    return global.DiscountRules || global.PackDiscountRules || null;
  }

  function getConfig() {
    var node = document.querySelector("[data-discount-rules-cart-config]");
    return {
      checkoutEndpoint: (node && node.dataset.checkoutEndpoint) || "/apps/cod-express/checkout"
    };
  }

  function formatMoney(cents) {
    var amount = Number(cents || 0) / 100;
    try {
      return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: (window.Shopify && window.Shopify.currency && window.Shopify.currency.active) || "COP",
        maximumFractionDigits: 0
      }).format(amount);
    } catch (error) {
      return "$" + Math.round(amount).toLocaleString("es-CO");
    }
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

  function fetchProductTags(handle) {
    if (!handle) {
      return Promise.resolve([]);
    }
    if (productTagCache[handle]) {
      return Promise.resolve(productTagCache[handle]);
    }
    return fetch("/products/" + encodeURIComponent(handle) + ".js", {
      headers: { Accept: "application/json" }
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("product.js failed");
        }
        return response.json();
      })
      .then(function (product) {
        var tags = String(product.tags || "")
          .split(",")
          .map(function (tag) {
            return tag.trim();
          })
          .filter(Boolean);
        productTagCache[handle] = tags;
        return tags;
      })
      .catch(function () {
        productTagCache[handle] = [];
        return [];
      });
  }

  function enrichCartItems(items) {
    var handles = [];
    items.forEach(function (item) {
      var match = String(item.url || "").match(/\/products\/([^/?#]+)/);
      if (match && handles.indexOf(match[1]) === -1) {
        handles.push(match[1]);
      }
    });

    return Promise.all(handles.map(fetchProductTags)).then(function () {
      return items.map(function (item) {
        var match = String(item.url || "").match(/\/products\/([^/?#]+)/);
        var handle = match ? match[1] : "";
        return Object.assign({}, item, {
          tags: handle ? productTagCache[handle] || [] : []
        });
      });
    });
  }

  function fetchCart() {
    return fetch("/cart.js", {
      headers: { Accept: "application/json" }
    }).then(function (response) {
      if (!response.ok) {
        throw new Error("No se pudo leer el carrito.");
      }
      return response.json();
    });
  }

  function buildSummary(engine, cart) {
    return enrichCartItems(cart.items || []).then(function (items) {
      return engine.applyStorefrontCartRules(items, { paymentMethod: "online" });
    });
  }

  function ensureTotalsBlock(container) {
    if (!container) {
      return null;
    }
    var block = container.querySelector("[data-discount-rules-cart-totals]");
    if (block) {
      return block;
    }
    block = document.createElement("div");
    block.className = "discount-rules-cart-totals";
    block.setAttribute("data-discount-rules-cart-totals", "");
    block.hidden = true;
    block.innerHTML =
      '<div class="discount-rules-cart-totals__row discount-rules-cart-totals__row--subtotal">' +
      '<span>Subtotal</span><span data-dr-subtotal></span></div>' +
      '<div class="discount-rules-cart-totals__row discount-rules-cart-totals__row--discount">' +
      '<span>Descuento por cantidad</span><span data-dr-discount></span></div>' +
      '<div class="discount-rules-cart-totals__row discount-rules-cart-totals__row--total">' +
      '<span>Total con descuento</span><strong data-dr-total></strong></div>' +
      '<p class="discount-rules-cart-totals__note">Impuestos y envío se calculan al pagar.</p>';
    container.insertBefore(block, container.firstChild);
    return block;
  }

  function updateTotalsContainers(summary) {
    var containers = document.querySelectorAll(
      "#main-cart-footer .js-contents, .cart-drawer__footer, .discount-rules-cart-totals-host"
    );

    containers.forEach(function (container) {
      var block = ensureTotalsBlock(container);
      if (!block) {
        return;
      }

      if (!summary || summary.discountTotal <= 0) {
        block.hidden = true;
        return;
      }

      block.hidden = false;
      var subtotalNode = block.querySelector("[data-dr-subtotal]");
      var discountNode = block.querySelector("[data-dr-discount]");
      var totalNode = block.querySelector("[data-dr-total]");

      if (subtotalNode) {
        subtotalNode.textContent = formatMoney(summary.originalSubtotal);
      }
      if (discountNode) {
        discountNode.textContent = "-" + formatMoney(summary.discountTotal);
      }
      if (totalNode) {
        totalNode.textContent = formatMoney(summary.subtotal);
      }
    });

    document.querySelectorAll(".totals__total-value").forEach(function (node) {
      if (!summary || summary.discountTotal <= 0) {
        node.classList.remove("discount-rules-cart-totals__native-hidden");
        node.removeAttribute("data-discount-rules-adjusted-total");
        return;
      }
      node.textContent = formatMoney(summary.subtotal);
      node.setAttribute("data-discount-rules-adjusted-total", "true");
    });
  }

  function updateLineItemPrices(summary) {
    if (!summary || !summary.lineItems) {
      return;
    }

    summary.lineItems.forEach(function (item, index) {
      var row =
        document.getElementById("CartItem-" + (index + 1)) ||
        document.querySelector('[data-cart-item-key="' + item.key + '"]');
      if (!row) {
        return;
      }

      row.setAttribute("data-cart-item-key", item.key || "");

      var hasDiscount = item.compareAtUnitPrice > item.unitPrice || item.originalUnitPrice > item.unitPrice;
      var unitWrap = row.querySelector(".cart-item__details .product-option, .cart-item__discounted-prices");
      var lineWrap = row.querySelector(".cart-item__price-wrapper");

      if (hasDiscount) {
        var detailsCell = row.querySelector(".cart-item__details");
        if (detailsCell) {
          var priceBlock = detailsCell.querySelector("[data-discount-rules-line-unit]");
          if (!priceBlock) {
            priceBlock = document.createElement("div");
            priceBlock.className = "cart-item__discounted-prices";
            priceBlock.setAttribute("data-discount-rules-line-unit", "");
            var anchor = detailsCell.querySelector(".cart-item__name");
            if (anchor && anchor.nextSibling) {
              detailsCell.insertBefore(priceBlock, anchor.nextSibling);
            } else {
              detailsCell.appendChild(priceBlock);
            }
          }
          priceBlock.innerHTML =
            '<s class="cart-item__old-price product-option">' +
            formatMoney(item.originalUnitPrice) +
            '</s><strong class="cart-item__final-price product-option">' +
            formatMoney(item.unitPrice) +
            "</strong>";
          if (unitWrap && unitWrap !== priceBlock && !unitWrap.hasAttribute("data-discount-rules-line-unit")) {
            unitWrap.style.display = "none";
          }
        }

        if (lineWrap) {
          lineWrap.innerHTML =
            '<dl class="cart-item__discounted-prices">' +
            '<dd><s class="cart-item__old-price price price--end">' +
            formatMoney(item.originalUnitPrice * item.quantity) +
            '</s></dd><dd class="price price--end">' +
            formatMoney(item.price) +
            "</dd></dl>";
        }
      }
    });
  }

  function renderCart(summary) {
    lastSummary = summary;
    updateLineItemPrices(summary);
    updateTotalsContainers(summary);
    document.dispatchEvent(
      new CustomEvent("discount-rules:cart-updated", {
        detail: { summary: summary }
      })
    );
  }

  function refreshCart() {
    var engine = getEngine();
    if (!engine || typeof engine.applyStorefrontCartRules !== "function") {
      return Promise.resolve(null);
    }

    return fetchCart()
      .then(function (cart) {
        if (!cart.items || !cart.items.length) {
          renderCart(null);
          return null;
        }
        return buildSummary(engine, cart).then(function (summary) {
          renderCart(summary);
          return summary;
        });
      })
      .catch(function (error) {
        console.warn("DiscountRules cart:", error.message);
        return null;
      });
  }

  function bindCartEvents() {
    if (typeof subscribe === "function" && typeof PUB_SUB_EVENTS !== "undefined") {
      subscribe(PUB_SUB_EVENTS.cartUpdate, function () {
        window.setTimeout(refreshCart, 120);
      });
    }

    document.addEventListener("shopify:section:load", function () {
      window.setTimeout(refreshCart, 120);
    });
  }

  function submitDiscountCheckout(summary, cart) {
    var config = getConfig();
    var freightVariantId = "";
    var freightPrice = 0;
    var hasEffi = false;

    var pricedByVariant = {};
    if (summary && Array.isArray(summary.lineItems)) {
      summary.lineItems.forEach(function (line) {
        if (line && (line.variantId != null || line.variant_id != null)) {
          pricedByVariant[String(line.variantId || line.variant_id)] = line;
        }
      });
    }

    var lineItems = (cart && cart.items ? cart.items : summary.lineItems).map(function (item) {
      var variantId = item.variant_id || item.variantId;
      var quantity = item.quantity;
      var isFlete =
        (global.PackEffiCart && global.PackEffiCart.isEffiCartItem && global.PackEffiCart.isEffiCartItem(item)) ||
        (item.properties && item.properties._caletzza_effi_hidden);
      var priced = pricedByVariant[String(variantId)] || {};
      var unitPrice = Number(
        priced.unitPrice != null
          ? priced.unitPrice
          : item.final_price != null
            ? item.final_price
            : item.price != null
              ? item.price
              : NaN
      );

      if (isFlete) {
        hasEffi = true;
        freightVariantId = String(variantId);
        freightPrice = Number(item.original_line_price || item.final_line_price || item.price || 0);
        if (!Number.isFinite(unitPrice) && quantity) {
          unitPrice = freightPrice / Number(quantity || 1);
        }
      }

      var payload = {
        variantId: variantId,
        quantity: quantity,
        isEffiFlete: Boolean(isFlete)
      };
      if (Number.isFinite(unitPrice) && unitPrice >= 0) {
        payload.unitPrice = unitPrice;
      }
      return payload;
    });

    if (!hasEffi && cart && global.PackEffiCart && global.PackEffiCart.cartHasEffiFlow) {
      hasEffi = global.PackEffiCart.cartHasEffiFlow(cart);
    }

    return fetch(config.checkoutEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        lineItems: lineItems,
        discountAmount: summary && summary.discountTotal > 0 ? summary.discountTotal : 0,
        discountLabel: (summary && summary.appliedRule && summary.appliedRule.title) || "Descuento por cantidad",
        note: hasEffi ? "Checkout pack con flete Effi" : "Checkout con descuento por cantidad",
        packEffiFlow: hasEffi,
        freightVariantId: freightVariantId,
        freightPrice: freightPrice,
        shippingPrice: 0
      })
    })
      .then(function (response) {
        return response.json().then(function (payload) {
          if (!response.ok) {
            throw new Error(payload.error || "No se pudo iniciar el checkout con descuento.");
          }
          return payload;
        });
      })
      .then(function (payload) {
        if (!payload.invoiceUrl) {
          throw new Error("No se recibió la URL de pago.");
        }
        window.location.href = payload.invoiceUrl;
      });
  }

  function bindCheckoutIntercept() {
    function handleCheckoutAttempt(event) {
      var button = event.submitter || event.target.closest('[name="checkout"]');
      if (!button || checkoutBusy) {
        return;
      }

      var form = button.closest("form") || event.target;
      if (
        form &&
        form.tagName === "FORM" &&
        form.id !== "cart" &&
        form.id !== "cart-notification-form" &&
        form.id !== "CartDrawer-Form"
      ) {
        return;
      }

      var engine = getEngine();
      if (!engine) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      checkoutBusy = true;
      button.setAttribute("aria-disabled", "true");
      button.classList.add("loading");

      fetchCart()
        .then(function (cart) {
          var hasEffi =
            global.PackEffiCart && global.PackEffiCart.cartHasEffiFlow
              ? global.PackEffiCart.cartHasEffiFlow(cart)
              : (cart.items || []).some(function (item) {
                  return item.properties && item.properties._caletzza_effi_hidden;
                });

          return buildSummary(engine, cart).then(function (summary) {
            lastSummary = summary;
            if (global.PackEffiCart && global.PackEffiCart.refresh) {
              global.PackEffiCart.refresh();
            }

            if ((summary && summary.discountTotal > 0) || hasEffi) {
              return submitDiscountCheckout(summary || { discountTotal: 0, lineItems: [] }, cart);
            }

            checkoutBusy = false;
            button.removeAttribute("aria-disabled");
            button.classList.remove("loading");
            window.location.href = "/checkout";
            return null;
          });
        })
        .catch(function (error) {
          checkoutBusy = false;
          button.removeAttribute("aria-disabled");
          button.classList.remove("loading");
          window.alert(error.message || "No se pudo aplicar el descuento en checkout.");
        });
    }

    document.addEventListener("submit", function (event) {
      var submitter = event.submitter;
      if (!submitter || submitter.name !== "checkout") {
        return;
      }
      handleCheckoutAttempt(event);
    }, true);

    document.addEventListener(
      "click",
      function (event) {
        var button = event.target.closest('[name="checkout"]');
        if (!button || button.type === "submit") {
          return;
        }
        handleCheckoutAttempt(event);
      },
      true
    );
  }

  function init() {
    bindCartEvents();
    bindCheckoutIntercept();
    refreshCart();
  }

  function boot() {
    waitForEngine(init);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  document.addEventListener("discount-rules:ready", boot);
})();
