<?php
/**
 * Frontend y shortcode.
 *
 * @package DiegoArangoSocialProof
 */

defined( 'ABSPATH' ) || exit;

/**
 * Clase DASP_Frontend
 */
class DASP_Frontend {

	/**
	 * IDs de shortcodes activos en la página actual.
	 *
	 * @var array<int, string>
	 */
	private static $active_ids = array();

	/**
	 * Si los assets ya fueron encolados.
	 *
	 * @var bool
	 */
	private static $assets_enqueued = false;

	/**
	 * Inicializa hooks del frontend.
	 */
	public static function init() {
		add_shortcode( 'dasp_social_proof', array( __CLASS__, 'render_shortcode' ) );
		add_action( 'wp_footer', array( __CLASS__, 'enqueue_assets' ), 5 );
	}

	/**
	 * Renderiza el shortcode.
	 *
	 * @param array<string, string> $atts Atributos del shortcode.
	 * @return string
	 */
	public static function render_shortcode( $atts ) {
		$atts = shortcode_atts(
			array(
				'id' => '',
			),
			$atts,
			'dasp_social_proof'
		);

		$id = sanitize_text_field( $atts['id'] );
		if ( empty( $id ) ) {
			return '';
		}

		$config = DASP_Shortcode_Manager::get_by_id( $id );
		if ( ! $config || empty( $config['enabled'] ) ) {
			return '';
		}

		if ( ! in_array( $id, self::$active_ids, true ) ) {
			self::$active_ids[] = $id;
		}

		$container_id = 'dasp-container-' . esc_attr( $id );

		return sprintf(
			'<div id="%1$s" class="dasp-shortcode-container" data-dasp-id="%2$s" aria-live="polite"></div>',
			esc_attr( $container_id ),
			esc_attr( $id )
		);
	}

	/**
	 * Encola CSS y JS del frontend.
	 */
	public static function enqueue_assets() {
		if ( self::$assets_enqueued || empty( self::$active_ids ) ) {
			return;
		}

		wp_enqueue_style(
			'dasp-frontend',
			DASP_PLUGIN_URL . 'assets/css/social-proof.css',
			array(),
			DASP_VERSION
		);

		wp_enqueue_script(
			'dasp-frontend',
			DASP_PLUGIN_URL . 'assets/js/social-proof.js',
			array(),
			DASP_VERSION,
			true
		);

		$configs = array();
		foreach ( self::$active_ids as $id ) {
			$config = DASP_Shortcode_Manager::get_by_id( $id );
			if ( $config && ! empty( $config['enabled'] ) ) {
				$configs[ $id ] = DASP_Shortcode_Manager::prepare_frontend_config( $config );
			}
		}

		wp_localize_script(
			'dasp-frontend',
			'daspSettings',
			array(
				'configs' => $configs,
				'i18n'    => array(
					'purchased' => __( 'ha comprado un', 'diego-arango-social-proof' ),
					'ago'       => __( 'hace', 'diego-arango-social-proof' ),
					'in'        => __( 'en', 'diego-arango-social-proof' ),
					'verified'  => __( 'Compra verificada', 'diego-arango-social-proof' ),
				),
			)
		);

		self::$assets_enqueued = true;
	}
}
