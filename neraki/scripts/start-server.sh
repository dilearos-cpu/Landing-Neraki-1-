#!/usr/bin/env bash
# Inicia el servidor de desarrollo Neraki
cd "$(dirname "$0")/../wordpress-core"
echo "Neraki corriendo en http://localhost:8080"
echo "Admin: http://localhost:8080/wp-admin"
php -S 0.0.0.0:8080
