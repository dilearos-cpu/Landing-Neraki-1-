<?php
/**
 * Panel de administración del plugin.
 *
 * @package LandingBonus
 */

defined( 'ABSPATH' ) || exit;

/**
 * Clase Landing_Bonus_Admin_Settings
 */
class Landing_Bonus_Admin_Settings {

	/**
	 * Tabs del panel de administración.
	 *
	 * @var array<string, string>
	 */
	private static array $tabs = array(
		'general'         => 'General',
		'countdown'       => 'Contador',
		'google_badge'    => 'Google Badge',
		'floating_button' => 'Botón flotante',
		'shortcodes'      => 'Shortcodes',
	);

	/**
	 * Inicializa hooks del admin.
	 */
	public static function init(): void {
		add_action( 'admin_menu', array( __CLASS__, 'register_menu' ) );
		add_action( 'admin_post_landing_bonus_save_settings', array( __CLASS__, 'handle_save' ) );
	}

	/**
	 * Registra el menú en WooCommerce.
	 */
	public static function register_menu(): void {
		add_submenu_page(
			'woocommerce',
			__( 'Landing Bonus', 'landing-bonus' ),
			__( 'Landing Bonus', 'landing-bonus' ),
			'manage_woocommerce',
			'landing-bonus',
			array( __CLASS__, 'render_page' )
		);
	}

	/**
	 * Renderiza la página de ajustes.
	 */
	public static function render_page(): void {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_die( esc_html__( 'No tienes permisos.', 'landing-bonus' ) );
		}

		$tab      = isset( $_GET['tab'] ) ? sanitize_key( wp_unslash( $_GET['tab'] ) ) : 'general'; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$settings = landing_bonus_get_settings();

		if ( ! array_key_exists( $tab, self::$tabs ) ) {
			$tab = 'general';
		}

		include LANDING_BONUS_PLUGIN_DIR . 'templates/admin-settings.php';
	}

	/**
	 * Maneja el guardado de ajustes.
	 */
	public static function handle_save(): void {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_die( esc_html__( 'No tienes permisos.', 'landing-bonus' ) );
		}

		check_admin_referer( 'landing_bonus_save_settings' );

		$tab      = isset( $_POST['landing_bonus_tab'] ) ? sanitize_key( wp_unslash( $_POST['landing_bonus_tab'] ) ) : 'general';
		$settings = landing_bonus_get_settings();

		switch ( $tab ) {
			case 'general':
				$settings['modules'] = array(
					'countdown'       => isset( $_POST['module_countdown'] ),
					'google_badge'    => isset( $_POST['module_google_badge'] ),
					'floating_button' => isset( $_POST['module_floating_button'] ),
				);
				break;

			case 'countdown':
				$settings['countdown'] = array(
					'default_units'      => absint( $_POST['countdown_default_units'] ?? 4 ),
					'default_hours'      => absint( $_POST['countdown_default_hours'] ?? 24 ),
					'progress_prefix'    => sanitize_text_field( wp_unslash( $_POST['countdown_progress_prefix'] ?? '' ) ),
					'progress_suffix'    => sanitize_text_field( wp_unslash( $_POST['countdown_progress_suffix'] ?? '' ) ),
					'completion_message' => sanitize_text_field( wp_unslash( $_POST['countdown_completion_message'] ?? '' ) ),
					'color_low'          => sanitize_hex_color( wp_unslash( $_POST['countdown_color_low'] ?? '#E53935' ) ) ?: '#E53935',
					'color_mid'          => sanitize_hex_color( wp_unslash( $_POST['countdown_color_mid'] ?? '#F9A825' ) ) ?: '#F9A825',
					'color_high'         => sanitize_hex_color( wp_unslash( $_POST['countdown_color_high'] ?? '#2E7D32' ) ) ?: '#2E7D32',
					'timer_number_size'  => sanitize_text_field( wp_unslash( $_POST['countdown_timer_number_size'] ?? '32px' ) ),
					'timer_label_size'   => sanitize_text_field( wp_unslash( $_POST['countdown_timer_label_size'] ?? '12px' ) ),
					'pack_selector'      => sanitize_text_field( wp_unslash( $_POST['countdown_pack_selector'] ?? '.pack-ui' ) ),
					'slot_selector'      => sanitize_text_field( wp_unslash( $_POST['countdown_slot_selector'] ?? '.slot' ) ),
				);
				break;

			case 'google_badge':
				$settings['google_badge'] = array(
					'prefix_text'       => sanitize_text_field( wp_unslash( $_POST['badge_prefix_text'] ?? '' ) ),
					'customer_count'    => sanitize_text_field( wp_unslash( $_POST['badge_customer_count'] ?? '' ) ),
					'phrase_text'       => sanitize_text_field( wp_unslash( $_POST['badge_phrase_text'] ?? '' ) ),
					'show_heading'      => isset( $_POST['badge_show_heading'] ),
					'heading_text'      => sanitize_text_field( wp_unslash( $_POST['badge_heading_text'] ?? '' ) ),
					'heading_font_size' => sanitize_text_field( wp_unslash( $_POST['badge_heading_font_size'] ?? '24px' ) ),
					'phrase_font_size'  => sanitize_text_field( wp_unslash( $_POST['badge_phrase_font_size'] ?? '16px' ) ),
					'enable_animation'  => isset( $_POST['badge_enable_animation'] ),
				);
				break;

			case 'floating_button':
				$settings['floating_button'] = array(
					'label'                     => sanitize_text_field( wp_unslash( $_POST['float_label'] ?? '' ) ),
					'url'                       => esc_url_raw( wp_unslash( $_POST['float_url'] ?? '' ) ),
					'position_mode'             => sanitize_text_field( wp_unslash( $_POST['float_position_mode'] ?? 'fixed_floating' ) ),
					'float_trigger'             => sanitize_text_field( wp_unslash( $_POST['float_trigger'] ?? 'pack_buy' ) ),
					'button_background_color'   => sanitize_hex_color( wp_unslash( $_POST['float_button_background_color'] ?? '#FFDE21' ) ) ?: '#FFDE21',
					'border_color'              => sanitize_hex_color( wp_unslash( $_POST['float_border_color'] ?? '#000000' ) ) ?: '#000000',
					'border_radius'             => sanitize_text_field( wp_unslash( $_POST['float_border_radius'] ?? '8px' ) ),
					'section_background_color'  => sanitize_text_field( wp_unslash( $_POST['float_section_background_color'] ?? 'transparent' ) ),
					'floating_background_color' => sanitize_hex_color( wp_unslash( $_POST['float_floating_background_color'] ?? '#FFFFFF' ) ) ?: '#FFFFFF',
				);
				break;
		}

		update_option( LANDING_BONUS_OPTION_KEY, $settings );

		wp_safe_redirect(
			add_query_arg(
				array(
					'page'    => 'landing-bonus',
					'tab'     => $tab,
					'updated' => '1',
				),
				admin_url( 'admin.php' )
			)
		);
		exit;
	}

	/**
	 * Obtiene las tabs del panel.
	 *
	 * @return array<string, string>
	 */
	public static function get_tabs(): array {
		return self::$tabs;
	}
}
