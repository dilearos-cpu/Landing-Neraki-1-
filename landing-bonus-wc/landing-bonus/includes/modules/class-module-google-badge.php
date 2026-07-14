<?php
/**
 * Módulo Google Badge.
 *
 * @package LandingBonus
 */

defined( 'ABSPATH' ) || exit;

/**
 * Clase Landing_Bonus_Module_Google_Badge
 */
class Landing_Bonus_Module_Google_Badge {

	/**
	 * Inicializa el módulo.
	 */
	public static function init(): void {
		// El shortcode se registra en Landing_Bonus_Shortcodes.
	}

	/**
	 * Renderiza el shortcode del badge Google.
	 *
	 * @param array<string, string> $atts Atributos del shortcode.
	 * @return string
	 */
	public static function render_shortcode( array $atts = array() ): string {
		$settings = landing_bonus_get_settings();
		$defaults = $settings['google_badge'] ?? array();

		$atts = shortcode_atts(
			array(
				'prefix_text'       => $defaults['prefix_text'] ?? 'mas de',
				'customer_count'    => $defaults['customer_count'] ?? '5.000',
				'phrase_text'       => $defaults['phrase_text'] ?? 'clientes felices',
				'show_heading'      => ! empty( $defaults['show_heading'] ) ? 'true' : 'false',
				'heading_text'      => $defaults['heading_text'] ?? '',
				'heading_font_size' => $defaults['heading_font_size'] ?? '24px',
				'phrase_font_size'  => $defaults['phrase_font_size'] ?? '16px',
				'enable_animation'  => ! empty( $defaults['enable_animation'] ) ? 'true' : 'false',
			),
			$atts,
			'landing_bonus_google_badge'
		);

		wp_enqueue_style( 'landing-bonus-google-badge' );

		$show_heading     = filter_var( $atts['show_heading'], FILTER_VALIDATE_BOOLEAN );
		$enable_animation = filter_var( $atts['enable_animation'], FILTER_VALIDATE_BOOLEAN );

		ob_start();
		?>
		<div
			class="landing-bonus-google-badge<?php echo $enable_animation ? ' landing-bonus-google-badge--animated' : ''; ?>"
			data-landing-bonus-google-badge
		>
			<?php if ( $show_heading && ! empty( $atts['heading_text'] ) ) : ?>
				<h3
					class="landing-bonus-google-badge__heading"
					style="font-size: <?php echo esc_attr( $atts['heading_font_size'] ); ?>;"
				>
					<?php echo esc_html( $atts['heading_text'] ); ?>
				</h3>
			<?php endif; ?>
			<div class="landing-bonus-google-badge__stars" aria-hidden="true">
				<?php for ( $i = 0; $i < 5; $i++ ) : ?>
					<svg class="landing-bonus-google-badge__star" viewBox="0 0 24 24" width="24" height="24">
						<path fill="currentColor" d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.2 22 12 18.56 5.8 22l1.2-7.86-5-4.87 7.1-1.01L12 2z"/>
					</svg>
				<?php endfor; ?>
			</div>
			<p
				class="landing-bonus-google-badge__phrase"
				style="font-size: <?php echo esc_attr( $atts['phrase_font_size'] ); ?>;"
			>
				<?php echo esc_html( $atts['prefix_text'] ); ?>
				<strong><?php echo esc_html( $atts['customer_count'] ); ?></strong>
				<?php echo esc_html( $atts['phrase_text'] ); ?>
			</p>
		</div>
		<?php
		return (string) ob_get_clean();
	}
}
