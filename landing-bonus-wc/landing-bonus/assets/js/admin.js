(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-copy-shortcode]').forEach(function (button) {
      button.addEventListener('click', function () {
        var code = button.getAttribute('data-copy-shortcode');
        if (!code || !navigator.clipboard) {
          return;
        }
        navigator.clipboard.writeText(code);
      });
    });
  });
})();
