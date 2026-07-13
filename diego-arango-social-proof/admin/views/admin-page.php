<?php
/**
 * Vista del panel de administración.
 *
 * @package DiegoArangoSocialProof
 */

defined( 'ABSPATH' ) || exit;
?>
<div class="wrap dasp-admin-wrap">
	<h1>
		<?php esc_html_e( 'Social Proof Boost', 'diego-arango-social-proof' ); ?>
		<span class="dasp-author"><?php esc_html_e( 'por Diego Arango', 'diego-arango-social-proof' ); ?></span>
	</h1>

	<p class="dasp-description">
		<?php esc_html_e( 'Crea notificaciones emergentes de prueba social para aumentar la conversión. Inserta el shortcode en las páginas donde quieras mostrar las alertas.', 'diego-arango-social-proof' ); ?>
	</p>

	<?php if ( 'saved' === $message ) : ?>
		<div class="notice notice-success is-dismissible">
			<p><?php esc_html_e( 'Shortcode guardado correctamente.', 'diego-arango-social-proof' ); ?></p>
		</div>
	<?php elseif ( 'deleted' === $message ) : ?>
		<div class="notice notice-success is-dismissible">
			<p><?php esc_html_e( 'Shortcode eliminado.', 'diego-arango-social-proof' ); ?></p>
		</div>
	<?php elseif ( 'error' === $message ) : ?>
		<div class="notice notice-error is-dismissible">
			<p><?php esc_html_e( 'Error al guardar. Verifica que el título y el nombre del pack estén completos.', 'diego-arango-social-proof' ); ?></p>
		</div>
	<?php endif; ?>

	<div class="dasp-admin-grid">
		<div class="dasp-admin-card">
			<h2><?php echo $editing['id'] ? esc_html__( 'Editar shortcode', 'diego-arango-social-proof' ) : esc_html__( 'Crear nuevo shortcode', 'diego-arango-social-proof' ); ?></h2>

			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
				<?php wp_nonce_field( 'dasp_save_shortcode' ); ?>
				<input type="hidden" name="action" value="dasp_save_shortcode" />
				<input type="hidden" name="dasp_id" value="<?php echo esc_attr( $editing['id'] ); ?>" />

				<table class="form-table" role="presentation">
					<tr>
						<th scope="row">
							<label for="dasp_title"><?php esc_html_e( 'Nombre interno', 'diego-arango-social-proof' ); ?></label>
						</th>
						<td>
							<input type="text" id="dasp_title" name="dasp_title" class="regular-text" value="<?php echo esc_attr( $editing['title'] ); ?>" required />
							<p class="description"><?php esc_html_e( 'Solo para identificarlo en el panel.', 'diego-arango-social-proof' ); ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row">
							<label for="dasp_pack_prefix"><?php esc_html_e( 'Prefijo del pack', 'diego-arango-social-proof' ); ?></label>
						</th>
						<td>
							<input type="text" id="dasp_pack_prefix" name="dasp_pack_prefix" class="regular-text" value="<?php echo esc_attr( $editing['pack_prefix'] ); ?>" />
							<p class="description"><?php esc_html_e( 'Ejemplo: "pack de", "combo de", "set de".', 'diego-arango-social-proof' ); ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row">
							<label for="dasp_pack_name"><?php esc_html_e( 'Nombre del producto/pack', 'diego-arango-social-proof' ); ?></label>
						</th>
						<td>
							<input type="text" id="dasp_pack_name" name="dasp_pack_name" class="regular-text" value="<?php echo esc_attr( $editing['pack_name'] ); ?>" required placeholder="bodys" />
							<p class="description"><?php esc_html_e( 'Ejemplo: bodys, camisetas, leggings.', 'diego-arango-social-proof' ); ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row">
							<label for="dasp_units"><?php esc_html_e( 'Unidades', 'diego-arango-social-proof' ); ?></label>
						</th>
						<td>
							<input type="number" id="dasp_units" name="dasp_units" min="1" max="999" value="<?php echo esc_attr( $editing['units'] ); ?>" />
							<p class="description"><?php esc_html_e( 'Cantidad mostrada en la notificación. Ejemplo: x4, x10.', 'diego-arango-social-proof' ); ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><?php esc_html_e( 'Vista previa del mensaje', 'diego-arango-social-proof' ); ?></th>
						<td>
							<div class="dasp-preview" id="dasp-preview">
								<strong>Juanito</strong>
								<?php esc_html_e( 'ha comprado un', 'diego-arango-social-proof' ); ?>
								<span class="dasp-preview-pack"><?php echo esc_html( $editing['pack_prefix'] . ' ' . $editing['pack_name'] ); ?></span>
								x<span class="dasp-preview-units"><?php echo esc_html( $editing['units'] ); ?></span>
								<?php esc_html_e( 'hace 1 minuto en Bogotá', 'diego-arango-social-proof' ); ?>
							</div>
						</td>
					</tr>
					<tr>
						<th scope="row">
							<label for="dasp_interval_min"><?php esc_html_e( 'Intervalo mínimo (seg)', 'diego-arango-social-proof' ); ?></label>
						</th>
						<td>
							<input type="number" id="dasp_interval_min" name="dasp_interval_min" min="3" max="120" value="<?php echo esc_attr( $editing['interval_min'] ); ?>" />
						</td>
					</tr>
					<tr>
						<th scope="row">
							<label for="dasp_interval_max"><?php esc_html_e( 'Intervalo máximo (seg)', 'diego-arango-social-proof' ); ?></label>
						</th>
						<td>
							<input type="number" id="dasp_interval_max" name="dasp_interval_max" min="5" max="300" value="<?php echo esc_attr( $editing['interval_max'] ); ?>" />
						</td>
					</tr>
					<tr>
						<th scope="row">
							<label for="dasp_display_duration"><?php esc_html_e( 'Duración visible (seg)', 'diego-arango-social-proof' ); ?></label>
						</th>
						<td>
							<input type="number" id="dasp_display_duration" name="dasp_display_duration" min="2" max="30" value="<?php echo esc_attr( $editing['display_duration'] ); ?>" />
						</td>
					</tr>
					<tr>
						<th scope="row">
							<label for="dasp_position"><?php esc_html_e( 'Posición', 'diego-arango-social-proof' ); ?></label>
						</th>
						<td>
							<select id="dasp_position" name="dasp_position">
								<?php foreach ( $positions as $key => $label ) : ?>
									<option value="<?php echo esc_attr( $key ); ?>" <?php selected( $editing['position'], $key ); ?>>
										<?php echo esc_html( $label ); ?>
									</option>
								<?php endforeach; ?>
							</select>
						</td>
					</tr>
					<tr>
						<th scope="row"><?php esc_html_e( 'Estado', 'diego-arango-social-proof' ); ?></th>
						<td>
							<label>
								<input type="checkbox" name="dasp_enabled" value="1" <?php checked( $editing['enabled'], 1 ); ?> />
								<?php esc_html_e( 'Activo', 'diego-arango-social-proof' ); ?>
							</label>
						</td>
					</tr>
				</table>

				<?php submit_button( $editing['id'] ? __( 'Actualizar shortcode', 'diego-arango-social-proof' ) : __( 'Crear shortcode', 'diego-arango-social-proof' ) ); ?>

				<?php if ( $editing['id'] ) : ?>
					<a href="<?php echo esc_url( admin_url( 'admin.php?page=dasp-social-proof' ) ); ?>" class="button">
						<?php esc_html_e( 'Cancelar edición', 'diego-arango-social-proof' ); ?>
					</a>
				<?php endif; ?>
			</form>

			<?php if ( ! empty( $editing['id'] ) ) : ?>
				<div class="dasp-shortcode-box">
					<h3><?php esc_html_e( 'Shortcode generado', 'diego-arango-social-proof' ); ?></h3>
					<code id="dasp-shortcode-output"><?php echo esc_html( DASP_Shortcode_Manager::get_shortcode_text( $editing['id'] ) ); ?></code>
					<button type="button" class="button button-secondary" onclick="navigator.clipboard.writeText(document.getElementById('dasp-shortcode-output').textContent)">
						<?php esc_html_e( 'Copiar shortcode', 'diego-arango-social-proof' ); ?>
					</button>
				</div>
			<?php endif; ?>
		</div>

		<div class="dasp-admin-card">
			<h2><?php esc_html_e( 'Shortcodes creados', 'diego-arango-social-proof' ); ?></h2>

			<?php if ( empty( $shortcodes ) ) : ?>
				<p><?php esc_html_e( 'Aún no has creado ningún shortcode.', 'diego-arango-social-proof' ); ?></p>
			<?php else : ?>
				<table class="widefat striped dasp-table">
					<thead>
						<tr>
							<th><?php esc_html_e( 'Nombre', 'diego-arango-social-proof' ); ?></th>
							<th><?php esc_html_e( 'Pack', 'diego-arango-social-proof' ); ?></th>
							<th><?php esc_html_e( 'Unidades', 'diego-arango-social-proof' ); ?></th>
							<th><?php esc_html_e( 'Estado', 'diego-arango-social-proof' ); ?></th>
							<th><?php esc_html_e( 'Shortcode', 'diego-arango-social-proof' ); ?></th>
							<th><?php esc_html_e( 'Acciones', 'diego-arango-social-proof' ); ?></th>
						</tr>
					</thead>
					<tbody>
						<?php foreach ( $shortcodes as $item ) : ?>
							<tr>
								<td><?php echo esc_html( $item['title'] ); ?></td>
								<td><?php echo esc_html( $item['pack_prefix'] . ' ' . $item['pack_name'] ); ?></td>
								<td>x<?php echo esc_html( $item['units'] ); ?></td>
								<td>
									<?php if ( ! empty( $item['enabled'] ) ) : ?>
										<span class="dasp-badge dasp-badge--active"><?php esc_html_e( 'Activo', 'diego-arango-social-proof' ); ?></span>
									<?php else : ?>
										<span class="dasp-badge dasp-badge--inactive"><?php esc_html_e( 'Inactivo', 'diego-arango-social-proof' ); ?></span>
									<?php endif; ?>
								</td>
								<td><code><?php echo esc_html( DASP_Shortcode_Manager::get_shortcode_text( $item['id'] ) ); ?></code></td>
								<td class="dasp-actions">
									<a href="<?php echo esc_url( add_query_arg( array( 'page' => 'dasp-social-proof', 'edit' => $item['id'] ), admin_url( 'admin.php' ) ) ); ?>">
										<?php esc_html_e( 'Editar', 'diego-arango-social-proof' ); ?>
									</a>
									|
									<a href="<?php echo esc_url( wp_nonce_url( add_query_arg( array( 'action' => 'dasp_delete_shortcode', 'id' => $item['id'] ), admin_url( 'admin-post.php' ) ), 'dasp_delete_' . $item['id'] ) ); ?>" class="dasp-delete" onclick="return confirm('<?php esc_attr_e( '¿Eliminar este shortcode?', 'diego-arango-social-proof' ); ?>')">
										<?php esc_html_e( 'Eliminar', 'diego-arango-social-proof' ); ?>
									</a>
								</td>
							</tr>
						<?php endforeach; ?>
					</tbody>
				</table>
			<?php endif; ?>

			<div class="dasp-info-box">
				<h3><?php esc_html_e( 'Cómo usar', 'diego-arango-social-proof' ); ?></h3>
				<ol>
					<li><?php esc_html_e( 'Crea un shortcode con el nombre del pack y las unidades.', 'diego-arango-social-proof' ); ?></li>
					<li><?php esc_html_e( 'Copia el shortcode generado.', 'diego-arango-social-proof' ); ?></li>
					<li><?php esc_html_e( 'Pégalo en la página de producto, landing o cualquier página de WordPress/Elementor.', 'diego-arango-social-proof' ); ?></li>
				</ol>
				<p><strong><?php esc_html_e( 'Ciudades incluidas:', 'diego-arango-social-proof' ); ?></strong>
					<?php echo esc_html( implode( ', ', DASP_Data::get_cities() ) ); ?>
				</p>
			</div>
		</div>
	</div>
</div>

<script>
(function () {
	var prefix = document.getElementById('dasp_pack_prefix');
	var name = document.getElementById('dasp_pack_name');
	var units = document.getElementById('dasp_units');
	var previewPack = document.querySelector('.dasp-preview-pack');
	var previewUnits = document.querySelector('.dasp-preview-units');

	function updatePreview() {
		if (previewPack) previewPack.textContent = (prefix.value || 'pack de') + ' ' + (name.value || 'bodys');
		if (previewUnits) previewUnits.textContent = units.value || '4';
	}

	[prefix, name, units].forEach(function (el) {
		if (el) el.addEventListener('input', updatePreview);
	});
})();
</script>
