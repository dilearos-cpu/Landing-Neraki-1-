<?php
/**
 * Plugin Name:       Diego Arango - Social Proof Boost
 * Plugin URI:        https://github.com/dilearos-cpu/Landing-Neraki-1-
 * Description:       Notificaciones emergentes de prueba social para WooCommerce. Muestra compras simuladas aleatorias en ciudades de Colombia para aumentar la conversión.
 * Version:           1.0.0
 * Author:            Diego Arango
 * Author URI:        https://github.com/dilearos-cpu
 * Text Domain:       diego-arango-social-proof
 * Domain Path:       /languages
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * WC requires at least: 5.0
 * WC tested up to:   9.0
 *
 * @package DiegoArangoSocialProof
 */

defined( 'ABSPATH' ) || exit;

define( 'DASP_VERSION', '1.0.0' );
define( 'DASP_PLUGIN_FILE', __FILE__ );
define( 'DASP_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'DASP_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'DASP_OPTION_KEY', 'dasp_shortcodes' );

/**
 * Comprueba si WooCommerce está activo.
 */
function dasp_is_woocommerce_active() {
	return class_exists( 'WooCommerce' );
}

/**
 * Aviso si WooCommerce no está instalado.
 */
function dasp_woocommerce_missing_notice() {
	echo '<div class="notice notice-error"><p>';
	echo esc_html__(
		'Diego Arango - Social Proof Boost requiere WooCommerce para funcionar. Por favor, instala y activa WooCommerce.',
		'diego-arango-social-proof'
	);
	echo '</p></div>';
}

/**
 * Inicializa el plugin.
 */
function dasp_init() {
	if ( ! dasp_is_woocommerce_active() ) {
		add_action( 'admin_notices', 'dasp_woocommerce_missing_notice' );
		return;
	}

	require_once DASP_PLUGIN_DIR . 'includes/class-dasp-data.php';
	require_once DASP_PLUGIN_DIR . 'includes/class-dasp-shortcode-manager.php';
	require_once DASP_PLUGIN_DIR . 'includes/class-dasp-admin.php';
	require_once DASP_PLUGIN_DIR . 'includes/class-dasp-frontend.php';

	DASP_Admin::init();
	DASP_Frontend::init();
}
add_action( 'plugins_loaded', 'dasp_init' );

/**
 * Declara compatibilidad con HPOS de WooCommerce.
 */
function dasp_declare_wc_compatibility() {
	if ( class_exists( '\Automattic\WooCommerce\Utilities\FeaturesUtil' ) ) {
		\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility(
			'custom_order_tables',
			DASP_PLUGIN_FILE,
			true
		);
	}
}
add_action( 'before_woocommerce_init', 'dasp_declare_wc_compatibility' );
