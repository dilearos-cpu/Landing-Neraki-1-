/**
 * PIXEL DOBLE PARA CHECKOUT Y GRACIAS POR TU COMPRA
 *
 * Donde pegarlo en Shopify:
 * Configuracion → Eventos de cliente → Agregar pixel personalizado → Personalizado
 *
 * Antes de guardar, reemplaza los IDs de BASICAS y BODYS con los tuyos.
 */

const PIXELS = {
  basicas: {
    meta: "META_PIXEL_BASICAS",
    tiktok: "TIKTOK_PIXEL_BASICAS",
    google: "AW-BASICAS_O_G-BASICAS"
  },
  bodys: {
    meta: "META_PIXEL_BODYS",
    tiktok: "TIKTOK_PIXEL_BODYS",
    google: "AW-BODYS_O_G-BODYS"
  }
};

let pixelsLoaded = false;

function isCheckoutFlow(url) {
  return (
    /\/checkouts?\//i.test(url) ||
    /thank_you/i.test(url) ||
    /\/orders\//i.test(url) ||
    /\/post_purchase/i.test(url) ||
    /\/account\/orders\//i.test(url)
  );
}

function loadScript(src) {
  return new Promise(function (resolve, reject) {
    const existing = document.querySelector('script[src="' + src + '"]');
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function initMeta(pixelIds) {
  const ids = pixelIds.filter(Boolean);
  if (!ids.length) return Promise.resolve();

  return loadScript("https://connect.facebook.net/en_US/fbevents.js").then(function () {
    if (!window.fbq) return;

    ids.forEach(function (id) {
      window.fbq("init", id);
    });

    window.fbq("track", "PageView");
  });
}

function initTikTok(pixelIds) {
  const ids = pixelIds.filter(Boolean);
  if (!ids.length) return Promise.resolve();

  if (!window.ttq) {
    window.TiktokAnalyticsObject = "ttq";
    window.ttq = window.ttq || [];
    window.ttq.methods = [
      "page",
      "track",
      "identify",
      "instances",
      "debug",
      "on",
      "off",
      "once",
      "ready",
      "alias",
      "group",
      "enableCookie",
      "disableCookie",
      "holdConsent",
      "revokeConsent",
      "grantConsent"
    ];
    window.ttq.setAndDefer = function (target, method) {
      target[method] = function () {
        target.push([method].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };

    for (let i = 0; i < window.ttq.methods.length; i++) {
      window.ttq.setAndDefer(window.ttq, window.ttq.methods[i]);
    }

    window.ttq.load = function (pixelId, options) {
      const url = "https://analytics.tiktok.com/i18n/pixel/events.js";
      window.ttq._i = window.ttq._i || {};
      window.ttq._i[pixelId] = [];
      window.ttq._i[pixelId]._u = url;
      window.ttq._t = window.ttq._t || {};
      window.ttq._t[pixelId] = +new Date();
      window.ttq._o = window.ttq._o || {};
      window.ttq._o[pixelId] = options || {};

      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.src = url + "?sdkid=" + pixelId + "&lib=ttq";
      const firstScript = document.getElementsByTagName("script")[0];
      firstScript.parentNode.insertBefore(script, firstScript);
    };
  }

  ids.forEach(function (id) {
    window.ttq.load(id);
  });

  window.ttq.page();
  return Promise.resolve();
}

function initGoogle(pixelIds) {
  const ids = pixelIds.filter(Boolean);
  if (!ids.length) return Promise.resolve();

  const firstId = ids[0];

  return loadScript("https://www.googletagmanager.com/gtag/js?id=" + firstId).then(function () {
    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function () {
        window.dataLayer.push(arguments);
      };

    window.gtag("js", new Date());
    ids.forEach(function (id) {
      window.gtag("config", id);
    });
  });
}

function loadBothLandingPixels() {
  if (pixelsLoaded) return Promise.resolve();
  pixelsLoaded = true;

  const metaIds = [PIXELS.basicas.meta, PIXELS.bodys.meta];
  const tiktokIds = [PIXELS.basicas.tiktok, PIXELS.bodys.tiktok];
  const googleIds = [PIXELS.basicas.google, PIXELS.bodys.google];

  return Promise.all([
    initMeta(metaIds),
    initTikTok(tiktokIds),
    initGoogle(googleIds)
  ]).catch(function () {
    pixelsLoaded = false;
  });
}

function trackPurchase(checkout) {
  if (!checkout) return;

  const value = checkout.totalPrice && checkout.totalPrice.amount;
  const currency = checkout.totalPrice && checkout.totalPrice.currencyCode;
  const orderId = checkout.order && checkout.order.id;

  loadBothLandingPixels().then(function () {
    if (window.fbq) {
      window.fbq("track", "Purchase", {
        value: value,
        currency: currency
      });
    }

    if (window.ttq) {
      window.ttq.track("CompletePayment", {
        value: value,
        currency: currency,
        content_type: "product"
      });
    }

    if (window.gtag) {
      window.gtag("event", "purchase", {
        transaction_id: orderId,
        value: value,
        currency: currency
      });
    }
  });
}

analytics.subscribe("page_viewed", function (event) {
  const url = event.context.document.location.href;
  if (!isCheckoutFlow(url)) return;

  loadBothLandingPixels();
});

analytics.subscribe("checkout_completed", function (event) {
  trackPurchase(event.data.checkout);
});
