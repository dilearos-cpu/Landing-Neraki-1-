<?php
/**
 * AJAX para crear pedidos COD desde el modal.
 *
 * @package LandingBonus
 */

defined( 'ABSPATH' ) || exit;

/**
 * Clase Landing_Bonus_Ajax_Cod_Order
 */
class Landing_Bonus_Ajax_Cod_Order {

	/**
	 * Inicializa hooks AJAX.
	 */
	public static function init(): void {
		add_action( 'wp_ajax_landing_bonus_create_cod_order', array( __CLASS__, 'handle' ) );
		add_action( 'wp_ajax_nopriv_landing_bonus_create_cod_order', array( __CLASS__, 'handle' ) );
	}

	/**
	 * Maneja la creación del pedido COD.
	 */
	public static function handle(): void {
		check_ajax_referer( 'landing_bonus_nonce', 'nonce' );

		$customer = array(
			'name'        => sanitize_text_field( wp_unslash( $_POST['name'] ?? '' ) ),
			'phone'       => sanitize_text_field( wp_unslash( $_POST['phone'] ?? '' ) ),
			'email'       => sanitize_email( wp_unslash( $_POST['email'] ?? '' ) ),
			'department'  => sanitize_text_field( wp_unslash( $_POST['department'] ?? '' ) ),
			'city'        => sanitize_text_field( wp_unslash( $_POST['city'] ?? '' ) ),
			'address'     => sanitize_textarea_field( wp_unslash( $_POST['address'] ?? '' ) ),
			'notes'       => sanitize_textarea_field( wp_unslash( $_POST['notes'] ?? '' ) ),
		);

		$raw_items = isset( $_POST['items'] ) ? wp_unslash( $_POST['items'] ) : '[]'; // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		$items     = json_decode( $raw_items, true );

		if ( ! is_array( $items ) || empty( $items ) ) {
			wp_send_json_error(
				array( 'message' => __( 'No hay productos en el pack.', 'landing-bonus' ) ),
				400
			);
		}

		$validation = self::validate_customer( $customer );
		if ( is_wp_error( $validation ) ) {
			wp_send_json_error( array( 'message' => $validation->get_error_message() ), 400 );
		}

		$cart_items = self::normalize_items( $items );
		if ( empty( $cart_items ) ) {
			wp_send_json_error(
				array( 'message' => __( 'Los productos del pack no son válidos.', 'landing-bonus' ) ),
				400
			);
		}

		/**
		 * Hook antes de crear el pedido COD.
		 *
		 * @param array<int, array<string, mixed>> $cart_items Datos del pack.
		 * @param array<string, string>            $customer   Datos del cliente.
		 */
		do_action( 'landing_bonus_before_cod_order', $cart_items, $customer );

		$order_id = self::create_order( $cart_items, $customer );

		if ( is_wp_error( $order_id ) ) {
			wp_send_json_error( array( 'message' => $order_id->get_error_message() ), 500 );
		}

		/**
		 * Hook después de crear el pedido COD.
		 *
		 * @param int $order_id ID del pedido creado.
		 */
		do_action( 'landing_bonus_after_cod_order', $order_id );

		wp_send_json_success(
			array(
				'order_id' => $order_id,
				'message'  => sprintf(
					/* translators: %s: order number */
					__( 'Tu pedido #%s fue registrado. Te contactaremos para coordinar la entrega.', 'landing-bonus' ),
					$order_id
				),
			)
		);
	}

	/**
	 * Valida los datos del cliente.
	 *
	 * @param array<string, string> $customer Datos del cliente.
	 * @return true|WP_Error
	 */
	private static function validate_customer( array $customer ) {
		$settings = landing_bonus_get_settings();
		$cod      = $settings['cod_modal'] ?? array();

		if ( empty( $customer['name'] ) ) {
			return new WP_Error( 'missing_name', __( 'El nombre es obligatorio.', 'landing-bonus' ) );
		}

		if ( ! empty( $cod['require_phone'] ) && empty( $customer['phone'] ) ) {
			return new WP_Error( 'missing_phone', __( 'El teléfono es obligatorio.', 'landing-bonus' ) );
		}

		if ( ! empty( $cod['require_email'] ) && empty( $customer['email'] ) ) {
			return new WP_Error( 'missing_email', __( 'El email es obligatorio.', 'landing-bonus' ) );
		}

		if ( ! empty( $cod['require_address'] ) && empty( $customer['address'] ) ) {
			return new WP_Error( 'missing_address', __( 'La dirección es obligatoria.', 'landing-bonus' ) );
		}

		return true;
	}

	/**
	 * Normaliza los ítems del pack.
	 *
	 * @param array<int, mixed> $items Ítems recibidos.
	 * @return array<int, array<string, mixed>>
	 */
	private static function normalize_items( array $items ): array {
		$normalized = array();

		foreach ( $items as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}

			$product_id = absint( $item['product_id'] ?? 0 );
			$quantity   = max( 1, absint( $item['quantity'] ?? 1 ) );

			if ( $product_id <= 0 ) {
				continue;
			}

			$product = wc_get_product( $product_id );
			if ( ! $product ) {
				continue;
			}

			$normalized[] = array(
				'product_id' => $product_id,
				'quantity'   => $quantity,
				'product'    => $product,
			);
		}

		return $normalized;
	}

	/**
	 * Crea el pedido WooCommerce.
	 *
	 * @param array<int, array<string, mixed>> $cart_items Ítems del pack.
	 * @param array<string, string>            $customer   Datos del cliente.
	 * @return int|WP_Error
	 */
	private static function create_order( array $cart_items, array $customer ) {
		try {
			$order = wc_create_order();

			foreach ( $cart_items as $item ) {
				$order->add_product( $item['product'], $item['quantity'] );
			}

			$subtotal = (float) $order->get_subtotal();
			$settings = landing_bonus_get_settings();
			$cod      = $settings['cod_modal'] ?? array();

			$shipping_cost = (float) ( $cod['shipping_cost'] ?? 0 );
			$threshold     = (float) ( $cod['free_shipping_threshold'] ?? 0 );

			if ( $threshold > 0 && $subtotal >= $threshold ) {
				$shipping_cost = 0.0;
			}

			/**
			 * Filtra el costo de envío del modal COD.
			 *
			 * @param float $shipping_cost Costo calculado.
			 * @param float $subtotal      Subtotal del pedido.
			 */
			$shipping_cost = (float) apply_filters( 'landing_bonus_cod_shipping_cost', $shipping_cost, $subtotal );

			if ( $shipping_cost > 0 ) {
				$shipping_item = new WC_Order_Item_Shipping();
				$shipping_item->set_method_title( __( 'Envío', 'landing-bonus' ) );
				$shipping_item->set_total( $shipping_cost );
				$order->add_item( $shipping_item );
			}

			$name_parts = preg_split( '/\s+/', trim( $customer['name'] ), 2 );
			$order->set_billing_first_name( $name_parts[0] ?? '' );
			$order->set_billing_last_name( $name_parts[1] ?? '' );
			$order->set_billing_phone( $customer['phone'] );
			$order->set_billing_email( $customer['email'] ?: get_option( 'admin_email' ) );
			$order->set_billing_city( $customer['city'] );
			$order->set_billing_address_1( $customer['address'] );
			$order->set_billing_state( $customer['department'] );

			$order->set_shipping_first_name( $name_parts[0] ?? '' );
			$order->set_shipping_last_name( $name_parts[1] ?? '' );
			$order->set_shipping_city( $customer['city'] );
			$order->set_shipping_address_1( $customer['address'] );
			$order->set_shipping_state( $customer['department'] );

			if ( ! empty( $customer['notes'] ) ) {
				$order->set_customer_note( $customer['notes'] );
			}

			$order->set_payment_method( 'cod' );
			$order->set_payment_method_title( __( 'Contra entrega', 'landing-bonus' ) );
			$order->set_status( 'pending' );
			$order->update_meta_data( '_landing_bonus_source', 'pack' );
			$order->calculate_totals();
			$order->save();

			if ( ! empty( $cod['notification_email'] ) ) {
				$mailer = WC()->mailer();
				$mailer->customer_invoice( $order );
			}

			return $order->get_id();
		} catch ( Exception $exception ) {
			return new WP_Error(
				'order_creation_failed',
				$exception->getMessage()
			);
		}
	}
}
