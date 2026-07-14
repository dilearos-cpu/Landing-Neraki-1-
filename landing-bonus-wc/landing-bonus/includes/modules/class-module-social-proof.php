<?php
/**
 * Módulo popup de prueba social.
 *
 * @package LandingBonus
 */

defined( 'ABSPATH' ) || exit;

/**
 * Clase Landing_Bonus_Module_Social_Proof
 */
class Landing_Bonus_Module_Social_Proof {

	/**
	 * Inicializa el módulo.
	 */
	public static function init(): void {
		// El shortcode se registra en Landing_Bonus_Shortcodes.
	}

	/**
	 * Renderiza el shortcode de prueba social.
	 *
	 * @param array<string, string> $atts Atributos del shortcode.
	 * @return string
	 */
	public static function render_shortcode( array $atts = array() ): string {
		$settings = landing_bonus_get_settings();
		$defaults = $settings['social_proof'] ?? array();

		$atts = shortcode_atts(
			array(
				'id'          => 'campaign1',
				'pack_label'  => 'pack de básicas',
				'units'       => '10',
			),
			$atts,
			'landing_bonus_social_proof'
		);

		$config = array(
			'id'              => sanitize_key( $atts['id'] ),
			'packLabel'       => sanitize_text_field( $atts['pack_label'] ),
			'units'           => absint( $atts['units'] ),
			'initialDelay'    => absint( $defaults['initial_delay'] ?? 5 ),
			'intervalMin'     => absint( $defaults['interval_min'] ?? 8 ),
			'intervalMax'     => absint( $defaults['interval_max'] ?? 15 ),
			'displayDuration' => absint( $defaults['display_duration'] ?? 5 ),
			'position'        => sanitize_text_field( $defaults['position'] ?? 'bottom-left' ),
			'enableMobile'    => ! empty( $defaults['enable_mobile'] ),
			'enableDesktop'   => ! empty( $defaults['enable_desktop'] ),
			'cities'          => self::lines_to_array( $defaults['cities'] ?? '' ),
			'names'           => self::lines_to_array( $defaults['names'] ?? '' ),
			'timePhrases'     => self::lines_to_array( $defaults['time_phrases'] ?? '' ),
		);

		wp_enqueue_style( 'landing-bonus-social-proof' );
		wp_enqueue_script( 'landing-bonus-social-proof' );

		ob_start();
		?>
		<div
			class="landing-bonus-social-proof"
			data-landing-bonus-social-proof
			data-campaign-id="<?php echo esc_attr( $config['id'] ); ?>"
		>
			<script type="application/json" data-social-proof-settings><?php echo wp_json_encode( $config ); ?></script>
		</div>
		<?php
		return (string) ob_get_clean();
	}

	/**
	 * Convierte texto multilínea en array.
	 *
	 * @param string $text Texto con saltos de línea.
	 * @return array<int, string>
	 */
	private static function lines_to_array( string $text ): array {
		$lines = preg_split( '/\r\n|\r|\n/', $text ) ?: array();

		return array_values(
			array_filter(
				array_map( 'trim', $lines )
			)
		);
	}

	/**
	 * Genera un mensaje de prueba social.
	 *
	 * @param array<string, mixed> $config Configuración de la campaña.
	 * @return string
	 */
	public static function build_message( array $config ): string {
		$names   = $config['names'] ?? array( 'María' );
		$cities  = $config['cities'] ?? array( 'Bogotá' );
		$times   = $config['timePhrases'] ?? array( 'hace unos minutos' );
		$pack    = $config['packLabel'] ?? 'pack';

		$name = $names[ array_rand( $names ) ];
		$city = $cities[ array_rand( $cities ) ];
		$time = $times[ array_rand( $times ) ];

		$message = sprintf(
			/* translators: 1: customer name, 2: pack label, 3: time phrase, 4: city */
			__( '%1$s ha comprado un %2$s %3$s en %4$s', 'landing-bonus' ),
			$name,
			$pack,
			$time,
			$city
		);

		/**
		 * Filtra el mensaje de prueba social.
		 *
		 * @param string               $message  Mensaje generado.
		 * @param array<string, mixed> $config   Configuración de campaña.
		 */
		return (string) apply_filters( 'landing_bonus_social_proof_message', $message, $config );
	}
}
