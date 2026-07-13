# Caletzza — Shopify Theme

Proyecto local para editar el tema de [caletzza.myshopify.com](https://caletzza.myshopify.com) desde Cursor.

## Requisitos

- Node.js 22+
- Acceso de administrador o permisos de **Temas** en la tienda

## Tema actual

- **Nombre:** Copy of Dawn
- **ID:** `142036828310`
- **Estado:** Live (publicado)

## Comandos

```bash
# Listar temas de la tienda
npm run theme:list

# Descargar el tema activo
npm run theme:pull

# Vista previa en vivo (hot reload)
npm run theme:dev

# Subir cambios a un tema no publicado
npm run theme:push

# Validar el tema
npm run theme:check
```

## Autenticación (primer paso obligatorio)

La primera vez que ejecutes un comando, Shopify te pedirá iniciar sesión:

1. Ejecuta `npm run theme:list` en la terminal de Cursor
2. Se mostrará un **código de verificación** y un enlace
3. Abre el enlace en tu navegador e inicia sesión con la cuenta de Caletzza
4. Introduce el código cuando te lo pida
5. Vuelve a la terminal — la conexión quedará guardada

## Flujo de trabajo

1. `npm run theme:pull` — descarga el tema actual
2. Edita archivos en `sections/`, `templates/`, `assets/`, etc.
3. `npm run theme:dev` — previsualiza cambios en tiempo real
4. `npm run theme:push` — sube a un tema de prueba (no publicado)
5. Cuando estés conforme, publica desde el admin de Shopify o con `shopify theme publish`

## Configuración

La tienda está configurada en `shopify.theme.toml`:

```toml
[environments.default]
store = "caletzza.myshopify.com"
```
