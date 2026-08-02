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

## A. Bloquear precios, **sin** cortar inventario

Inventario y precios **no son el mismo permiso** en Shopify:

| Scope Shopify | Qué permite | ¿Lo necesita Caletzza con Effi? |
|---|---|---|
| `write_inventory` | Cambiar **stock** (`inventorySetQuantities` / `inventoryAdjustQuantities`) | **Sí — mantener** |
| `read_inventory` | Leer stock | **Sí — mantener** |
| `write_products` | Editar producto/variante (**incluye precio**, título, SKU, etc.) | **No para precios** |
| `write_orders` / fulfillments | Pedidos y guías | **Sí — mantener** |

**No quites `write_inventory`.** Eso es lo que deja a Effi actualizar el stock en Shopify.

### Camino recomendado (preferido): apagar solo precios en Effi

1. Entra a Effi → **Administración → Tiendas virtuales** / Integración Shopify.
2. **Mantén activo:**
   - sincronizar / actualizar **inventario (stock)**
   - **importar pedidos** desde Shopify
   - estados de guía / fulfillment (si los usan)
3. **Desactiva:**
   - sincronizar / actualizar **productos**
   - sincronizar / actualizar **precios**
   - exportar catálogo / tarifas hacia la tienda

Así Effi sigue empujando stock y **no** pisa el precio de Shopify.  
El precio de venta viaja en el **pedido**, no en el artículo del ERP.

### Camino opcional (Shopify scopes): quitar solo `write_products`

Solo si en el panel de Effi **no** puedes separar “precios” de “stock”:

1. `https://admin.shopify.com/store/caletzza` → **Apps** → app Effi
2. **Deja** `write_inventory` / `read_inventory` (y pedidos)
3. **Quita solo** `write_products` si Effi realmente usa `write_inventory` para el stock

> Si al quitar `write_products` el stock deja de actualizarse, **vuelve a activarlo** y usa solo el panel de Effi (camino recomendado). Algunas apps antiguas mezclan operaciones; en la API actual de Shopify el stock va por `write_inventory`, no por `write_products`.

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
