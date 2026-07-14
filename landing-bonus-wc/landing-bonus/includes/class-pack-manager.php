<?php
/**
 * Gestor de configuraciones de pack shortcodes.
 *
 * @package LandingBonus
 */

defined( 'ABSPATH' ) || exit;

/**
 * Clase Landing_Bonus_Pack_Manager
 */
class Landing_Bonus_Pack_Manager {

	/**
	 * Obtiene packs por defecto.
	 *
	 * @return array<string, array<string, mixed>>
	 */
	public static function default_packs(): array {
		return array(
			'bodys4'    => array(
				'id'             => 'bodys4',
				'title'          => 'Pack Bodys x4',
				'shortcode'      => 'pack_bodys4',
				'enabled'        => true,
				'type'           => 'variable',
				'cat_id'         => 93,
				'slots'          => 4,
				'slot_columns'   => 4,
				'per_page'       => 20,
				'checkout_mode'  => 'cod_modal',
				'checkout_url'   => '/finaliza-compra/',
				'countdown_id'   => 'promo1',
			),
			'basicas10' => array(
				'id'             => 'basicas10',
				'title'          => 'Pack Básicas x10',
				'shortcode'      => 'pack_visual_rapido',
				'enabled'        => true,
				'type'           => 'simple',
				'cat_id'         => 87,
				'slots'          => 10,
				'slot_columns'   => 5,
				'per_page'       => 20,
				'checkout_mode'  => 'cod_modal',
				'checkout_url'   => '/finaliza-compra/',
				'countdown_id'   => 'promo1',
			),
		);
	}

	/**
	 * Obtiene todos los packs guardados.
	 *
	 * @return array<string, array<string, mixed>>
	 */
	public static function all(): array {
		$stored = get_option( LANDING_BONUS_PACKS_OPTION_KEY, array() );

		if ( ! is_array( $stored ) || empty( $stored ) ) {
			return self::default_packs();
		}

		return array_replace( self::default_packs(), $stored );
	}

	/**
	 * Obtiene un pack por ID.
	 *
	 * @param string $id ID del pack.
	 * @return array<string, mixed>|null
	 */
	public static function get( string $id ): ?array {
		$packs = self::all();

		return $packs[ $id ] ?? null;
	}

	/**
	 * Obtiene un pack por tag de shortcode legacy.
	 *
	 * @param string $tag Tag del shortcode.
	 * @return array<string, mixed>|null
	 */
	public static function get_by_shortcode( string $tag ): ?array {
		foreach ( self::all() as $pack ) {
			if ( ! empty( $pack['enabled'] ) && ( $pack['shortcode'] ?? '' ) === $tag ) {
				return $pack;
			}
		}

		return null;
	}

	/**
	 * Guarda o actualiza un pack.
	 *
	 * @param array<string, mixed> $data Datos del pack.
	 * @return string ID guardado.
	 */
	public static function save( array $data ): string {
		$packs = self::all();

		$id = sanitize_key( $data['id'] ?? '' );
		if ( ! $id ) {
			$id = 'pack_' . wp_generate_password( 6, false, false );
		}

		$packs[ $id ] = array(
			'id'             => $id,
			'title'          => sanitize_text_field( $data['title'] ?? '' ),
			'shortcode'      => sanitize_key( $data['shortcode'] ?? '' ),
			'enabled'        => ! empty( $data['enabled'] ),
			'type'           => in_array( $data['type'] ?? '', array( 'variable', 'simple' ), true ) ? $data['type'] : 'simple',
			'cat_id'         => absint( $data['cat_id'] ?? 0 ),
			'slots'          => max( 1, absint( $data['slots'] ?? 4 ) ),
			'slot_columns'   => max( 1, absint( $data['slot_columns'] ?? 4 ) ),
			'per_page'       => max( 1, absint( $data['per_page'] ?? 20 ) ),
			'checkout_mode'  => in_array( $data['checkout_mode'] ?? '', array( 'cod_modal', 'redirect' ), true ) ? $data['checkout_mode'] : 'cod_modal',
			'checkout_url'   => esc_url_raw( $data['checkout_url'] ?? '/finaliza-compra/' ),
			'countdown_id'   => sanitize_key( $data['countdown_id'] ?? '' ),
		);

		update_option( LANDING_BONUS_PACKS_OPTION_KEY, $packs );

		return $id;
	}

	/**
	 * Elimina un pack.
	 *
	 * @param string $id ID del pack.
	 */
	public static function delete( string $id ): void {
		$packs = self::all();
		unset( $packs[ $id ] );
		update_option( LANDING_BONUS_PACKS_OPTION_KEY, $packs );
	}

	/**
	 * Packs habilitados.
	 *
	 * @return array<string, array<string, mixed>>
	 */
	public static function enabled(): array {
		return array_filter(
			self::all(),
			static function ( $pack ) {
				return ! empty( $pack['enabled'] );
			}
		);
	}
}
