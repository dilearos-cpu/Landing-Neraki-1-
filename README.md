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
4. Ajusta cantidad de slots, textos y limite de productos.
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