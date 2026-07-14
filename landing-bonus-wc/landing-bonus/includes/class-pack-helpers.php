<?php
/**
 * Helpers para imágenes y productos del pack builder.
 *
 * @package LandingBonus
 */

defined( 'ABSPATH' ) || exit;

/**
 * Clase Landing_Bonus_Pack_Helpers
 */
class Landing_Bonus_Pack_Helpers {

	/**
	 * Prefiere AVIF/WebP si existe en disco.
	 *
	 * @param string $url URL de imagen.
	 * @return string
	 */
	public static function prefer_modern_image( string $url ): string {
		if ( ! $url ) {
			return $url;
		}

		$uploads = wp_get_upload_dir();
		if ( empty( $uploads['baseurl'] ) || empty( $uploads['basedir'] ) ) {
			return $url;
		}

		if ( 0 !== strpos( $url, $uploads['baseurl'] ) ) {
			return $url;
		}

		$rel  = substr( $url, strlen( $uploads['baseurl'] ) );
		$path = $uploads['basedir'] . $rel;

		foreach ( array( 'avif', 'webp' ) as $ext ) {
			$candidate = preg_replace( '/\.(jpe?g|png|webp|avif)$/i', '.' . $ext, $path );
			if ( $candidate && $candidate !== $path && file_exists( $candidate ) ) {
				return preg_replace( '/\.(jpe?g|png|webp|avif)$/i', '.' . $ext, $url );
			}
		}

		return $url;
	}

	/**
	 * URL de imagen optimizada para el modal del pack.
	 *
	 * @param int $attachment_id ID del adjunto.
	 * @return string
	 */
	public static function small_image_url( int $attachment_id ): string {
		if ( ! $attachment_id ) {
			return '';
		}

		$url = wp_get_attachment_image_url( $attachment_id, 'medium' );
		if ( ! $url ) {
			$url = wp_get_attachment_image_url( $attachment_id, 'woocommerce_thumbnail' );
		}
		if ( ! $url ) {
			$url = wp_get_attachment_image_url( $attachment_id, 'woocommerce_gallery_thumbnail' );
		}
		if ( ! $url ) {
			$url = wp_get_attachment_image_url( $attachment_id, 'thumbnail' );
		}

		return $url ? self::prefer_modern_image( $url ) : '';
	}

	/**
	 * Obtiene productos para el pack según categoría.
	 *
	 * @param array<string, mixed> $pack Configuración del pack.
	 * @return array<int, array<string, mixed>>
	 */
	public static function get_pack_products( array $pack ): array {
		if ( ! function_exists( 'wc_get_products' ) ) {
			return array();
		}

		$cat_id = absint( $pack['cat_id'] ?? 0 );
		$term   = $cat_id ? get_term( $cat_id, 'product_cat' ) : null;
		$slug   = ( $term && ! is_wp_error( $term ) ) ? $term->slug : '';

		$query = array(
			'type'         => 'variable' === ( $pack['type'] ?? '' ) ? array( 'simple', 'variable' ) : array( 'simple' ),
			'status'       => 'publish',
			'stock_status' => 'instock',
			'limit'        => 100,
			'orderby'      => 'title',
			'order'        => 'ASC',
			'return'       => 'objects',
		);

		if ( $slug ) {
			$query['category'] = array( $slug );
		}

		$products = wc_get_products( $query );
		$data     = array();

		foreach ( $products as $product ) {
			$img = get_the_post_thumbnail_url( $product->get_id(), 'woocommerce_thumbnail' );
			if ( ! $img ) {
				$img = wc_placeholder_img_src( 'woocommerce_thumbnail' );
			}

			$data[] = array(
				'id'          => $product->get_id(),
				'name'        => $product->get_name(),
				'img'         => self::prefer_modern_image( (string) $img ),
				'is_variable' => $product->is_type( 'variable' ),
				'price'       => (float) wc_get_price_to_display( $product ),
			);
		}

		return $data;
	}

	/**
	 * Resuelve selección del pack a ítems con precio para el modal COD.
	 *
	 * @param array<int, mixed> $selection Selección del usuario.
	 * @return array<int, array<string, mixed>>
	 */
	public static function resolve_selection( array $selection ): array {
		$items = array();

		foreach ( $selection as $entry ) {
			$variation_id = 0;
			$product_id   = 0;

			if ( is_array( $entry ) ) {
				$product_id   = absint( $entry['product_id'] ?? 0 );
				$variation_id = absint( $entry['variation_id'] ?? 0 );
			} else {
				$product_id = absint( $entry );
			}

			$product = $variation_id ? wc_get_product( $variation_id ) : wc_get_product( $product_id );
			if ( ! $product ) {
				continue;
			}

			$items[] = array(
				'product_id'   => $variation_id ? (int) $product->get_parent_id() : $product_id,
				'variation_id' => $variation_id,
				'quantity'     => 1,
				'name'         => $product->get_name(),
				'price'        => (float) wc_get_price_to_display( $product ),
			);
		}

		return $items;
	}
}
