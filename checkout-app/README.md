# Checkout Customizer

App de Shopify para personalizar el checkout: agregar campos personalizados, banners informativos, y gestionar preferencias sobre campos predeterminados.

## Funcionalidades

- **Banners**: mensajes informativos, promocionales o de advertencia en encabezado, contacto, entrega o bloque general.
- **Campos personalizados**: texto, número, fecha, email, teléfono, lista desplegable, casilla de verificación.
- **Obligatoriedad**: marca tus campos personalizados como obligatorios u opcionales.
- **Campos nativos**: guía y recordatorios para ocultar u opcionalizar campos de Shopify (empresa, apartamento, teléfono).
- **Sincronización**: la configuración se guarda en base de datos y se publica como metafield de la tienda para la extensión de checkout.

## Requisitos

- Node.js 20+
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
- Cuenta de [Shopify Partners](https://partners.shopify.com/)

## Instalación

```bash
npm install
npm run setup
```

## Desarrollo local

```bash
shopify app dev
```

1. Instala la app en tu tienda de desarrollo.
2. Configura banners y campos desde el panel de la app.
3. Abre **Configuración > Checkout > Personalizar** y activa la extensión **Checkout Customizer**.
4. Mueve los bloques a la posición deseada.

## Estructura

```
app/
  routes/
    app._index.tsx              # Dashboard
    app.banners.tsx             # Gestión de banners
    app.campos.tsx              # Campos personalizados
    app.campos-predeterminados.tsx  # Preferencias de campos nativos
  models/checkout-config.server.ts
  types/checkout-config.ts
extensions/
  checkout-customizer/          # Extensión de Checkout UI
```

## Limitaciones de Shopify

Shopify **no permite** que las apps oculten o deshabiliten campos nativos obligatorios del checkout (nombre, dirección, país, etc.). Solo algunos campos como empresa, apartamento y teléfono pueden ajustarse desde **Configuración > Checkout** en el admin de Shopify.

Esta app:

- Agrega campos y banners nuevos vía Checkout UI Extensions.
- Valida campos personalizados obligatorios antes de continuar.
- Muestra recordatorios para configurar campos nativos en el admin.

## Despliegue

```bash
npm run build
npm run deploy
```

Consulta la [documentación de despliegue de Shopify](https://shopify.dev/docs/apps/launch/deployment).

## Licencia

MIT
