<?php
/**
 * Panel de administración.
 *
 * @package DiegoArangoSocialProof
 */

defined( 'ABSPATH' ) || exit;

/**
 * Clase DASP_Admin
 */
class DASP_Admin {

	/**
	 * Inicializa hooks del admin.
	 */
	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'register_menu' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_assets' ) );
		add_action( 'admin_post_dasp_save_shortcode', array( __CLASS__, 'handle_save' ) );
		add_action( 'admin_post_dasp_delete_shortcode', array( __CLASS__, 'handle_delete' ) );
	}

	/**
	 * Registra el menú en WooCommerce.
	 */
	public static function register_menu() {
		add_submenu_page(
			'woocommerce',
			__( 'Social Proof Boost', 'diego-arango-social-proof' ),
			__( 'Social Proof Boost', 'diego-arango-social-proof' ),
			'manage_woocommerce',
			'dasp-social-proof',
			array( __CLASS__, 'render_page' )
		);
	}

	/**
	 * Encola estilos del admin.
	 *
	 * @param string $hook Hook de la página actual.
	 */
	public static function enqueue_assets( $hook ) {
		if ( 'woocommerce_page_dasp-social-proof' !== $hook ) {
			return;
		}

		wp_enqueue_style(
			'dasp-admin',
			DASP_PLUGIN_URL . 'assets/css/admin.css',
			array(),
			DASP_VERSION
		);
	}

	/**
	 * Maneja el guardado del formulario.
	 */
	public static function handle_save() {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_die( esc_html__( 'No tienes permisos.', 'diego-arango-social-proof' ) );
		}

		check_admin_referer( 'dasp_save_shortcode' );

		$data = array(
			'id'               => isset( $_POST['dasp_id'] ) ? sanitize_text_field( wp_unslash( $_POST['dasp_id'] ) ) : '',
			'title'            => isset( $_POST['dasp_title'] ) ? sanitize_text_field( wp_unslash( $_POST['dasp_title'] ) ) : '',
			'pack_prefix'      => isset( $_POST['dasp_pack_prefix'] ) ? sanitize_text_field( wp_unslash( $_POST['dasp_pack_prefix'] ) ) : 'pack de',
			'pack_name'        => isset( $_POST['dasp_pack_name'] ) ? sanitize_text_field( wp_unslash( $_POST['dasp_pack_name'] ) ) : '',
			'units'            => isset( $_POST['dasp_units'] ) ? absint( $_POST['dasp_units'] ) : 4,
			'enabled'          => isset( $_POST['dasp_enabled'] ) ? 1 : 0,
			'interval_min'     => isset( $_POST['dasp_interval_min'] ) ? absint( $_POST['dasp_interval_min'] ) : 8,
			'interval_max'     => isset( $_POST['dasp_interval_max'] ) ? absint( $_POST['dasp_interval_max'] ) : 15,
			'display_duration' => isset( $_POST['dasp_display_duration'] ) ? absint( $_POST['dasp_display_duration'] ) : 5,
			'position'         => isset( $_POST['dasp_position'] ) ? sanitize_text_field( wp_unslash( $_POST['dasp_position'] ) ) : 'bottom-left',
		);

		$id = DASP_Shortcode_Manager::save( $data );

		$redirect = add_query_arg(
			array(
				'page'    => 'dasp-social-proof',
				'message' => $id ? 'saved' : 'error',
				'edit'    => $id ? $id : '',
			),
			admin_url( 'admin.php' )
		);

		wp_safe_redirect( $redirect );
		exit;
	}

	/**
	 * Maneja la eliminación.
	 */
	public static function handle_delete() {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			wp_die( esc_html__( 'No tienes permisos.', 'diego-arango-social-proof' ) );
		}

		$id = isset( $_GET['id'] ) ? sanitize_text_field( wp_unslash( $_GET['id'] ) ) : '';
		check_admin_referer( 'dasp_delete_' . $id );

		if ( $id ) {
			DASP_Shortcode_Manager::delete( $id );
		}

		$redirect = add_query_arg(
			array(
				'page'    => 'dasp-social-proof',
				'message' => 'deleted',
			),
			admin_url( 'admin.php' )
		);

		wp_safe_redirect( $redirect );
		exit;
	}

	/**
	 * Renderiza la página de administración.
	 */
	public static function render_page() {
		if ( ! current_user_can( 'manage_woocommerce' ) ) {
			return;
		}

		$edit_id = isset( $_GET['edit'] ) ? sanitize_text_field( wp_unslash( $_GET['edit'] ) ) : '';
		$editing = $edit_id ? DASP_Shortcode_Manager::get_by_id( $edit_id ) : null;

		if ( ! $editing ) {
			$editing = array(
				'id'               => '',
				'title'            => '',
				'pack_prefix'      => 'pack de',
				'pack_name'        => 'bodys',
				'units'            => 4,
				'enabled'          => 1,
				'interval_min'     => 8,
				'interval_max'     => 15,
				'display_duration' => 5,
				'position'         => 'bottom-left',
			);
		}

		$shortcodes = DASP_Shortcode_Manager::get_all();
		$positions  = DASP_Data::get_positions();
		$message    = isset( $_GET['message'] ) ? sanitize_text_field( wp_unslash( $_GET['message'] ) ) : '';

		include DASP_PLUGIN_DIR . 'admin/views/admin-page.php';
	}
}
