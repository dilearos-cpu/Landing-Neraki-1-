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
			<table class="widefat striped">
				<thead>
					<tr>
						<th><?php esc_html_e( 'Módulo', 'landing-bonus' ); ?></th>
						<th><?php esc_html_e( 'Shortcode', 'landing-bonus' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td><?php esc_html_e( 'Contador + barra (bodys x4)', 'landing-bonus' ); ?></td>
						<td><code>[landing_bonus_countdown id="promo1" units="4" hours="24"]</code></td>
					</tr>
					<tr>
						<td><?php esc_html_e( 'Contador + barra (básicas x10)', 'landing-bonus' ); ?></td>
						<td><code>[landing_bonus_countdown id="promo1" units="10" hours="24"]</code></td>
					</tr>
					<tr>
						<td><?php esc_html_e( 'Google Badge', 'landing-bonus' ); ?></td>
						<td><code>[landing_bonus_google_badge]</code></td>
					</tr>
					<tr>
						<td><?php esc_html_e( 'Botón flotante', 'landing-bonus' ); ?></td>
						<td><code>[landing_bonus_floating_button url="#pack" label="Compra aqui | Paga en casa"]</code></td>
					</tr>
				</tbody>
			</table>
			<p>
				<?php esc_html_e( 'La barra detecta automáticamente los slots de tus packs existentes (.pack-ui .slot). Al llegar al 100%, un clic en la barra pulsa #pack-buy.', 'landing-bonus' ); ?>
			</p>
		</div>
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
						'countdown'       => __( 'Barra progreso + contador 24h', 'landing-bonus' ),
						'google_badge'    => __( 'Recuadro estrellas Google', 'landing-bonus' ),
						'floating_button' => __( 'Botón flotante estilo RSI', 'landing-bonus' ),
					);
					foreach ( $labels as $key => $label ) :
						?>
						<label>
							<input type="checkbox" name="module_<?php echo esc_attr( $key ); ?>" <?php checked( ! empty( $modules[ $key ] ) ); ?>>
							<?php echo esc_html( $label ); ?>
						</label><br>
					<?php endforeach; ?>
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
							<th><label for="countdown_pack_selector"><?php esc_html_e( 'Selector pack (CSS)', 'landing-bonus' ); ?></label></th>
							<td><input type="text" class="regular-text" id="countdown_pack_selector" name="countdown_pack_selector" value="<?php echo esc_attr( $countdown['pack_selector'] ?? '.pack-ui' ); ?>"></td>
						</tr>
						<tr>
							<th><label for="countdown_slot_selector"><?php esc_html_e( 'Selector slot (CSS)', 'landing-bonus' ); ?></label></th>
							<td><input type="text" class="regular-text" id="countdown_slot_selector" name="countdown_slot_selector" value="<?php echo esc_attr( $countdown['slot_selector'] ?? '.slot' ); ?>"></td>
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
									<option value="pack_buy" <?php selected( $float['float_trigger'] ?? '', 'pack_buy' ); ?>>pack_buy (#pack-buy)</option>
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
			<?php endif; ?>

			<?php submit_button( __( 'Guardar cambios', 'landing-bonus' ) ); ?>
		</form>
	<?php endif; ?>
</div>
