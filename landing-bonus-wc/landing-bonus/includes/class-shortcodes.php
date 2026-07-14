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
		add_shortcode( 'landing_bonus_social_proof', array( 'Landing_Bonus_Module_Social_Proof', 'render_shortcode' ) );
		add_shortcode( 'landing_bonus_pack', array( __CLASS__, 'render_pack_placeholder' ) );
	}

	/**
	 * Shortcode placeholder del pack builder (v2).
	 *
	 * @param array<string, string> $atts Atributos del shortcode.
	 * @return string
	 */
	public static function render_pack_placeholder( array $atts = array() ): string {
		$atts = shortcode_atts(
			array(
				'collection' => '',
				'slots'      => '4',
			),
			$atts,
			'landing_bonus_pack'
		);

		ob_start();
		?>
		<div
			class="landing-bonus-pack"
			data-landing-bonus-pack
			data-slots="<?php echo esc_attr( $atts['slots'] ); ?>"
			data-collection="<?php echo esc_attr( $atts['collection'] ); ?>"
		>
			<p class="landing-bonus-pack__notice">
				<?php esc_html_e( 'Pack builder: integra aquí tu selector de productos o reemplaza este shortcode por tu pack existente.', 'landing-bonus' ); ?>
			</p>
			<button type="button" class="landing-bonus-pack-buy" data-landing-bonus-pack-buy>
				<?php esc_html_e( 'Comprar ahora', 'landing-bonus' ); ?>
			</button>
		</div>
		<?php
		return (string) ob_get_clean();
	}
}
