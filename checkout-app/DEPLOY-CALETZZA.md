# Desplegar Checkout Customizer en Caletzza

App lista para **caletzza.myshopify.com**. Incluye:

- Autocompletado de código postal colombiano (`000000`)
- Aviso colapsado editable para el cliente
- Panel admin para banners y campos personalizados

## Paso 1 — Vincular la app (solo una vez)

En la terminal de Cursor:

```bash
cd checkout-app
npm install
npm run setup
npx shopify app config link
```

1. Inicia sesión en tu cuenta de **Shopify Partners**
2. Crea una app nueva o selecciona una existente llamada "Checkout Customizer"
3. El CLI guardará el `client_id` en `shopify.app.toml`

## Paso 2 — Instalar en la tienda

```bash
cd checkout-app
npm run dev
```

1. El CLI abrirá un enlace para instalar la app en **caletzza.myshopify.com**
2. Acepta los permisos
3. En el panel de la app verás: Banners, Campos, Campos predeterminados

## Paso 3 — Activar la extensión en el checkout

1. Ve a **Configuración > Checkout > Personalizar** en el admin de Shopify
2. En el editor de checkout, busca **Checkout Customizer**
3. Activa y coloca los bloques:
   - **Header Banner** → después del encabezado
   - **Contact Fields** → después del contacto
   - **Delivery Fields** → después de la dirección (aquí va el código postal)
   - **Block Extension** → bloque general
4. Guarda

## Paso 4 — Configurar código postal (Colombia)

En la app → **Campos predeterminados**:

- Activa **Alternativa de código postal**
- Valor por defecto: `000000`
- Modo: **Aviso colapsado (recomendado)**
- Guarda

> Por defecto la extensión ya viene con el workaround activado para Colombia, pero guardar desde el panel sincroniza la config al metafield de la tienda.

## Paso 5 — Publicar en producción

Cuando todo funcione en desarrollo:

```bash
cd checkout-app
npm run build
npm run deploy -- --allow-updates
```

Luego instala la versión publicada en la tienda desde el admin de Partners o reinstala la app.

## Verificación rápida

1. Agrega un producto al carrito en caletzza.myshopify.com
2. Ve al checkout
3. En la sección de dirección deberías ver el aviso de código postal colapsado
4. El campo ZIP debería autocompletarse con `000000`

## Estructura

```
checkout-app/
  app/                    # Panel admin embebido
  extensions/
    checkout-customizer/  # Extensión de Checkout UI
  shopify.app.toml        # Config (store: caletzza.myshopify.com)
```

## Notas

- Shopify **no permite** ocultar el campo nativo de código postal; esta app lo autocompleta y guía al cliente.
- Para ocultar empresa/apartamento/teléfono, configúralo también en **Configuración > Checkout** del admin.
- El tema de la tienda vive en la raíz del repo; la app de checkout vive en `checkout-app/`.
