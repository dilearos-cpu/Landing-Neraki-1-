(function () {
  'use strict';

  window.LandingBonus = window.LandingBonus || {};

  window.LandingBonus.formatMoney = function (amount) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  window.LandingBonus.triggerPackBuy = function () {
    document.querySelectorAll('[data-landing-bonus-pack-buy]').forEach(function (button) {
      button.click();
    });
  };
})();
