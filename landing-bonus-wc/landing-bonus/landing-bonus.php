<?php
/**
 * Plugin Name:       Landing Bonus
 * Plugin URI:        https://github.com/dilearos-cpu/landing-neraki-1-
 * Description:       Herramientas de conversión para landings de pack en WooCommerce: checkout COD modal, contador, badge Google, botón flotante y prueba social.
 * Version:           1.0.0
 * Author:            Diego Arango
 * Author URI:        https://github.com/dilearos-cpu
 * Text Domain:       landing-bonus
 * Domain Path:       /languages
 * Requires at least: 6.0
 * Requires PHP:      8.0
 * WC requires at least: 8.0
 * WC tested up to:   9.0
 *
 * @package LandingBonus
 */

defined( 'ABSPATH' ) || exit;

define( 'LANDING_BONUS_VERSION', '1.0.0' );
define( 'LANDING_BONUS_PLUGIN_FILE', __FILE__ );
define( 'LANDING_BONUS_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'LANDING_BONUS_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'LANDING_BONUS_OPTION_KEY', 'landing_bonus_settings' );

/**
 * Comprueba si WooCommerce está activo.
 */
function landing_bonus_is_woocommerce_active(): bool {
	return class_exists( 'WooCommerce' );
}

/**
 * Aviso si WooCommerce no está instalado.
 */
function landing_bonus_woocommerce_missing_notice(): void {
	echo '<div class="notice notice-error"><p>';
	echo esc_html__(
		'Landing Bonus requiere WooCommerce para funcionar. Por favor, instala y activa WooCommerce.',
		'landing-bonus'
	);
	echo '</p></div>';
}

/**
 * Carga el text domain del plugin.
 */
function landing_bonus_load_textdomain(): void {
	load_plugin_textdomain(
		'landing-bonus',
		false,
		dirname( plugin_basename( LANDING_BONUS_PLUGIN_FILE ) ) . '/languages'
	);
}
add_action( 'init', 'landing_bonus_load_textdomain' );

/**
 * Inicializa el plugin.
 */
function landing_bonus_init(): void {
	if ( ! landing_bonus_is_woocommerce_active() ) {
		add_action( 'admin_notices', 'landing_bonus_woocommerce_missing_notice' );
		return;
	}

	require_once LANDING_BONUS_PLUGIN_DIR . 'includes/class-landing-bonus.php';

	Landing_Bonus::instance()->init();
}
add_action( 'plugins_loaded', 'landing_bonus_init' );

/**
 * Declara compatibilidad con HPOS de WooCommerce.
 */
function landing_bonus_declare_wc_compatibility(): void {
	if ( class_exists( '\Automattic\WooCommerce\Utilities\FeaturesUtil' ) ) {
		\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility(
			'custom_order_tables',
			LANDING_BONUS_PLUGIN_FILE,
			true
		);
	}
}
add_action( 'before_woocommerce_init', 'landing_bonus_declare_wc_compatibility' );

/**
 * Opciones por defecto del plugin.
 *
 * @return array<string, mixed>
 */
function landing_bonus_default_settings(): array {
	return array(
		'modules' => array(
			'cod_modal'        => true,
			'countdown'        => true,
			'google_badge'     => true,
			'floating_button'  => true,
			'social_proof'     => true,
		),
		'cod_modal' => array(
			'title'                  => __( 'Finaliza tu pedido', 'landing-bonus' ),
			'subtitle'               => __( 'Paga en casa al recibir tu pack', 'landing-bonus' ),
			'iva_percent'            => 19,
			'shipping_cost'          => 12000,
			'free_shipping_threshold'=> 150000,
			'accent_color'           => '#FFDE21',
			'require_email'          => true,
			'require_phone'          => true,
			'require_address'        => true,
			'notification_email'     => get_option( 'admin_email' ),
		),
		'countdown' => array(
			'default_units'          => 4,
			'default_hours'          => 24,
			'progress_prefix'        => 'Llevas',
			'progress_suffix'        => 'completado',
			'completion_message'     => __( '¡Pack completo! Toca aquí para Comprar ahora.', 'landing-bonus' ),
			'color_low'              => '#E53935',
			'color_mid'              => '#F9A825',
			'color_high'             => '#2E7D32',
			'timer_number_size'      => '32px',
			'timer_label_size'       => '12px',
		),
		'google_badge' => array(
			'prefix_text'        => 'mas de',
			'customer_count'     => '5.000',
			'phrase_text'        => 'clientes felices',
			'show_heading'       => false,
			'heading_text'       => '',
			'heading_font_size'  => '24px',
			'phrase_font_size'   => '16px',
			'enable_animation'   => true,
		),
		'floating_button' => array(
			'label'                      => 'Compra aqui | Paga en casa',
			'url'                        => '#',
			'position_mode'              => 'fixed_floating',
			'float_trigger'              => 'pack_buy',
			'button_background_color'    => '#FFDE21',
			'border_color'               => '#000000',
			'border_radius'              => '8px',
			'section_background_color'   => 'transparent',
			'floating_background_color'  => '#FFFFFF',
		),
		'social_proof' => array(
			'initial_delay'    => 5,
			'interval_min'     => 8,
			'interval_max'     => 15,
			'display_duration' => 5,
			'position'         => 'bottom-left',
			'enable_mobile'    => true,
			'enable_desktop'   => true,
			'cities'           => "Bogotá\nMedellín\nCali\nBarranquilla\nCartagena",
			'names'            => "María\nCarlos\nAna\nJuan\nLaura",
			'time_phrases'     => "hace unos minutos\nhace 5 minutos\nhace 10 minutos\nhace media hora",
		),
	);
}

/**
 * Obtiene los ajustes del plugin fusionados con los defaults.
 *
 * @return array<string, mixed>
 */
function landing_bonus_get_settings(): array {
	$defaults = landing_bonus_default_settings();
	$stored   = get_option( LANDING_BONUS_OPTION_KEY, array() );

	if ( ! is_array( $stored ) ) {
		$stored = array();
	}

	return array_replace_recursive( $defaults, $stored );
}

/**
 * Activa el plugin y guarda defaults si no existen.
 */
function landing_bonus_activate(): void {
	if ( false === get_option( LANDING_BONUS_OPTION_KEY, false ) ) {
		add_option( LANDING_BONUS_OPTION_KEY, landing_bonus_default_settings() );
	}
}
register_activation_hook( LANDING_BONUS_PLUGIN_FILE, 'landing_bonus_activate' );
