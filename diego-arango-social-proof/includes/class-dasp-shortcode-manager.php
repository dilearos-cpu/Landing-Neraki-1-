<?php
/**
 * Gestión de configuraciones de shortcodes.
 *
 * @package DiegoArangoSocialProof
 */

defined( 'ABSPATH' ) || exit;

/**
 * Clase DASP_Shortcode_Manager
 */
class DASP_Shortcode_Manager {

	/**
	 * Obtiene todos los shortcodes guardados.
	 *
	 * @return array<int, array<string, mixed>>
	 */
	public static function get_all() {
		$items = get_option( DASP_OPTION_KEY, array() );
		return is_array( $items ) ? $items : array();
	}

	/**
	 * Obtiene un shortcode por ID.
	 *
	 * @param string $id ID del shortcode.
	 * @return array<string, mixed>|null
	 */
	public static function get_by_id( $id ) {
		foreach ( self::get_all() as $item ) {
			if ( isset( $item['id'] ) && $item['id'] === $id ) {
				return $item;
			}
		}
		return null;
	}

	/**
	 * Guarda o actualiza un shortcode.
	 *
	 * @param array<string, mixed> $data Datos del shortcode.
	 * @return string|false ID guardado o false en error.
	 */
	public static function save( $data ) {
		$items = self::get_all();

		$sanitized = self::sanitize( $data );
		if ( empty( $sanitized['title'] ) || empty( $sanitized['pack_name'] ) ) {
			return false;
		}

		if ( empty( $sanitized['id'] ) ) {
			$sanitized['id'] = self::generate_id();
			$items[]         = $sanitized;
		} else {
			$found = false;
			foreach ( $items as $index => $item ) {
				if ( $item['id'] === $sanitized['id'] ) {
					$items[ $index ] = $sanitized;
					$found           = true;
					break;
				}
			}
			if ( ! $found ) {
				$items[] = $sanitized;
			}
		}

		update_option( DASP_OPTION_KEY, $items );
		return $sanitized['id'];
	}

	/**
	 * Elimina un shortcode por ID.
	 *
	 * @param string $id ID del shortcode.
	 * @return bool
	 */
	public static function delete( $id ) {
		$items   = self::get_all();
		$updated = array_filter(
			$items,
			function ( $item ) use ( $id ) {
				return ! ( isset( $item['id'] ) && $item['id'] === $id );
			}
		);

		update_option( DASP_OPTION_KEY, array_values( $updated ) );
		return true;
	}

	/**
	 * Genera un ID único.
	 *
	 * @return string
	 */
	public static function generate_id() {
		return 'dasp_' . wp_generate_password( 8, false, false );
	}

	/**
	 * Sanitiza los datos del formulario.
	 *
	 * @param array<string, mixed> $data Datos crudos.
	 * @return array<string, mixed>
	 */
	public static function sanitize( $data ) {
		$defaults = array(
			'id'               => '',
			'title'            => '',
			'pack_name'        => 'bodys',
			'units'            => 4,
			'enabled'          => 1,
			'interval_min'     => 8,
			'interval_max'     => 15,
			'display_duration' => 5,
			'position'         => 'bottom-left',
			'pack_prefix'      => 'pack de',
		);

		$data = wp_parse_args( $data, $defaults );

		$positions = array_keys( DASP_Data::get_positions() );

		return array(
			'id'               => sanitize_text_field( (string) $data['id'] ),
			'title'            => sanitize_text_field( (string) $data['title'] ),
			'pack_name'        => sanitize_text_field( (string) $data['pack_name'] ),
			'pack_prefix'      => sanitize_text_field( (string) $data['pack_prefix'] ),
			'units'            => max( 1, absint( $data['units'] ) ),
			'enabled'          => ! empty( $data['enabled'] ) ? 1 : 0,
			'interval_min'     => max( 3, absint( $data['interval_min'] ) ),
			'interval_max'     => max( 5, absint( $data['interval_max'] ) ),
			'display_duration' => max( 2, absint( $data['display_duration'] ) ),
			'position'         => in_array( $data['position'], $positions, true ) ? $data['position'] : 'bottom-left',
		);
	}

	/**
	 * Genera el texto del shortcode.
	 *
	 * @param string $id ID del shortcode.
	 * @return string
	 */
	public static function get_shortcode_text( $id ) {
		return '[dasp_social_proof id="' . esc_attr( $id ) . '"]';
	}

	/**
	 * Prepara la configuración para el frontend.
	 *
	 * @param array<string, mixed> $config Configuración del shortcode.
	 * @return array<string, mixed>
	 */
	public static function prepare_frontend_config( $config ) {
		return array(
			'id'               => $config['id'],
			'pack_name'        => $config['pack_name'],
			'pack_prefix'      => $config['pack_prefix'],
			'units'            => (int) $config['units'],
			'interval_min'     => (int) $config['interval_min'] * 1000,
			'interval_max'     => (int) $config['interval_max'] * 1000,
			'display_duration' => (int) $config['display_duration'] * 1000,
			'position'         => $config['position'],
			'cities'           => DASP_Data::get_cities(),
			'names'            => DASP_Data::get_names(),
			'time_phrases'     => DASP_Data::get_time_phrases(),
		);
	}
}
