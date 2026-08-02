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
theme = "142036828310"
```

## Segunda imagen de variaciones (Pack Bodys)

Equivalente al plugin WooCommerce **Segunda Imagen**. Muestra una segunda foto al elegir color/talla en el modal del pack.

### Configurar en Shopify Admin

1. **Configuración → Datos personalizados → Variantes → Agregar definición**
2. Nombre: `Segunda imagen`
3. Namespace: `custom`, clave: la que muestre Admin (ej. `custom_second_image` si el nombre fue `custom.second_image`)
4. Tipo: **Archivo** → una imagen
5. En cada variante (o una por color), sube la segunda imagen

Una imagen por **color** aplica a todas las tallas de ese color (igual que en WooCommerce).

## Precio autoridad Shopify → Effi

Los pedidos de packs/COD fijan el precio cobrado en Shopify (`priceOverride`) para que Effi opere con ese valor **sin** actualizar el catálogo de Effi ni permitir que Effi reescriba precios en Shopify.

Guía operativa (scopes + panel Effi): [docs/EFFI-PRECIO-SHOPIFY-AUTHORITY.md](docs/EFFI-PRECIO-SHOPIFY-AUTHORITY.md).

## Flete Effi (packs)

Equivalente al snippet WooCommerce **caletzza-pack-effi-shipping**.

1. Crea un producto en Shopify cuyo precio sea el flete (ej. "Flete" / $X).
2. En el theme editor: **Configuracion del tema → Flete Effi (packs)** elige ese producto.
   - Opcional: override por seccion en Pack Bodys / Pack Basicas.
3. En checkout express COD:
   - Se ocultan los precios por linea.
   - El flete se suma al **Total** (Envío muestra "Envío gratis").
   - El IVA no incluye el flete.
4. En checkout nativo / pago en linea:
   - El pack redirige a una **factura draft order** con el flete como line item no gravable.
   - En el carrito del theme se ocultan precios por linea y la fila del flete.
   - **Obligatorio:** en el producto flete desactiva **Cobrar impuestos** (Admin → producto → Impuestos).
   - Shopify Checkout no permite ocultar precios de line items sin Plus; el control visual completo queda en el modal COD y en el carrito del theme.

## Checkout express COD (Pack Bodys)

Formulario estilo **EasySell COD Form** integrado en el theme. Al pulsar **Comprar ahora** con el pack completo, se abre un modal de pago contra entrega sin salir de la landing.

### Theme

- Modal: `snippets/pack-cod-modal.liquid`
- JS/CSS: `assets/pack-cod-checkout.js`, `assets/pack-cod-checkout.css`
- Seccion Pack Bodys 4 → **Checkout express COD**

### App (requerida para crear pedidos)

La app vive en `cod-express-app/`. Sin ella el formulario se muestra pero no puede crear pedidos en Shopify.

Ver instrucciones completas en [cod-express-app/README.md](cod-express-app/README.md).

### Mantener Render despierto (cron-job.org)

En plan Free, Render se apaga tras ~15 min sin tráfico. Hay un cron job configurado en **cron-job.org** (cuenta `dilearos@hotmail.com`) que hace GET cada 10 min a `https://landing-neraki-1.onrender.com/health`. No crea pedidos en Shopify.

Detalle paso a paso: [cod-express-app/SETUP-DEV-DASHBOARD.md](cod-express-app/SETUP-DEV-DASHBOARD.md#mantener-render-despierto-sin-pedidos-ficticios-en-shopify).

