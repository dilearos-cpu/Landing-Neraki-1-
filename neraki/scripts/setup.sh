#!/usr/bin/env bash
# Neraki — WordPress local setup script
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

WP_URL="${WP_URL:-http://localhost:8080}"
WP_TITLE="${WP_TITLE:-Neraki}"
WP_ADMIN_USER="${WP_ADMIN_USER:-admin}"
WP_ADMIN_PASSWORD="${WP_ADMIN_PASSWORD:-admin123}"
WP_ADMIN_EMAIL="${WP_ADMIN_EMAIL:-admin@neraki.local}"

echo "==> Levantando contenedores Docker..."
sudo docker compose up -d db wordpress

echo "==> Esperando a que WordPress esté listo..."
for i in $(seq 1 30); do
  if curl -sf "${WP_URL}" > /dev/null 2>&1; then
    echo "    WordPress respondiendo."
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "Error: WordPress no respondió a tiempo."
    exit 1
  fi
  sleep 3
done

echo "==> Instalando WordPress (si no está instalado)..."
if ! sudo docker compose run --rm wpcli wp core is-installed --path=/var/www/html 2>/dev/null; then
  sudo docker compose run --rm wpcli wp core install \
    --path=/var/www/html \
    --url="${WP_URL}" \
    --title="${WP_TITLE}" \
    --admin_user="${WP_ADMIN_USER}" \
    --admin_password="${WP_ADMIN_PASSWORD}" \
    --admin_email="${WP_ADMIN_EMAIL}" \
    --skip-email
  echo "    WordPress instalado."
else
  echo "    WordPress ya estaba instalado."
fi

echo "==> Instalando tema Hello Elementor..."
sudo docker compose run --rm wpcli wp theme install hello-elementor --activate --path=/var/www/html 2>/dev/null || \
  sudo docker compose run --rm wpcli wp theme activate hello-elementor --path=/var/www/html

echo "==> Instalando Elementor (gratis)..."
sudo docker compose run --rm wpcli wp plugin install elementor --activate --path=/var/www/html 2>/dev/null || true

echo "==> Activando plugin Neraki Landing..."
sudo docker compose run --rm wpcli wp plugin activate neraki-landing --path=/var/www/html

echo "==> Configurando página de inicio..."
PAGE_ID=$(sudo docker compose run --rm wpcli wp post list --post_type=page --name=kivo-pack --field=ID --path=/var/www/html 2>/dev/null | tail -1 | tr -d '\r')

if [ -z "${PAGE_ID}" ] || [ "${PAGE_ID}" = "0" ]; then
  PAGE_ID=$(sudo docker compose run --rm wpcli wp post create \
    --post_type=page \
    --post_title='KIVO Pack' \
    --post_name='kivo-pack' \
    --post_status=publish \
    --porcelain \
    --path=/var/www/html | tail -1 | tr -d '\r')
  sudo docker compose run --rm wpcli wp post meta update "${PAGE_ID}" _wp_page_template neraki-kivo-landing.php --path=/var/www/html
fi

sudo docker compose run --rm wpcli wp option update show_on_front page --path=/var/www/html
sudo docker compose run --rm wpcli wp option update page_on_front "${PAGE_ID}" --path=/var/www/html

echo "==> Ajustes finales..."
sudo docker compose run --rm wpcli wp rewrite structure '/%postname%/' --path=/var/www/html
sudo docker compose run --rm wpcli wp rewrite flush --path=/var/www/html
sudo docker compose run --rm wpcli wp option update blogname "${WP_TITLE}" --path=/var/www/html
sudo docker compose run --rm wpcli wp option update blogdescription 'KIVO Performance Wear' --path=/var/www/html

echo ""
echo "============================================"
echo "  Neraki WordPress listo"
echo "============================================"
echo "  Sitio:    ${WP_URL}"
echo "  Admin:    ${WP_URL}/wp-admin"
echo "  Usuario:  ${WP_ADMIN_USER}"
echo "  Password: ${WP_ADMIN_PASSWORD}"
echo "============================================"
echo ""
echo "Comandos útiles:"
echo "  sudo docker compose logs -f wordpress"
echo "  sudo docker compose down"
echo "  sudo docker compose down -v   # borra datos"
