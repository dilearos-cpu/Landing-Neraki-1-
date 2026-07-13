# COD Express — Guía Dev Dashboard (Caletzza)

Ruta actual de Shopify para crear apps nuevas (2026).

---

## PARTE 1 — Crear la app en Dev Dashboard

### 1. Entrar al Dev Dashboard

1. Abre **https://dev.shopify.com**
2. Inicia sesión con la cuenta **dueña de Caletzza**
3. Menú izquierdo → **Apps**
4. Arriba a la derecha → **Create app**
5. **Start from Dev Dashboard**
6. Nombre: `COD Express`
7. **Create**

---

## PARTE 2 — Crear la versión (scopes + app proxy)

### 2. Configurar versión

1. En la app → pestaña **Versions**
2. **Create version** (o editar la activa)

Completa estos campos:

| Campo | Valor |
|-------|-------|
| **App URL** | `https://shopify.dev/apps/default-app-home` |
| **Webhooks API version** | La más reciente (ej. 2025-01) |

### 3. Scopes (permisos)

Activa estos access scopes:

```
write_draft_orders
write_orders
write_app_proxy
read_products
```

> `write_app_proxy` es obligatorio para que funcione `/apps/cod-express/order`

### 4. App proxy

En la misma pantalla de versión, sección **App proxy**:

| Campo | Valor |
|-------|-------|
| **Subpath prefix** | `apps` |
| **Subpath** | `cod-express` |
| **Proxy URL** | `https://TU-SERVIDOR.onrender.com/proxy/order` |

> Si aún no tienes Render, pon una URL temporal y actualízala después del deploy.

### 5. Publicar versión

1. **Release** (o **Save and release**)
2. Confirma

---

## PARTE 3 — Instalar en Caletzza

### 6. Instalar la app en la tienda

1. Menú izquierdo → **Home** (de la app COD Express)
2. Baja a **Install app**
3. Selecciona la tienda **caletzza** (o créala si es dev store)
4. **Install**
5. Acepta los permisos en la tienda

### 7. Copiar credenciales

1. Menú **Settings** de la app
2. Guarda en un bloc de notas:

| Credencial | Uso |
|------------|-----|
| **Client ID** | Render → `SHOPIFY_CLIENT_ID` |
| **Client secret** | Render → `SHOPIFY_CLIENT_SECRET` y `SHOPIFY_API_SECRET` |

> No hay `shpat_` permanente. El servidor renueva el token automáticamente cada 24 h.

---

## PARTE 4 — Desplegar servidor en Render

### 8. Crear servicio en Render

1. **https://render.com** → conectar repo GitHub
2. **New → Web Service** (o Blueprint con `render.yaml`)
3. Configuración:

| Campo | Valor |
|-------|-------|
| Root Directory | `cod-express-app` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Plan | Free |

### 9. Variables de entorno en Render

| Key | Value |
|-----|-------|
| `SHOPIFY_SHOP_DOMAIN` | `caletzza.myshopify.com` |
| `SHOPIFY_CLIENT_ID` | (Client ID del paso 7) |
| `SHOPIFY_CLIENT_SECRET` | (Client secret del paso 7) |
| `SHOPIFY_API_SECRET` | (mismo Client secret) |
| `SHOPIFY_API_VERSION` | `2025-01` |
| `PORT` | `3000` |

### 10. Deploy y verificar

1. **Deploy** → espera **Live**
2. Copia la URL: `https://cod-express-xxxx.onrender.com`
3. Abre: `https://TU-URL.onrender.com/health`

Debe responder:
```json
{"ok":true,"shop":"caletzza.myshopify.com"}
```

### 11. Actualizar App proxy con URL real

1. Vuelve a **dev.shopify.com** → COD Express → **Versions**
2. **Create version** (nueva versión con la URL correcta)
3. App proxy → Proxy URL: `https://TU-URL.onrender.com/proxy/order`
4. **Release**
5. En Admin de Caletzza, si pide aprobar nueva versión → acepta

---

## PARTE 5 — Theme y prueba

### 12. Theme (si no está subido)

```bash
npm run theme:push
```

Theme Editor → Pack Bodys 4 → Checkout express COD:

- ✅ Usar checkout express COD
- URL app proxy: `/apps/cod-express/order`
- IVA: 19%

### 13. Probar pedido

1. Landing Pack Bodys → selecciona 4 productos
2. **Comprar ahora**
3. Completa formulario COD
4. **Confirmar pedido COD**

**Éxito:**
- Pantalla "¡Pedido confirmado!" con `#número`
- Admin → Pedidos → nuevo pedido (pago pendiente)

---

## Solución de problemas

| Error | Solución |
|-------|----------|
| `Firma de app proxy invalida` | `SHOPIFY_API_SECRET` = Client secret en Render |
| `No se pudo obtener el access token` | App instalada en caletzza + Client ID/Secret correctos |
| `Configura SHOPIFY_CLIENT_ID...` | Faltan variables en Render |
| Primera petición muy lenta | Render free "despierta" tras ~15 min inactivo |
| 401 en proxy | Reinstala app o revisa que la versión tenga `write_app_proxy` |

---

## Checklist

- [ ] App creada en dev.shopify.com
- [ ] Versión con scopes + app proxy publicada
- [ ] App instalada en caletzza
- [ ] Client ID y Secret guardados
- [ ] Render desplegado con 4 variables
- [ ] `/health` OK
- [ ] Proxy URL actualizada con URL de Render
- [ ] Pedido de prueba en Admin
