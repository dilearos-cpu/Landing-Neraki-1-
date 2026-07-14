<?php
/**
 * Template del panel de administración.
 *
 * @package LandingBonus
 *
 * @var string               $tab      Tab activa.
 * @var array<string, mixed> $settings Ajustes del plugin.
 */

defined( 'ABSPATH' ) || exit;

$tabs = Landing_Bonus_Admin_Settings::get_tabs();
?>
<div class="wrap landing-bonus-admin">
	<h1><?php esc_html_e( 'Landing Bonus', 'landing-bonus' ); ?></h1>

	<?php if ( isset( $_GET['updated'] ) ) : // phpcs:ignore WordPress.Security.NonceVerification.Recommended ?>
		<div class="notice notice-success is-dismissible">
			<p><?php esc_html_e( 'Ajustes guardados correctamente.', 'landing-bonus' ); ?></p>
		</div>
	<?php endif; ?>

	<?php if ( isset( $_GET['deleted'] ) ) : // phpcs:ignore WordPress.Security.NonceVerification.Recommended ?>
		<div class="notice notice-success is-dismissible">
			<p><?php esc_html_e( 'Pack eliminado.', 'landing-bonus' ); ?></p>
		</div>
	<?php endif; ?>

	<nav class="nav-tab-wrapper">
		<?php foreach ( $tabs as $tab_key => $tab_label ) : ?>
			<a
				href="<?php echo esc_url( add_query_arg( array( 'page' => 'landing-bonus', 'tab' => $tab_key ), admin_url( 'admin.php' ) ) ); ?>"
				class="nav-tab <?php echo $tab === $tab_key ? 'nav-tab-active' : ''; ?>"
			>
				<?php echo esc_html( $tab_label ); ?>
			</a>
		<?php endforeach; ?>
	</nav>

	<?php if ( 'shortcodes' === $tab ) : ?>
		<div class="landing-bonus-admin__panel">
			<h2><?php esc_html_e( 'Shortcodes disponibles', 'landing-bonus' ); ?></h2>
			<p><?php esc_html_e( 'Copia estos shortcodes en Elementor o en el editor de bloques.', 'landing-bonus' ); ?></p>
			<table class="widefat striped">
				<thead>
					<tr>
						<th><?php esc_html_e( 'Módulo', 'landing-bonus' ); ?></th>
						<th><?php esc_html_e( 'Shortcode', 'landing-bonus' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td><?php esc_html_e( 'Contador + barra', 'landing-bonus' ); ?></td>
						<td><code>[landing_bonus_countdown id="promo1" units="4" hours="24"]</code></td>
					</tr>
					<tr>
						<td><?php esc_html_e( 'Google Badge', 'landing-bonus' ); ?></td>
						<td><code>[landing_bonus_google_badge]</code></td>
					</tr>
					<tr>
						<td><?php esc_html_e( 'Botón flotante', 'landing-bonus' ); ?></td>
						<td><code>[landing_bonus_floating_button url="/mi-pagina" label="Compra aqui | Paga en casa"]</code></td>
					</tr>
					<tr>
						<td><?php esc_html_e( 'Prueba social', 'landing-bonus' ); ?></td>
						<td><code>[landing_bonus_social_proof pack_label="pack de básicas" units="10"]</code></td>
					</tr>
					<?php foreach ( Landing_Bonus_Pack_Manager::enabled() as $pack ) : ?>
						<tr>
							<td><?php echo esc_html( $pack['title'] ?? '' ); ?></td>
							<td>
								<code>[landing_bonus_pack id="<?php echo esc_attr( $pack['id'] ?? '' ); ?>"]</code>
								<?php if ( ! empty( $pack['shortcode'] ) ) : ?>
									<br><code>[<?php echo esc_html( $pack['shortcode'] ); ?>]</code>
								<?php endif; ?>
							</td>
						</tr>
					<?php endforeach; ?>
				</tbody>
			</table>
			<p>
				<?php esc_html_e( 'Al completar los slots y pulsar Comprar, se abre el modal COD (si checkout_mode = cod_modal). La barra de progreso se sincroniza vía LandingBonusCountdown.setSlotsFilled().', 'landing-bonus' ); ?>
			</p>
		</div>
	<?php elseif ( 'packs' === $tab ) : ?>
		<?php
		$packs       = Landing_Bonus_Pack_Manager::all();
		$edit_id     = isset( $_GET['pack_id'] ) ? sanitize_key( wp_unslash( $_GET['pack_id'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$editing     = $edit_id ? ( Landing_Bonus_Pack_Manager::get( $edit_id ) ?? array() ) : array();
		$is_editing  = ! empty( $editing );
		?>
		<div class="landing-bonus-admin__panel">
			<h2><?php esc_html_e( 'Packs configurados', 'landing-bonus' ); ?></h2>
			<table class="widefat striped">
				<thead>
					<tr>
						<th><?php esc_html_e( 'Título', 'landing-bonus' ); ?></th>
						<th><?php esc_html_e( 'Shortcode', 'landing-bonus' ); ?></th>
						<th><?php esc_html_e( 'Tipo', 'landing-bonus' ); ?></th>
						<th><?php esc_html_e( 'Slots', 'landing-bonus' ); ?></th>
						<th><?php esc_html_e( 'Checkout', 'landing-bonus' ); ?></th>
						<th><?php esc_html_e( 'Acciones', 'landing-bonus' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<?php foreach ( $packs as $pack ) : ?>
						<tr>
							<td><?php echo esc_html( $pack['title'] ?? '' ); ?></td>
							<td>
								<code>[landing_bonus_pack id="<?php echo esc_attr( $pack['id'] ?? '' ); ?>"]</code>
								<?php if ( ! empty( $pack['shortcode'] ) ) : ?>
									<br><code>[<?php echo esc_html( $pack['shortcode'] ); ?>]</code>
								<?php endif; ?>
							</td>
							<td><?php echo esc_html( $pack['type'] ?? '' ); ?></td>
							<td><?php echo esc_html( (string) ( $pack['slots'] ?? '' ) ); ?></td>
							<td><?php echo esc_html( $pack['checkout_mode'] ?? '' ); ?></td>
							<td>
								<a href="<?php echo esc_url( add_query_arg( array( 'page' => 'landing-bonus', 'tab' => 'packs', 'pack_id' => $pack['id'] ?? '' ), admin_url( 'admin.php' ) ) ); ?>"><?php esc_html_e( 'Editar', 'landing-bonus' ); ?></a>
								|
								<a href="<?php echo esc_url( wp_nonce_url( add_query_arg( array( 'action' => 'landing_bonus_delete_pack', 'pack_id' => $pack['id'] ?? '' ), admin_url( 'admin-post.php' ) ), 'landing_bonus_delete_pack' ) ); ?>" onclick="return confirm('<?php esc_attr_e( '¿Eliminar este pack?', 'landing-bonus' ); ?>');"><?php esc_html_e( 'Eliminar', 'landing-bonus' ); ?></a>
							</td>
						</tr>
					<?php endforeach; ?>
				</tbody>
			</table>
		</div>

		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" class="landing-bonus-admin__form">
			<?php wp_nonce_field( 'landing_bonus_save_pack' ); ?>
			<input type="hidden" name="action" value="landing_bonus_save_pack">
			<div class="landing-bonus-admin__panel">
				<h2><?php echo $is_editing ? esc_html__( 'Editar pack', 'landing-bonus' ) : esc_html__( 'Nuevo pack', 'landing-bonus' ); ?></h2>
				<table class="form-table">
					<tr>
						<th><label for="pack_id"><?php esc_html_e( 'ID interno', 'landing-bonus' ); ?></label></th>
						<td><input type="text" class="regular-text" id="pack_id" name="pack_id" value="<?php echo esc_attr( $editing['id'] ?? '' ); ?>" <?php echo $is_editing ? 'readonly' : ''; ?> placeholder="bodys4"></td>
					</tr>
					<tr>
						<th><label for="pack_title"><?php esc_html_e( 'Título', 'landing-bonus' ); ?></label></th>
						<td><input type="text" class="regular-text" id="pack_title" name="pack_title" value="<?php echo esc_attr( $editing['title'] ?? '' ); ?>"></td>
					</tr>
					<tr>
						<th><label for="pack_shortcode"><?php esc_html_e( 'Shortcode legacy', 'landing-bonus' ); ?></label></th>
						<td><input type="text" class="regular-text" id="pack_shortcode" name="pack_shortcode" value="<?php echo esc_attr( $editing['shortcode'] ?? '' ); ?>" placeholder="pack_bodys4"></td>
					</tr>
					<tr>
						<th><?php esc_html_e( 'Activo', 'landing-bonus' ); ?></th>
						<td><label><input type="checkbox" name="pack_enabled" <?php checked( ! isset( $editing['enabled'] ) || ! empty( $editing['enabled'] ) ); ?>> <?php esc_html_e( 'Habilitado', 'landing-bonus' ); ?></label></td>
					</tr>
					<tr>
						<th><label for="pack_type"><?php esc_html_e( 'Tipo', 'landing-bonus' ); ?></label></th>
						<td>
							<select id="pack_type" name="pack_type">
								<option value="variable" <?php selected( $editing['type'] ?? '', 'variable' ); ?>><?php esc_html_e( 'Variable (bodys)', 'landing-bonus' ); ?></option>
								<option value="simple" <?php selected( $editing['type'] ?? '', 'simple' ); ?>><?php esc_html_e( 'Simple (básicas)', 'landing-bonus' ); ?></option>
							</select>
						</td>
					</tr>
					<tr>
						<th><label for="pack_cat_id"><?php esc_html_e( 'ID categoría WC', 'landing-bonus' ); ?></label></th>
						<td><input type="number" id="pack_cat_id" name="pack_cat_id" value="<?php echo esc_attr( $editing['cat_id'] ?? 0 ); ?>" min="0"></td>
					</tr>
					<tr>
						<th><label for="pack_slots"><?php esc_html_e( 'Slots', 'landing-bonus' ); ?></label></th>
						<td><input type="number" id="pack_slots" name="pack_slots" value="<?php echo esc_attr( $editing['slots'] ?? 4 ); ?>" min="1"></td>
					</tr>
					<tr>
						<th><label for="pack_slot_columns"><?php esc_html_e( 'Columnas grid', 'landing-bonus' ); ?></label></th>
						<td><input type="number" id="pack_slot_columns" name="pack_slot_columns" value="<?php echo esc_attr( $editing['slot_columns'] ?? 4 ); ?>" min="1"></td>
					</tr>
					<tr>
						<th><label for="pack_per_page"><?php esc_html_e( 'Productos por página', 'landing-bonus' ); ?></label></th>
						<td><input type="number" id="pack_per_page" name="pack_per_page" value="<?php echo esc_attr( $editing['per_page'] ?? 20 ); ?>" min="1"></td>
					</tr>
					<tr>
						<th><label for="pack_checkout_mode"><?php esc_html_e( 'Modo checkout', 'landing-bonus' ); ?></label></th>
						<td>
							<select id="pack_checkout_mode" name="pack_checkout_mode">
								<option value="cod_modal" <?php selected( $editing['checkout_mode'] ?? '', 'cod_modal' ); ?>><?php esc_html_e( 'Modal COD express', 'landing-bonus' ); ?></option>
								<option value="redirect" <?php selected( $editing['checkout_mode'] ?? '', 'redirect' ); ?>><?php esc_html_e( 'Redirigir a checkout WC', 'landing-bonus' ); ?></option>
							</select>
						</td>
					</tr>
					<tr>
						<th><label for="pack_checkout_url"><?php esc_html_e( 'URL checkout (redirect)', 'landing-bonus' ); ?></label></th>
						<td><input type="text" class="regular-text" id="pack_checkout_url" name="pack_checkout_url" value="<?php echo esc_attr( $editing['checkout_url'] ?? '/finaliza-compra/' ); ?>"></td>
					</tr>
					<tr>
						<th><label for="pack_countdown_id"><?php esc_html_e( 'ID contador vinculado', 'landing-bonus' ); ?></label></th>
						<td><input type="text" class="regular-text" id="pack_countdown_id" name="pack_countdown_id" value="<?php echo esc_attr( $editing['countdown_id'] ?? '' ); ?>" placeholder="promo1"></td>
					</tr>
				</table>
				<?php submit_button( $is_editing ? __( 'Actualizar pack', 'landing-bonus' ) : __( 'Crear pack', 'landing-bonus' ) ); ?>
			</div>
		</form>
	<?php else : ?>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" class="landing-bonus-admin__form">
			<?php wp_nonce_field( 'landing_bonus_save_settings' ); ?>
			<input type="hidden" name="action" value="landing_bonus_save_settings">
			<input type="hidden" name="landing_bonus_tab" value="<?php echo esc_attr( $tab ); ?>">

			<?php if ( 'general' === $tab ) : ?>
				<div class="landing-bonus-admin__panel">
					<h2><?php esc_html_e( 'Módulos activos', 'landing-bonus' ); ?></h2>
					<?php
					$modules = $settings['modules'] ?? array();
					$labels  = array(
						'cod_modal'       => __( 'Checkout COD Modal', 'landing-bonus' ),
						'pack'            => __( 'Pack builder (bodys / básicas)', 'landing-bonus' ),
						'countdown'       => __( 'Barra progreso + contador 24h', 'landing-bonus' ),
						'google_badge'    => __( 'Recuadro estrellas Google', 'landing-bonus' ),
						'floating_button' => __( 'Botón flotante estilo RSI', 'landing-bonus' ),
						'social_proof'    => __( 'Popup prueba social', 'landing-bonus' ),
					);
					foreach ( $labels as $key => $label ) :
						?>
						<label>
							<input type="checkbox" name="module_<?php echo esc_attr( $key ); ?>" <?php checked( ! empty( $modules[ $key ] ) ); ?>>
							<?php echo esc_html( $label ); ?>
						</label><br>
					<?php endforeach; ?>
				</div>
			<?php elseif ( 'cod_modal' === $tab ) : ?>
				<?php $cod = $settings['cod_modal'] ?? array(); ?>
				<div class="landing-bonus-admin__panel">
					<h2><?php esc_html_e( 'Checkout COD Modal', 'landing-bonus' ); ?></h2>
					<table class="form-table">
						<tr>
							<th><label for="cod_title"><?php esc_html_e( 'Título', 'landing-bonus' ); ?></label></th>
							<td><input type="text" class="regular-text" id="cod_title" name="cod_title" value="<?php echo esc_attr( $cod['title'] ?? '' ); ?>"></td>
						</tr>
						<tr>
							<th><label for="cod_subtitle"><?php esc_html_e( 'Subtítulo', 'landing-bonus' ); ?></label></th>
							<td><input type="text" class="regular-text" id="cod_subtitle" name="cod_subtitle" value="<?php echo esc_attr( $cod['subtitle'] ?? '' ); ?>"></td>
						</tr>
						<tr>
							<th><label for="cod_iva_percent"><?php esc_html_e( '% IVA (solo UI)', 'landing-bonus' ); ?></label></th>
							<td><input type="number" id="cod_iva_percent" name="cod_iva_percent" value="<?php echo esc_attr( $cod['iva_percent'] ?? 19 ); ?>" min="0" max="100"></td>
						</tr>
						<tr>
							<th><label for="cod_shipping_cost"><?php esc_html_e( 'Costo envío fijo', 'landing-bonus' ); ?></label></th>
							<td><input type="number" id="cod_shipping_cost" name="cod_shipping_cost" value="<?php echo esc_attr( $cod['shipping_cost'] ?? 0 ); ?>" min="0"></td>
						</tr>
						<tr>
							<th><label for="cod_free_shipping_threshold"><?php esc_html_e( 'Umbral envío gratis', 'landing-bonus' ); ?></label></th>
							<td><input type="number" id="cod_free_shipping_threshold" name="cod_free_shipping_threshold" value="<?php echo esc_attr( $cod['free_shipping_threshold'] ?? 0 ); ?>" min="0"></td>
						</tr>
						<tr>
							<th><label for="cod_accent_color"><?php esc_html_e( 'Color acento', 'landing-bonus' ); ?></label></th>
							<td><input type="color" id="cod_accent_color" name="cod_accent_color" value="<?php echo esc_attr( $cod['accent_color'] ?? '#FFDE21' ); ?>"></td>
						</tr>
						<tr>
							<th><?php esc_html_e( 'Campos obligatorios', 'landing-bonus' ); ?></th>
							<td>
								<label><input type="checkbox" name="cod_require_phone" <?php checked( ! empty( $cod['require_phone'] ) ); ?>> <?php esc_html_e( 'Teléfono', 'landing-bonus' ); ?></label><br>
								<label><input type="checkbox" name="cod_require_email" <?php checked( ! empty( $cod['require_email'] ) ); ?>> <?php esc_html_e( 'Email', 'landing-bonus' ); ?></label><br>
								<label><input type="checkbox" name="cod_require_address" <?php checked( ! empty( $cod['require_address'] ) ); ?>> <?php esc_html_e( 'Dirección', 'landing-bonus' ); ?></label>
							</td>
						</tr>
						<tr>
							<th><label for="cod_notification_email"><?php esc_html_e( 'Email notificación', 'landing-bonus' ); ?></label></th>
							<td><input type="email" class="regular-text" id="cod_notification_email" name="cod_notification_email" value="<?php echo esc_attr( $cod['notification_email'] ?? '' ); ?>"></td>
						</tr>
					</table>
				</div>
			<?php elseif ( 'countdown' === $tab ) : ?>
				<?php $countdown = $settings['countdown'] ?? array(); ?>
				<div class="landing-bonus-admin__panel">
					<h2><?php esc_html_e( 'Contador y barra de progreso', 'landing-bonus' ); ?></h2>
					<table class="form-table">
						<tr>
							<th><label for="countdown_default_units"><?php esc_html_e( 'Unidades por defecto', 'landing-bonus' ); ?></label></th>
							<td><input type="number" id="countdown_default_units" name="countdown_default_units" value="<?php echo esc_attr( $countdown['default_units'] ?? 4 ); ?>" min="1"></td>
						</tr>
						<tr>
							<th><label for="countdown_default_hours"><?php esc_html_e( 'Horas por defecto', 'landing-bonus' ); ?></label></th>
							<td><input type="number" id="countdown_default_hours" name="countdown_default_hours" value="<?php echo esc_attr( $countdown['default_hours'] ?? 24 ); ?>" min="1"></td>
						</tr>
						<tr>
							<th><label for="countdown_progress_prefix"><?php esc_html_e( 'Prefijo progreso', 'landing-bonus' ); ?></label></th>
							<td><input type="text" class="regular-text" id="countdown_progress_prefix" name="countdown_progress_prefix" value="<?php echo esc_attr( $countdown['progress_prefix'] ?? '' ); ?>"></td>
						</tr>
						<tr>
							<th><label for="countdown_progress_suffix"><?php esc_html_e( 'Sufijo progreso', 'landing-bonus' ); ?></label></th>
							<td><input type="text" class="regular-text" id="countdown_progress_suffix" name="countdown_progress_suffix" value="<?php echo esc_attr( $countdown['progress_suffix'] ?? '' ); ?>"></td>
						</tr>
						<tr>
							<th><label for="countdown_completion_message"><?php esc_html_e( 'Mensaje al 100%', 'landing-bonus' ); ?></label></th>
							<td><input type="text" class="large-text" id="countdown_completion_message" name="countdown_completion_message" value="<?php echo esc_attr( $countdown['completion_message'] ?? '' ); ?>"></td>
						</tr>
						<tr>
							<th><?php esc_html_e( 'Colores barra', 'landing-bonus' ); ?></th>
							<td>
								<label><?php esc_html_e( 'Bajo', 'landing-bonus' ); ?> <input type="color" name="countdown_color_low" value="<?php echo esc_attr( $countdown['color_low'] ?? '#E53935' ); ?>"></label>
								<label><?php esc_html_e( 'Medio', 'landing-bonus' ); ?> <input type="color" name="countdown_color_mid" value="<?php echo esc_attr( $countdown['color_mid'] ?? '#F9A825' ); ?>"></label>
								<label><?php esc_html_e( 'Alto', 'landing-bonus' ); ?> <input type="color" name="countdown_color_high" value="<?php echo esc_attr( $countdown['color_high'] ?? '#2E7D32' ); ?>"></label>
							</td>
						</tr>
					</table>
				</div>
			<?php elseif ( 'google_badge' === $tab ) : ?>
				<?php $badge = $settings['google_badge'] ?? array(); ?>
				<div class="landing-bonus-admin__panel">
					<h2><?php esc_html_e( 'Google Badge', 'landing-bonus' ); ?></h2>
					<table class="form-table">
						<tr>
							<th><label for="badge_prefix_text"><?php esc_html_e( 'Texto prefijo', 'landing-bonus' ); ?></label></th>
							<td><input type="text" class="regular-text" id="badge_prefix_text" name="badge_prefix_text" value="<?php echo esc_attr( $badge['prefix_text'] ?? '' ); ?>"></td>
						</tr>
						<tr>
							<th><label for="badge_customer_count"><?php esc_html_e( 'Número clientes', 'landing-bonus' ); ?></label></th>
							<td><input type="text" class="regular-text" id="badge_customer_count" name="badge_customer_count" value="<?php echo esc_attr( $badge['customer_count'] ?? '' ); ?>"></td>
						</tr>
						<tr>
							<th><label for="badge_phrase_text"><?php esc_html_e( 'Frase', 'landing-bonus' ); ?></label></th>
							<td><input type="text" class="regular-text" id="badge_phrase_text" name="badge_phrase_text" value="<?php echo esc_attr( $badge['phrase_text'] ?? '' ); ?>"></td>
						</tr>
						<tr>
							<th><?php esc_html_e( 'Título opcional', 'landing-bonus' ); ?></th>
							<td>
								<label><input type="checkbox" name="badge_show_heading" <?php checked( ! empty( $badge['show_heading'] ) ); ?>> <?php esc_html_e( 'Mostrar título', 'landing-bonus' ); ?></label><br>
								<input type="text" class="regular-text" name="badge_heading_text" value="<?php echo esc_attr( $badge['heading_text'] ?? '' ); ?>">
							</td>
						</tr>
						<tr>
							<th><?php esc_html_e( 'Animación', 'landing-bonus' ); ?></th>
							<td><label><input type="checkbox" name="badge_enable_animation" <?php checked( ! empty( $badge['enable_animation'] ) ); ?>> <?php esc_html_e( 'Activar flotación leve', 'landing-bonus' ); ?></label></td>
						</tr>
					</table>
				</div>
			<?php elseif ( 'floating_button' === $tab ) : ?>
				<?php $float = $settings['floating_button'] ?? array(); ?>
				<div class="landing-bonus-admin__panel">
					<h2><?php esc_html_e( 'Botón flotante', 'landing-bonus' ); ?></h2>
					<table class="form-table">
						<tr>
							<th><label for="float_label"><?php esc_html_e( 'Texto botón', 'landing-bonus' ); ?></label></th>
							<td><input type="text" class="regular-text" id="float_label" name="float_label" value="<?php echo esc_attr( $float['label'] ?? '' ); ?>"></td>
						</tr>
						<tr>
							<th><label for="float_url"><?php esc_html_e( 'URL', 'landing-bonus' ); ?></label></th>
							<td><input type="url" class="regular-text" id="float_url" name="float_url" value="<?php echo esc_attr( $float['url'] ?? '' ); ?>"></td>
						</tr>
						<tr>
							<th><label for="float_position_mode"><?php esc_html_e( 'Modo posición', 'landing-bonus' ); ?></label></th>
							<td>
								<select id="float_position_mode" name="float_position_mode">
									<option value="fixed" <?php selected( $float['position_mode'] ?? '', 'fixed' ); ?>>fixed</option>
									<option value="fixed_floating" <?php selected( $float['position_mode'] ?? '', 'fixed_floating' ); ?>>fixed_floating</option>
								</select>
							</td>
						</tr>
						<tr>
							<th><label for="float_trigger"><?php esc_html_e( 'Trigger flotante', 'landing-bonus' ); ?></label></th>
							<td>
								<select id="float_trigger" name="float_trigger">
									<option value="pack_buy" <?php selected( $float['float_trigger'] ?? '', 'pack_buy' ); ?>>pack_buy</option>
									<option value="cta_section" <?php selected( $float['float_trigger'] ?? '', 'cta_section' ); ?>>cta_section</option>
								</select>
							</td>
						</tr>
						<tr>
							<th><label for="float_button_background_color"><?php esc_html_e( 'Color botón', 'landing-bonus' ); ?></label></th>
							<td><input type="color" id="float_button_background_color" name="float_button_background_color" value="<?php echo esc_attr( $float['button_background_color'] ?? '#FFDE21' ); ?>"></td>
						</tr>
					</table>
				</div>
			<?php elseif ( 'social_proof' === $tab ) : ?>
				<?php $social = $settings['social_proof'] ?? array(); ?>
				<div class="landing-bonus-admin__panel">
					<h2><?php esc_html_e( 'Prueba social', 'landing-bonus' ); ?></h2>
					<table class="form-table">
						<tr>
							<th><label for="social_initial_delay"><?php esc_html_e( 'Delay inicial (s)', 'landing-bonus' ); ?></label></th>
							<td><input type="number" id="social_initial_delay" name="social_initial_delay" value="<?php echo esc_attr( $social['initial_delay'] ?? 5 ); ?>" min="0"></td>
						</tr>
						<tr>
							<th><?php esc_html_e( 'Intervalo (s)', 'landing-bonus' ); ?></th>
							<td>
								<input type="number" name="social_interval_min" value="<?php echo esc_attr( $social['interval_min'] ?? 8 ); ?>" min="1"> —
								<input type="number" name="social_interval_max" value="<?php echo esc_attr( $social['interval_max'] ?? 15 ); ?>" min="1">
							</td>
						</tr>
						<tr>
							<th><label for="social_display_duration"><?php esc_html_e( 'Duración visible (s)', 'landing-bonus' ); ?></label></th>
							<td><input type="number" id="social_display_duration" name="social_display_duration" value="<?php echo esc_attr( $social['display_duration'] ?? 5 ); ?>" min="1"></td>
						</tr>
						<tr>
							<th><label for="social_position"><?php esc_html_e( 'Posición', 'landing-bonus' ); ?></label></th>
							<td>
								<select id="social_position" name="social_position">
									<option value="bottom-left" <?php selected( $social['position'] ?? '', 'bottom-left' ); ?>>bottom-left</option>
									<option value="bottom-right" <?php selected( $social['position'] ?? '', 'bottom-right' ); ?>>bottom-right</option>
								</select>
							</td>
						</tr>
						<tr>
							<th><?php esc_html_e( 'Dispositivos', 'landing-bonus' ); ?></th>
							<td>
								<label><input type="checkbox" name="social_enable_mobile" <?php checked( ! empty( $social['enable_mobile'] ) ); ?>> <?php esc_html_e( 'Mobile', 'landing-bonus' ); ?></label><br>
								<label><input type="checkbox" name="social_enable_desktop" <?php checked( ! empty( $social['enable_desktop'] ) ); ?>> <?php esc_html_e( 'Desktop', 'landing-bonus' ); ?></label>
							</td>
						</tr>
						<tr>
							<th><label for="social_cities"><?php esc_html_e( 'Ciudades (una por línea)', 'landing-bonus' ); ?></label></th>
							<td><textarea id="social_cities" name="social_cities" rows="6" class="large-text"><?php echo esc_textarea( $social['cities'] ?? '' ); ?></textarea></td>
						</tr>
						<tr>
							<th><label for="social_names"><?php esc_html_e( 'Nombres (uno por línea)', 'landing-bonus' ); ?></label></th>
							<td><textarea id="social_names" name="social_names" rows="6" class="large-text"><?php echo esc_textarea( $social['names'] ?? '' ); ?></textarea></td>
						</tr>
						<tr>
							<th><label for="social_time_phrases"><?php esc_html_e( 'Frases de tiempo', 'landing-bonus' ); ?></label></th>
							<td><textarea id="social_time_phrases" name="social_time_phrases" rows="4" class="large-text"><?php echo esc_textarea( $social['time_phrases'] ?? '' ); ?></textarea></td>
						</tr>
					</table>
				</div>
			<?php endif; ?>

			<?php submit_button( __( 'Guardar cambios', 'landing-bonus' ) ); ?>
		</form>
	<?php endif; ?>
</div>
