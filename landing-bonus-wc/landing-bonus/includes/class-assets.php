<?php
/**
 * Gestión de assets del plugin.
 *
 * @package LandingBonus
 */

defined( 'ABSPATH' ) || exit;

/**
 * Clase Landing_Bonus_Assets
 */
class Landing_Bonus_Assets {

	/**
	 * Inicializa hooks de assets.
	 */
	public static function init(): void {
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'enqueue_frontend' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_admin' ) );
	}

	/**
	 * Encola assets del frontend.
	 */
	public static function enqueue_frontend(): void {
		if ( is_admin() ) {
			return;
		}

		$settings = landing_bonus_get_settings();
		$modules  = $settings['modules'] ?? array();

		wp_register_style(
			'landing-bonus-frontend',
			LANDING_BONUS_PLUGIN_URL . 'assets/css/landing-bonus.css',
			array(),
			LANDING_BONUS_VERSION
		);

		wp_register_script(
			'landing-bonus-frontend',
			LANDING_BONUS_PLUGIN_URL . 'assets/js/landing-bonus.js',
			array(),
			LANDING_BONUS_VERSION,
			true
		);

		wp_localize_script(
			'landing-bonus-frontend',
			'landingBonusConfig',
			array(
				'ajaxUrl' => admin_url( 'admin-ajax.php' ),
				'nonce'   => wp_create_nonce( 'landing_bonus_nonce' ),
				'i18n'    => array(
					'orderSuccess' => __( '¡Pedido creado con éxito!', 'landing-bonus' ),
					'orderError'   => __( 'No se pudo crear el pedido. Intenta de nuevo.', 'landing-bonus' ),
					'freeShipping' => __( 'Te obsequiamos el envío', 'landing-bonus' ),
				),
				'modules' => $modules,
			)
		);

		if ( self::should_enqueue_frontend() ) {
			wp_enqueue_style( 'landing-bonus-frontend' );
			wp_enqueue_script( 'landing-bonus-frontend' );
		}

		if ( ! empty( $modules['cod_modal'] ) ) {
			wp_enqueue_style( 'landing-bonus-cod-modal' );
			wp_enqueue_script( 'landing-bonus-cod-modal' );
		}

		if ( ! empty( $modules['countdown'] ) ) {
			wp_enqueue_style( 'landing-bonus-countdown' );
			wp_enqueue_script( 'landing-bonus-countdown' );
		}

		if ( ! empty( $modules['google_badge'] ) ) {
			wp_enqueue_style( 'landing-bonus-google-badge' );
		}

		if ( ! empty( $modules['floating_button'] ) ) {
			wp_enqueue_style( 'landing-bonus-floating-button' );
			wp_enqueue_script( 'landing-bonus-floating-button' );
		}

		if ( ! empty( $modules['social_proof'] ) ) {
			wp_enqueue_style( 'landing-bonus-social-proof' );
			wp_enqueue_script( 'landing-bonus-social-proof' );
		}

		self::register_module_assets();
	}

	/**
	 * Registra assets individuales por módulo.
	 */
	private static function register_module_assets(): void {
		$assets = array(
			'landing-bonus-cod-modal'        => array( 'css/cod-modal.css', 'js/cod-modal.js' ),
			'landing-bonus-countdown'        => array( 'css/countdown.css', 'js/countdown.js' ),
			'landing-bonus-google-badge'     => array( 'css/google-badge.css', null ),
			'landing-bonus-floating-button'  => array( 'css/floating-button.css', 'js/floating-button.js' ),
			'landing-bonus-social-proof'     => array( 'css/social-proof.css', 'js/social-proof.js' ),
		);

		foreach ( $assets as $handle => $files ) {
			if ( $files[0] ) {
				wp_register_style(
					$handle,
					LANDING_BONUS_PLUGIN_URL . 'assets/' . $files[0],
					array( 'landing-bonus-frontend' ),
					LANDING_BONUS_VERSION
				);
			}

			if ( $files[1] ) {
				wp_register_script(
					$handle,
					LANDING_BONUS_PLUGIN_URL . 'assets/' . $files[1],
					array( 'landing-bonus-frontend' ),
					LANDING_BONUS_VERSION,
					true
				);
			}
		}
	}

	/**
	 * Encola assets del admin.
	 *
	 * @param string $hook Hook de la página actual.
	 */
	public static function enqueue_admin( string $hook ): void {
		if ( 'woocommerce_page_landing-bonus' !== $hook ) {
			return;
		}

		wp_enqueue_style(
			'landing-bonus-admin',
			LANDING_BONUS_PLUGIN_URL . 'assets/css/admin.css',
			array(),
			LANDING_BONUS_VERSION
		);

		wp_enqueue_script(
			'landing-bonus-admin',
			LANDING_BONUS_PLUGIN_URL . 'assets/js/admin.js',
			array(),
			LANDING_BONUS_VERSION,
			true
		);
	}

	/**
	 * Determina si se deben cargar los assets base del frontend.
	 */
	private static function should_enqueue_frontend(): bool {
		if ( is_singular() ) {
			global $post;

			if ( $post instanceof WP_Post && has_shortcode( $post->post_content, 'landing_bonus_countdown' ) ) {
				return true;
			}
			if ( $post instanceof WP_Post && has_shortcode( $post->post_content, 'landing_bonus_google_badge' ) ) {
				return true;
			}
			if ( $post instanceof WP_Post && has_shortcode( $post->post_content, 'landing_bonus_floating_button' ) ) {
				return true;
			}
			if ( $post instanceof WP_Post && has_shortcode( $post->post_content, 'landing_bonus_social_proof' ) ) {
				return true;
			}
			if ( $post instanceof WP_Post && has_shortcode( $post->post_content, 'landing_bonus_pack' ) ) {
				return true;
			}
		}

		return Landing_Bonus_Module_Cod_Modal::should_render_modal();
	}
}
