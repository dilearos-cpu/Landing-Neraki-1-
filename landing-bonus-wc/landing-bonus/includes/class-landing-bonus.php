<?php
/**
 * Clase principal del plugin Landing Bonus.
 *
 * @package LandingBonus
 */

defined( 'ABSPATH' ) || exit;

/**
 * Clase Landing_Bonus
 */
final class Landing_Bonus {

	/**
	 * Instancia singleton.
	 *
	 * @var Landing_Bonus|null
	 */
	private static ?Landing_Bonus $instance = null;

	/**
	 * Obtiene la instancia singleton.
	 */
	public static function instance(): Landing_Bonus {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Constructor privado.
	 */
	private function __construct() {}

	/**
	 * Inicializa el plugin.
	 */
	public function init(): void {
		$this->load_dependencies();
		$this->init_components();
	}

	/**
	 * Carga las dependencias del plugin.
	 */
	private function load_dependencies(): void {
		require_once LANDING_BONUS_PLUGIN_DIR . 'includes/class-pack-manager.php';
		require_once LANDING_BONUS_PLUGIN_DIR . 'includes/class-pack-helpers.php';
		require_once LANDING_BONUS_PLUGIN_DIR . 'includes/class-assets.php';
		require_once LANDING_BONUS_PLUGIN_DIR . 'includes/class-shortcodes.php';
		require_once LANDING_BONUS_PLUGIN_DIR . 'includes/class-admin-settings.php';
		require_once LANDING_BONUS_PLUGIN_DIR . 'includes/ajax/class-ajax-cod-order.php';
		require_once LANDING_BONUS_PLUGIN_DIR . 'includes/ajax/class-ajax-pack.php';

		require_once LANDING_BONUS_PLUGIN_DIR . 'includes/modules/class-module-cod-modal.php';
		require_once LANDING_BONUS_PLUGIN_DIR . 'includes/modules/class-module-pack.php';
		require_once LANDING_BONUS_PLUGIN_DIR . 'includes/modules/class-module-countdown.php';
		require_once LANDING_BONUS_PLUGIN_DIR . 'includes/modules/class-module-google-badge.php';
		require_once LANDING_BONUS_PLUGIN_DIR . 'includes/modules/class-module-floating-button.php';
		require_once LANDING_BONUS_PLUGIN_DIR . 'includes/modules/class-module-social-proof.php';
	}

	/**
	 * Inicializa los componentes del plugin.
	 */
	private function init_components(): void {
		Landing_Bonus_Assets::init();
		Landing_Bonus_Shortcodes::init();
		Landing_Bonus_Admin_Settings::init();
		Landing_Bonus_Ajax_Cod_Order::init();
		Landing_Bonus_Ajax_Pack::init();

		$settings = landing_bonus_get_settings();
		$modules  = $settings['modules'] ?? array();

		if ( ! empty( $modules['cod_modal'] ) ) {
			Landing_Bonus_Module_Cod_Modal::init();
		}

		if ( ! empty( $modules['pack'] ) ) {
			Landing_Bonus_Module_Pack::init();
		}

		if ( ! empty( $modules['countdown'] ) ) {
			Landing_Bonus_Module_Countdown::init();
		}

		if ( ! empty( $modules['google_badge'] ) ) {
			Landing_Bonus_Module_Google_Badge::init();
		}

		if ( ! empty( $modules['floating_button'] ) ) {
			Landing_Bonus_Module_Floating_Button::init();
		}

		if ( ! empty( $modules['social_proof'] ) ) {
			Landing_Bonus_Module_Social_Proof::init();
		}
	}

	/**
	 * Comprueba si un módulo está activo.
	 *
	 * @param string $module_key Clave del módulo.
	 */
	public static function is_module_enabled( string $module_key ): bool {
		$settings = landing_bonus_get_settings();
		$modules  = $settings['modules'] ?? array();

		return ! empty( $modules[ $module_key ] );
	}
}
