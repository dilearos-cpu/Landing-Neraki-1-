# Caletzza Theme

Repositorio completo del **theme Shopify Caletzza** + **app COD Express** (Render).

## Contenido del repo

```
assets/  config/  layout/  locales/
sections/  snippets/  templates/  blocks/   ← Theme Shopify
cod-express-app/                              ← App backend pedidos COD
render.yaml                                   ← Deploy en Render (Blueprint)
shopify.theme.toml
package.json
```

## Funcionalidades incluidas

| Módulo | Descripción |
|--------|-------------|
| **Pack Básicas** | Elige 10 diseños — `sections/pack-basicas.liquid` |
| **Pack Bodys x4** | Pack variable con modal — `sections/pack-bodys4.liquid` |
| **Checkout express COD** | Modal + app proxy — `snippets/pack-cod-modal.liquid`, `cod-express-app/` |
| **Segunda imagen variante** | Metafield por color/talla |
| **Prueba social** | Popup compras recientes |
| **Secciones tienda Caletzza** | Marquee, shipping, tabs, banners colección, tabla precios |
| **Landings** | `index.json`, `page.landing-basicas-x10.json`, `page.landing-bodys-x4.json` |

## Requisitos

- Node.js 22+
- Cuenta **Shopify Partners** + Development Store (o tienda con acceso Temas)
- Cuenta **Render** (plan Free vale para COD app)

---

## 1. Theme Shopify

### Configurar tienda

Edita `shopify.theme.toml`:

```toml
[environments.default]
store = "tu-tienda-dev.myshopify.com"
```

### Comandos

```bash
npm install
npm run theme:list          # Primera vez: login Partner (link + código)
npm run theme:dev           # Preview con hot reload
npm run theme:push:draft    # Subir como BORRADOR (no publica)
npm run theme:check
```

### Preview en móvil

Usa el link que da Shopify:

`https://tu-tienda.myshopify.com/?preview_theme_id=XXXXX`

---

## 2. Checkout express COD (app)

La UI del checkout está en el theme; **crear pedidos en Shopify** requiere la app en `cod-express-app/`.

Documentación detallada:

- [cod-express-app/README.md](cod-express-app/README.md)
- [cod-express-app/SETUP-DEV-DASHBOARD.md](cod-express-app/SETUP-DEV-DASHBOARD.md)

### Desarrollo local

```bash
cd cod-express-app
cp .env.example .env
# Completar SHOPIFY_CLIENT_ID, SHOPIFY_CLIENT_SECRET, etc.
npm install
npm run dev
```

### Conectar theme → app

En **Pack Bodys 4** (personalizador) → **Checkout express COD**:

- **URL app proxy pedido:** `https://tu-app.onrender.com/proxy/order`
- Activar COD, umbrales envío, etc.

---

## 3. Deploy en Render

El archivo `render.yaml` define el servicio web `cod-express`:

1. [render.com](https://render.com) → **New → Blueprint** → conecta este repo
2. Render detecta `render.yaml` automáticamente
3. Configura variables secretas en el dashboard:
   - `SHOPIFY_CLIENT_ID`
   - `SHOPIFY_CLIENT_SECRET`
   - `SHOPIFY_API_SECRET`
4. Ajusta `SHOPIFY_SHOP_DOMAIN` si no es `caletzza.myshopify.com`

**Health check:** `GET /health` (usar con cron-job.org en plan Free para mantener despierto — ver SETUP-DEV-DASHBOARD.md).

---

## Templates principales

| Template | Uso |
|----------|-----|
| `index.caletzza-store.json` | Homepage tienda |
| `index.json` | Landing Pack Básicas |
| `page.landing-basicas-x10.json` | Landing pack básicas |
| `page.landing-bodys-x4.json` | Landing pack bodys + COD |
| `collection.json` | Colección con banner + tabla precios |
| `collection.bodys.json` | Template Bodys |

---

## Segunda imagen por variante

1. Admin → **Datos personalizados → Variantes → Agregar definición**
2. Namespace `custom`, clave `custom_second_image`, tipo **Archivo** (imagen)

---

## Flujo recomendado (Partner + Render)

1. Crear **dev store** en Partners con test data
2. `npm run theme:push:draft` → theme en borrador
3. Desplegar `cod-express-app` en Render (Blueprint)
4. Configurar app proxy en Shopify Dev Dashboard → URL Render
5. En theme customizer: Pack Bodys → pegar URL proxy
6. Probar landing bodys en móvil con link preview

**No publicar** el theme hasta validar pack + COD end-to-end.
