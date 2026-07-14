<?php
/**
 * Template del modal COD.
 *
 * @package LandingBonus
 *
 * @var array<string, mixed> $cod Ajustes del modal COD.
 */

defined( 'ABSPATH' ) || exit;

$cod_config = Landing_Bonus_Module_Cod_Modal::get_js_config();
?>
<div
	class="landing-bonus-cod-modal"
	id="landing-bonus-cod-modal"
	data-landing-bonus-cod-modal
	hidden
	aria-hidden="true"
>
	<script type="application/json" data-cod-settings><?php echo wp_json_encode( $cod_config ); ?></script>
	<div class="landing-bonus-cod-modal__overlay" data-cod-close></div>
	<div class="landing-bonus-cod-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="landing-bonus-cod-title">
		<button type="button" class="landing-bonus-cod-modal__close" data-cod-close aria-label="<?php esc_attr_e( 'Cerrar', 'landing-bonus' ); ?>">&times;</button>

		<div class="landing-bonus-cod-modal__header">
			<h2 id="landing-bonus-cod-title"><?php echo esc_html( $cod['title'] ?? '' ); ?></h2>
			<p><?php echo esc_html( $cod['subtitle'] ?? '' ); ?></p>
		</div>

		<div class="landing-bonus-cod-modal__body">
			<form class="landing-bonus-cod-modal__form" data-cod-form>
				<label>
					<?php esc_html_e( 'Nombre completo', 'landing-bonus' ); ?>
					<input type="text" name="name" required>
				</label>
				<label>
					<?php esc_html_e( 'Teléfono', 'landing-bonus' ); ?>
					<input type="tel" name="phone" <?php echo ! empty( $cod['require_phone'] ) ? 'required' : ''; ?>>
				</label>
				<label>
					<?php esc_html_e( 'Email', 'landing-bonus' ); ?>
					<input type="email" name="email" <?php echo ! empty( $cod['require_email'] ) ? 'required' : ''; ?>>
				</label>
				<label>
					<?php esc_html_e( 'Departamento', 'landing-bonus' ); ?>
					<input type="text" name="department">
				</label>
				<label>
					<?php esc_html_e( 'Ciudad', 'landing-bonus' ); ?>
					<input type="text" name="city">
				</label>
				<label>
					<?php esc_html_e( 'Dirección', 'landing-bonus' ); ?>
					<input type="text" name="address" <?php echo ! empty( $cod['require_address'] ) ? 'required' : ''; ?>>
				</label>
				<label>
					<?php esc_html_e( 'Notas del pedido', 'landing-bonus' ); ?>
					<textarea name="notes" rows="3"></textarea>
				</label>
				<button type="submit" class="landing-bonus-cod-modal__submit" data-cod-submit>
					<?php esc_html_e( 'Confirmar pedido contra entrega', 'landing-bonus' ); ?>
				</button>
			</form>

			<aside class="landing-bonus-cod-modal__summary" data-cod-summary>
				<h3><?php esc_html_e( 'Resumen del pack', 'landing-bonus' ); ?></h3>
				<ul class="landing-bonus-cod-modal__lines" data-cod-lines></ul>
				<div class="landing-bonus-cod-modal__totals">
					<p><span><?php esc_html_e( 'Subtotal', 'landing-bonus' ); ?></span> <strong data-cod-subtotal>$0</strong></p>
					<p><span><?php esc_html_e( 'IVA', 'landing-bonus' ); ?></span> <strong data-cod-iva>$0</strong></p>
					<p><span><?php esc_html_e( 'Envío', 'landing-bonus' ); ?></span> <strong data-cod-shipping>$0</strong></p>
					<p class="landing-bonus-cod-modal__free-shipping" data-cod-free-shipping hidden>
						<?php esc_html_e( 'Te obsequiamos el envío', 'landing-bonus' ); ?>
					</p>
					<p class="landing-bonus-cod-modal__total">
						<span><?php esc_html_e( 'Total', 'landing-bonus' ); ?></span>
						<strong data-cod-total>$0</strong>
					</p>
				</div>
			</aside>
		</div>

		<div class="landing-bonus-cod-modal__success" data-cod-success hidden>
			<h3><?php esc_html_e( '¡Pedido registrado!', 'landing-bonus' ); ?></h3>
			<p data-cod-success-message></p>
			<button type="button" class="landing-bonus-cod-modal__submit" data-cod-close>
				<?php esc_html_e( 'Cerrar', 'landing-bonus' ); ?>
			</button>
		</div>
	</div>
</div>
