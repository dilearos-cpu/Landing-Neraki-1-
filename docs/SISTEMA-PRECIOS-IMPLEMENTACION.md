# Sistema de precios por cantidad — Guía de implementación en otro theme/repo

Documento de referencia para replicar el motor de reglas de precio (estilo Flycart) de Caletzza en otro tema Shopify o repositorio.

**Versión de referencia:** rama `cursor/global-discount-rules-1c6f` / theme live `Dawn + Packs + COD Express 1.0.2.4`

---

## 1. Qué hace el sistema

- Define **reglas de precio por cantidad** desde el Theme Editor (sin tocar código).
- Aplica precios en:
  - **Tienda:** tarjetas de colección, ficha de producto (PDP), carrito.
  - **Packs:** modal COD y checkout de packs.
- Soporta filtros por colección, producto, tag o todos los productos.
- Soporta tramos (`tiers`) con precio fijo por unidad, porcentaje o descuento fijo.
- El **checkout nativo de Shopify no aplica** estos descuentos automáticamente. Para cobrar el precio correcto se usa **COD Express** (`draftOrderCreate` + `invoiceUrl` o pedido COD).

---

## 2. Arquitectura

```
Theme Editor (Reglas de precio global)
        │
        ▼
discount-rules-group.json  →  discount-rules-global.liquid
        │                              │
        │                    JSON en <script data-discount-rules>
        ▼                              ▼
pack-discount-rules.js  ◄─────────────┘
        │
        ├── discount-rules-storefront.js  → tarjetas + PDP
        ├── discount-rules-cart.js        → carrito + intercept checkout
        └── pack-cod-checkout.js          → modal COD packs
                    │
                    ▼
            cod-express-app/server.js
            POST /apps/cod-express
            POST /apps/cod-express/checkout
```

---

## 3. Archivos a copiar

### 3.1 Núcleo obligatorio

| Archivo | Descripción |
|---|---|
| `assets/pack-discount-rules.js` | Motor de reglas: filtros, tramos, cálculo, API global `DiscountRules` / `PackDiscountRules` |
| `assets/pack-discount-rules.css` | Estilos: badge, tabla de tramos, totales en carrito |
| `sections/discount-rules-global.liquid` | Panel de reglas + exporta JSON al HTML |
| `sections/discount-rules-group.json` | Grupo de secciones que carga el panel en **todas** las páginas |

### 3.2 Capas de UI (tienda + carrito)

| Archivo | Descripción |
|---|---|
| `assets/discount-rules-storefront.js` | Actualiza precios en tarjetas y ficha de producto |
| `assets/discount-rules-cart.js` | Muestra descuento en carrito e intercepta el checkout |
| `snippets/discount-rules-card-price.liquid` | Wrapper de precio en tarjetas de producto |
| `snippets/discount-rules-tier-table.liquid` | Tabla "Precios por cantidad" en PDP |

### 3.3 Integración con packs y checkout (si aplica)

| Archivo | Descripción |
|---|---|
| `assets/pack-cod-checkout.js` | Modal COD; usa `PackDiscountRules.applyRules()` |
| `cod-express-app/` | Backend Node.js en Render; app proxy Shopify |

### 3.4 Legacy (opcional, no recomendado)

| Archivo | Nota |
|---|---|
| `sections/pack-discount-rules.liquid` | Versión antigua por página. Usar el panel **global** en su lugar. |

---

## 4. Integración en el theme destino

### Paso 1 — Cargar en todas las páginas

En `layout/theme.liquid`, antes de `</body>`:

```liquid
<script src="{{ 'pack-discount-rules.js' | asset_url }}" defer="defer"></script>
<script src="{{ 'discount-rules-storefront.js' | asset_url }}" defer="defer"></script>
<script src="{{ 'discount-rules-cart.js' | asset_url }}" defer="defer"></script>
{% sections 'discount-rules-group' %}
```

### Paso 2 — Tarjetas de colección

En `snippets/card-product.liquid`, sustituir el render del precio por:

```liquid
{% render 'discount-rules-card-price',
  card_product: card_product,
  show_compare_at_price: true
%}
```

> Suele haber 2–3 lugares en el mismo snippet (vista grid, lista, etc.).

### Paso 3 — Ficha de producto (PDP)

En `sections/main-product.liquid`, bloque `price`, añadir atributos al contenedor:

```liquid
<div
  id="price-{{ section.id }}"
  role="status"
  data-discount-rules-product
  data-section-id="{{ section.id }}"
  data-quantity-input="#Quantity-{{ section.id }}"
  data-product-id="{{ product.id }}"
  data-product-handle="{{ product.handle }}"
  data-variant-price="{{ product.selected_or_first_available_variant.price }}"
  data-collection-handles="{{ product.collections | map: 'handle' | join: ',' }}"
  data-tags="{{ product.tags | join: ',' }}"
>
  {%- render 'price', product: product, use_variant: true, show_badges: true, price_class: 'price--large' -%}
</div>
{% render 'discount-rules-tier-table', product: product %}
```

### Paso 4 — Packs con COD (opcional)

Si el theme ya tiene packs con checkout express:

- `pack-cod-checkout.js` ya consume el motor vía `PackDiscountRules.applyRules()`.
- Solo asegúrate de que el **Paso 1** esté hecho (scripts globales cargados).
- En la sección del pack, configura `cod_order_endpoint: /apps/cod-express`.

### Paso 5 — Proteger contenido del editor

Crea `.shopifyignore` en la raíz del theme:

```
templates/*.json
config/settings_data.json
```

Así los `theme:push` solo suben código (`assets/`, `sections/*.liquid`, `snippets/`, `layout/`) y **no pisan** páginas configuradas manualmente en el Theme Editor.

---

## 5. Configuración en Theme Editor

1. Abre el theme en **Theme Editor**.
2. Busca la sección **"Reglas de precio (global)"** (viene del grupo `discount-rules-group`).
3. Añade un bloque **Regla** por cada política de precio.

### Campos principales

| Campo | Valores | Descripción |
|---|---|---|
| **Activa** | checkbox | La regla solo aplica si está activa |
| **Alcance** | `storefront` / `pack` / `both` | Dónde aplica la regla |
| **Filtrar por** | colección / producto / tag / todos | Qué productos entran en la regla |
| **Modo conteo** | `filter_set` / `individual_product` | Cómo se suman cantidades para el tramo |
| **tiers_json** | JSON | Tramos de precio |
| **priority** | número | Mayor prioridad gana primero |
| **exclusive** | checkbox | Si es exclusiva, no se combina con otras |
| **checkout_endpoint** | texto | Default: `/apps/cod-express/checkout` |

### Alcances (`scope`)

| Valor | Dónde actúa |
|---|---|
| `storefront` | Home (packs), colección, PDP, carrito, checkout interceptado |
| `pack` | Solo modal COD de packs |
| `both` | Todo lo anterior |

> **Home con packs:** la Home usa secciones Pack (no tarjetas normales). Para que aplique ahí, usa alcance `storefront` o `both` y filtro por la **colección del pack** (ej. `bodys`), no solo un producto suelto.

### Formato `tiers_json`

Precios en **centavos** de la moneda de la tienda:

```json
[
  {"min":1,"max":3,"type":"fixed_price_per_item","value":4000000,"label":"1-3"},
  {"min":4,"max":10,"type":"fixed_price_per_item","value":2500000,"label":"4-10"}
]
```

| Campo | Ejemplo | Significado |
|---|---|---|
| `value: 4000000` | $40.000 COP | Precio unitario fijo en ese tramo |
| `value: 2500000` | $25.000 COP | Precio unitario fijo en ese tramo |

**Tipos de tramo soportados:**

| `type` | Efecto |
|---|---|
| `fixed_price_per_item` | Precio unitario fijo en el tramo |
| `percentage` | Descuento porcentual sobre el precio original |
| `fixed_discount` | Descuento fijo en centavos por unidad |

### Ejemplo real (Caletzza — body-bandeja)

```json
{
  "enabled": true,
  "scope": "storefront",
  "filter_type": "product",
  "product": "body-bandeja",
  "count_mode": "filter_set",
  "tiers_json": "[{\"min\":1,\"max\":3,\"type\":\"fixed_price_per_item\",\"value\":4000000,\"label\":\"1-3\"},{\"min\":4,\"max\":10,\"type\":\"fixed_price_per_item\",\"value\":2500000,\"label\":\"4-10\"}]",
  "priority": 10,
  "exclusive": true
}
```

---

## 6. Backend COD Express (checkout con descuento real)

El checkout estándar de Shopify **no refleja** estos descuentos. Para cobrar el precio correcto:

### Endpoints

| Ruta app proxy | Uso |
|---|---|
| `POST /apps/cod-express` | Crear pedido COD desde packs (`draftOrderCreate` + `draftOrderComplete`) |
| `POST /apps/cod-express/checkout` | Checkout carrito con descuento (`draftOrderCreate` → `invoiceUrl`) |

### Archivos del backend

```
cod-express-app/
├── server.js          # Lógica principal
├── package.json
├── shopify.app.toml   # Config app Shopify
├── .env.example
├── SETUP.md
└── SETUP-DEV-DASHBOARD.md
```

### Mutaciones GraphQL usadas

- `draftOrderCreate` — crea borrador con `appliedDiscount` (descuento fijo)
- `draftOrderComplete` — completa pedido COD como pago pendiente

### Variables de entorno necesarias

```
SHOPIFY_SHOP_DOMAIN=tu-tienda.myshopify.com
SHOPIFY_ADMIN_API_TOKEN=...   # o CLIENT_ID + CLIENT_SECRET (Dev Dashboard)
SHOPIFY_API_VERSION=2025-01
```

### App proxy en Shopify Admin

| Campo | Valor |
|---|---|
| Subpath | `cod-express` |
| Proxy URL | `https://TU-SERVIDOR.onrender.com/proxy/order` |

---

## 7. API JavaScript del motor

Tras cargar la página, el motor expone:

```javascript
window.DiscountRules  // alias de PackDiscountRules
```

Evento de arranque:

```javascript
document.addEventListener('discount-rules:ready', function (event) {
  console.log(event.detail.rules);
});
```

### Métodos principales

| Método | Uso |
|---|---|
| `applyRules(lineItems, context)` | Aplica reglas a líneas de pack (scope `pack`) |
| `applyStorefrontCartRules(cartItems, options)` | Aplica reglas al carrito (scope `storefront`) |
| `getLowestTierPrice(price, productContext, options)` | Mejor precio unitario para una cantidad |
| `getBestCardPrice(price, productContext, options)` | Precio para tarjetas ("Desde $X") |
| `getTierRowsForProduct(productContext, options)` | Filas para tabla de tramos en PDP |
| `getProductContextFromNode(domNode)` | Lee contexto de producto desde `data-*` del DOM |

---

## 8. Checklist de despliegue

```
[ ] Copiar archivos del núcleo (sección 3.1)
[ ] Copiar capas UI (sección 3.2)
[ ] Editar layout/theme.liquid (Paso 1)
[ ] Editar snippets/card-product.liquid (Paso 2)
[ ] Editar sections/main-product.liquid (Paso 3)
[ ] Crear .shopifyignore (Paso 5)
[ ] theme:push SOLO código (assets, sections liquid, snippets, layout)
[ ] En Theme Editor: configurar reglas en «Reglas de precio (global)»
[ ] Desplegar cod-express-app + configurar app proxy en la tienda destino
[ ] Probar colección → PDP → carrito → checkout
[ ] Probar pack completo → modal COD → pedido
[ ] Consola del navegador: debe aparecer "DiscountRules: reglas de tienda cargadas"
```

---

## 9. Pruebas

| Superficie | Qué verificar |
|---|---|
| **Colección** | Tarjeta con precio tachado + badge si hay tramo mejor |
| **PDP** | Precio cambia al subir cantidad; tabla de tramos visible |
| **Carrito** | Líneas con precio ajustado + bloque subtotal / descuento / total |
| **Checkout** | Con descuento → redirige a `invoiceUrl`; sin descuento → checkout normal |
| **Pack COD** | Resumen del modal refleja descuento aplicado |
| **Consola** | Sin warning "no se cargaron reglas" |

---

## 10. Orden recomendado de trabajo

1. Copiar archivos e integrar Liquid (**sin tocar** `templates/*.json`).
2. `theme:push` solo código.
3. Configurar reglas manualmente en Theme Editor.
4. Conectar COD Express en la tienda destino.
5. Probar cada superficie antes de crear más reglas.

---

## 11. Dependencias y requisitos

- Theme compatible con Dawn (snippets `price`, estructura de carrito estándar).
- Shopify CLI para deploy (`npm run theme:push`).
- App COD Express con permisos Admin API.
- Storefront API token en packs solo si el modal COD usa checkout online con prefill.

---

## 12. Comportamientos adicionales (Caletzza)

Estas mejoras van en archivos separados pero conviven con el sistema de precios:

| Funcionalidad | Archivos |
|---|---|
| Vaciar carrito al comprar pack | `pack-page-utils.js` → `replaceCartWithItems()` |
| Ocultar productos agotados en packs | `pack-bodys4.js`, `pack-basicas.js`, secciones Liquid |
| No pisar contenido del editor | `.shopifyignore` |

---

## 13. Troubleshooting

| Síntoma | Causa probable | Solución |
|---|---|---|
| No aparece descuento en tienda | Regla inactiva o scope incorrecto | Activar regla; usar `storefront` o `both` |
| No aplica en Home/pack | Filtro por producto en vez de colección | Cambiar filtro a la colección del pack |
| Checkout cobra precio sin descuento | Checkout nativo Shopify | Usar `/apps/cod-express/checkout` |
| Consola: "no se cargaron reglas" | Falta `{% sections 'discount-rules-group' %}` | Revisar `theme.liquid` |
| Precios en $0 o incorrectos | `value` en pesos en vez de centavos | Multiplicar por 100 (25000 → 2500000) |

---

## 14. Referencia rápida de archivos tocados en este repo

```
layout/theme.liquid                          # carga scripts + grupo global
sections/discount-rules-global.liquid        # panel + JSON reglas
sections/discount-rules-group.json           # grupo global
assets/pack-discount-rules.js                # motor
assets/pack-discount-rules.css               # estilos
assets/discount-rules-storefront.js          # UI tienda
assets/discount-rules-cart.js                # UI carrito
snippets/discount-rules-card-price.liquid    # precio en tarjetas
snippets/discount-rules-tier-table.liquid    # tabla PDP
snippets/card-product.liquid                 # integración tarjetas
sections/main-product.liquid                 # integración PDP
assets/pack-cod-checkout.js                  # packs + descuento
cod-express-app/server.js                    # backend checkout
.shopifyignore                               # protege templates/settings
```

---

*Documento generado para replicar el sistema en otro theme. No incluye contenido de páginas (`templates/*.json`); esas se configuran manualmente en el Theme Editor.*
