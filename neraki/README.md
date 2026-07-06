# Neraki — WordPress local (agent sandbox)

Entorno local igual al de **agentes de confianza**: Docker Compose + `npm run start` + contenedor workspace con WP-CLI, Claude y Cursor.

## Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (o Docker + Compose v2)
- [Node.js](https://nodejs.org/) 18+
- Puerto **8080** libre

## Inicio rápido

```bash
cd neraki
cp .env.example .env
npm run setup    # primera vez: construye contenedores + instala WordPress + landing KIVO
npm run start    # siguientes veces: solo levanta el stack
```

| | URL |
|---|-----|
| **Landing KIVO** | http://localhost:8080 |
| **Admin WP** | http://localhost:8080/wp-admin |
| **Usuario** | `admin` |
| **Contraseña** | `admin123` |

## Comandos npm (igual que agentes de confianza)

| Comando | Descripción |
|---------|-------------|
| `npm run setup` | Primera instalación completa |
| `npm run start` | Levantar contenedores |
| `npm run stop` | Parar contenedores |
| `npm run down` | Bajar stack |
| `npm run reset` | Borrar `db/` + `workspace/` y reinstalar |
| `npm run bash` | Shell en el contenedor workspace |
| `npm run wp -- plugin list` | WP-CLI |
| `npm run claude` | Claude Code en el workspace |
| `npm run cursor` | Cursor CLI en el workspace |
| `npm run logs` | Ver logs de todos los servicios |

## Estructura

```
neraki/
├── package.json              # Scripts npm
├── docker-compose.yml        # db + wordpress + workspace + playwright
├── sandbox.config.json       # Plugins y setup de Neraki
├── .env                      # Credenciales (copiar de .env.example)
├── plugin/neraki-landing/    # Plugin KIVO (versionado en git)
├── scripts/
│   └── user-setup.sh         # Enlaza plugin + crea página de inicio
├── db/                       # MariaDB (gitignored, se crea al setup)
└── workspace/                # WordPress en workspace/wp (gitignored)
    └── wp/                   # Instalación WordPress
```

El plugin en `plugin/neraki-landing/` se enlaza automáticamente a `workspace/wp/wp-content/plugins/` al ejecutar setup.

## Editar la landing

1. Modifica CSS/JS en `plugin/neraki-landing/assets/`
2. O edita el HTML en `plugin/neraki-landing/templates/landing-content.php`
3. Recarga http://localhost:8080

Para sincronizar desde la raíz del repo:

```bash
cp ../css/kivo-landing.css plugin/neraki-landing/assets/css/
cp ../js/kivo-landing.js plugin/neraki-landing/assets/js/
```

## Sincronizar con el repo principal

Los archivos fuente de la landing viven en la raíz del proyecto (`css/`, `js/`, `index.html`). El plugin en `plugin/neraki-landing/` es la copia desplegada en WordPress.

## Solución de problemas

**Docker no arranca:** Asegúrate de que Docker Desktop esté corriendo.

**Puerto ocupado:** Cambia `WP_PORT=8888` en `.env` y `npm run reset`.

**Permisos en Linux:** Los contenedores usan uid 1000. Si hay problemas de escritura en `workspace/`, ejecuta `sudo chown -R 1000:1000 workspace/`.

**Reset completo:**

```bash
npm run reset
```
