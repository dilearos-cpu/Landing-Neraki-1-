<?php
/**
 * Registro de shortcodes del plugin.
 *
 * @package LandingBonus
 */

defined( 'ABSPATH' ) || exit;

/**
 * Clase Landing_Bonus_Shortcodes
 */
class Landing_Bonus_Shortcodes {

	/**
	 * Inicializa los shortcodes.
	 */
	public static function init(): void {
		add_action( 'init', array( __CLASS__, 'register' ) );
	}

	/**
	 * Registra todos los shortcodes.
	 */
	public static function register(): void {
		add_shortcode( 'landing_bonus_countdown', array( 'Landing_Bonus_Module_Countdown', 'render_shortcode' ) );
		add_shortcode( 'landing_bonus_google_badge', array( 'Landing_Bonus_Module_Google_Badge', 'render_shortcode' ) );
		add_shortcode( 'landing_bonus_floating_button', array( 'Landing_Bonus_Module_Floating_Button', 'render_shortcode' ) );
	}
}
