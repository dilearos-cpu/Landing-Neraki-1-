(function (global) {
  function formatMoney(cents, currency) {
    var amount = Number(cents || 0) / 100;
    try {
      return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: currency || "COP",
        maximumFractionDigits: 0
      }).format(amount);
    } catch (error) {
      return "$" + Math.round(amount).toLocaleString("es-CO");
    }
  }

  function splitName(fullName) {
    var parts = String(fullName || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!parts.length) {
      return { firstName: "", lastName: "" };
    }
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: "-" };
    }
    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(" ")
    };
  }

  function findVariantDetails(products, variantId) {
    var id = String(variantId);
    for (var i = 0; i < products.length; i += 1) {
      var product = products[i];
      var variants = product.variants || [];
      for (var j = 0; j < variants.length; j += 1) {
        if (String(variants[j].id) === id) {
          return {
            product: product,
            variant: variants[j]
          };
        }
      }
      if (String(product.default_variant_id) === id) {
        return {
          product: product,
          variant: {
            id: product.default_variant_id,
            title: "Default",
            price: product.price || 0,
            image: product.img || ""
          }
        };
      }
    }
    return null;
  }

  function PackCodCheckout(section, config) {
    this.section = section;
    this.config = config || {};
    this.root = section.querySelector("[data-pack-cod]");
    this.form = section.querySelector("[data-cod-form]");
    this.successPanel = section.querySelector("[data-cod-success]");
    this.errorNode = section.querySelector("[data-cod-error]");
    this.itemsNode = section.querySelector("[data-cod-items]");
    this.subtotalNode = section.querySelector("[data-cod-subtotal]");
    this.shippingNode = section.querySelector("[data-cod-shipping]");
    this.totalNode = section.querySelector("[data-cod-total]");
    this.submitButton = section.querySelector("[data-cod-submit]");
    this.fallbackButton = section.querySelector("[data-cod-fallback]");
    this.orderNameNode = section.querySelector("[data-cod-order-name]");
    this.grid = section.querySelector(".pack-cod__grid");
    this.pendingItems = [];
    this.pendingSummary = null;
    this.onComplete = null;
    this.bindEvents();
  }

  PackCodCheckout.prototype.bindEvents = function () {
    var self = this;

    if (!this.root) {
      return;
    }

    this.root.addEventListener("click", function (event) {
      if (event.target === self.root || event.target.closest("[data-cod-close]")) {
        self.close();
      }
    });

    if (this.form) {
      this.form.addEventListener("submit", function (event) {
        event.preventDefault();
        self.submit();
      });
    }

    var doneButton = this.section.querySelector("[data-cod-done]");
    if (doneButton) {
      doneButton.addEventListener("click", function () {
        self.close();
        if (typeof self.onComplete === "function") {
          self.onComplete();
        }
      });
    }

    if (this.fallbackButton) {
      this.fallbackButton.addEventListener("click", function () {
        self.fallbackToCheckout();
      });
    }
  };

  PackCodCheckout.prototype.renderSummary = function (lineItems) {
    var self = this;
    var subtotal = 0;
    var shipping = Number(this.config.shippingFlat || 0);

    this.itemsNode.innerHTML = lineItems
      .map(function (item) {
        subtotal += Number(item.price || 0);
        var image = item.image
          ? '<img src="' + item.image + '" alt="">'
          : '<div style="width:56px;height:56px;background:#f5f5f5;border-radius:6px;"></div>';
        return (
          '<li class="pack-cod__item">' +
          image +
          '<div><p class="pack-cod__item-title">' +
          item.title +
          '</p><p class="pack-cod__item-variant">' +
          (item.variantTitle || "") +
          "</p></div>" +
          '<span class="pack-cod__item-price">' +
          formatMoney(item.price, self.config.currency) +
          "</span></li>"
        );
      })
      .join("");

    if (this.config.freeShippingThreshold && subtotal >= Number(this.config.freeShippingThreshold)) {
      shipping = 0;
    }

    this.pendingSummary = {
      subtotal: subtotal,
      shipping: shipping,
      total: subtotal + shipping
    };

    this.subtotalNode.textContent = formatMoney(subtotal, this.config.currency);
    this.shippingNode.textContent = shipping > 0 ? formatMoney(shipping, this.config.currency) : "Gratis";
    this.totalNode.textContent = formatMoney(subtotal + shipping, this.config.currency);
  };

  PackCodCheckout.prototype.buildLineItems = function (cartItems, products) {
    var self = this;
    return cartItems
      .map(function (item) {
        var details = findVariantDetails(products, item.id);
        if (!details) {
          return null;
        }
        return {
          variantId: item.id,
          quantity: item.quantity || 1,
          title: details.product.name,
          variantTitle: details.variant.title,
          image: details.variant.image || details.product.img || "",
          price: Number(details.variant.price || 0) * (item.quantity || 1)
        };
      })
      .filter(Boolean);
  };

  PackCodCheckout.prototype.open = function (cartItems, products, options) {
    if (!this.root || !this.form) {
      return;
    }

    this.onComplete = options && options.onComplete;
    this.pendingItems = cartItems.slice();
    var lineItems = this.buildLineItems(cartItems, products);

    if (!lineItems.length) {
      return;
    }

    this.renderSummary(lineItems);
    this.form.hidden = false;
    this.form.reset();
    this.successPanel.hidden = true;
    this.grid.hidden = false;
    this.hideError();
    if (this.fallbackButton) {
      this.fallbackButton.hidden = true;
    }
    this.root.hidden = false;
    document.body.classList.add("pack-modal-open");
  };

  PackCodCheckout.prototype.close = function () {
    if (!this.root) {
      return;
    }
    this.root.hidden = true;
    document.body.classList.remove("pack-modal-open");
  };

  PackCodCheckout.prototype.showError = function (message) {
    if (!this.errorNode) {
      return;
    }
    this.errorNode.hidden = !message;
    this.errorNode.textContent = message || "";
    if (this.fallbackButton && this.config.showCheckoutFallback) {
      this.fallbackButton.hidden = false;
    }
  };

  PackCodCheckout.prototype.hideError = function () {
    this.showError("");
  };

  PackCodCheckout.prototype.setLoading = function (isLoading) {
    if (!this.submitButton) {
      return;
    }
    this.submitButton.disabled = isLoading;
    this.submitButton.textContent = isLoading
      ? this.config.loadingLabel || "Procesando..."
      : this.config.submitLabel || "Confirmar pedido";
  };

  PackCodCheckout.prototype.fallbackToCheckout = function () {
    var self = this;
    if (!this.pendingItems.length) {
      return;
    }

    this.setLoading(true);
    fetch((this.config.cartUrl || "/cart/add.js").replace(/\.js$/, "") + ".js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({ items: this.pendingItems })
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("No se pudo preparar el carrito.");
        }
        window.location.href = self.config.checkoutUrl || "/checkout";
      })
      .catch(function (error) {
        self.showError(error.message);
      })
      .finally(function () {
        self.setLoading(false);
      });
  };

  PackCodCheckout.prototype.submit = function () {
    var self = this;
    if (!this.form || !this.pendingItems.length) {
      return;
    }

    if (!this.form.reportValidity()) {
      return;
    }

    var formData = new FormData(this.form);
    var fullName = String(formData.get("full_name") || "").trim();
    var names = splitName(fullName);
    var payload = {
      customer: {
        firstName: names.firstName,
        lastName: names.lastName,
        phone: String(formData.get("phone") || "").trim(),
        email: String(formData.get("email") || "").trim()
      },
      shippingAddress: {
        address1: String(formData.get("address1") || "").trim(),
        city: String(formData.get("city") || "").trim(),
        province: String(formData.get("province") || "").trim(),
        country: "Colombia",
        zip: ""
      },
      lineItems: this.pendingItems.map(function (item) {
        return {
          variantId: item.id,
          quantity: item.quantity || 1
        };
      }),
      note: String(formData.get("note") || "").trim(),
      shippingPrice: this.pendingSummary ? this.pendingSummary.shipping : 0,
      packLabel: this.config.packLabel || "Pack Bodys"
    };

    this.setLoading(true);
    this.hideError();

    fetch(this.config.orderEndpoint || "/apps/cod-express/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        return response.json().then(function (data) {
          if (!response.ok) {
            throw new Error((data && data.error) || "No se pudo crear el pedido.");
          }
          return data;
        });
      })
      .then(function (data) {
        self.form.hidden = true;
        self.grid.hidden = true;
        self.successPanel.hidden = false;
        if (self.orderNameNode && data.orderName) {
          self.orderNameNode.textContent = "Pedido " + data.orderName;
        }
      })
      .catch(function (error) {
        self.showError(
          error.message +
            ". Si el problema continua, usa el checkout alternativo o contacta a la tienda."
        );
      })
      .finally(function () {
        self.setLoading(false);
      });
  };

  global.PackCodCheckout = {
    create: function (section, config) {
      return new PackCodCheckout(section, config);
    },
    formatMoney: formatMoney,
    findVariantDetails: findVariantDetails
  };
})(window);
