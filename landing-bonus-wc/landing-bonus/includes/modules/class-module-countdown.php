<?php
/**
 * Módulo contador + barra de progreso.
 *
 * @package LandingBonus
 */

defined( 'ABSPATH' ) || exit;

/**
 * Clase Landing_Bonus_Module_Countdown
 */
class Landing_Bonus_Module_Countdown {

	/**
	 * Inicializa el módulo.
	 */
	public static function init(): void {
		// El shortcode se registra en Landing_Bonus_Shortcodes.
	}

	/**
	 * Renderiza el shortcode del contador.
	 *
	 * @param array<string, string> $atts Atributos del shortcode.
	 * @return string
	 */
	public static function render_shortcode( array $atts = array() ): string {
		$settings = landing_bonus_get_settings();
		$defaults = $settings['countdown'] ?? array();

		$atts = shortcode_atts(
			array(
				'id'            => 'promo1',
				'units'         => (string) ( $defaults['default_units'] ?? 4 ),
				'hours'         => (string) ( $defaults['default_hours'] ?? 24 ),
				'pack_selector' => $defaults['pack_selector'] ?? '.pack-ui',
				'slot_selector' => $defaults['slot_selector'] ?? '.slot',
			),
			$atts,
			'landing_bonus_countdown'
		);

		$config = array(
			'id'                => sanitize_key( $atts['id'] ),
			'unitsToComplete'   => absint( $atts['units'] ),
			'durationHours'     => absint( $atts['hours'] ),
			'packSelector'      => sanitize_text_field( $atts['pack_selector'] ),
			'slotSelector'      => sanitize_text_field( $atts['slot_selector'] ),
			'progressPrefix'    => $defaults['progress_prefix'] ?? 'Llevas',
			'progressSuffix'    => $defaults['progress_suffix'] ?? 'completado',
			'completionMessage' => $defaults['completion_message'] ?? '',
			'colorLow'          => $defaults['color_low'] ?? '#E53935',
			'colorMid'          => $defaults['color_mid'] ?? '#F9A825',
			'colorHigh'         => $defaults['color_high'] ?? '#2E7D32',
			'timerNumberSize'   => $defaults['timer_number_size'] ?? '32px',
			'timerLabelSize'    => $defaults['timer_label_size'] ?? '12px',
		);

		wp_enqueue_style( 'landing-bonus-countdown' );
		wp_enqueue_script( 'landing-bonus-countdown' );

		ob_start();
		?>
		<div
			class="landing-bonus-countdown"
			data-landing-bonus-countdown
			data-countdown-id="<?php echo esc_attr( $config['id'] ); ?>"
		>
			<script type="application/json" data-countdown-settings><?php echo wp_json_encode( $config ); ?></script>
			<div class="landing-bonus-countdown__timer" data-countdown-timer>
				<div class="landing-bonus-countdown__unit">
					<span class="landing-bonus-countdown__number" data-hours>00</span>
					<span class="landing-bonus-countdown__label"><?php esc_html_e( 'horas', 'landing-bonus' ); ?></span>
				</div>
				<div class="landing-bonus-countdown__unit">
					<span class="landing-bonus-countdown__number" data-minutes>00</span>
					<span class="landing-bonus-countdown__label"><?php esc_html_e( 'minutos', 'landing-bonus' ); ?></span>
				</div>
				<div class="landing-bonus-countdown__unit">
					<span class="landing-bonus-countdown__number" data-seconds>00</span>
					<span class="landing-bonus-countdown__label"><?php esc_html_e( 'segundos', 'landing-bonus' ); ?></span>
				</div>
			</div>
			<div class="landing-bonus-countdown__progress-wrap">
				<p class="landing-bonus-countdown__progress-text" data-progress-text></p>
				<div class="landing-bonus-countdown__progress-bar" data-progress-bar>
					<div class="landing-bonus-countdown__progress-fill" data-progress-fill></div>
				</div>
			</div>
		</div>
		<?php
		return (string) ob_get_clean();
	}
}
