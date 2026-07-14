(function () {
  'use strict';

  var config = window.landingBonusConfig || {};
  var instances = {};
  var currentInstance = null;
  var currentSlot = null;
  var currentPage = 1;
  var varCache = {};
  var varPrefetching = {};
  var imgReady = {};
  var imgHot = {};
  var imgSwapToken = 0;
  var currentVariationData = null;

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function softMatch(a, b) {
    a = String(a == null ? '' : a);
    b = String(b == null ? '' : b);
    if (a === b) return true;
    a = a.toLowerCase().replace(/\s+/g, ' ').trim();
    b = b.toLowerCase().replace(/\s+/g, ' ').trim();
    if (a === b) return true;
    return a.replace(/\s+/g, '-') === b.replace(/\s+/g, '-');
  }

  function showModal(el) {
    if (!el) return;
    el.hidden = false;
    el.classList.add('is-open');
  }

  function hideModal(el) {
    if (!el) return;
    el.hidden = true;
    el.classList.remove('is-open');
  }

  function getInstance(root) {
    var id = root.getAttribute('data-pack-instance');
    return instances[id] || null;
  }

  function syncCountdown(instance, count) {
    if (window.LandingBonusCountdown && typeof window.LandingBonusCountdown.setSlotsFilled === 'function') {
      window.LandingBonusCountdown.setSlotsFilled(count);
    }
    if (instance && instance.config && instance.config.countdownId) {
      document.querySelectorAll('[data-landing-bonus-countdown]').forEach(function (node) {
        if (node.getAttribute('data-countdown-id') === instance.config.countdownId && window.LandingBonusCountdown) {
          window.LandingBonusCountdown.setSlotsFilled(count);
        }
      });
    }
  }

  function updateSelectionState(instance) {
    var filled = Object.keys(instance.selected).length;
    syncCountdown(instance, filled);
  }

  function collectUrls(data) {
    var urls = {};
    if (!data) return [];
    if (data.image) urls[data.image] = 1;
    (data.variations || []).forEach(function (v) {
      if (v.image) urls[v.image] = 1;
      if (v.second_image) urls[v.second_image] = 1;
    });
    Object.keys(data.second_by_color || {}).forEach(function (k) {
      var u = data.second_by_color[k];
      if (u) urls[u] = 1;
    });
    return Object.keys(urls);
  }

  function warmUrl(url) {
    if (!url) return Promise.resolve('');
    if (imgHot[url]) return Promise.resolve(url);
    if (imgReady[url]) return imgReady[url];
    imgReady[url] = new Promise(function (resolve) {
      var img = new Image();
      img.decoding = 'async';
      img.onload = function () { imgHot[url] = true; resolve(url); };
      img.onerror = function () { imgHot[url] = true; resolve(url); };
      img.src = url;
    });
    return imgReady[url];
  }

  function prefetchVars(productId) {
    productId = String(productId || '');
    if (!productId || varCache[productId] || varPrefetching[productId]) return;
    varPrefetching[productId] = true;
    var body = new FormData();
    body.append('action', 'landing_bonus_pack_get_vars');
    body.append('product_id', productId);
    fetch(config.ajaxUrl || '/wp-admin/admin-ajax.php', { method: 'POST', body: body, credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && !data.error) varCache[productId] = data;
      })
      .finally(function () { delete varPrefetching[productId]; });
  }

  function renderProducts() {
    if (!currentInstance) return;
    var cfg = currentInstance.config;
    var perPage = parseInt(cfg.perPage, 10) || 20;
    var start = (currentPage - 1) * perPage;
    var items = currentInstance.products.slice(start, start + perPage);
    var container = $('[data-pack-products]');
    if (!container) return;

    var html = '';
    items.forEach(function (p) {
      var picked = Object.keys(currentInstance.selected).some(function (k) {
        var s = currentInstance.selected[k];
        return (typeof s === 'object' ? s.product_id : s) == p.id;
      });
      html += '<div class="prod' + (picked ? ' is-picked' : '') + '" data-id="' + p.id + '">';
      html += '<img src="' + esc(p.img) + '" loading="lazy" decoding="async" alt=""><p>' + esc(p.name) + '</p></div>';
    });
    html += '<div class="pack-pagination">';
    html += '<button type="button" data-pack-prev>Anterior</button>';
    html += '<span>Pagina ' + currentPage + '</span>';
    html += '<button type="button" data-pack-next>Siguiente</button></div>';
    container.innerHTML = html;

    items.filter(function (p) { return p.is_variable; }).slice(0, 6).forEach(function (p, i) {
      setTimeout(function () { prefetchVars(p.id); }, i * 60);
    });
  }

  function findMatchedVariation(data) {
    var selects = $$('.var-select', $('[data-pack-variation-content]') || document);
    var chosen = [];
    var incomplete = false;
    selects.forEach(function (sel) {
      if (!sel.value) incomplete = true;
      chosen.push(sel.value || '');
    });
    if (incomplete || !chosen.length) return null;
    var found = null;
    (data.variations || []).forEach(function (v) {
      var match = true;
      (data.attributes || []).forEach(function (attr, i) {
        var have = (v.attributes_assoc && v.attributes_assoc[attr.key]) || '';
        var want = chosen[i];
        if (have !== '' && !softMatch(have, want)) match = false;
      });
      if (match) found = v;
    });
    return found;
  }

  function mapSecond(map, val) {
    if (!map || !val) return '';
    if (map[val]) return map[val];
    var keys = Object.keys(map);
    for (var i = 0; i < keys.length; i++) {
      if (softMatch(keys[i], val)) return map[keys[i]];
    }
    return '';
  }

  function resolveSecondImage(data, found) {
    if (!found) return '';
    if (found.second_image) return found.second_image;
    var firstSelect = $('.var-select', $('[data-pack-variation-content]'));
    var colorVal = firstSelect ? firstSelect.value : '';
    if (!colorVal) return '';
    return mapSecond(data && data.second_by_color, colorVal) || mapSecond(data && data.second_by_color, found.color_value || '');
  }

  function applyImagePair(mainUrl, secondUrl) {
    var main = $('#landing-bonus-variation-preview') || $('#variation-preview');
    var box = $('.variation-second', $('[data-pack-variation-content]'));
    var img = $('#landing-bonus-variation-second-preview') || $('#variation-second-preview');
    if (main && mainUrl) main.src = mainUrl;
    if (secondUrl && img && box) {
      img.src = secondUrl;
      box.classList.add('is-visible');
      box.classList.remove('is-empty');
      box.style.display = '';
    } else if (img && box) {
      img.src = '';
      box.classList.remove('is-visible');
      box.classList.add('is-empty');
      box.style.display = '';
    }
  }

  function updateVariationImages(data, found) {
    var mainUrl = found ? (found.image || data.image) : (data.image || '');
    var secondUrl = found ? resolveSecondImage(data, found) : '';
    var token = ++imgSwapToken;
    warmUrl(mainUrl).then(function () {
      if (token !== imgSwapToken) return;
      var main = $('#landing-bonus-variation-preview') || $('#variation-preview');
      if (main) main.src = mainUrl;
    });
    if (!secondUrl) {
      applyImagePair(mainUrl, '');
      return;
    }
    warmUrl(secondUrl).then(function () {
      if (token !== imgSwapToken) return;
      applyImagePair(mainUrl, secondUrl);
    });
  }

  function paintVariationModal(data, productId) {
    currentVariationData = data;
    var content = $('[data-pack-variation-content]');
    if (!content) return;

    var html = '<h3>' + esc(data.name) + '</h3>';
    html += '<div class="variation-media">';
    html += '<img id="landing-bonus-variation-preview" src="' + esc(data.image) + '" alt="" decoding="async">';
    html += '<div class="variation-second is-empty"><img id="landing-bonus-variation-second-preview" src="" alt="" decoding="async"></div>';
    html += '</div>';

    (data.attributes || []).forEach(function (attr, i) {
      var isSize = /talla|size|talle/i.test(String(attr.label || '') + ' ' + String(attr.key || ''));
      var defaultSize = '';
      if (isSize) {
        (attr.options || []).forEach(function (opt) {
          if (defaultSize) return;
          if (softMatch(opt.slug, 'S/M') || softMatch(opt.name, 'S/M')) defaultSize = opt.slug;
        });
      }
      html += '<label>' + esc(attr.label) + '</label>';
      html += '<select class="var-select" data-index="' + i + '">';
      if (!isSize) html += '<option value="">Escoja una opción</option>';
      (attr.options || []).forEach(function (opt) {
        var selected = (isSize && defaultSize && String(opt.slug) === String(defaultSize)) ? ' selected' : '';
        html += '<option value="' + esc(opt.slug) + '"' + selected + '>' + esc(opt.name) + '</option>';
      });
      html += '</select>';
    });
    html += '<button type="button" id="landing-bonus-select-variation" class="botoncito">Seleccionar</button>';
    content.innerHTML = html;
    showModal($('#landing-bonus-pack-variations-modal'));
    updateVariationImages(data, null);
  }

  function openVariations(productId) {
    currentVariationData = null;
    if (varCache[productId]) {
      paintVariationModal(varCache[productId], productId);
      return;
    }
    var body = new FormData();
    body.append('action', 'landing_bonus_pack_get_vars');
    body.append('product_id', productId);
    fetch(config.ajaxUrl || '/wp-admin/admin-ajax.php', { method: 'POST', body: body, credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data || data.error) {
          window.alert('Sin variaciones');
          return;
        }
        varCache[productId] = data;
        paintVariationModal(data, productId);
      })
      .catch(function () { window.alert('No se pudieron cargar las variaciones'); });
  }

  function handleBuy(instance) {
    var ids = Object.keys(instance.selected).map(function (k) { return instance.selected[k]; });
    var slotsNeeded = parseInt(instance.config.slots, 10) || 4;

    if (ids.length !== slotsNeeded) {
      window.alert('Debes seleccionar ' + slotsNeeded + ' productos');
      return;
    }

    if (instance.config.checkoutMode === 'redirect') {
      var body = new FormData();
      body.append('action', 'landing_bonus_pack_add_cart');
      body.append('ids', JSON.stringify(ids));
      fetch(config.ajaxUrl || '/wp-admin/admin-ajax.php', { method: 'POST', body: body, credentials: 'same-origin' })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res.success) {
            window.location.href = instance.config.checkoutUrl || '/finaliza-compra/';
          } else {
            window.alert('No se pudo agregar el pack');
          }
        })
        .catch(function () { window.alert('Error AJAX'); });
      return;
    }

    var resolveBody = new FormData();
    resolveBody.append('action', 'landing_bonus_pack_resolve_items');
    resolveBody.append('ids', JSON.stringify(ids));

    fetch(config.ajaxUrl || '/wp-admin/admin-ajax.php', { method: 'POST', body: resolveBody, credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.success || !res.data || !res.data.items) {
          window.alert('No se pudieron resolver los productos');
          return;
        }
        if (window.LandingBonus && typeof window.LandingBonus.openCodModal === 'function') {
          window.LandingBonus.openCodModal(res.data.items);
        } else {
          window.alert('Modal COD no disponible');
        }
      })
      .catch(function () { window.alert('Error al preparar el pedido'); });
  }

  function bindGlobalEvents() {
    document.addEventListener('click', function (event) {
      var target = event.target;

      var slot = target.closest('.landing-bonus-pack-slot, .slot');
      if (slot) {
        var root = slot.closest('[data-landing-bonus-pack]');
        if (!root) return;
        currentInstance = getInstance(root);
        currentSlot = slot;
        currentPage = 1;
        renderProducts();
        showModal($('#landing-bonus-pack-modal'));
        return;
      }

      if (target.matches('[data-pack-modal-close]')) {
        hideModal($('#landing-bonus-pack-modal'));
        return;
      }

      if (target.matches('[data-pack-var-close]')) {
        hideModal($('#landing-bonus-pack-variations-modal'));
        currentVariationData = null;
        return;
      }

      if (target.matches('[data-pack-next]')) {
        if (!currentInstance) return;
        var perPage = parseInt(currentInstance.config.perPage, 10) || 20;
        if (currentPage * perPage < currentInstance.products.length) {
          currentPage++;
          renderProducts();
        }
        return;
      }

      if (target.matches('[data-pack-prev]')) {
        if (currentPage > 1) {
          currentPage--;
          renderProducts();
        }
        return;
      }

      var prod = target.closest('.prod');
      if (prod && $('[data-pack-products]') && $('[data-pack-products]').contains(prod)) {
        if (!currentInstance || !currentSlot) return;
        var id = parseInt(prod.getAttribute('data-id'), 10);
        var product = currentInstance.products.find(function (p) { return p.id === id; });
        if (!product) return;

        if (product.is_variable) {
          openVariations(id);
        } else {
          currentSlot.innerHTML = '<img src="' + esc(product.img) + '" alt="">';
          currentInstance.selected[currentSlot.getAttribute('data-slot')] = id;
          updateSelectionState(currentInstance);
          hideModal($('#landing-bonus-pack-modal'));
        }
        return;
      }

      var resetBtn = target.closest('[data-landing-bonus-pack-reset]');
      if (resetBtn) {
        var packRoot = resetBtn.closest('[data-landing-bonus-pack]');
        var inst = getInstance(packRoot);
        if (!inst) return;
        $$('.landing-bonus-pack-slot, .slot', packRoot).forEach(function (s) { s.innerHTML = '+'; });
        inst.selected = {};
        updateSelectionState(inst);
        return;
      }

      var buyBtn = target.closest('[data-landing-bonus-pack-buy]');
      if (buyBtn) {
        var buyRoot = buyBtn.closest('[data-landing-bonus-pack]');
        var buyInst = getInstance(buyRoot);
        if (!buyInst || buyBtn.disabled) return;
        buyBtn.disabled = true;
        buyBtn.textContent = 'Procesando...';
        handleBuy(buyInst);
        setTimeout(function () {
          buyBtn.disabled = false;
          buyBtn.textContent = 'Comprar ahora';
        }, 1500);
        return;
      }

      if (target.matches('#landing-bonus-select-variation')) {
        if (!currentVariationData || !currentInstance || !currentSlot) return;
        var incomplete = false;
        $$('.var-select', $('[data-pack-variation-content]')).forEach(function (sel) {
          if (!sel.value) incomplete = true;
        });
        if (incomplete) { window.alert('Escoge color y talla'); return; }
        var found = findMatchedVariation(currentVariationData);
        if (!found) { window.alert('No existe esa combinacion'); return; }
        if (!found.in_stock) { window.alert('Agotado'); return; }
        currentInstance.selected[currentSlot.getAttribute('data-slot')] = {
          variation_id: found.variation_id,
          product_id: found.parent_id
        };
        currentSlot.innerHTML = '<img src="' + esc(found.image || currentVariationData.image) + '" alt="">';
        updateSelectionState(currentInstance);
        hideModal($('#landing-bonus-pack-variations-modal'));
        hideModal($('#landing-bonus-pack-modal'));
        currentVariationData = null;
      }
    });

    document.addEventListener('change', function (event) {
      if (event.target.matches('.var-select') && currentVariationData) {
        updateVariationImages(currentVariationData, findMatchedVariation(currentVariationData));
      }
    });

    document.addEventListener('mouseenter', function (event) {
      var prod = event.target.closest && event.target.closest('.prod');
      if (prod) {
        var id = prod.getAttribute('data-id');
        if (id) prefetchVars(id);
      }
    }, true);
  }

  function initInstances() {
    var bootNode = document.getElementById('landing-bonus-pack-boot');
    if (!bootNode) return;

    try {
      var boot = JSON.parse(bootNode.textContent);
      boot.forEach(function (entry) {
        var root = document.querySelector('[data-pack-instance="' + entry.instanceId + '"]');
        if (!root) return;
        instances[entry.instanceId] = {
          root: root,
          packId: entry.packId,
          products: entry.products || [],
          config: entry.config || {},
          selected: {}
        };
      });
    } catch (error) {
      return;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    initInstances();
    bindGlobalEvents();
  });
})();
