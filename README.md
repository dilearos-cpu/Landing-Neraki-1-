# Caletzza Theme

Repositorio **solo del theme** de Shopify para Caletzza. Basado en Dawn con extensiones custom: pack builder, checkout COD (UI), prueba social, banners de colección, tabla de precios por unidades, etc.

## Estructura del repo

```
assets/          CSS, JS, imágenes del theme
config/          settings_schema.json, settings_data.json
layout/          theme.liquid
locales/         Traducciones
sections/        Secciones Liquid (incl. caletzza-* y pack-*)
snippets/        Fragmentos reutilizables
templates/       JSON templates por página
shopify.theme.toml
package.json     Shopify CLI
```

No incluye (viven en otros repos):

- App backend COD (`cod-express-app`) — necesaria para crear pedidos COD en Shopify
- Plugin WooCommerce (`landing-bonus-wc`)

## Requisitos

- Node.js 22+
- Cuenta **Shopify Partners** + **Development Store** (gratis)
- Permisos de **Temas** en la tienda

## Configuración inicial (Partner)

1. En [partners.shopify.com](https://partners.shopify.com) → **Dev stores** → **Add dev store**
2. Activa **Generate test data** (productos/colecciones de prueba)
3. Edita `shopify.theme.toml` y pon tu tienda:

```toml
[environments.default]
store = "tu-tienda-dev.myshopify.com"
```

4. Instala dependencias y conecta:

```bash
npm install
npm run theme:list
```

5. Autenticación (primera vez): el CLI muestra un **código** y un **enlace** → ábrelo en el navegador (móvil vale), inicia sesión con Partner, pega el código.

## Comandos

```bash
npm run theme:dev          # Preview local + hot reload (link preview para móvil)
npm run theme:push:draft   # Subir como BORRADOR (no publica)
npm run theme:check        # Validar theme
```

## Preview en móvil

Tras `npm run theme:dev` o `theme:push:draft`, abre en el teléfono el link que da Shopify:

`https://tu-tienda-dev.myshopify.com/?preview_theme_id=XXXXX`

No hace falta abrir `127.0.0.1` en el móvil.

## Templates principales

| Template | Uso |
|---|---|
| `index.caletzza-store.json` | Homepage tienda |
| `index.json` | Landing Pack Básicas |
| `page.landing-basicas-x10.json` | Landing pack básicas |
| `page.landing-bodys-x4.json` | Landing pack bodys |
| `collection.json` | Colecciones con banner + tabla precios |
| `collection.bodys.json` | Template dedicado Bodys |

## Secciones Caletzza

| Sección | Descripción |
|---|---|
| `caletzza-marquee-bar` | Barra anuncios marquee |
| `caletzza-shipping-bar` | Beneficios envío/pago |
| `caletzza-category-grid` | Grid categorías |
| `caletzza-tabs-collection` | Colecciones con tabs |
| `caletzza-split-banner` | Banner dividido 50/50 |
| `caletzza-mobile-toolbar` | Nav inferior móvil |
| `caletzza-collection-banner` | Banner colección (desktop + móvil, bajo) |
| `caletzza-unit-price-table` | Tabla precios por unidades |

## Pack builder y COD

- **Pack Básicas / Pack Bodys:** `sections/pack-basicas.liquid`, `sections/pack-bodys4.liquid`
- **Modal COD (UI del theme):** `snippets/pack-cod-modal.liquid`
- **Backend pedidos COD:** requiere app separada (no incluida en este repo)

## Segunda imagen por variante

1. Admin → **Datos personalizados → Variantes → Agregar definición**
2. Nombre: `Segunda imagen`, namespace `custom`, tipo **Archivo** (imagen)
3. Asignar por variante/color

## Migrar a un repo nuevo

Si clonas este repo en GitHub/GitLab vacío:

```bash
git clone https://github.com/TU-USUARIO/caletzza-theme.git
cd caletzza-theme
npm install
# Editar shopify.theme.toml con tu dev store
npm run theme:push:draft
```

## Publicación

Siempre usar `theme:push:draft` hasta estar conforme. Publicar manualmente desde Admin → Temas.
