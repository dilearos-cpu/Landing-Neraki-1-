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