/**
 * Popup de prueba social - Frontend
 */
(function () {
	'use strict';

	if (typeof daspSettings === 'undefined' || !daspSettings.configs) {
		return;
	}

	var configs = daspSettings.configs;
	var i18n = daspSettings.i18n || {};

	function randomItem(arr) {
		return arr[Math.floor(Math.random() * arr.length)];
	}

	function randomBetween(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function buildMessage(config) {
		var name = randomItem(config.names);
		var city = randomItem(config.cities);
		var time = randomItem(config.time_phrases);
		var pack = config.pack_prefix + ' ' + config.pack_name;

		return (
			'<strong>' + escapeHtml(name) + '</strong> ' +
			escapeHtml(i18n.purchased || 'ha comprado un') + ' ' +
			'<strong>' + escapeHtml(pack) + ' x' + config.units + '</strong> ' +
			escapeHtml(i18n.ago || 'hace') + ' ' + escapeHtml(time) + ' ' +
			escapeHtml(i18n.in || 'en') + ' ' +
			'<strong>' + escapeHtml(city) + '</strong>'
		);
	}

	function escapeHtml(text) {
		var div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}

	function createPopup(config) {
		var popup = document.createElement('div');
		popup.className = 'dasp-popup dasp-popup--' + config.position;
		popup.setAttribute('role', 'status');
		popup.innerHTML =
			'<button class="dasp-popup__close" aria-label="Cerrar">&times;</button>' +
			'<div class="dasp-popup__inner">' +
				'<div class="dasp-popup__icon">🛒</div>' +
				'<div class="dasp-popup__content">' +
					'<p class="dasp-popup__message"></p>' +
					'<span class="dasp-popup__verified">' + escapeHtml(i18n.verified || 'Compra verificada') + '</span>' +
				'</div>' +
			'</div>';

		document.body.appendChild(popup);

		var closeBtn = popup.querySelector('.dasp-popup__close');
		closeBtn.addEventListener('click', function () {
			hidePopup(popup);
		});

		return popup;
	}

	function showPopup(popup, config) {
		var messageEl = popup.querySelector('.dasp-popup__message');
		messageEl.innerHTML = buildMessage(config);

		popup.classList.add('dasp-popup--visible');

		setTimeout(function () {
			hidePopup(popup);
		}, config.display_duration);
	}

	function hidePopup(popup) {
		popup.classList.remove('dasp-popup--visible');
	}

	function scheduleNotification(popup, config) {
		var delay = randomBetween(config.interval_min, config.interval_max);

		setTimeout(function () {
			showPopup(popup, config);
			scheduleNotification(popup, config);
		}, delay);
	}

	function initShortcode(id, config) {
		var popup = createPopup(config);
		var initialDelay = randomBetween(2000, 5000);

		setTimeout(function () {
			showPopup(popup, config);
			scheduleNotification(popup, config);
		}, initialDelay);
	}

	Object.keys(configs).forEach(function (id) {
		initShortcode(id, configs[id]);
	});
})();
