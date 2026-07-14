(function () {
  'use strict';

  var config = window.landingBonusConfig || {};
  var modal = document.querySelector('[data-landing-bonus-cod-modal]');
  var currentItems = [];

  function readSettings() {
    var node = modal && modal.querySelector('[data-cod-settings]');
    if (!node) {
      return {};
    }
    try {
      return JSON.parse(node.textContent);
    } catch (error) {
      return {};
    }
  }

  function openModal(items) {
    if (!modal) {
      return;
    }

    currentItems = Array.isArray(items) ? items : [];
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    renderSummary();
    hideSuccess();
  }

  function closeModal() {
    if (!modal) {
      return;
    }

    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function hideSuccess() {
    var success = modal.querySelector('[data-cod-success]');
    var body = modal.querySelector('.landing-bonus-cod-modal__body');
    if (success) {
      success.hidden = true;
    }
    if (body) {
      body.hidden = false;
    }
  }

  function showSuccess(message) {
    var success = modal.querySelector('[data-cod-success]');
    var body = modal.querySelector('.landing-bonus-cod-modal__body');
    var messageNode = modal.querySelector('[data-cod-success-message]');

    if (messageNode) {
      messageNode.textContent = message;
    }
    if (success) {
      success.hidden = false;
    }
    if (body) {
      body.hidden = true;
    }
  }

  function renderSummary() {
    var settings = readSettings();
    var subtotal = currentItems.reduce(function (sum, item) {
      return sum + (Number(item.price) || 0) * (Number(item.quantity) || 1);
    }, 0);

    var iva = subtotal * ((Number(settings.ivaPercent) || 0) / 100);
    var shipping = Number(settings.shippingCost) || 0;
    var threshold = Number(settings.freeShippingThreshold) || 0;
    var freeShipping = threshold > 0 && subtotal >= threshold;

    if (freeShipping) {
      shipping = 0;
    }

    var total = subtotal + iva + shipping;
    var lines = modal.querySelector('[data-cod-lines]');

    if (lines) {
      lines.innerHTML = currentItems.map(function (item) {
        return '<li>' + (item.name || 'Producto') + ' x' + (item.quantity || 1) + '</li>';
      }).join('');
    }

    setText('[data-cod-subtotal]', window.LandingBonus.formatMoney(subtotal));
    setText('[data-cod-iva]', window.LandingBonus.formatMoney(iva));
    setText('[data-cod-shipping]', freeShipping ? (config.i18n && config.i18n.freeShipping) || 'Gratis' : window.LandingBonus.formatMoney(shipping));
    setText('[data-cod-total]', window.LandingBonus.formatMoney(total));

    var freeNode = modal.querySelector('[data-cod-free-shipping]');
    if (freeNode) {
      freeNode.hidden = !freeShipping;
    }

    var submit = modal.querySelector('[data-cod-submit]');
    if (submit && settings.accentColor) {
      submit.style.backgroundColor = settings.accentColor;
    }
  }

  function setText(selector, value) {
    var node = modal.querySelector(selector);
    if (node) {
      node.textContent = value;
    }
  }

  function collectFormData(form) {
    return {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      email: form.email.value.trim(),
      department: form.department.value.trim(),
      city: form.city.value.trim(),
      address: form.address.value.trim(),
      notes: form.notes.value.trim()
    };
  }

  function submitOrder(form) {
    var submit = modal.querySelector('[data-cod-submit]');
    if (submit) {
      submit.disabled = true;
    }

    var payload = new FormData();
    payload.append('action', 'landing_bonus_create_cod_order');
    payload.append('nonce', config.nonce || '');
    payload.append('items', JSON.stringify(currentItems));

    var customer = collectFormData(form);
    Object.keys(customer).forEach(function (key) {
      payload.append(key, customer[key]);
    });

    fetch(config.ajaxUrl, {
      method: 'POST',
      body: payload,
      credentials: 'same-origin'
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (result) {
        if (!result.success) {
          throw new Error((result.data && result.data.message) || (config.i18n && config.i18n.orderError));
        }
        showSuccess(result.data.message);
      })
      .catch(function (error) {
        window.alert(error.message || (config.i18n && config.i18n.orderError));
      })
      .finally(function () {
        if (submit) {
          submit.disabled = false;
        }
      });
  }

  function bindModal() {
    if (!modal) {
      return;
    }

    modal.querySelectorAll('[data-cod-close]').forEach(function (button) {
      button.addEventListener('click', closeModal);
    });

    var form = modal.querySelector('[data-cod-form]');
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        submitOrder(form);
      });
    }
  }

  function bindPackButtons() {
    document.querySelectorAll('[data-landing-bonus-pack-buy], .landing-bonus-pack-buy').forEach(function (button) {
      button.addEventListener('click', function () {
        var pack = button.closest('[data-landing-bonus-pack]');
        var demoItems = [
          {
            product_id: 0,
            quantity: 1,
            name: 'Pack demo',
            price: 0
          }
        ];

        if (pack) {
          var slots = Number(pack.getAttribute('data-slots')) || 4;
          demoItems[0].name = 'Pack x' + slots;
        }

        openModal(demoItems);
      });
    });
  }

  window.LandingBonus.openCodModal = openModal;
  window.LandingBonus.closeCodModal = closeModal;

  document.addEventListener('DOMContentLoaded', function () {
    bindModal();
    bindPackButtons();
  });
})();
