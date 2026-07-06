#!/usr/bin/env bash
#
# Neraki — Setup personalizado: plugin KIVO, tema Hello Elementor, página de inicio.
# Se ejecuta dentro del contenedor workspace (como usuario node).
#
set -euo pipefail

cd /home/node

echo "→ Enlazando plugin Neraki Landing..."
mkdir -p wp/wp-content/plugins
ln -sfn /home/node/plugin/neraki-landing wp/wp-content/plugins/neraki-landing

echo "→ Instalando tema Hello Elementor..."
wp theme install hello-elementor --activate 2>/dev/null || wp theme activate hello-elementor

echo "→ Configurando página KIVO Pack..."
PAGE_ID=$(wp post list --post_type=page --name=kivo-pack --field=ID --format=ids 2>/dev/null || true)

if [ -z "${PAGE_ID}" ]; then
  PAGE_ID=$(wp post create \
    --post_type=page \
    --post_title='KIVO Pack' \
    --post_name='kivo-pack' \
    --post_status=publish \
    --porcelain)
  wp post meta update "${PAGE_ID}" _wp_page_template neraki-kivo-landing.php
  wp post meta update "${PAGE_ID}" _neraki_kivo_page 1
  echo "    Página creada (ID: ${PAGE_ID})"
else
  wp post meta update "${PAGE_ID}" _wp_page_template neraki-kivo-landing.php
  echo "    Página existente (ID: ${PAGE_ID})"
fi

wp option update show_on_front page
wp option update page_on_front "${PAGE_ID}"
wp option update blogname "Neraki"
wp option update blogdescription "KIVO Performance Wear"
wp rewrite structure '/%postname%/'
wp rewrite flush

echo "✓ Neraki Landing configurada."
