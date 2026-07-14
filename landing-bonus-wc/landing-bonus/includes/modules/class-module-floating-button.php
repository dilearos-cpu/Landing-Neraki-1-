<?php
/**
 * Módulo botón flotante estilo RSI.
 *
 * @package LandingBonus
 */

defined( 'ABSPATH' ) || exit;

/**
 * Clase Landing_Bonus_Module_Floating_Button
 */
class Landing_Bonus_Module_Floating_Button {

	/**
	 * Inicializa el módulo.
	 */
	public static function init(): void {
		// El shortcode se registra en Landing_Bonus_Shortcodes.
	}

	/**
	 * Renderiza el shortcode del botón flotante.
	 *
	 * @param array<string, string> $atts Atributos del shortcode.
	 * @return string
	 */
	public static function render_shortcode( array $atts = array() ): string {
		$settings = landing_bonus_get_settings();
		$defaults = $settings['floating_button'] ?? array();

		$atts = shortcode_atts(
			array(
				'url'                       => $defaults['url'] ?? '#',
				'label'                     => $defaults['label'] ?? 'Compra aqui | Paga en casa',
				'position_mode'             => $defaults['position_mode'] ?? 'fixed_floating',
				'float_trigger'             => $defaults['float_trigger'] ?? 'pack_buy',
				'button_background_color'   => $defaults['button_background_color'] ?? '#FFDE21',
				'border_color'              => $defaults['border_color'] ?? '#000000',
				'border_radius'             => $defaults['border_radius'] ?? '8px',
				'section_background_color'  => $defaults['section_background_color'] ?? 'transparent',
				'floating_background_color' => $defaults['floating_background_color'] ?? '#FFFFFF',
			),
			$atts,
			'landing_bonus_floating_button'
		);

		wp_enqueue_style( 'landing-bonus-floating-button' );
		wp_enqueue_script( 'landing-bonus-floating-button' );

		$instance_id = 'lb-float-' . wp_unique_id();
		$config      = array(
			'id'            => $instance_id,
			'positionMode'  => $atts['position_mode'],
			'floatTrigger'  => $atts['float_trigger'],
		);

		$button_style = sprintf(
			'background-color:%1$s;border-color:%2$s;border-radius:%3$s;',
			esc_attr( $atts['button_background_color'] ),
			esc_attr( $atts['border_color'] ),
			esc_attr( $atts['border_radius'] )
		);

		ob_start();
		?>
		<div
			class="landing-bonus-floating-button"
			data-landing-bonus-floating-button
			data-float-id="<?php echo esc_attr( $instance_id ); ?>"
			style="background-color: <?php echo esc_attr( $atts['section_background_color'] ); ?>;"
		>
			<script type="application/json" data-float-settings><?php echo wp_json_encode( $config ); ?></script>
			<a
				href="<?php echo esc_url( $atts['url'] ); ?>"
				class="landing-bonus-floating-button__inline"
				data-landing-bonus-float-inline
				style="<?php echo esc_attr( $button_style ); ?>"
			>
				<?php echo esc_html( $atts['label'] ); ?>
			</a>
		</div>
		<div
			class="landing-bonus-floating-button__dock"
			data-landing-bonus-float-dock
			data-float-dock-for="<?php echo esc_attr( $instance_id ); ?>"
			style="background-color: <?php echo esc_attr( $atts['floating_background_color'] ); ?>;"
			hidden
		>
			<a
				href="<?php echo esc_url( $atts['url'] ); ?>"
				class="landing-bonus-floating-button__floating"
				data-landing-bonus-float-floating
				style="<?php echo esc_attr( $button_style ); ?>"
			>
				<?php echo esc_html( $atts['label'] ); ?>
			</a>
		</div>
		<?php
		return (string) ob_get_clean();
	}
}
