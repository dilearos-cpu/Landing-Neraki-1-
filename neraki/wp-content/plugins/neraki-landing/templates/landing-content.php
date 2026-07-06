<?php
/**
 * KIVO Landing content partial
 * @var string $neraki_assets Base URL for plugin assets
 */
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
?>
<!-- ============================================================
       SECCIÓN HERO — Réplica exacta imagen de referencia
       ============================================================ -->
  <section class="kivo-hero" id="hero" aria-label="Oferta principal KIVO">
    <!-- Formas geométricas de fondo -->
    <div class="kivo-hero__bg-shapes" aria-hidden="true">
      <div class="kivo-hero__bg-circle"></div>
      <div class="kivo-hero__bg-polygon"></div>
    </div>

    <div class="kivo-hero__inner">

      <!-- Logo -->
      <header class="kivo-hero__brand">
        <div class="kivo-hero__logo-icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 4L16 28L24 4H20L16 18L12 4H8Z" fill="#1A1A1A"/>
            <path d="M6 4H10L16 20L22 4H26L16 28L6 4Z" fill="#FF85A2"/>
          </svg>
        </div>
        <h2 class="kivo-hero__logo-text">KIVO</h2>
        <p class="kivo-hero__tagline">— PERFORMANCE WEAR —</p>
      </header>

      <!-- Badge exclusivo -->
      <div class="kivo-hero__badge">
        <span>PACK EXCLUSIVO</span>
      </div>

      <!-- Headline principal -->
      <div class="kivo-hero__headline-wrap">
        <h1 class="kivo-hero__headline">
          <span class="kivo-hero__headline-main">2 OUTFITS</span>
          <span class="kivo-hero__headline-accent">Premium</span>
        </h1>
      </div>

      <!-- Caja de precio y confianza -->
      <div class="kivo-hero__price-box">
        <div class="kivo-hero__price-left">
          <span class="kivo-hero__price-label">POR SOLO</span>
          <span class="kivo-hero__price-value">$119.900</span>
        </div>
        <div class="kivo-hero__price-divider" aria-hidden="true"></div>
        <div class="kivo-hero__price-right">
          <div class="kivo-hero__lock-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="3" y="7" width="10" height="8" rx="1" fill="#FF85A2"/>
              <path d="M5 7V5C5 3.34315 6.34315 2 8 2C9.65685 2 11 3.34315 11 5V7" stroke="#FF85A2" stroke-width="2" fill="none"/>
              <circle cx="8" cy="11" r="1.5" fill="white"/>
            </svg>
          </div>
          <span class="kivo-hero__price-trust">PAGA AL RECIBIR</span>
        </div>
      </div>

      <!-- Sub-headline -->
      <p class="kivo-hero__subheadline">
        <svg class="kivo-hero__heart-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 14L1.5 7.5C0.5 6.5 0.5 4.8 1.5 3.8C2.5 2.8 4.2 2.8 5.2 3.8L8 6.6L10.8 3.8C11.8 2.8 13.5 2.8 14.5 3.8C15.5 4.8 15.5 6.5 14.5 7.5L8 14Z" fill="#FF85A2"/>
        </svg>
        Escoge cualquier combinación de colores y paga al recibir.
      </p>

      <!-- Visual centerpiece: modelos -->
      <div class="kivo-hero__visual">
        <div class="kivo-hero__circle" aria-hidden="true"></div>
        <div class="kivo-hero__models">
          <!-- Placeholder: reemplazar src con imagen real de modelos PNG -->
          <img
            src="<?php echo esc_url( $neraki_assets . 'images/hero-models.svg' ); ?>"
            alt="Tres modelos usando conjuntos KIVO en colores rosa, negro y blanco"
            class="kivo-hero__models-img"
            width="400"
            height="500"
            loading="eager"
            fetchpriority="high"
          >
        </div>
        <!-- Barra flotante -->
        <div class="kivo-hero__floating-bar">
          <div class="kivo-hero__floating-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="10" fill="#FF85A2"/>
              <path d="M10 4L11.5 8.5L16 8.5L12.5 11.5L14 16L10 13L6 16L7.5 11.5L4 8.5L8.5 8.5L10 4Z" fill="white"/>
            </svg>
          </div>
          <p class="kivo-hero__floating-text">
            TÚ ELIGES, TÚ COMBINAS, <strong>TÚ BRILLAS</strong>
          </p>
        </div>
      </div>

      <!-- Beneficios inline (4 iconos) -->
      <div class="kivo-hero__benefits">
        <div class="kivo-hero__benefit">
          <div class="kivo-hero__benefit-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF85A2" stroke-width="1.5">
              <rect x="1" y="6" width="15" height="13" rx="1"/>
              <path d="M16 10h4l2 4v5h-6v-9z"/>
              <circle cx="5.5" cy="19.5" r="2.5"/>
              <circle cx="18.5" cy="19.5" r="2.5"/>
            </svg>
          </div>
          <span class="kivo-hero__benefit-text">ENVÍO GRATIS</span>
        </div>
        <div class="kivo-hero__benefit">
          <div class="kivo-hero__benefit-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF85A2" stroke-width="1.5">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
            </svg>
          </div>
          <span class="kivo-hero__benefit-text">PAGO CONTRA ENTREGA</span>
        </div>
        <div class="kivo-hero__benefit">
          <div class="kivo-hero__benefit-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF85A2" stroke-width="1.5">
              <path d="M4 4h16v16H4z"/>
              <path d="M4 12h16M12 4v16"/>
            </svg>
          </div>
          <span class="kivo-hero__benefit-text">TELA LICRADA PREMIUM</span>
        </div>
        <div class="kivo-hero__benefit">
          <div class="kivo-hero__benefit-icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF85A2" stroke-width="1.5">
              <path d="M2 12h20M6 12V8M10 12V6M14 12V8M18 12V4"/>
            </svg>
          </div>
          <span class="kivo-hero__benefit-text">TALLAS S/M Y L/XL</span>
        </div>
      </div>

      <!-- CTA principal -->
      <a href="#duo-builder" class="kivo-hero__cta kivo-btn kivo-btn--primary">
        <svg class="kivo-btn__icon" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M5 7V5a3 3 0 016 0v2M3 7h14l-1 10H4L3 7z" stroke="white" stroke-width="1.5" fill="none"/>
        </svg>
        QUIERO MI PACK
      </a>

      <!-- Trust badge -->
      <div class="kivo-hero__trust">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <rect x="2" y="5" width="8" height="6" rx="1" fill="#FF85A2"/>
          <path d="M3.5 5V3.5C3.5 2.4 4.4 1.5 5.5 1.5C6.6 1.5 7.5 2.4 7.5 3.5V5" stroke="#FF85A2" stroke-width="1.2" fill="none"/>
        </svg>
        <span>COMPRA 100% SEGURA</span>
      </div>

    </div>
  </section>

  <!-- ============================================================
       SECCIÓN BENEFICIOS
       ============================================================ -->
  <section class="kivo-benefits" id="beneficios" aria-label="Beneficios KIVO">
    <div class="kivo-container">
      <header class="kivo-section-header">
        <span class="kivo-section-label">¿Por qué KIVO?</span>
        <h2 class="kivo-section-title">Diseñado para tu <em>mejor versión</em></h2>
      </header>
      <div class="kivo-benefits__grid">
        <article class="kivo-benefit-card">
          <div class="kivo-benefit-card__icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#FF85A2" stroke-width="1.5">
              <rect x="2" y="8" width="20" height="17" rx="2"/>
              <path d="M22 13h5l3 5v7h-8V13z"/>
              <circle cx="7" cy="26" r="3"/>
              <circle cx="24" cy="26" r="3"/>
            </svg>
          </div>
          <h3 class="kivo-benefit-card__title">Envío Gratis</h3>
          <p class="kivo-benefit-card__desc">Recibe tu pack en la puerta de tu casa sin costo adicional en todo el país.</p>
        </article>
        <article class="kivo-benefit-card">
          <div class="kivo-benefit-card__icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#FF85A2" stroke-width="1.5">
              <rect x="4" y="8" width="24" height="18" rx="2"/>
              <path d="M4 14h24"/>
              <path d="M10 20h6"/>
            </svg>
          </div>
          <h3 class="kivo-benefit-card__title">Pago Contra Entrega</h3>
          <p class="kivo-benefit-card__desc">Paga solo cuando recibas tu pedido. Sin riesgos, sin tarjetas de crédito.</p>
        </article>
        <article class="kivo-benefit-card">
          <div class="kivo-benefit-card__icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#FF85A2" stroke-width="1.5">
              <path d="M4 4h24v24H4z"/>
              <path d="M4 16h24M16 4v24"/>
              <path d="M8 8l16 16" stroke-dasharray="3 3"/>
            </svg>
          </div>
          <h3 class="kivo-benefit-card__title">Tela Lícrada Premium</h3>
          <p class="kivo-benefit-card__desc">Material de alta compresión, suave al tacto y con secado rápido para máximo rendimiento.</p>
        </article>
        <article class="kivo-benefit-card">
          <div class="kivo-benefit-card__icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#FF85A2" stroke-width="1.5">
              <path d="M4 16h24M8 16v-6M14 16v-8M20 16v-6M26 16V6"/>
            </svg>
          </div>
          <h3 class="kivo-benefit-card__title">Tallas S/M y L/XL</h3>
          <p class="kivo-benefit-card__desc">Ajuste perfecto para todo tipo de cuerpo. Elige la talla ideal para cada outfit.</p>
        </article>
      </div>
    </div>
  </section>

  <!-- ============================================================
       SECCIÓN CÓMO FUNCIONA
       ============================================================ -->
  <section class="kivo-how" id="como-funciona" aria-label="Cómo funciona">
    <div class="kivo-container">
      <header class="kivo-section-header kivo-section-header--center">
        <span class="kivo-section-label">Simple y rápido</span>
        <h2 class="kivo-section-title">Cómo funciona tu <em>Dúo Pack</em></h2>
      </header>
      <div class="kivo-how__steps">
        <article class="kivo-step">
          <div class="kivo-step__number" aria-hidden="true">01</div>
          <div class="kivo-step__icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#FF85A2" stroke-width="1.5">
              <circle cx="20" cy="20" r="16"/>
              <path d="M20 12v8l5 5"/>
            </svg>
          </div>
          <h3 class="kivo-step__title">Elige tus 2 outfits</h3>
          <p class="kivo-step__desc">Selecciona cualquier combinación de colores y tallas que desees para tu pack.</p>
        </article>
        <article class="kivo-step">
          <div class="kivo-step__number" aria-hidden="true">02</div>
          <div class="kivo-step__icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#FF85A2" stroke-width="1.5">
              <rect x="8" y="12" width="24" height="20" rx="2"/>
              <path d="M8 18h24"/>
              <path d="M16 26h8"/>
            </svg>
          </div>
          <h3 class="kivo-step__title">Confirma tu pedido</h3>
          <p class="kivo-step__desc">Completa tus datos de envío. No necesitas pagar por adelantado.</p>
        </article>
        <article class="kivo-step">
          <div class="kivo-step__number" aria-hidden="true">03</div>
          <div class="kivo-step__icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="#FF85A2" stroke-width="1.5">
              <path d="M8 20l8 8 16-16"/>
            </svg>
          </div>
          <h3 class="kivo-step__title">Recibe y paga</h3>
          <p class="kivo-step__desc">Te entregamos en 3-5 días hábiles. Pagas al recibir con total tranquilidad.</p>
        </article>
      </div>
    </div>
  </section>

  <!-- ============================================================
       SECCIÓN PRODUCTOS
       ============================================================ -->
  <section class="kivo-products" id="productos" aria-label="Catálogo de productos">
    <div class="kivo-container">
      <header class="kivo-section-header">
        <span class="kivo-section-label">Colección</span>
        <h2 class="kivo-section-title">Elige tus <em>favoritos</em></h2>
      </header>
      <div class="kivo-products__grid" id="products-grid">
        <!-- Producto 1 -->
        <article class="kivo-product-card" data-product-id="1" data-product-name="Set Rosa Blush" data-product-color="Rosa Blush" data-product-price="59900">
          <div class="kivo-product-card__image-wrap">
            <img src="<?php echo esc_url( $neraki_assets . 'images/product-rosa.svg' ); ?>" alt="Set deportivo Rosa Blush KIVO" class="kivo-product-card__image" width="360" height="450" loading="lazy">
            <span class="kivo-product-card__badge" style="--badge-color: #FF85A2;">Rosa Blush</span>
          </div>
          <div class="kivo-product-card__body">
            <h3 class="kivo-product-card__name">Set Rosa Blush</h3>
            <p class="kivo-product-card__price">$59.900</p>
            <button type="button" class="kivo-product-card__btn kivo-btn kivo-btn--outline" data-add-to-duo>
              Agregar al dúo
            </button>
          </div>
        </article>
        <!-- Producto 2 -->
        <article class="kivo-product-card" data-product-id="2" data-product-name="Set Negro Elite" data-product-color="Negro" data-product-price="59900">
          <div class="kivo-product-card__image-wrap">
            <img src="<?php echo esc_url( $neraki_assets . 'images/product-negro.svg' ); ?>" alt="Set deportivo Negro Elite KIVO" class="kivo-product-card__image" width="360" height="450" loading="lazy">
            <span class="kivo-product-card__badge" style="--badge-color: #1A1A1A;">Negro</span>
          </div>
          <div class="kivo-product-card__body">
            <h3 class="kivo-product-card__name">Set Negro Elite</h3>
            <p class="kivo-product-card__price">$59.900</p>
            <button type="button" class="kivo-product-card__btn kivo-btn kivo-btn--outline" data-add-to-duo>
              Agregar al dúo
            </button>
          </div>
        </article>
        <!-- Producto 3 -->
        <article class="kivo-product-card" data-product-id="3" data-product-name="Set Blanco Pure" data-product-color="Blanco" data-product-price="59900">
          <div class="kivo-product-card__image-wrap">
            <img src="<?php echo esc_url( $neraki_assets . 'images/product-blanco.svg' ); ?>" alt="Set deportivo Blanco Pure KIVO" class="kivo-product-card__image" width="360" height="450" loading="lazy">
            <span class="kivo-product-card__badge" style="--badge-color: #E8E8E8; color: #1A1A1A;">Blanco</span>
          </div>
          <div class="kivo-product-card__body">
            <h3 class="kivo-product-card__name">Set Blanco Pure</h3>
            <p class="kivo-product-card__price">$59.900</p>
            <button type="button" class="kivo-product-card__btn kivo-btn kivo-btn--outline" data-add-to-duo>
              Agregar al dúo
            </button>
          </div>
        </article>
        <!-- Producto 4 -->
        <article class="kivo-product-card" data-product-id="4" data-product-name="Set Lavanda Dream" data-product-color="Lavanda" data-product-price="59900">
          <div class="kivo-product-card__image-wrap">
            <img src="<?php echo esc_url( $neraki_assets . 'images/product-lavanda.svg' ); ?>" alt="Set deportivo Lavanda Dream KIVO" class="kivo-product-card__image" width="360" height="450" loading="lazy">
            <span class="kivo-product-card__badge" style="--badge-color: #C8A2C8;">Lavanda</span>
          </div>
          <div class="kivo-product-card__body">
            <h3 class="kivo-product-card__name">Set Lavanda Dream</h3>
            <p class="kivo-product-card__price">$59.900</p>
            <button type="button" class="kivo-product-card__btn kivo-btn kivo-btn--outline" data-add-to-duo>
              Agregar al dúo
            </button>
          </div>
        </article>
        <!-- Producto 5 -->
        <article class="kivo-product-card" data-product-id="5" data-product-name="Set Coral Energy" data-product-color="Coral" data-product-price="59900">
          <div class="kivo-product-card__image-wrap">
            <img src="<?php echo esc_url( $neraki_assets . 'images/product-coral.svg' ); ?>" alt="Set deportivo Coral Energy KIVO" class="kivo-product-card__image" width="360" height="450" loading="lazy">
            <span class="kivo-product-card__badge" style="--badge-color: #FF6B6B;">Coral</span>
          </div>
          <div class="kivo-product-card__body">
            <h3 class="kivo-product-card__name">Set Coral Energy</h3>
            <p class="kivo-product-card__price">$59.900</p>
            <button type="button" class="kivo-product-card__btn kivo-btn kivo-btn--outline" data-add-to-duo>
              Agregar al dúo
            </button>
          </div>
        </article>
        <!-- Producto 6 -->
        <article class="kivo-product-card" data-product-id="6" data-product-name="Set Verde Mint" data-product-color="Verde Mint" data-product-price="59900">
          <div class="kivo-product-card__image-wrap">
            <img src="<?php echo esc_url( $neraki_assets . 'images/product-verde.svg' ); ?>" alt="Set deportivo Verde Mint KIVO" class="kivo-product-card__image" width="360" height="450" loading="lazy">
            <span class="kivo-product-card__badge" style="--badge-color: #7FDBCA;">Verde Mint</span>
          </div>
          <div class="kivo-product-card__body">
            <h3 class="kivo-product-card__name">Set Verde Mint</h3>
            <p class="kivo-product-card__price">$59.900</p>
            <button type="button" class="kivo-product-card__btn kivo-btn kivo-btn--outline" data-add-to-duo>
              Agregar al dúo
            </button>
          </div>
        </article>
      </div>
    </div>
  </section>

  <!-- ============================================================
       SECCIÓN CONSTRUCTOR DEL DÚO
       ============================================================ -->
  <section class="kivo-duo-builder" id="duo-builder" aria-label="Constructor del dúo pack">
    <div class="kivo-container">
      <header class="kivo-section-header kivo-section-header--center">
        <span class="kivo-section-label">Tu pack personalizado</span>
        <h2 class="kivo-section-title">Arma tu <em>Dúo Pack</em></h2>
        <p class="kivo-section-subtitle">Selecciona 2 outfits de la colección y obtén un precio especial</p>
      </header>

      <div class="kivo-duo-builder__slots">
        <!-- Slot Producto 1 -->
        <div class="kivo-duo-slot" id="duo-slot-1" data-slot="1">
          <div class="kivo-duo-slot__header">
            <span class="kivo-duo-slot__label">Producto 1</span>
            <button type="button" class="kivo-duo-slot__remove" aria-label="Quitar producto 1" hidden>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4l8 8M12 4l-8 8"/>
              </svg>
            </button>
          </div>
          <div class="kivo-duo-slot__content">
            <div class="kivo-duo-slot__empty">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#FF85A2" stroke-width="1.5" opacity="0.5">
                <rect x="8" y="8" width="32" height="32" rx="4" stroke-dasharray="6 4"/>
                <path d="M24 18v12M18 24h12"/>
              </svg>
              <p>Selecciona un producto</p>
            </div>
            <div class="kivo-duo-slot__filled" hidden>
              <img src="" alt="" class="kivo-duo-slot__img" width="80" height="100">
              <div class="kivo-duo-slot__info">
                <span class="kivo-duo-slot__name"></span>
                <span class="kivo-duo-slot__color"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Conector visual -->
        <div class="kivo-duo-builder__connector" aria-hidden="true">
          <span class="kivo-duo-builder__plus">+</span>
        </div>

        <!-- Slot Producto 2 -->
        <div class="kivo-duo-slot" id="duo-slot-2" data-slot="2">
          <div class="kivo-duo-slot__header">
            <span class="kivo-duo-slot__label">Producto 2</span>
            <button type="button" class="kivo-duo-slot__remove" aria-label="Quitar producto 2" hidden>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4l8 8M12 4l-8 8"/>
              </svg>
            </button>
          </div>
          <div class="kivo-duo-slot__content">
            <div class="kivo-duo-slot__empty">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#FF85A2" stroke-width="1.5" opacity="0.5">
                <rect x="8" y="8" width="32" height="32" rx="4" stroke-dasharray="6 4"/>
                <path d="M24 18v12M18 24h12"/>
              </svg>
              <p>Selecciona un producto</p>
            </div>
            <div class="kivo-duo-slot__filled" hidden>
              <img src="" alt="" class="kivo-duo-slot__img" width="80" height="100">
              <div class="kivo-duo-slot__info">
                <span class="kivo-duo-slot__name"></span>
                <span class="kivo-duo-slot__color"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado del dúo -->
      <div class="kivo-duo-builder__status">
        <div class="kivo-duo-builder__progress">
          <div class="kivo-duo-builder__progress-bar" id="duo-progress-bar" style="width: 0%"></div>
        </div>
        <p class="kivo-duo-builder__status-text" id="duo-status-text">
          <span class="kivo-duo-builder__status-count">0/2</span> productos seleccionados
        </p>
        <div class="kivo-duo-builder__pricing">
          <span class="kivo-duo-builder__price-original">$119.800</span>
          <span class="kivo-duo-builder__price-final">$119.900</span>
          <span class="kivo-duo-builder__price-save">¡Ahorras con el pack!</span>
        </div>
      </div>

      <!-- CTA Finalizar -->
      <button type="button" class="kivo-duo-builder__cta kivo-btn kivo-btn--primary" id="duo-checkout-btn" disabled>
        <svg class="kivo-btn__icon" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M5 7V5a3 3 0 016 0v2M3 7h14l-1 10H4L3 7z" stroke="white" stroke-width="1.5" fill="none"/>
        </svg>
        Finalizar compra
      </button>
    </div>
  </section>

  <!-- ============================================================
       SECCIÓN OFERTA
       ============================================================ -->
  <section class="kivo-offer" id="oferta" aria-label="Oferta especial">
    <div class="kivo-offer__pattern" aria-hidden="true"></div>
    <div class="kivo-container kivo-offer__inner">
      <div class="kivo-offer__content">
        <span class="kivo-offer__label">Oferta por tiempo limitado</span>
        <h2 class="kivo-offer__title">
          <span class="kivo-offer__discount">-40%</span>
          en tu Dúo Pack
        </h2>
        <p class="kivo-offer__desc">Lleva 2 outfits premium por solo <strong>$119.900</strong> en lugar de $199.800</p>
        <div class="kivo-offer__countdown" id="offer-countdown" aria-label="Tiempo restante de la oferta">
          <div class="kivo-offer__countdown-item">
            <span class="kivo-offer__countdown-value" id="countdown-hours">23</span>
            <span class="kivo-offer__countdown-label">Horas</span>
          </div>
          <div class="kivo-offer__countdown-sep">:</div>
          <div class="kivo-offer__countdown-item">
            <span class="kivo-offer__countdown-value" id="countdown-minutes">59</span>
            <span class="kivo-offer__countdown-label">Min</span>
          </div>
          <div class="kivo-offer__countdown-sep">:</div>
          <div class="kivo-offer__countdown-item">
            <span class="kivo-offer__countdown-value" id="countdown-seconds">59</span>
            <span class="kivo-offer__countdown-label">Seg</span>
          </div>
        </div>
        <a href="#duo-builder" class="kivo-offer__cta kivo-btn kivo-btn--white">
          Aprovechar oferta
        </a>
      </div>
    </div>
  </section>

  <!-- ============================================================
       SECCIÓN TESTIMONIOS
       ============================================================ -->
  <section class="kivo-testimonials" id="testimonios" aria-label="Testimonios de clientas">
    <div class="kivo-container">
      <header class="kivo-section-header kivo-section-header--center">
        <span class="kivo-section-label">Lo que dicen nuestras clientas</span>
        <h2 class="kivo-section-title">Historias <em>reales</em></h2>
      </header>
      <div class="kivo-testimonials__grid">
        <article class="kivo-testimonial-card">
          <div class="kivo-testimonial-card__stars" aria-label="5 estrellas">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#FFC107"><path d="M8 1l2 5h5l-4 3 1.5 5L8 11l-4.5 3L5 9 1 6h5z"/></svg>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#FFC107"><path d="M8 1l2 5h5l-4 3 1.5 5L8 11l-4.5 3L5 9 1 6h5z"/></svg>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#FFC107"><path d="M8 1l2 5h5l-4 3 1.5 5L8 11l-4.5 3L5 9 1 6h5z"/></svg>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#FFC107"><path d="M8 1l2 5h5l-4 3 1.5 5L8 11l-4.5 3L5 9 1 6h5z"/></svg>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#FFC107"><path d="M8 1l2 5h5l-4 3 1.5 5L8 11l-4.5 3L5 9 1 6h5z"/></svg>
          </div>
          <blockquote class="kivo-testimonial-card__quote">
            "La tela es increíble, no se transparenta y el ajuste es perfecto. Ya pedí mi segundo pack."
          </blockquote>
          <footer class="kivo-testimonial-card__author">
            <img src="<?php echo esc_url( $neraki_assets . 'images/avatar-1.svg' ); ?>" alt="" class="kivo-testimonial-card__avatar" width="48" height="48" loading="lazy">
            <div>
              <cite class="kivo-testimonial-card__name">Valentina M.</cite>
              <span class="kivo-testimonial-card__location">Bogotá, CO</span>
            </div>
          </footer>
        </article>
        <article class="kivo-testimonial-card">
          <div class="kivo-testimonial-card__stars" aria-label="5 estrellas">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#FFC107"><path d="M8 1l2 5h5l-4 3 1.5 5L8 11l-4.5 3L5 9 1 6h5z"/></svg>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#FFC107"><path d="M8 1l2 5h5l-4 3 1.5 5L8 11l-4.5 3L5 9 1 6h5z"/></svg>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#FFC107"><path d="M8 1l2 5h5l-4 3 1.5 5L8 11l-4.5 3L5 9 1 6h5z"/></svg>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#FFC107"><path d="M8 1l2 5h5l-4 3 1.5 5L8 11l-4.5 3L5 9 1 6h5z"/></svg>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#FFC107"><path d="M8 1l2 5h5l-4 3 1.5 5L8 11l-4.5 3L5 9 1 6h5z"/></svg>
          </div>
          <blockquote class="kivo-testimonial-card__quote">
            "Me encanta poder pagar al recibir. El envío fue rapidísimo y los colores son tal cual las fotos."
          </blockquote>
          <footer class="kivo-testimonial-card__author">
            <img src="<?php echo esc_url( $neraki_assets . 'images/avatar-2.svg' ); ?>" alt="" class="kivo-testimonial-card__avatar" width="48" height="48" loading="lazy">
            <div>
              <cite class="kivo-testimonial-card__name">Camila R.</cite>
              <span class="kivo-testimonial-card__location">Medellín, CO</span>
            </div>
          </footer>
        </article>
        <article class="kivo-testimonial-card">
          <div class="kivo-testimonial-card__stars" aria-label="5 estrellas">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#FFC107"><path d="M8 1l2 5h5l-4 3 1.5 5L8 11l-4.5 3L5 9 1 6h5z"/></svg>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#FFC107"><path d="M8 1l2 5h5l-4 3 1.5 5L8 11l-4.5 3L5 9 1 6h5z"/></svg>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#FFC107"><path d="M8 1l2 5h5l-4 3 1.5 5L8 11l-4.5 3L5 9 1 6h5z"/></svg>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#FFC107"><path d="M8 1l2 5h5l-4 3 1.5 5L8 11l-4.5 3L5 9 1 6h5z"/></svg>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#FFC107"><path d="M8 1l2 5h5l-4 3 1.5 5L8 11l-4.5 3L5 9 1 6h5z"/></svg>
          </div>
          <blockquote class="kivo-testimonial-card__quote">
            "Calidad de marca internacional a un precio accesible. Mis amigas ya están pidiendo el suyo."
          </blockquote>
          <footer class="kivo-testimonial-card__author">
            <img src="<?php echo esc_url( $neraki_assets . 'images/avatar-3.svg' ); ?>" alt="" class="kivo-testimonial-card__avatar" width="48" height="48" loading="lazy">
            <div>
              <cite class="kivo-testimonial-card__name">Daniela S.</cite>
              <span class="kivo-testimonial-card__location">Cali, CO</span>
            </div>
          </footer>
        </article>
      </div>
    </div>
  </section>

  <!-- ============================================================
       SECCIÓN FAQ
       ============================================================ -->
  <section class="kivo-faq" id="faq" aria-label="Preguntas frecuentes">
    <div class="kivo-container kivo-faq__container">
      <header class="kivo-section-header kivo-section-header--center">
        <span class="kivo-section-label">Resolvemos tus dudas</span>
        <h2 class="kivo-section-title">Preguntas <em>frecuentes</em></h2>
      </header>
      <div class="kivo-faq__list" id="faq-list">
        <div class="kivo-faq__item">
          <button type="button" class="kivo-faq__question" aria-expanded="false">
            <span>¿Cómo funciona el pago contra entrega?</span>
            <span class="kivo-faq__icon" aria-hidden="true">+</span>
          </button>
          <div class="kivo-faq__answer">
            <p>Realizas tu pedido sin pagar nada por adelantado. Cuando el mensajero llegue a tu domicilio, pagas en efectivo o con datáfono. Es 100% seguro y sin riesgos.</p>
          </div>
        </div>
        <div class="kivo-faq__item">
          <button type="button" class="kivo-faq__question" aria-expanded="false">
            <span>¿Cuánto tarda en llegar mi pedido?</span>
            <span class="kivo-faq__icon" aria-hidden="true">+</span>
          </button>
          <div class="kivo-faq__answer">
            <p>El tiempo de entrega es de 3 a 5 días hábiles en las principales ciudades. Para zonas apartadas puede tomar hasta 7 días hábiles.</p>
          </div>
        </div>
        <div class="kivo-faq__item">
          <button type="button" class="kivo-faq__question" aria-expanded="false">
            <span>¿Puedo cambiar de talla si no me queda?</span>
            <span class="kivo-faq__icon" aria-hidden="true">+</span>
          </button>
          <div class="kivo-faq__answer">
            <p>Sí, tienes 5 días hábiles después de recibir tu pedido para solicitar un cambio de talla sin costo adicional. Contáctanos por WhatsApp para gestionar el cambio.</p>
          </div>
        </div>
        <div class="kivo-faq__item">
          <button type="button" class="kivo-faq__question" aria-expanded="false">
            <span>¿La tela es transparente?</span>
            <span class="kivo-faq__icon" aria-hidden="true">+</span>
          </button>
          <div class="kivo-faq__answer">
            <p>No. Nuestra tela lícrada premium tiene doble capa en zonas estratégicas y un gramaje que garantiza cero transparencia, incluso en color blanco.</p>
          </div>
        </div>
        <div class="kivo-faq__item">
          <button type="button" class="kivo-faq__question" aria-expanded="false">
            <span>¿Puedo elegir dos outfits del mismo color?</span>
            <span class="kivo-faq__icon" aria-hidden="true">+</span>
          </button>
          <div class="kivo-faq__answer">
            <p>¡Por supuesto! Tú eliges la combinación que prefieras: dos del mismo color, dos diferentes, o cualquier mezcla. La decisión es tuya.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================================================
       SECCIÓN CTA FINAL
       ============================================================ -->
  <section class="kivo-cta-final" id="cta-final" aria-label="Llamada a la acción final">
    <div class="kivo-container kivo-cta-final__inner">
      <h2 class="kivo-cta-final__title">¿Lista para brillar?</h2>
      <p class="kivo-cta-final__subtitle">Únete a miles de mujeres que ya confían en KIVO para su entrenamiento diario.</p>
      <a href="#duo-builder" class="kivo-cta-final__btn kivo-btn kivo-btn--primary kivo-btn--pulse">
        <svg class="kivo-btn__icon" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M5 7V5a3 3 0 016 0v2M3 7h14l-1 10H4L3 7z" stroke="white" stroke-width="1.5" fill="none"/>
        </svg>
        QUIERO MI PACK AHORA
      </a>
      <p class="kivo-cta-final__trust">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <rect x="2" y="5" width="8" height="6" rx="1" fill="#FF85A2"/>
          <path d="M3.5 5V3.5C3.5 2.4 4.4 1.5 5.5 1.5C6.6 1.5 7.5 2.4 7.5 3.5V5" stroke="#FF85A2" stroke-width="1.2" fill="none"/>
        </svg>
        Envío gratis · Pago al recibir · Garantía de satisfacción
      </p>
    </div>
  </section>

  <!-- ============================================================
       FOOTER
       ============================================================ -->
  <footer class="kivo-footer" aria-label="Pie de página">
    <div class="kivo-container kivo-footer__inner">
      <div class="kivo-footer__brand">
        <span class="kivo-footer__logo">KIVO</span>
        <p class="kivo-footer__tagline">Performance Wear</p>
      </div>
      <nav class="kivo-footer__nav" aria-label="Enlaces legales">
        <a href="#" class="kivo-footer__link">Términos y condiciones</a>
        <a href="#" class="kivo-footer__link">Política de privacidad</a>
        <a href="#" class="kivo-footer__link">Política de devoluciones</a>
      </nav>
      <div class="kivo-footer__social">
        <a href="#" class="kivo-footer__social-link" aria-label="Instagram">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2" y="2" width="16" height="16" rx="4"/>
            <circle cx="10" cy="10" r="4"/>
            <circle cx="15" cy="5" r="1" fill="currentColor"/>
          </svg>
        </a>
        <a href="#" class="kivo-footer__social-link" aria-label="TikTok">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M14 2h2.5c.2 1.5.8 2.8 1.8 3.8 1 1 2.3 1.6 3.7 1.8V10c-1.4 0-2.8-.4-4-1.1v5.5c0 3-2.4 5.5-5.5 5.5S7 17.4 7 14.5s2.4-5.5 5.5-5.5c.3 0 .6 0 .9.1V12c-.3-.1-.6-.2-.9-.2-1.2 0-2.2 1-2.2 2.2s1 2.2 2.2 2.2 2.2-1 2.2-2.2V2z"/>
          </svg>
        </a>
        <a href="#" class="kivo-footer__social-link" aria-label="WhatsApp">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2C5.6 2 2 5.6 2 10c0 1.8.5 3.5 1.4 5L2 18l3.1-.9c1.4.8 3 1.2 4.7 1.2 4.4 0 8-3.6 8-8s-3.6-8-8-8zm4.3 11.3c-.2.5-1.1 1-1.5 1.1-.4.1-.9.2-1.5-.2-.3-.2-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2-1.1-1.5-1.1-2.9 0-1.4.7-2.1 1-2.4.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .5.4.2.4.7 1.5.7 1.6.1.1.1.3 0 .4-.1.2-.1.3-.2.4-.1.2-.2.3-.1.5.1.2.5.9 1.2 1.5.8.7 1.5.9 1.7 1 .2.1.4.1.5-.1.1-.2.6-.8.8-1 .2-.2.3-.2.6-.1.2.1 1.5.7 1.7.8.2.1.4.2.4.4 0 .2 0 .5-.2 1z"/>
          </svg>
        </a>
      </div>
      <p class="kivo-footer__copy">&copy; 2026 KIVO. Todos los derechos reservados.</p>
    </div>
  </footer>
