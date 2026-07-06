# Neraki — WordPress Local

Entorno de desarrollo local con Docker para el proyecto **Neraki** (landing KIVO).

## Requisitos

- Puerto **8080** libre
- **Opción A (recomendada):** PHP 8.2+, MariaDB/MySQL, [WP-CLI](https://wp-cli.org/)
- **Opción B:** Docker y Docker Compose

## Inicio rápido

### Opción A — PHP + MariaDB (recomendada)

```bash
cd neraki
chmod +x scripts/setup-local.sh
./scripts/setup-local.sh

# En otra terminal, iniciar el servidor:
cd wordpress-core && php -S 0.0.0.0:8080
```

### Opción B — Docker

```bash
cd neraki
chmod +x scripts/setup.sh
./scripts/setup.sh
```

Abre **http://localhost:8080** — verás la landing KIVO como página de inicio.

## Credenciales por defecto

| Campo | Valor |
|-------|-------|
| URL sitio | http://localhost:8080 |
| URL admin | http://localhost:8080/wp-admin |
| Usuario | `admin` |
| Contraseña | `admin123` |
| Email | admin@neraki.local |

Cambia estos valores en `.env` antes de ejecutar `setup.sh`.

## Estructura

```
neraki/
├── docker-compose.yml          # WordPress + MySQL + WP-CLI
├── .env                        # Variables de entorno
├── scripts/
│   └── setup.sh                # Instalación automática
└── wp-content/plugins/
    └── neraki-landing/         # Plugin con template KIVO
        ├── neraki-landing.php
        ├── templates/
        │   ├── neraki-kivo-landing.php
        │   └── landing-content.php
        └── assets/
            ├── css/kivo-landing.css
            ├── js/kivo-landing.js
            └── images/         # Placeholders SVG
```

## Comandos útiles

```bash
# Levantar contenedores
sudo docker compose up -d

# Ver logs
sudo docker compose logs -f wordpress

# Parar
sudo docker compose down

# Parar y borrar base de datos (reset completo)
sudo docker compose down -v
./scripts/setup.sh
```

## WP-CLI

```bash
# Listar plugins
sudo docker compose run --rm wpcli wp plugin list --path=/var/www/html

# Activar Elementor Pro (si tienes licencia, súbelo manualmente)
sudo docker compose run --rm wpcli wp plugin install /ruta/a/elementor-pro.zip --activate --path=/var/www/html
```

## Reemplazar imágenes placeholder

Sustituye los SVG en:

`wp-content/plugins/neraki-landing/assets/images/`

Por tus imágenes reales (WebP/PNG/JPG) manteniendo los mismos nombres de archivo, o edita las rutas en `templates/landing-content.php`.

## Sincronizar CSS/JS desde el repo principal

Si actualizas los archivos en la raíz del proyecto:

```bash
cp ../css/kivo-landing.css wp-content/plugins/neraki-landing/assets/css/
cp ../js/kivo-landing.js wp-content/plugins/neraki-landing/assets/js/
```

## Elementor Pro

El entorno instala **Elementor gratis** + el plugin **Neraki Landing** que renderiza la landing sin depender de Elementor Pro.

Para migrar a Elementor Pro más adelante:

1. Instala y activa Elementor Pro con licencia
2. Crea una página con template Canvas
3. Pega el HTML de `../index.html` en widgets HTML
4. Usa la guía en `../docs/elementor-estructura-kivo.md`

## Solución de problemas

**Puerto 8080 ocupado:** cambia en `docker-compose.yml` `"8080:80"` → `"8888:80"` y actualiza `WP_URL` en `.env`.

**Permisos Docker:** en Linux, añade tu usuario al grupo docker: `sudo usermod -aG docker $USER` y reinicia sesión.

**Página en blanco:** revisa logs con `sudo docker compose logs wordpress` y verifica que el plugin esté activo.
