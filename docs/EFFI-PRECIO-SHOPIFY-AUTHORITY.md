# Precio autoridad Shopify → Effi (sin que Effi pise precios)

Objetivo en producción (Caletzza):

1. **En los pedidos que llegan a Effi**, el precio que debe prevalecer es el de **Shopify** (el cobrado al cliente).
2. **No actualizar** el catálogo de precios dentro de Effi desde Shopify.
3. **No permitir** que Effi vuelva a cambiar precios en Shopify.

---

## Modelo deseado

```
Shopify (fuente del precio de venta)
   │
   │  pedido con line items + priceOverride / precio cobrado
   ▼
Effi (solo opera logística / guías / recaudo)
   │
   ✗  no escribe precios ni productos en Shopify
   ✗  no se sincroniza el catálogo de precios Effi ↔ Shopify
```

---

## A. Bloquear que Effi cambie precios en Shopify (obligatorio)

Esto se hace en **Shopify Admin**, no en código.

1. Abre `https://admin.shopify.com/store/caletzza`
2. **Configuración → Apps y canales de ventas**
3. Abre la app de **Effi** (o la app personalizada / conector que usa Effi)
4. Revisa permisos / scopes. Debe poder:
   - leer/escribir **pedidos** (`read_orders` / `write_orders` o fulfillments según usen)
   - opcional: inventario, si quieren stock
5. **Quitar** (si existen):
   - `write_products`
   - cualquier permiso de escritura de variantes / precios / catálogo

Sin `write_products`, Effi **no puede** sobrescribir el precio de un producto en Shopify aunque el ERP intente sincronizar catálogo.

> Si Effi es una app del App Store y el scope es obligatorio, pide a soporte Effi desactivar “actualizar productos/precios hacia Shopify”, o reinstala el conector solo con pedidos.

### En Effi ERP (panel)

1. Entra a Effi → **Administración → Tiendas virtuales** (o Integración Shopify).
2. Desactiva / deja en off:
   - sincronizar / actualizar **productos**
   - sincronizar / actualizar **precios**
   - exportar catálogo hacia la tienda
3. Mantén activo solo:
   - **importar pedidos** desde Shopify
   - (opcional) estados de guía / fulfillment de vuelta a Shopify
   - (opcional) stock, si lo necesitan

No hace falta “empujar” el precio de Shopify al artículo de Effi: el precio de venta viaja **dentro del pedido**.

---

## B. Que el pedido lleve el precio de Shopify (código Caletzza)

En COD Express / checkout de packs:

- El frontend manda `unitPrice` (centavos) por línea = precio neto de Shopify (reglas de pack incluidas).
- El backend fija ese valor con GraphQL `priceOverride` en el draft order.
- El pedido queda etiquetado `Shopify-Price-Authority` y atributos:
  - `_price_authority = shopify`
  - `_price_source = shopify`
  - `_shopify_unit_price_cents = …`

Así, cuando Effi lee el pedido de Shopify, ve el **precio cobrado en Shopify**, no el precio del artículo en Effi.

Archivos:

| Archivo | Rol |
|---|---|
| `cod-express-app/server.js` | `priceOverride` + atributos de autoridad |
| `assets/pack-cod-checkout.js` | envía `unitPrice` neto del pack |
| `assets/discount-rules-cart.js` | envía `unitPrice` del carrito |

Tras desplegar: **Render** (COD Express) + **theme push** de los assets.

---

## C. Qué no hacemos (a propósito)

| Acción | ¿Se hace? | Por qué |
|---|---|---|
| Actualizar precio del artículo en Effi con el de Shopify | **No** | Pediste no cambiar precios en Effi |
| Dejar que Effi actualice el producto en Shopify | **No** | Pediste que no los cambien desde Effi |
| Usar solo el precio del catálogo Effi al importar el pedido | **No** | Debe mandar el precio del pedido Shopify |

Si en Effi, al abrir un pedido, ves el precio del **artículo ERP** en vez del de la línea del pedido, pide a soporte Effi:  
**“Usar precio de la plataforma / precio del pedido al importar órdenes de Shopify”**.

---

## D. Checklist de verificación (5 min)

1. En Shopify, cambia el precio de un SKU de prueba (solo Admin).
2. Confirma que **no** vuelve solo al valor de Effi en los siguientes minutos/horas.
3. Crea un pedido COD/pack de prueba.
4. En Shopify Admin, abre el pedido: el line item debe mostrar el precio de Shopify (y atributos `_shopify_unit_price_cents`).
5. En Effi, abre el mismo pedido: el valor de la línea/total debe coincidir con Shopify.
6. En Effi, el precio del **artículo de inventario** no debe haberse modificado.

---

## E. Contacto útil Effi

- Soporte: `soporte@effisystems.com`
- Academia: lección **Integración Shopify** en efficommerce.com
- Video: [SHOPIFY - EFFI ERP INTEGRATION](https://www.youtube.com/watch?v=L0HDzpMZbD4)
