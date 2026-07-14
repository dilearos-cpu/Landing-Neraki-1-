<?php
/**
 * Módulo COD Modal.
 *
 * @package LandingBonus
 */

defined( 'ABSPATH' ) || exit;

/**
 * Clase Landing_Bonus_Module_Cod_Modal
 */
class Landing_Bonus_Module_Cod_Modal {

	/**
	 * Inicializa el módulo.
	 */
	public static function init(): void {
		add_action( 'wp_footer', array( __CLASS__, 'render_modal' ) );
	}

	/**
	 * Determina si el modal debe renderizarse en la página actual.
	 */
	public static function should_render_modal(): bool {
		if ( is_singular() ) {
			global $post;

			if ( $post instanceof WP_Post ) {
				if ( has_shortcode( $post->post_content, 'landing_bonus_pack' ) ) {
					return true;
				}
				foreach ( Landing_Bonus_Pack_Manager::enabled() as $pack ) {
					$tag = $pack['shortcode'] ?? '';
					if ( $tag && has_shortcode( $post->post_content, $tag ) ) {
						return true;
					}
				}
			}
		}

		return false;
	}

	/**
	 * Renderiza el modal en el footer.
	 */
	public static function render_modal(): void {
		if ( ! self::should_render_modal() ) {
			return;
		}

		$settings = landing_bonus_get_settings();
		$cod      = $settings['cod_modal'] ?? array();

		include LANDING_BONUS_PLUGIN_DIR . 'templates/cod-modal.php';
	}

	/**
	 * Obtiene la configuración del modal para JS.
	 *
	 * @return array<string, mixed>
	 */
	public static function get_js_config(): array {
		$settings = landing_bonus_get_settings();
		$cod      = $settings['cod_modal'] ?? array();

		return array(
			'title'                   => $cod['title'] ?? '',
			'subtitle'                => $cod['subtitle'] ?? '',
			'ivaPercent'              => (float) ( $cod['iva_percent'] ?? 19 ),
			'shippingCost'            => (float) ( $cod['shipping_cost'] ?? 0 ),
			'freeShippingThreshold'   => (float) ( $cod['free_shipping_threshold'] ?? 0 ),
			'accentColor'             => $cod['accent_color'] ?? '#FFDE21',
			'requireEmail'            => ! empty( $cod['require_email'] ),
			'requirePhone'            => ! empty( $cod['require_phone'] ),
			'requireAddress'          => ! empty( $cod['require_address'] ),
		);
	}
}
