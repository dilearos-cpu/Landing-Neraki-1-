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

  function cartAddUrl(cartUrl) {
    var base = String(cartUrl || "/cart/add").replace(/\.js$/, "");
    return base + ".js";
  }

  var CO_PROVINCE_CODES = {
    Amazonas: "AMA",
    Antioquia: "ANT",
    Arauca: "ARA",
    Atlantico: "ATL",
    "Bogota D.C.": "DC",
    Bolivar: "BOL",
    Boyaca: "BOY",
    Caldas: "CAL",
    Caqueta: "CAQ",
    Casanare: "CAS",
    Cauca: "CAU",
    Cesar: "CES",
    Choco: "CHO",
    Cordoba: "COR",
    Cundinamarca: "CUN",
    Guainia: "GUA",
    Guaviare: "GUV",
    Huila: "HUI",
    "La Guajira": "LAG",
    Magdalena: "MAG",
    Meta: "MET",
    Narino: "NAR",
    "Norte de Santander": "NSA",
    Putumayo: "PUT",
    Quindio: "QUI",
    Risaralda: "RIS",
    "San Andres": "SAP",
    Santander: "SAN",
    Sucre: "SUC",
    Tolima: "TOL",
    "Valle del Cauca": "VAC",
    Vaupes: "VAU",
    Vichada: "VID"
  };

  function variantGid(variantId) {
    return "gid://shopify/ProductVariant/" + variantId;
  }

  function normalizePhone(phone) {
    var digits = String(phone || "").replace(/\D/g, "");
    if (!digits) {
      return "";
    }
    if (digits.indexOf("57") === 0 && digits.length >= 12) {
      return "+" + digits;
    }
    if (digits.length === 10) {
      return "+57" + digits;
    }
    return "+" + digits;
  }

  function checkoutEmail(customer) {
    if (customer.email) {
      return customer.email;
    }
    var digits = String(customer.phone || "").replace(/\D/g, "");
    if (digits) {
      return "cliente+" + digits + "@checkout.caletzza.local";
    }
    return "cliente@checkout.caletzza.local";
  }

  function PackCodCheckout(section, config) {
    this.section = section;
    this.config = config || {};
    this.root = section.querySelector("[data-pack-cod]");
    this.dialog = section.querySelector("[data-cod-dialog]");
    this.mainPanel = section.querySelector("[data-cod-main]");
    this.form = section.querySelector("[data-cod-form]");
    this.successPanel = section.querySelector("[data-cod-success]");
    this.errorNode = section.querySelector("[data-cod-error]");
    this.itemsNode = section.querySelector("[data-cod-items]");
    this.subtotalNode = section.querySelector("[data-cod-subtotal]");
    this.taxNode = section.querySelector("[data-cod-tax]");
    this.taxRow = section.querySelector("[data-cod-tax-row]");
    this.shippingNode = section.querySelector("[data-cod-shipping]");
    this.totalNode = section.querySelector("[data-cod-total]");
    this.submitButton = section.querySelector("[data-cod-submit]");
    this.fallbackButton = section.querySelector("[data-cod-fallback]");
    this.orderNameNode = section.querySelector("[data-cod-order-name]");
    this.paymentNoteNode = section.querySelector("[data-cod-payment-note]");
    this.paymentsFieldset = section.querySelector("[data-cod-payments]");
    this.grid = section.querySelector(".pack-cod__grid");
    this.pendingItems = [];
    this.pendingSummary = null;
    this.onComplete = null;
    this.isLoading = false;
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

      this.form.addEventListener("change", function (event) {
        if (event.target && event.target.name === "payment_method") {
          self.updatePaymentUI();
        }
      });
    }

    if (this.paymentsFieldset) {
      this.paymentsFieldset.addEventListener("click", function (event) {
        var option = event.target.closest(".pack-cod__pay-card");
        if (!option) {
          return;
        }
        var options = self.paymentsFieldset.querySelectorAll(".pack-cod__pay-card");
        options.forEach(function (node) {
          node.classList.toggle("pack-cod__pay-card--active", node === option);
        });
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

  PackCodCheckout.prototype.getTaxRate = function () {
    return Number(this.config.taxRatePercent || 19) / 100;
  };

  PackCodCheckout.prototype.getPaymentMethod = function () {
    if (!this.config.enableOnlinePayment || !this.form) {
      return "cod";
    }
    var selected = this.form.querySelector('input[name="payment_method"]:checked');
    return selected && selected.value === "online" ? "online" : "cod";
  };

  PackCodCheckout.prototype.updatePaymentUI = function () {
    if (!this.submitButton) {
      return;
    }

    var method = this.getPaymentMethod();
    var isOnline = method === "online";

    if (this.isLoading) {
      this.submitButton.textContent = isOnline
        ? this.config.onlineLoadingLabel || "Redirigiendo al checkout..."
        : this.config.loadingLabel || "Procesando...";
    } else {
      this.submitButton.textContent = isOnline
        ? this.config.onlineSubmitLabel || "Continuar al pago seguro"
        : this.config.submitLabel || "Confirmar pedido";
    }

    if (this.paymentNoteNode) {
      this.paymentNoteNode.textContent = isOnline
        ? this.config.paymentNoteOnline || "Checkout seguro de Shopify con tus metodos activos."
        : this.config.paymentNoteCod || "Pagas al recibir tu pedido.";
      this.paymentNoteNode.classList.toggle("pack-cod__payment-note--online", isOnline);
    }

    if (this.submitButton) {
      this.submitButton.classList.toggle("pack-cod__submit--online", isOnline);
    }
  };

  PackCodCheckout.prototype.renderSummary = function (lineItems) {
    var self = this;
    var subtotal = 0;
    var shipping = Number(this.config.shippingFlat || 0);
    var taxRate = this.getTaxRate();

    this.itemsNode.innerHTML = lineItems
      .map(function (item) {
        subtotal += Number(item.price || 0);
        var image = item.image
          ? '<img src="' + item.image + '" alt="">'
          : '<div class="pack-cod__item-placeholder"></div>';
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

    var taxAmount = Math.round(subtotal * taxRate);
    var displayTotal = subtotal + shipping;

    this.pendingSummary = {
      subtotal: subtotal,
      taxAmount: taxAmount,
      taxRate: taxRate,
      shipping: shipping,
      total: displayTotal
    };

    this.subtotalNode.textContent = formatMoney(subtotal, this.config.currency);
    if (this.taxNode) {
      this.taxNode.textContent = formatMoney(taxAmount, this.config.currency);
    }
    if (this.taxRow) {
      this.taxRow.hidden = taxRate <= 0;
    }
    if (this.shippingNode) {
      var isFreeShipping = shipping <= 0;
      this.shippingNode.textContent = isFreeShipping
        ? "Te obsequiamos el envío"
        : formatMoney(shipping, this.config.currency);
      this.shippingNode.classList.toggle("pack-cod__shipping-gift", isFreeShipping);
    }
    this.totalNode.textContent = formatMoney(displayTotal, this.config.currency);
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
    this.grid.hidden = false;
    this.hideError();

    if (this.paymentsFieldset) {
      var codRadio = this.form.querySelector('input[name="payment_method"][value="cod"]');
      if (codRadio) {
        codRadio.checked = true;
      }
      var paymentOptions = this.paymentsFieldset.querySelectorAll(".pack-cod__pay-card");
      paymentOptions.forEach(function (node, index) {
        node.classList.toggle("pack-cod__pay-card--active", index === 0);
      });
    }

    this.updatePaymentUI();

    if (this.mainPanel) {
      this.mainPanel.hidden = false;
    }
    if (this.dialog) {
      this.dialog.classList.remove("pack-cod__dialog--success");
    }
    this.successPanel.hidden = true;

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
    this.isLoading = isLoading;
    if (!this.submitButton) {
      return;
    }
    this.submitButton.disabled = isLoading;
    this.updatePaymentUI();
  };

  PackCodCheckout.prototype.readFormData = function () {
    var formData = new FormData(this.form);
    var fullName = String(formData.get("full_name") || "").trim();
    var names = splitName(fullName);
    return {
      formData: formData,
      fullName: fullName,
      names: names,
      phone: String(formData.get("phone") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      city: String(formData.get("city") || "").trim(),
      province: String(formData.get("province") || "").trim(),
      address1: String(formData.get("address1") || "").trim(),
      note: String(formData.get("note") || "").trim()
    };
  };

  PackCodCheckout.prototype.buildCartAttributes = function (customer) {
    var attributes = {
      "Nombre completo": customer.fullName,
      Telefono: customer.phone,
      Ciudad: customer.city,
      Departamento: customer.province,
      Direccion: customer.address1,
      "Pack express": this.config.packLabel || "Pack Bodys",
      "Metodo de pago": "En linea (Shopify Checkout)"
    };

    if (customer.email) {
      attributes.Email = customer.email;
    }
    if (customer.note) {
      attributes["Barrio / Referencia"] = customer.note;
    }

    return attributes;
  };

  PackCodCheckout.prototype.buildCartNote = function (customer) {
    var lines = [
      (this.config.packLabel || "Pack Bodys") + " — pago en linea",
      "Nombre: " + customer.fullName,
      "Telefono: " + customer.phone
    ];

    if (customer.email) {
      lines.push("Email: " + customer.email);
    }

    lines.push(
      "Ciudad: " + customer.city,
      "Departamento: " + customer.province,
      "Direccion: " + customer.address1
    );

    if (customer.note) {
      lines.push("Referencia: " + customer.note);
    }

    return lines.join("\n");
  };

  PackCodCheckout.prototype.fallbackToCheckout = function () {
    var self = this;
    if (!this.pendingItems.length) {
      return;
    }

    this.setLoading(true);
    fetch(cartAddUrl(this.config.cartUrl), {
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

  function parseOrderResponse(response) {
    return response.text().then(function (text) {
      var data = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (error) {
          throw new Error(
            "El servidor no respondio JSON (HTTP " +
              response.status +
              "). Revisa app proxy en Dev Dashboard."
          );
        }
      }

      if (!response.ok) {
        throw new Error((data && data.error) || "No se pudo crear el pedido (HTTP " + response.status + ").");
      }

      return data;
    });
  }

  PackCodCheckout.prototype.storefrontGraphql = function (query, variables) {
    var self = this;
    if (!this.config.storefrontToken) {
      return Promise.reject(new Error("Falta el token Storefront API en la configuracion del theme."));
    }

    return fetch(this.config.storefrontApiUrl || "/api/2025-01/graphql.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": this.config.storefrontToken
      },
      body: JSON.stringify({ query: query, variables: variables })
    }).then(function (response) {
      return response.json();
    }).then(function (payload) {
      if (payload.errors && payload.errors.length) {
        throw new Error(payload.errors[0].message);
      }
      return payload.data;
    });
  };

  PackCodCheckout.prototype.showSuccess = function (orderName) {
    if (this.mainPanel) {
      this.mainPanel.hidden = true;
    }
    if (this.dialog) {
      this.dialog.classList.add("pack-cod__dialog--success");
    }
    this.successPanel.hidden = false;
    if (this.orderNameNode && orderName) {
      this.orderNameNode.textContent = "Pedido " + orderName;
    }
  };

  PackCodCheckout.prototype.submitOnline = function (customer) {
    var self = this;
    var provinceCode = CO_PROVINCE_CODES[customer.province] || "CUN";
    var phone = normalizePhone(customer.phone);
    var email = checkoutEmail(customer);
    var lines = this.pendingItems.map(function (item) {
      return {
        merchandiseId: variantGid(item.id),
        quantity: item.quantity || 1
      };
    });

    var cartCreateMutation =
      "mutation cartCreate($input: CartInput!) {" +
      " cartCreate(input: $input) {" +
      " cart { id checkoutUrl }" +
      " userErrors { field message }" +
      " }" +
      "}";

    var identityMutation =
      "mutation cartBuyerIdentityUpdate($cartId: ID!, $identity: CartBuyerIdentityInput!) {" +
      " cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $identity) {" +
      " cart { id checkoutUrl }" +
      " userErrors { field message }" +
      " }" +
      "}";

    var addressMutation =
      "mutation cartDeliveryAddressesAdd($cartId: ID!, $addresses: [CartSelectableAddressInput!]!) {" +
      " cartDeliveryAddressesAdd(cartId: $cartId, addresses: $addresses) {" +
      " cart { id checkoutUrl }" +
      " userErrors { field message }" +
      " }" +
      "}";

    var noteMutation =
      "mutation cartNoteUpdate($cartId: ID!, $note: String!) {" +
      " cartNoteUpdate(cartId: $cartId, note: $note) {" +
      " cart { id checkoutUrl }" +
      " userErrors { field message }" +
      " }" +
      "}";

    var cartId = "";
    var checkoutUrl = "";

    function ensureNoErrors(result, key) {
      var errors = result && result[key] && result[key].userErrors;
      if (errors && errors.length) {
        throw new Error(errors.map(function (error) {
          return error.message;
        }).join(" "));
      }
      return result[key];
    }

    this.storefrontGraphql(cartCreateMutation, {
      input: {
        lines: lines,
        buyerIdentity: {
          email: email,
          phone: phone,
          countryCode: "CO"
        }
      }
    })
      .then(function (data) {
        var result = ensureNoErrors(data, "cartCreate");
        cartId = result.cart.id;
        checkoutUrl = result.cart.checkoutUrl;
        return self.storefrontGraphql(identityMutation, {
          cartId: cartId,
          identity: {
            email: email,
            phone: phone,
            countryCode: "CO"
          }
        });
      })
      .then(function (data) {
        var result = ensureNoErrors(data, "cartBuyerIdentityUpdate");
        checkoutUrl = result.cart.checkoutUrl || checkoutUrl;
        return self.storefrontGraphql(addressMutation, {
          cartId: cartId,
          addresses: [
            {
              selected: true,
              oneTimeUse: true,
              address: {
                deliveryAddress: {
                  firstName: customer.names.firstName,
                  lastName: customer.names.lastName,
                  address1: customer.address1,
                  city: customer.city,
                  provinceCode: provinceCode,
                  countryCode: "CO",
                  zip: "000000",
                  phone: phone
                }
              }
            }
          ]
        });
      })
      .then(function (data) {
        var result = ensureNoErrors(data, "cartDeliveryAddressesAdd");
        checkoutUrl = result.cart.checkoutUrl || checkoutUrl;
        if (!customer.note) {
          return null;
        }
        return self.storefrontGraphql(noteMutation, {
          cartId: cartId,
          note: customer.note
        });
      })
      .then(function (data) {
        if (data && data.cartNoteUpdate) {
          checkoutUrl = data.cartNoteUpdate.cart.checkoutUrl || checkoutUrl;
        }
        if (!checkoutUrl) {
          throw new Error("No se obtuvo la URL de checkout.");
        }
        window.location.href = checkoutUrl;
      })
      .catch(function (error) {
        console.warn("Storefront checkout prefill failed, using fallback:", error);
        self.submitOnlineFallback(customer);
      });
  };

  PackCodCheckout.prototype.submitOnlineFallback = function (customer) {
    var self = this;

    fetch("/cart/clear.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    })
      .catch(function () {
        return null;
      })
      .then(function () {
        return fetch(cartAddUrl(self.config.cartUrl), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({ items: self.pendingItems })
        });
      })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("No se pudo agregar el pack al carrito.");
        }
        return fetch("/cart/update.js", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({
            note: self.buildCartNote(customer),
            attributes: self.buildCartAttributes(customer)
          })
        });
      })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("No se pudo preparar el checkout.");
        }
        window.location.href = self.config.checkoutUrl || "/checkout";
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

  PackCodCheckout.prototype.submitCod = function (customer) {
    var self = this;
    var payload = {
      customer: {
        firstName: customer.names.firstName,
        lastName: customer.names.lastName,
        phone: customer.phone,
        email: customer.email
      },
      shippingAddress: {
        address1: customer.address1,
        city: customer.city,
        province: customer.province,
        country: "Colombia",
        zip: ""
      },
      lineItems: this.pendingItems.map(function (item) {
        return {
          variantId: item.id,
          quantity: item.quantity || 1
        };
      }),
      note: customer.note,
      shippingPrice: this.pendingSummary ? this.pendingSummary.shipping : 0,
      packLabel: this.config.packLabel || "Pack Bodys"
    };

    fetch(this.config.orderEndpoint || "/apps/cod-express", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then(parseOrderResponse)
      .then(function (data) {
        self.showSuccess(data.orderName);
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

  PackCodCheckout.prototype.submit = function () {
    if (!this.form || !this.pendingItems.length) {
      return;
    }

    if (!this.form.reportValidity()) {
      return;
    }

    var customer = this.readFormData();
    var paymentMethod = this.getPaymentMethod();

    this.setLoading(true);
    this.hideError();

    if (paymentMethod === "online") {
      this.submitOnline(customer);
      return;
    }

    this.submitCod(customer);
  };

  global.PackCodCheckout = {
    create: function (section, config) {
      return new PackCodCheckout(section, config);
    },
    formatMoney: formatMoney,
    findVariantDetails: findVariantDetails
  };
})(window);
