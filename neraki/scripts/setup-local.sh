#!/usr/bin/env bash
# Neraki — WordPress local setup (PHP + MariaDB, sin Docker)
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(pwd)"

WP_DIR="${ROOT}/wordpress-core"
WP_URL="${WP_URL:-http://localhost:8080}"
WP_TITLE="${WP_TITLE:-Neraki}"
WP_ADMIN_USER="${WP_ADMIN_USER:-admin}"
WP_ADMIN_PASSWORD="${WP_ADMIN_PASSWORD:-admin123}"
WP_ADMIN_EMAIL="${WP_ADMIN_EMAIL:-admin@neraki.local}"
DB_NAME="${MYSQL_DATABASE:-neraki}"
DB_USER="${MYSQL_USER:-wordpress}"
DB_PASS="${MYSQL_PASSWORD:-wordpress}"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

echo "==> Verificando dependencias..."
for cmd in php mysql wp curl; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "Error: falta '$cmd'. Instala PHP, MariaDB y WP-CLI."
    exit 1
  fi
done

echo "==> Iniciando MariaDB (si no está corriendo)..."
if ! mysql -u"$DB_USER" -p"$DB_PASS" -e "SELECT 1" &>/dev/null; then
  sudo mysqld_safe --datadir=/var/lib/mysql &>/tmp/neraki-mysqld.log &
  sleep 4
fi

echo "==> Creando base de datos..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME};
  CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
  GRANT ALL ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
  FLUSH PRIVILEGES;" 2>/dev/null || \
mysql -u root -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME};
  CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
  GRANT ALL ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
  FLUSH PRIVILEGES;"

echo "==> Descargando WordPress..."
if [ ! -f "${WP_DIR}/wp-load.php" ]; then
  curl -sL https://wordpress.org/latest.tar.gz | tar xz
  mv wordpress wordpress-core
fi

echo "==> Instalando plugin Neraki Landing..."
mkdir -p "${WP_DIR}/wp-content/plugins"
rsync -a --delete "${ROOT}/wp-content/plugins/neraki-landing/" "${WP_DIR}/wp-content/plugins/neraki-landing/"

echo "==> Configurando wp-config.php..."
if [ ! -f "${WP_DIR}/wp-config.php" ]; then
  wp config create \
    --path="${WP_DIR}" \
    --dbname="${DB_NAME}" \
    --dbuser="${DB_USER}" \
    --dbpass="${DB_PASS}" \
    --dbhost=localhost \
    --skip-check
fi

echo "==> Instalando WordPress..."
if ! wp core is-installed --path="${WP_DIR}" 2>/dev/null; then
  wp core install \
    --path="${WP_DIR}" \
    --url="${WP_URL}" \
    --title="${WP_TITLE}" \
    --admin_user="${WP_ADMIN_USER}" \
    --admin_password="${WP_ADMIN_PASSWORD}" \
    --admin_email="${WP_ADMIN_EMAIL}" \
    --skip-email
fi

echo "==> Instalando tema y plugins..."
wp theme install hello-elementor --activate --path="${WP_DIR}" 2>/dev/null || wp theme activate hello-elementor --path="${WP_DIR}"
wp plugin install elementor --activate --path="${WP_DIR}" 2>/dev/null || true
wp plugin activate neraki-landing --path="${WP_DIR}"

PAGE_ID=$(wp post list --post_type=page --name=kivo-pack --field=ID --path="${WP_DIR}" 2>/dev/null || true)
if [ -z "${PAGE_ID}" ]; then
  PAGE_ID=$(wp post create \
    --path="${WP_DIR}" \
    --post_type=page \
    --post_title='KIVO Pack' \
    --post_name='kivo-pack' \
    --post_status=publish \
    --porcelain)
  wp post meta update "${PAGE_ID}" _wp_page_template neraki-kivo-landing.php --path="${WP_DIR}"
fi

wp option update show_on_front page --path="${WP_DIR}"
wp option update page_on_front "${PAGE_ID}" --path="${WP_DIR}"
wp option update blogname "${WP_TITLE}" --path="${WP_DIR}"
wp rewrite structure '/%postname%/' --path="${WP_DIR}"
wp rewrite flush --path="${WP_DIR}"

echo ""
echo "============================================"
echo "  Neraki WordPress listo"
echo "============================================"
echo "  Iniciar servidor:"
echo "    cd ${WP_DIR} && php -S 0.0.0.0:8080"
echo ""
echo "  Sitio:    ${WP_URL}"
echo "  Admin:    ${WP_URL}/wp-admin"
echo "  Usuario:  ${WP_ADMIN_USER}"
echo "  Password: ${WP_ADMIN_PASSWORD}"
echo "============================================"
