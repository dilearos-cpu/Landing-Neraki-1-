<?php
/**
 * Plugin Name:       Neraki Landing
 * Plugin URI:        https://github.com/dilearos-cpu/Landing-Neraki-1-
 * Description:       Landing page KIVO de alta conversión para el proyecto Neraki. Template Canvas con CSS/JS integrados.
 * Version:           1.0.0
 * Author:            Neraki
 * Text Domain:       neraki-landing
 * Requires at least: 6.0
 * Requires PHP:      8.0
 *
 * @package Neraki_Landing
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'NERAKI_LANDING_VERSION', '1.0.0' );
define( 'NERAKI_LANDING_FILE', __FILE__ );
define( 'NERAKI_LANDING_PATH', plugin_dir_path( __FILE__ ) );
define( 'NERAKI_LANDING_URL', plugin_dir_url( __FILE__ ) );

/**
 * Comprueba si la página actual usa el template KIVO.
 */
function neraki_is_kivo_landing(): bool {
	return is_page() && get_page_template_slug() === 'neraki-kivo-landing.php';
}

/**
 * Registra el template de página en el selector de WordPress.
 *
 * @param array<string, string> $templates Plantillas existentes.
 * @return array<string, string>
 */
function neraki_register_page_template( array $templates ): array {
	$templates['neraki-kivo-landing.php'] = __( 'KIVO Landing (Neraki)', 'neraki-landing' );
	return $templates;
}
add_filter( 'theme_page_templates', 'neraki_register_page_template' );

/**
 * Carga el template del plugin cuando corresponde.
 *
 * @param string $template Ruta del template por defecto.
 * @return string
 */
function neraki_load_page_template( string $template ): string {
	if ( neraki_is_kivo_landing() ) {
		$plugin_template = NERAKI_LANDING_PATH . 'templates/neraki-kivo-landing.php';
		if ( file_exists( $plugin_template ) ) {
			return $plugin_template;
		}
	}
	return $template;
}
add_filter( 'template_include', 'neraki_load_page_template' );

/**
 * Encola estilos y scripts solo en la landing KIVO.
 */
function neraki_enqueue_assets(): void {
	if ( ! neraki_is_kivo_landing() ) {
		return;
	}

	wp_enqueue_style(
		'neraki-google-fonts',
		'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Inter:wght@400;500;600&family=Montserrat:wght@400;500;600;700;800;900&display=swap',
		array(),
		null
	);

	wp_enqueue_style(
		'neraki-kivo-landing',
		NERAKI_LANDING_URL . 'assets/css/kivo-landing.css',
		array( 'neraki-google-fonts' ),
		NERAKI_LANDING_VERSION
	);

	wp_enqueue_script(
		'neraki-kivo-landing',
		NERAKI_LANDING_URL . 'assets/js/kivo-landing.js',
		array(),
		NERAKI_LANDING_VERSION,
		true
	);
}
add_action( 'wp_enqueue_scripts', 'neraki_enqueue_assets' );

/**
 * Elimina estilos del tema en la landing para experiencia Canvas.
 */
function neraki_dequeue_theme_assets(): void {
	if ( ! neraki_is_kivo_landing() ) {
		return;
	}

	// Desencolar estilos comunes del tema Hello Elementor si están registrados.
	wp_dequeue_style( 'hello-elementor' );
	wp_dequeue_style( 'hello-elementor-theme-style' );
}
add_action( 'wp_enqueue_scripts', 'neraki_dequeue_theme_assets', 100 );

/**
 * Crea la página de inicio KIVO al activar el plugin.
 */
function neraki_activate(): void {
	$existing = get_posts(
		array(
			'post_type'      => 'page',
			'post_status'    => 'any',
			'meta_key'       => '_neraki_kivo_page',
			'meta_value'     => '1',
			'posts_per_page' => 1,
		)
	);

	if ( ! empty( $existing ) ) {
		return;
	}

	$page_id = wp_insert_post(
		array(
			'post_title'   => 'KIVO Pack',
			'post_name'    => 'kivo-pack',
			'post_status'  => 'publish',
			'post_type'    => 'page',
			'post_content' => '',
		)
	);

	if ( $page_id && ! is_wp_error( $page_id ) ) {
		update_post_meta( $page_id, '_wp_page_template', 'neraki-kivo-landing.php' );
		update_post_meta( $page_id, '_neraki_kivo_page', '1' );

		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', $page_id );
	}

	flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'neraki_activate' );

/**
 * Limpia rewrite rules al desactivar.
 */
function neraki_deactivate(): void {
	flush_rewrite_rules();
}
register_deactivation_hook( __FILE__, 'neraki_deactivate' );
