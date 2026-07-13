# Landing-Neraki-1-

## Shopify pack builder

Se agrego una implementacion para Shopify que replica la idea del shortcode/ajax de WooCommerce:

- muestra una grilla de productos de una coleccion;
- permite llenar un numero configurable de slots;
- soporta productos simples y con variantes;
- agrega todo el pack al carrito en una sola llamada Ajax;
- redirige al checkout al finalizar.

### Archivos

- `sections/pack-bodys4.liquid` → productos con variantes (+ segunda imagen por color)
- `sections/pack-basicas.liquid` → solo productos simples
- `assets/pack-bodys4.js`
- `assets/pack-basicas.js`
- `assets/pack-bodys4.css` (compartido por ambos)
- `snippets/pack-product-seconds.liquid` → JSON de segundas imagenes (Pack Bodys 4)
- `templates/product.pack-seconds.liquid` → endpoint Ajax para segundas imagenes

### Como usarlo

1. Copia estos archivos a tu tema Shopify.
2. En el editor del tema, agrega la seccion **Pack Bodys 4** o **Pack Basicas** segun tu landing.
3. Selecciona la coleccion que quieres usar.
4. Ajusta cantidad de slots, textos, limite de productos y el panel de espaciado/fondo.
5. Guarda y publica.

**Pack Bodys 4:** productos variables (abre modal de talla/color).  
**Pack Basicas:** solo productos simples (un clic y listo).

### Diferencias con WooCommerce

- En Shopify no existe `add_action` ni `shortcode`; el equivalente natural es una **seccion Liquid** con JavaScript del tema.
- El agregado multiple se hace contra `POST /cart/add.js` usando `items`.
- Para productos con variantes se envia el `variant_id`, que es lo que Shopify necesita para agregar al carrito.

## Segunda imagen por variante (Pack Bodys 4)

Adaptacion del plugin WooCommerce `wc-variacion-segunda-imagen`: en el modal de variantes del pack se muestran **dos imagenes lado a lado** (principal + segunda imagen del color seleccionado).

### Archivos

- `sections/pack-bodys4.liquid` — incluye metafields en el JSON inicial (hasta 50 productos)
- `assets/pack-bodys4.js` — modal de variantes con preview dual
- `assets/pack-bodys4.css` — estilos `.variant-picker__media` y `.variant-picker__second`
- `snippets/pack-product-seconds.liquid` — genera JSON de segundas imagenes
- `templates/product.pack-seconds.liquid` — endpoint Ajax para productos cargados despues (colecciones grandes)

### Configuracion en Shopify Admin

1. Ve a **Configuracion → Metafields y metaobjetos → Variantes**.
2. Crea un metafield:
   - **Namespace y key:** `custom.second_image`
   - **Tipo:** Archivo → Imagen (o referencia de archivo)
3. En cada variante del producto, sube la **segunda imagen** correspondiente al color.
4. Repite por color/talla segun tu catalogo.

En la seccion **Pack Bodys 4** puedes cambiar namespace/key si usas otro metafield (por defecto `custom` / `second_image`).

### Como se ve

1. El cliente abre un slot del pack y elige un producto variable.
2. Se abre el modal de variantes con la imagen principal a la izquierda.
3. Al elegir color (u opcion que no sea talla), aparece la **segunda imagen** a la derecha si existe en el metafield.
4. Las imagenes se agrupan por color, igual que en WooCommerce.

### Notas

- Los primeros 50 productos de la coleccion cargan las segundas imagenes en el HTML.
- Si cargas mas de 50 productos (Ajax), el JS consulta `/products/{handle}?view=pack-seconds` para obtener las segundas imagenes.
- Copia tambien `snippets/pack-product-seconds.liquid` y `templates/product.pack-seconds.liquid` al tema.

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

## Banner responsive

Seccion para mostrar una imagen en escritorio y otra distinta en movil.

### Archivos

- `sections/responsive-banner.liquid`
- `assets/responsive-banner.css`

### Como usarlo

1. Copia los archivos al tema.
2. Agrega la seccion **Banner responsive** en la pagina que quieras.
3. Sube la imagen de escritorio y la de movil.
4. Opcional: enlace, texto alternativo, ancho completo o contenedor, padding, margin y borde redondeado.

## Tracking pixels (Meta, TikTok, Google)

Hay dos piezas segun tu caso:

1. **Landings distintas** → seccion `Pixels de landing` (una por pagina)
2. **Checkout + gracias por tu compra** → pixel personalizado `checkout-dual-pixels.js` en el admin de Shopify

### Archivos

- `sections/landing-pixels.liquid` → una landing = un pixel
- `sections/tracking-pixels.liquid` → pixel global (opcional)
- `snippets/tracking-pixels.liquid`
- `assets/checkout-dual-pixels.js` → ambos pixeles en checkout y thank you

---

### A) Landing de basicas con su pixel

1. Sube los archivos al tema.
2. Abre la pagina/landing de **basicas** en el personalizador.
3. Agrega la seccion **Pixels landing basicas** (o **Pixels de landing**).
4. Activa Meta/TikTok/Google y pega solo los IDs de basicas.
5. Guarda.

### B) Landing de bodys con otro pixel

1. Abre la pagina/landing de **bodys**.
2. Agrega otra seccion **Pixels landing bodys**.
3. Pega solo los IDs de bodys.
4. Guarda.

Importante: **no** pongas estas secciones en el header global. Van solo en cada landing.

---

### C) Checkout y pagina de gracias con AMBOS pixeles

El checkout **no usa el tema**, asi que esto se configura en Shopify Admin:

1. Ve a **Configuracion → Eventos de cliente**.
2. Pulsa **Agregar pixel personalizado → Personalizado**.
3. Nombre sugerido: `Checkout basicas + bodys`.
4. Abre `assets/checkout-dual-pixels.js` del repo.
5. Reemplaza estos valores con tus IDs reales:

```js
const PIXELS = {
  basicas: {
    meta: "123456789012345",
    tiktok: "C4AAAAABASICAS",
    google: "AW-BASICAS"
  },
  bodys: {
    meta: "987654321098765",
    tiktok: "C4AAAAABODYS",
    google: "AW-BODYS"
  }
};
```

6. Pega todo el codigo en el pixel personalizado.
7. Guarda y conectalo a la tienda online.

Ese script:

- en **checkout** carga los dos pixeles (basicas + bodys)
- en **gracias por tu compra / thank you** tambien
- en **checkout_completed** dispara evento de compra en ambos

---

### Resumen rapido

| Pagina | Que pixel corre |
|---|---|
| Landing basicas | Solo pixel basicas |
| Landing bodys | Solo pixel bodys |
| Checkout | Basicas + bodys |
| Gracias por tu compra | Basicas + bodys |
| Resto de la tienda | Ninguno (salvo que agregues otra seccion) |

---

## Popup de prueba social (conversion boost)

Notificaciones emergentes tipo *"Juanito ha comprado un pack de bodys x4 hace 1 minuto en Bogotá"* para aumentar la confianza y conversion durante la compra.

### Archivos

- `sections/social-proof-popup.liquid` → seccion con panel de admin y bloques (shortcodes). **Debe ir solo en la carpeta `sections/`**
- `snippets/social-proof-popup.liquid` → equivalente a shortcode para paginas puntuales. **Debe ir solo en `snippets/` (sin bloque schema)**
- `assets/social-proof-popup.js`
- `assets/social-proof-popup.css`

### Como usarlo (seccion)

1. Copia los archivos a tu tema Shopify.
2. En el editor del tema, agrega la seccion **Popup prueba social** solo en las paginas donde quieras mostrarlo (landing de pack, producto, etc.).
3. En **Pack / Producto** configura el nombre del pack y las unidades (ej: `pack de bodys` x4).
4. Opcional: agrega bloques **Campaña adicional** si quieres rotar varios packs distintos.
5. Ajusta tiempos, posicion, ciudades y nombres en los ajustes globales de la seccion.
6. Guarda y publica.

Cada bloque funciona como un shortcode independiente. Si tienes varios bloques, el popup elige uno al azar en cada ciclo.

### Como usarlo (snippet / shortcode manual)

En cualquier template `.liquid` donde necesites el popup en una pagina especifica:

```liquid
{% render 'social-proof-popup',
  pack_label: 'pack de bodys',
  units: 4
%}
```

Con unidades aleatorias:

```liquid
{% render 'social-proof-popup',
  pack_label: 'pack de bodys',
  random_units: true,
  units_min: 2,
  units_max: 10
%}
```

Con nombres y campana personalizada:

```liquid
{% render 'social-proof-popup',
  campaign_id: 'pack-bodys-10',
  pack_label: 'pack de bodys',
  units: 10,
  names: 'Juanito,Paola,Mateo'
%}
```

### Variables de la plantilla del mensaje

| Variable | Descripcion |
|---|---|
| `{name}` | Nombre aleatorio del comprador |
| `{pack}` | Nombre del pack con unidades (ej: pack de bodys x4) |
| `{units}` | Numero de unidades |
| `{time}` | Tiempo aleatorio (ej: hace 1 minuto) |
| `{city}` | Ciudad aleatoria de Colombia |

Plantilla por defecto: `{name} ha comprado un {pack} hace {time} en {city}`

### Ciudades incluidas por defecto

Bogota, Medellin, Cali, Barranquilla, Cartagena, Bucaramanga, Pereira, Manizales, Santa Marta, Ibague, Cucuta, Villavicencio, Pasto, Monteria, Armenia.

Puedes editarlas desde el panel de la seccion.

### Diferencias con WordPress shortcodes

- En Shopify no existe `shortcode`; el equivalente es una **seccion Liquid** (panel visual) o un **snippet** (`{% render %}`).
- Cada bloque **Campaña / Shortcode** en la seccion equivale a un shortcode configurable desde el admin del tema.
- El popup es fijo en pantalla (esquina inferior) y no ocupa espacio en el layout de la pagina.
