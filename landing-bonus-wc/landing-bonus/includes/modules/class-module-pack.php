<?php
/**
 * Módulo pack builder con shortcodes múltiples.
 *
 * @package LandingBonus
 */

defined( 'ABSPATH' ) || exit;

/**
 * Clase Landing_Bonus_Module_Pack
 */
class Landing_Bonus_Module_Pack {

	/**
	 * Instancias de pack en la página actual.
	 *
	 * @var array<int, array<string, mixed>>
	 */
	private static array $boot_instances = array();

	/**
	 * Inicializa el módulo.
	 */
	public static function init(): void {
		add_action( 'init', array( __CLASS__, 'register_shortcodes' ), 20 );
		add_action( 'wp_footer', array( __CLASS__, 'print_footer_assets' ), 99 );
	}

	/**
	 * Registra shortcodes dinámicos.
	 */
	public static function register_shortcodes(): void {
		add_shortcode( 'landing_bonus_pack', array( __CLASS__, 'render_shortcode' ) );

		foreach ( Landing_Bonus_Pack_Manager::enabled() as $pack ) {
			$tag = sanitize_key( $pack['shortcode'] ?? '' );
			if ( $tag && $tag !== 'landing_bonus_pack' ) {
				add_shortcode( $tag, static function ( $atts = array() ) use ( $pack ) {
					$atts = is_array( $atts ) ? $atts : array();
					$atts['id'] = $pack['id'];
					return Landing_Bonus_Module_Pack::render_shortcode( $atts );
				} );
			}
		}
	}

	/**
	 * Renderiza el shortcode del pack.
	 *
	 * @param array<string, string> $atts Atributos.
	 * @return string
	 */
	public static function render_shortcode( array $atts = array() ): string {
		if ( ! function_exists( 'wc_get_products' ) ) {
			return '';
		}

		$atts = shortcode_atts(
			array(
				'id' => '',
			),
			$atts,
			'landing_bonus_pack'
		);

		$pack = Landing_Bonus_Pack_Manager::get( sanitize_key( $atts['id'] ) );
		if ( ! $pack || empty( $pack['enabled'] ) ) {
			return '';
		}

		$instance_id = $pack['id'] . '-' . wp_unique_id();
		$products      = Landing_Bonus_Pack_Helpers::get_pack_products( $pack );
		$slots         = max( 1, absint( $pack['slots'] ?? 4 ) );
		$columns       = max( 1, absint( $pack['slot_columns'] ?? 4 ) );

		self::$boot_instances[] = array(
			'instanceId' => $instance_id,
			'packId'     => $pack['id'],
			'products'   => $products,
			'config'     => array(
				'ajaxUrl'       => admin_url( 'admin-ajax.php' ),
				'slots'         => $slots,
				'perPage'       => max( 1, absint( $pack['per_page'] ?? 20 ) ),
				'type'          => $pack['type'] ?? 'simple',
				'checkoutMode'  => $pack['checkout_mode'] ?? 'cod_modal',
				'checkoutUrl'   => $pack['checkout_url'] ?? '/finaliza-compra/',
				'countdownId'   => $pack['countdown_id'] ?? '',
			),
		);

		wp_enqueue_style( 'landing-bonus-pack' );
		wp_enqueue_script( 'landing-bonus-pack' );

		if ( 'cod_modal' === ( $pack['checkout_mode'] ?? 'cod_modal' ) && Landing_Bonus::is_module_enabled( 'cod_modal' ) ) {
			wp_enqueue_style( 'landing-bonus-cod-modal' );
			wp_enqueue_script( 'landing-bonus-cod-modal' );
		}

		ob_start();
		?>
		<div
			class="landing-bonus-pack-ui pack-ui"
			data-landing-bonus-pack
			data-pack-instance="<?php echo esc_attr( $instance_id ); ?>"
			data-pack-id="<?php echo esc_attr( $pack['id'] ); ?>"
			data-pack-type="<?php echo esc_attr( $pack['type'] ?? 'simple' ); ?>"
		>
			<div class="landing-bonus-pack-slots pack-slots" style="grid-template-columns:repeat(<?php echo esc_attr( (string) $columns ); ?>,1fr)">
				<?php for ( $i = 1; $i <= $slots; $i++ ) : ?>
					<div class="landing-bonus-pack-slot slot" data-slot="<?php echo esc_attr( (string) $i ); ?>">+</div>
				<?php endfor; ?>
			</div>
			<div class="landing-bonus-pack-actions pack-actions">
				<button type="button" class="landing-bonus-pack-buy pack-buy" data-landing-bonus-pack-buy>
					<?php esc_html_e( 'Comprar ahora', 'landing-bonus' ); ?>
				</button>
				<button type="button" class="landing-bonus-pack-reset pack-reset" data-landing-bonus-pack-reset>
					<?php esc_html_e( 'Borrar todo', 'landing-bonus' ); ?>
				</button>
			</div>
		</div>
		<?php
		return (string) ob_get_clean();
	}

	/**
	 * Imprime modales compartidos y boot JSON en el footer.
	 */
	public static function print_footer_assets(): void {
		if ( empty( self::$boot_instances ) ) {
			return;
		}

		$has_variable = false;
		foreach ( self::$boot_instances as $instance ) {
			if ( 'variable' === ( $instance['config']['type'] ?? '' ) ) {
				$has_variable = true;
				break;
			}
		}
		?>
		<div id="landing-bonus-pack-modal" class="landing-bonus-pack-modal pack-modal" hidden>
			<div class="landing-bonus-pack-modal__content modal-content">
				<button type="button" class="landing-bonus-pack-modal__close close" data-pack-modal-close aria-label="<?php esc_attr_e( 'Cerrar', 'landing-bonus' ); ?>">&#10005;</button>
				<div class="landing-bonus-pack-modal__products products" data-pack-products></div>
			</div>
		</div>
		<?php if ( $has_variable ) : ?>
		<div id="landing-bonus-pack-variations-modal" class="landing-bonus-pack-variations-modal pack-variations-modal" hidden>
			<div class="landing-bonus-pack-modal__content modal-content">
				<button type="button" class="landing-bonus-pack-modal__close close-var" data-pack-var-close aria-label="<?php esc_attr_e( 'Cerrar', 'landing-bonus' ); ?>">&#10005;</button>
				<div id="landing-bonus-variation-content" data-pack-variation-content></div>
			</div>
		</div>
		<?php endif; ?>
		<script type="application/json" id="landing-bonus-pack-boot"><?php echo wp_json_encode( self::$boot_instances ); ?></script>
		<?php
	}

	/**
	 * Comprueba si hay packs en la página.
	 */
	public static function has_instances(): bool {
		return ! empty( self::$boot_instances );
	}
}
