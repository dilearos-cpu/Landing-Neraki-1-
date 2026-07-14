(function () {
  'use strict';

  window.LandingBonus = window.LandingBonus || {};

  window.LandingBonus.triggerPackBuy = function () {
    var selectors = [
      '#pack-buy',
      '.pack-buy',
      '[data-landing-bonus-pack-buy]',
      '.landing-bonus-pack-buy'
    ];

    for (var i = 0; i < selectors.length; i++) {
      var button = document.querySelector(selectors[i]);
      if (button) {
        button.click();
        return;
      }
    }
  };
})();
