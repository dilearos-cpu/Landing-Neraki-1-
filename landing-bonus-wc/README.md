# Landing Bonus (WooCommerce)

Plugin de conversión para landings de pack — **autor Diego Arango**.

| Módulo | Descripción |
|---|---|
| Contador + barra | Timer 24h + progreso sincronizado con slots del pack |
| Google Badge | Recuadro ⭐ + clientes felices |
| Botón RSI | Flotante estilo Releasit |

## Instalación

```bash
cp -r landing-bonus-wc/landing-bonus /wp-content/plugins/
```

O descarga `landing-bonus.zip` desde el repo.

## Shortcodes

```
[landing_bonus_countdown id="promo1" units="4" hours="24"]
[landing_bonus_google_badge]
[landing_bonus_floating_button url="#pack" label="Compra aqui | Paga en casa"]
```

## Sincronización con packs existentes

El contador detecta automáticamente los slots de tus snippets (`pack_bodys4`, `pack_visual_rapido`):

- Observa `.pack-ui .slot` (configurable en admin)
- Cuenta slots con imagen (producto seleccionado)
- Reset al pulsar **Borrar todo** (`#pack-reset`)
- Al 100%, clic en la barra pulsa `#pack-buy`

## Autor

**Diego Arango**
