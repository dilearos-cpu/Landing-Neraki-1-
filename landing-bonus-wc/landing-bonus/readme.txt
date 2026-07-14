=== Landing Bonus ===
Contributors: diegoarango
Tags: woocommerce, landing page, conversion, cod, countdown, social proof
Requires at least: 6.0
Tested up to: 6.5
Requires PHP: 8.0
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Herramientas de conversión para landings de pack en WooCommerce: checkout COD modal, contador, badge Google, botón flotante y prueba social.

== Description ==

Landing Bonus replica en WordPress/WooCommerce las herramientas de conversión usadas en las landing pages Caletzza (Shopify).

**Módulos incluidos:**

* Checkout COD Modal — pedido contra entrega sin salir de la landing
* Barra progreso + contador 24h — timer persistente y progreso del pack
* Google Badge — recuadro de estrellas y clientes felices
* Botón flotante estilo RSI — CTA fijo + copia flotante al hacer scroll
* Popup prueba social — toast de compras recientes

**Shortcodes:**

* `[landing_bonus_countdown id="promo1" units="4" hours="24"]`
* `[landing_bonus_google_badge]`
* `[landing_bonus_floating_button url="/mi-pagina"]`
* `[landing_bonus_social_proof pack_label="pack de básicas"]`
* `[landing_bonus_pack collection="slug" slots="4"]`

**Requisitos:** WooCommerce 8.0+

**Autor:** Diego Arango

== Installation ==

1. Sube la carpeta `landing-bonus` a `/wp-content/plugins/`
2. Activa el plugin desde el menú Plugins
3. Configura en WooCommerce → Landing Bonus
4. Inserta los shortcodes en tus landings de Elementor

== Frequently Asked Questions ==

= ¿Necesito WooCommerce? =

Sí. El plugin requiere WooCommerce activo para crear pedidos COD.

= ¿Incluye pack builder completo? =

La v1 incluye un shortcode placeholder `[landing_bonus_pack]`. Integra tu pack existente o reemplázalo en v2.

== Changelog ==

= 1.0.0 =
* Scaffold inicial con 5 módulos, panel admin, shortcodes y hooks de extensibilidad.

== Upgrade Notice ==

= 1.0.0 =
Versión inicial del plugin Landing Bonus.
