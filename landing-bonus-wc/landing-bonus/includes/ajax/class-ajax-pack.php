<?php
/**
 * AJAX del pack builder.
 *
 * @package LandingBonus
 */

defined( 'ABSPATH' ) || exit;

/**
 * Clase Landing_Bonus_Ajax_Pack
 */
class Landing_Bonus_Ajax_Pack {

	/**
	 * Inicializa hooks AJAX.
	 */
	public static function init(): void {
		add_action( 'wp_ajax_landing_bonus_pack_get_vars', array( __CLASS__, 'get_vars' ) );
		add_action( 'wp_ajax_nopriv_landing_bonus_pack_get_vars', array( __CLASS__, 'get_vars' ) );
		add_action( 'wp_ajax_landing_bonus_pack_resolve_items', array( __CLASS__, 'resolve_items' ) );
		add_action( 'wp_ajax_nopriv_landing_bonus_pack_resolve_items', array( __CLASS__, 'resolve_items' ) );
		add_action( 'wp_ajax_landing_bonus_pack_add_cart', array( __CLASS__, 'add_cart' ) );
		add_action( 'wp_ajax_nopriv_landing_bonus_pack_add_cart', array( __CLASS__, 'add_cart' ) );
	}

	/**
	 * Devuelve variaciones de un producto variable.
	 */
	public static function get_vars(): void {
		$product_id = isset( $_POST['product_id'] ) ? absint( $_POST['product_id'] ) : 0;
		if ( ! $product_id ) {
			wp_send_json( array( 'error' => true ) );
		}

		$cache_key = 'landing_bonus_pack_vars_' . $product_id;
		$cached    = get_transient( $cache_key );
		if ( false !== $cached && is_array( $cached ) ) {
			wp_send_json( $cached );
		}

		$product = wc_get_product( $product_id );
		if ( ! $product || ! $product->is_type( 'variable' ) ) {
			wp_send_json( array( 'error' => true ) );
		}

		$image_id = (int) $product->get_image_id();
		$image    = $image_id ? Landing_Bonus_Pack_Helpers::small_image_url( $image_id ) : '';
		if ( ! $image ) {
			$image = Landing_Bonus_Pack_Helpers::prefer_modern_image( (string) wc_placeholder_img_src( 'woocommerce_thumbnail' ) );
		}

		$color_attr = '';
		foreach ( array_keys( $product->get_variation_attributes() ) as $attr_key ) {
			$low = strtolower( $attr_key );
			if ( false !== strpos( $low, 'color' ) || false !== strpos( $low, 'colour' ) || false !== strpos( $low, 'colo' ) ) {
				$color_attr = $attr_key;
				break;
			}
		}
		if ( ! $color_attr ) {
			foreach ( array_keys( $product->get_variation_attributes() ) as $attr_key ) {
				$low = strtolower( $attr_key );
				if ( false === strpos( $low, 'size' ) && false === strpos( $low, 'talla' ) ) {
					$color_attr = $attr_key;
					break;
				}
			}
		}
		$color_key = $color_attr ? 'attribute_' . sanitize_title( $color_attr ) : '';

		$attributes = array();
		foreach ( $product->get_variation_attributes() as $attr_name => $options ) {
			$key    = 'attribute_' . sanitize_title( $attr_name );
			$opts   = array();
			$is_tax = taxonomy_exists( $attr_name );
			foreach ( (array) $options as $opt ) {
				$name = $opt;
				if ( $is_tax ) {
					$term = get_term_by( 'slug', $opt, $attr_name );
					if ( $term && ! is_wp_error( $term ) ) {
						$name = $term->name;
					}
				}
				$opts[] = array(
					'slug' => $opt,
					'name' => $name,
				);
			}
			$attributes[] = array(
				'key'     => $key,
				'label'   => wc_attribute_label( $attr_name ),
				'options' => $opts,
			);
		}

		$variations      = array();
		$second_by_color = array();
		$by_variation    = array();

		if ( class_exists( 'WC_VSI_Frontend' ) ) {
			$payload = WC_VSI_Frontend::build_seconds_payload( $product_id );
			if ( ! is_wp_error( $payload ) && is_array( $payload ) ) {
				$second_by_color = isset( $payload['second_by_color'] ) ? (array) $payload['second_by_color'] : array();
				$by_variation    = isset( $payload['by_variation'] ) ? (array) $payload['by_variation'] : array();
			}
		}

		foreach ( $product->get_children() as $variation_id ) {
			$variation = wc_get_product( $variation_id );
			if ( ! $variation || ! $variation->exists() || 'publish' !== get_post_status( $variation_id ) ) {
				continue;
			}

			$img_id  = $variation->get_image_id();
			$var_img = $img_id ? Landing_Bonus_Pack_Helpers::small_image_url( $img_id ) : $image;
			if ( ! $var_img ) {
				$var_img = $image;
			}

			$second_img = isset( $by_variation[ (string) $variation_id ] ) ? $by_variation[ (string) $variation_id ] : '';
			if ( ! $second_img ) {
				$second_id = (int) get_post_meta( $variation_id, '_wc_vsi_second_image_id', true );
				if ( $second_id ) {
					$second_img = Landing_Bonus_Pack_Helpers::small_image_url( $second_id );
				}
			} else {
				$second_img = Landing_Bonus_Pack_Helpers::prefer_modern_image( $second_img );
			}

			$assoc = array();
			foreach ( $variation->get_variation_attributes() as $key => $value ) {
				$assoc[ $key ] = is_string( $value ) ? rawurldecode( $value ) : $value;
			}

			$color_label = $color_attr ? (string) $variation->get_attribute( $color_attr ) : '';
			$color_raw   = ( $color_key && isset( $assoc[ $color_key ] ) ) ? (string) $assoc[ $color_key ] : '';
			$color_value = $color_label ? $color_label : $color_raw;

			if ( $second_img && $color_value ) {
				$second_by_color[ $color_value ]                 = $second_img;
				$second_by_color[ sanitize_title( $color_value ) ] = $second_img;
				if ( $color_raw ) {
					$second_by_color[ $color_raw ]                 = $second_img;
					$second_by_color[ sanitize_title( $color_raw ) ] = $second_img;
				}
			}

			$variations[] = array(
				'variation_id'     => $variation_id,
				'parent_id'        => $product_id,
				'in_stock'         => $variation->is_in_stock(),
				'image'            => $var_img ? $var_img : $image,
				'second_image'     => $second_img ? $second_img : '',
				'color_value'      => $color_value,
				'attributes_assoc' => $assoc,
				'price'            => (float) wc_get_price_to_display( $variation ),
			);
		}

		foreach ( $variations as &$row ) {
			if ( ! empty( $row['second_image'] ) || empty( $row['color_value'] ) ) {
				continue;
			}
			if ( ! empty( $second_by_color[ $row['color_value'] ] ) ) {
				$row['second_image'] = $second_by_color[ $row['color_value'] ];
			} elseif ( ! empty( $second_by_color[ sanitize_title( $row['color_value'] ) ] ) ) {
				$row['second_image'] = $second_by_color[ sanitize_title( $row['color_value'] ) ];
			}
		}
		unset( $row );

		$out = array(
			'name'            => $product->get_name(),
			'image'           => $image,
			'color_key'       => $color_key,
			'second_by_color' => $second_by_color,
			'attributes'      => $attributes,
			'variations'      => $variations,
		);

		set_transient( $cache_key, $out, 6 * HOUR_IN_SECONDS );
		wp_send_json( $out );
	}

	/**
	 * Resuelve selección a ítems con precio para el modal COD.
	 */
	public static function resolve_items(): void {
		$raw = isset( $_POST['ids'] ) ? wp_unslash( $_POST['ids'] ) : '[]'; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$ids = json_decode( $raw, true );

		if ( ! is_array( $ids ) || empty( $ids ) ) {
			wp_send_json_error( array( 'message' => __( 'Sin productos seleccionados.', 'landing-bonus' ) ) );
		}

		$items = Landing_Bonus_Pack_Helpers::resolve_selection( $ids );
		if ( empty( $items ) ) {
			wp_send_json_error( array( 'message' => __( 'No se pudieron resolver los productos.', 'landing-bonus' ) ) );
		}

		wp_send_json_success( array( 'items' => $items ) );
	}

	/**
	 * Agrega pack al carrito (modo redirect legacy).
	 */
	public static function add_cart(): void {
		if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
			wp_send_json_error( array( 'message' => __( 'Carrito no disponible.', 'landing-bonus' ) ) );
		}

		if ( null === WC()->cart ) {
			wc_load_cart();
		}

		WC()->cart->empty_cart();

		$raw = isset( $_POST['ids'] ) ? wp_unslash( $_POST['ids'] ) : '[]'; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$ids = json_decode( $raw, true );

		if ( ! is_array( $ids ) || empty( $ids ) ) {
			wp_send_json_error( array( 'message' => __( 'Sin productos.', 'landing-bonus' ) ) );
		}

		foreach ( $ids as $item ) {
			if ( is_array( $item ) ) {
				$product_id   = absint( $item['product_id'] ?? 0 );
				$variation_id = absint( $item['variation_id'] ?? 0 );
				if ( $product_id && $variation_id ) {
					WC()->cart->add_to_cart( $product_id, 1, $variation_id );
				}
			} else {
				$id = absint( $item );
				if ( $id ) {
					WC()->cart->add_to_cart( $id, 1 );
				}
			}
		}

		WC()->cart->calculate_totals();
		wp_send_json_success();
	}
}
