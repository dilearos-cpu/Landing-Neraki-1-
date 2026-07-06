<?php
/**
 * Template: KIVO Landing (Neraki)
 * Full-width Canvas layout without theme header/footer.
 *
 * @package Neraki_Landing
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$neraki_assets = trailingslashit( NERAKI_LANDING_URL . 'assets' );
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="description" content="KIVO — Pack exclusivo 2 outfits premium. Escoge tu combinación y paga al recibir.">
	<title><?php wp_title( '|', true, 'right' ); bloginfo( 'name' ); ?></title>
	<?php wp_head(); ?>
</head>
<body <?php body_class( 'kivo-landing' ); ?>>
<?php wp_body_open(); ?>

<?php include NERAKI_LANDING_PATH . 'templates/landing-content.php'; ?>

<?php wp_footer(); ?>
</body>
</html>
