# Landing Bonus (WooCommerce)

Plugin de conversión para landings de pack — **autor Diego Arango**.

Replica en WordPress/WooCommerce las herramientas de las landing Caletzza (Shopify):

| Módulo | Descripción |
|---|---|
| COD Modal | Checkout contra entrega en modal |
| Contador + barra | Timer 24h + progreso del pack |
| Google Badge | Recuadro ⭐ + clientes felices |
| Botón RSI | Flotante estilo Releasit |
| Prueba social | Popup de compras recientes |

## Instalación

1. Copia `landing-bonus-wc/landing-bonus/` a `wp-content/plugins/landing-bonus/`
2. Activa **Landing Bonus** en WordPress
3. Configura en **WooCommerce → Landing Bonus**
4. Inserta shortcodes en tus landings

## Estructura

```
landing-bonus-wc/
├── README.md
├── SPEC-FUNCIONAL.md
├── CHAT-INICIO.md
└── landing-bonus/
    ├── landing-bonus.php
    ├── includes/
    ├── assets/
    ├── templates/
    └── languages/
```

## Shortcodes

```
[landing_bonus_countdown id="promo1" units="4" hours="24"]
[landing_bonus_google_badge]
[landing_bonus_floating_button url="/mi-pagina" label="Compra aqui | Paga en casa"]
[landing_bonus_social_proof pack_label="pack de básicas" units="10"]
[landing_bonus_pack collection="slug" slots="4"]
```

## Documentación

- [SPEC-FUNCIONAL.md](./SPEC-FUNCIONAL.md) — Especificación detallada por módulo
- [CHAT-INICIO.md](./CHAT-INICIO.md) — Prompt para continuar desarrollo

## Autor

**Diego Arango**
