=== Landing Bonus ===
Contributors: diegoarango
Tags: woocommerce, landing page, conversion, countdown, google badge
Requires at least: 6.0
Tested up to: 6.5
Requires PHP: 8.0
Stable tag: 1.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Herramientas de conversión para landings WooCommerce: contador con barra de progreso, badge Google y botón flotante RSI.

== Description ==

Landing Bonus replica en WordPress/WooCommerce herramientas de conversión de las landing Caletzza (Shopify).

**Módulos incluidos:**

* Barra progreso + contador 24h — sincroniza con slots del pack existente (.pack-ui .slot)
* Google Badge — recuadro de estrellas y clientes felices
* Botón flotante estilo RSI — CTA fijo + copia flotante al hacer scroll

**Shortcodes:**

* `[landing_bonus_countdown id="promo1" units="4" hours="24"]`
* `[landing_bonus_google_badge]`
* `[landing_bonus_floating_button url="#pack"]`

**Requisitos:** WooCommerce 8.0+

**Autor:** Diego Arango

== Installation ==

1. Sube la carpeta `landing-bonus` a `/wp-content/plugins/`
2. Activa el plugin desde el menú Plugins
3. Configura en WooCommerce → Landing Bonus
4. Inserta los shortcodes en tus landings de Elementor
5. Mantén tus snippets de pack (`pack_bodys4`, `pack_visual_rapido`) — la barra los detecta automáticamente

== Changelog ==

= 1.1.0 =
* Enfoque en 3 módulos: contador, Google badge, botón flotante
* Barra sincroniza slots de packs existentes vía DOM (como Shopify)
* Retirados: COD modal, packs integrados, prueba social

= 1.0.0 =
* Versión inicial
