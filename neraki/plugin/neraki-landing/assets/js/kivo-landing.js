/**
 * KIVO Landing Page — JavaScript
 * Elementor Pro compatible | Vanilla JS (no jQuery)
 *
 * Módulos:
 *  - DuoBuilder: Constructor del dúo pack
 *  - FAQAccordion: Acordeón de preguntas frecuentes
 *  - CountdownTimer: Temporizador de oferta
 *  - ScrollReveal: Animaciones al scroll
 *  - SmoothScroll: Navegación suave entre secciones
 *  - Toast: Notificaciones de feedback
 */

(function () {
  'use strict';

  /* ==========================================================================
     UTILIDADES
     ========================================================================== */

  /**
   * Selecciona un elemento del DOM
   * @param {string} selector
   * @param {Element} [context=document]
   * @returns {Element|null}
   */
  function $(selector, context) {
    return (context || document).querySelector(selector);
  }

  /**
   * Selecciona múltiples elementos del DOM
   * @param {string} selector
   * @param {Element} [context=document]
   * @returns {NodeList}
   */
  function $$(selector, context) {
    return (context || document).querySelectorAll(selector);
  }

  /**
   * Emite un evento personalizado
   * @param {Element} el
   * @param {string} name
   * @param {object} [detail={}]
   */
  function emit(el, name, detail) {
    el.dispatchEvent(new CustomEvent(name, { detail: detail || {}, bubbles: true }));
  }

  /* ==========================================================================
     TOAST — Notificaciones de feedback
     ========================================================================== */

  const Toast = {
    el: null,

    init() {
      this.el = document.createElement('div');
      this.el.className = 'kivo-toast';
      this.el.setAttribute('role', 'status');
      this.el.setAttribute('aria-live', 'polite');
      document.body.appendChild(this.el);
    },

    /**
     * Muestra un mensaje toast
     * @param {string} message
     * @param {number} [duration=3000]
     */
    show(message, duration) {
      if (!this.el) this.init();

      this.el.textContent = message;
      this.el.classList.add('is-visible');

      clearTimeout(this._timer);
      this._timer = setTimeout(() => {
        this.el.classList.remove('is-visible');
      }, duration || 3000);
    }
  };

  /* ==========================================================================
     DUO BUILDER — Constructor del dúo pack
     ========================================================================== */

  const DuoBuilder = {
  /** @type {Array<{id: string, name: string, color: string, price: number, image: string}|null>} */
    slots: [null, null],
    maxSlots: 2,

    init() {
      this.bindProductButtons();
      this.bindRemoveButtons();
      this.bindCheckout();
      this.updateUI();
    },

    /**
     * Vincula botones "Agregar al dúo" en las cards de producto
     */
    bindProductButtons() {
      $$('[data-add-to-duo]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const card = e.target.closest('.kivo-product-card');
          if (!card) return;

          const product = {
            id: card.dataset.productId,
            name: card.dataset.productName,
            color: card.dataset.productColor,
            price: parseInt(card.dataset.productPrice, 10),
            image: $('.kivo-product-card__image', card)?.src || ''
          };

          this.addProduct(product, card);
        });
      });
    },

    /**
     * Vincula botones de eliminar en los slots
     */
    bindRemoveButtons() {
      $$('.kivo-duo-slot__remove').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const slot = e.target.closest('.kivo-duo-slot');
          if (!slot) return;
          const index = parseInt(slot.dataset.slot, 10) - 1;
          this.removeProduct(index);
        });
      });
    },

    /**
     * Vincula botón de finalizar compra
     */
    bindCheckout() {
      const btn = $('#duo-checkout-btn');
      if (!btn) return;

      btn.addEventListener('click', () => {
        if (btn.disabled) return;

        const products = this.slots.filter(Boolean);
        emit(document, 'kivo:checkout', { products });

        // Redirigir a checkout — ajustar URL según plataforma
        Toast.show('¡Redirigiendo al checkout...', 2000);

        // Ejemplo: window.location.href = '/checkout?duo=' + products.map(p => p.id).join(',');
      });
    },

    /**
     * Agrega un producto al primer slot disponible
     * @param {object} product
     * @param {Element} cardEl
     */
    addProduct(product, cardEl) {
      // Verificar si ya está en algún slot
      const existingIndex = this.slots.findIndex((s) => s && s.id === product.id);
      if (existingIndex !== -1) {
        Toast.show('Este producto ya está en tu dúo');
        return;
      }

      // Buscar primer slot vacío
      const emptyIndex = this.slots.findIndex((s) => s === null);
      if (emptyIndex === -1) {
        Toast.show('Ya tienes 2 productos. Quita uno para cambiar.');
        return;
      }

      this.slots[emptyIndex] = product;
      this.renderSlot(emptyIndex);
      this.updateUI();

      // Marcar card como seleccionada
      cardEl.classList.add('is-selected');
      const btn = $('[data-add-to-duo]', cardEl);
      if (btn) {
        btn.classList.add('is-added');
        btn.textContent = '✓ Agregado';
      }

      Toast.show(product.name + ' agregado al dúo');

      // Scroll al constructor si es el primer producto
      if (this.getFilledCount() === 1) {
        const builder = $('#duo-builder');
        if (builder) {
          builder.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    },

    /**
     * Elimina un producto de un slot
     * @param {number} index
     */
    removeProduct(index) {
      const product = this.slots[index];
      if (!product) return;

      this.slots[index] = null;
      this.renderSlot(index);
      this.updateUI();

      // Desmarcar card
      const card = $(`.kivo-product-card[data-product-id="${product.id}"]`);
      if (card) {
        card.classList.remove('is-selected');
        const btn = $('[data-add-to-duo]', card);
        if (btn) {
          btn.classList.remove('is-added');
          btn.textContent = 'Agregar al dúo';
        }
      }

      Toast.show(product.name + ' eliminado del dúo');
    },

    /**
     * Renderiza el contenido visual de un slot
     * @param {number} index
     */
    renderSlot(index) {
      const slotEl = $(`#duo-slot-${index + 1}`);
      if (!slotEl) return;

      const product = this.slots[index];
      const emptyEl = $('.kivo-duo-slot__empty', slotEl);
      const filledEl = $('.kivo-duo-slot__filled', slotEl);
      const removeBtn = $('.kivo-duo-slot__remove', slotEl);

      if (product) {
        slotEl.classList.add('is-filled');
        emptyEl.hidden = true;
        filledEl.hidden = false;
        removeBtn.hidden = false;

        const img = $('.kivo-duo-slot__img', filledEl);
        const name = $('.kivo-duo-slot__name', filledEl);
        const color = $('.kivo-duo-slot__color', filledEl);

        if (img) {
          img.src = product.image;
          img.alt = product.name;
        }
        if (name) name.textContent = product.name;
        if (color) color.textContent = product.color;
      } else {
        slotEl.classList.remove('is-filled');
        emptyEl.hidden = false;
        filledEl.hidden = true;
        removeBtn.hidden = true;
      }
    },

    /**
     * Cuenta slots llenos
     * @returns {number}
     */
    getFilledCount() {
      return this.slots.filter(Boolean).length;
    },

    /**
     * Actualiza barra de progreso, estado y botón CTA
     */
    updateUI() {
      const count = this.getFilledCount();
      const progressBar = $('#duo-progress-bar');
      const statusCount = $('.kivo-duo-builder__status-count');
      const checkoutBtn = $('#duo-checkout-btn');

      const percentage = (count / this.maxSlots) * 100;

      if (progressBar) {
        progressBar.style.width = percentage + '%';
      }

      if (statusCount) {
        statusCount.textContent = count + '/' + this.maxSlots;
      }

      if (checkoutBtn) {
        checkoutBtn.disabled = count < this.maxSlots;

        if (count === this.maxSlots) {
          checkoutBtn.classList.add('kivo-btn--pulse');
        } else {
          checkoutBtn.classList.remove('kivo-btn--pulse');
        }
      }
    }
  };

  /* ==========================================================================
     FAQ ACCORDION
     ========================================================================== */

  const FAQAccordion = {
    init() {
      const items = $$('.kivo-faq__item');
      items.forEach((item) => {
        const question = $('.kivo-faq__question', item);
        if (!question) return;

        question.addEventListener('click', () => {
          const isOpen = item.classList.contains('is-open');

          // Cerrar todos
          items.forEach((other) => {
            other.classList.remove('is-open');
            const q = $('.kivo-faq__question', other);
            if (q) q.setAttribute('aria-expanded', 'false');
          });

          // Abrir el clickeado si estaba cerrado
          if (!isOpen) {
            item.classList.add('is-open');
            question.setAttribute('aria-expanded', 'true');
          }
        });
      });
    }
  };

  /* ==========================================================================
     COUNTDOWN TIMER — Temporizador de oferta
     ========================================================================== */

  const CountdownTimer = {
    /** @type {number|null} */
    intervalId: null,
    endTime: null,

    init() {
      const hoursEl = $('#countdown-hours');
      if (!hoursEl) return; // No hay countdown en la página

      // Establecer fin de oferta: medianoche del día siguiente
      const now = new Date();
      this.endTime = new Date(now);
      this.endTime.setHours(23, 59, 59, 999);

      // Si ya pasó, sumar un día
      if (this.endTime <= now) {
        this.endTime.setDate(this.endTime.getDate() + 1);
      }

      this.tick();
      this.intervalId = setInterval(() => this.tick(), 1000);
    },

    tick() {
      const now = new Date();
      const diff = this.endTime - now;

      if (diff <= 0) {
        this.render(0, 0, 0);
        clearInterval(this.intervalId);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      this.render(hours, minutes, seconds);
    },

  /**
   * Renderiza los valores en el DOM
   * @param {number} h
   * @param {number} m
   * @param {number} s
   */
    render(h, m, s) {
      const hoursEl = $('#countdown-hours');
      const minutesEl = $('#countdown-minutes');
      const secondsEl = $('#countdown-seconds');

      if (hoursEl) hoursEl.textContent = String(h).padStart(2, '0');
      if (minutesEl) minutesEl.textContent = String(m).padStart(2, '0');
      if (secondsEl) secondsEl.textContent = String(s).padStart(2, '0');
    },

    destroy() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }
  };

  /* ==========================================================================
     SCROLL REVEAL — Animaciones al entrar en viewport
     ========================================================================== */

  const ScrollReveal = {
    observer: null,

    init() {
      // Elementos a animar al scroll
      const targets = [
        '.kivo-benefit-card',
        '.kivo-step',
        '.kivo-product-card',
        '.kivo-testimonial-card',
        '.kivo-faq__item',
        '.kivo-duo-slot'
      ];

      targets.forEach((selector) => {
        $$(selector).forEach((el) => {
          el.classList.add('kivo-reveal');
        });
      });

      if (!('IntersectionObserver' in window)) {
        // Fallback: mostrar todo
        $$('.kivo-reveal').forEach((el) => el.classList.add('is-visible'));
        return;
      }

      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              this.observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.15,
          rootMargin: '0px 0px -40px 0px'
        }
      );

      $$('.kivo-reveal').forEach((el) => {
        this.observer.observe(el);
      });
    },

    destroy() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    }
  };

  /* ==========================================================================
     SMOOTH SCROLL — Navegación suave entre secciones
     ========================================================================== */

  const SmoothScroll = {
    init() {
      $$('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          if (!href || href === '#') return;

          const target = $(href);
          if (!target) return;

          e.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });

          // Actualizar focus para accesibilidad
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        });
      });
    }
  };

  /* ==========================================================================
     CTA RIPPLE — Microinteracción en botones
     ========================================================================== */

  const CTARipple = {
    init() {
      $$('.kivo-btn--primary, .kivo-btn--white').forEach((btn) => {
        btn.addEventListener('click', function (e) {
          const rect = this.getBoundingClientRect();
          const ripple = document.createElement('span');
          const size = Math.max(rect.width, rect.height);

          ripple.style.cssText = [
            'position:absolute',
            'border-radius:50%',
            'background:rgba(255,255,255,0.3)',
            'width:' + size + 'px',
            'height:' + size + 'px',
            'left:' + (e.clientX - rect.left - size / 2) + 'px',
            'top:' + (e.clientY - rect.top - size / 2) + 'px',
            'transform:scale(0)',
            'animation:kivo-ripple 0.6s ease-out',
            'pointer-events:none'
          ].join(';');

          this.style.position = 'relative';
          this.style.overflow = 'hidden';
          this.appendChild(ripple);

          setTimeout(() => ripple.remove(), 600);
        });
      });

      // Inyectar keyframes del ripple si no existen
      if (!$('#kivo-ripple-style')) {
        const style = document.createElement('style');
        style.id = 'kivo-ripple-style';
        style.textContent = '@keyframes kivo-ripple{to{transform:scale(4);opacity:0}}';
        document.head.appendChild(style);
      }
    }
  };

  /* ==========================================================================
     HEADER SCROLL — Efecto al hacer scroll (opcional, para sticky header futuro)
     ========================================================================== */

  const HeaderScroll = {
    init() {
      // Reservado para futuro sticky header
      // Actualmente el hero no tiene header fijo
    }
  };

  /* ==========================================================================
     INICIALIZACIÓN
     ========================================================================== */

  function init() {
    Toast.init();
    DuoBuilder.init();
    FAQAccordion.init();
    CountdownTimer.init();
    ScrollReveal.init();
    SmoothScroll.init();
    CTARipple.init();
    HeaderScroll.init();

    // Log de inicialización (solo en desarrollo)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('[KIVO] Landing initialized');
    }
  }

  // Ejecutar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Cleanup al salir de la página
  window.addEventListener('beforeunload', () => {
    CountdownTimer.destroy();
    ScrollReveal.destroy();
  });

  // Exponer API pública para integración con Elementor/WooCommerce
  window.KIVO = {
    DuoBuilder: DuoBuilder,
    Toast: Toast,
    CountdownTimer: CountdownTimer
  };

})();
