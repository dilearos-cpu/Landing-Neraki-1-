# Landing-Neraki-1-

## Shopify pack builder

Se agrego una implementacion para Shopify que replica la idea del shortcode/ajax de WooCommerce:

- muestra una grilla de productos de una coleccion;
- permite llenar un numero configurable de slots;
- soporta productos simples y con variantes;
- agrega todo el pack al carrito en una sola llamada Ajax;
- redirige al checkout al finalizar.

### Archivos

- `sections/pack-bodys4.liquid`
- `assets/pack-bodys4.js`
- `assets/pack-bodys4.css`

### Como usarlo

1. Copia estos archivos a tu tema Shopify.
2. En el editor del tema, agrega la seccion **Pack Bodys 4**.
3. Selecciona la coleccion que quieres usar.
4. Ajusta cantidad de slots, textos, limite de productos y el panel de espaciado/fondo.
5. Guarda y publica.

### Diferencias con WooCommerce

- En Shopify no existe `add_action` ni `shortcode`; el equivalente natural es una **seccion Liquid** con JavaScript del tema.
- El agregado multiple se hace contra `POST /cart/add.js` usando `items`.
- Para productos con variantes se envia el `variant_id`, que es lo que Shopify necesita para agregar al carrito.

## Carrusel de fotos

Seccion independiente para mostrar imagenes en carrusel.

### Archivos

- `sections/photo-carousel.liquid`
- `assets/photo-carousel.js`
- `assets/photo-carousel.css`

### Como usarlo

1. Copia los archivos al tema.
2. Agrega la seccion **Carrusel de fotos** en la pagina que quieras.
3. Agrega bloques de tipo **Imagen** con las fotos que necesites.
4. Configura velocidad, pausa al hover, flechas, imagenes visibles en escritorio y el panel de espaciado/fondo.

## Contador promo 24h

Seccion independiente con la visual del contador regresivo y barra de promos.

### Archivos

- `sections/promo-countdown.liquid`
- `assets/promo-countdown.js`
- `assets/promo-countdown.css`

### Como usarlo

1. Copia los archivos al tema.
2. Agrega la seccion **Contador promo 24h** encima o debajo del pack builder.
3. Configura promos disponibles, total de promos y textos.
4. El contador inicia en 24 horas cuando la persona entra por primera vez y se reinicia automaticamente al cumplirse ese tiempo (usa `localStorage` del navegador).

## Tracking pixels (Meta, TikTok, Google)

Seccion para pegar IDs de tracking sin editar codigo cada vez.

### Archivos

- `sections/tracking-pixels.liquid`
- `snippets/tracking-pixels.liquid`

### Como usarlo

**Opcion A (recomendada en Horizon):**

1. Copia los 2 archivos al tema.
2. Ve a **Personalizar tema**.
3. En la parte superior, haz clic en el area del **encabezado / header**.
4. Pulsa **Agregar seccion** y elige **Tracking pixels**.
5. Activa Meta, TikTok o Google y pega cada ID.
6. Guarda.

**Opcion B (por codigo en el header group):**

En `sections/header-group.json`, agrega un bloque como este dentro de `"sections"`:

```json
"tracking_pixels": {
  "type": "tracking-pixels",
  "settings": {
    "enable_meta": true,
    "meta_pixel_id": "123456789012345",
    "enable_tiktok": false,
    "tiktok_pixel_id": "",
    "enable_google": true,
    "google_ads_id": "AW-XXXXXXXXX",
    "custom_scripts": ""
  }
}
```

Y anade `"tracking_pixels"` al array `"order"` del header.

**Opcion C (snippet manual en theme.liquid):**

Si prefieres fijarlo en codigo, antes de `</head>` en `layout/theme.liquid`:

```liquid
{% render 'tracking-pixels',
  enable_meta: true,
  meta_pixel_id: 'TU_META_PIXEL_ID',
  enable_tiktok: true,
  tiktok_pixel_id: 'TU_TIKTOK_PIXEL_ID',
  enable_google: true,
  google_ads_id: 'AW-XXXXXXXXX',
  custom_scripts: ''
%}
```

### IDs que debes pegar

- **Meta:** Pixel ID numerico (ej. `123456789012345`)
- **TikTok:** Pixel ID (ej. `C4ABCDEF1234567890`)
- **Google:** `AW-XXXXXXXXX` para Google Ads o `G-XXXXXXXXXX` para GA4