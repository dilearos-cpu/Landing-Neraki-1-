# KIVO Landing — Guía de Implementación en Elementor Pro

## Resumen de la estructura de la página

La landing sigue un flujo vertical de conversión (CRO) optimizado para móvil-first:

```
┌─────────────────────────────────────┐
│  HERO (réplica exacta imagen ref.)  │  ← Logo, badge, headline, precio, modelos, beneficios inline, CTA
├─────────────────────────────────────┤
│  BENEFICIOS (4 iconos)              │  ← Refuerzo de confianza
├─────────────────────────────────────┤
│  CÓMO FUNCIONA (3 pasos)            │  ← Reducción de fricción
├─────────────────────────────────────┤
│  PRODUCTOS (grid cards)             │  ← Selección visual
├─────────────────────────────────────┤
│  CONSTRUCTOR DEL DÚO                │  ← Interacción principal (JS)
├─────────────────────────────────────┤
│  OFERTA (banner descuento)          │  ← Urgencia
├─────────────────────────────────────┤
│  TESTIMONIOS (cards)                │  ← Prueba social
├─────────────────────────────────────┤
│  FAQ (acordeón)                     │  ← Objeciones
├─────────────────────────────────────┤
│  CTA FINAL                          │  ← Cierre
├─────────────────────────────────────┤
│  FOOTER (minimalista)               │
└─────────────────────────────────────┘
```

---

## Configuración global de Elementor

| Parámetro | Valor |
|-----------|-------|
| **Page Layout** | Elementor Canvas (sin header/footer del tema) |
| **Content Width** | Full Width |
| **Default Fonts** | Montserrat (headings), Inter (body), Dancing Script (accent) |
| **Custom CSS** | Pegar `css/kivo-landing.css` en Apariencia → Personalizar → CSS adicional, o en el widget HTML del hero |
| **Custom JS** | Pegar `js/kivo-landing.js` en plugin "Insert Headers and Footers" o Code Snippets |

### Fuentes Google (Elementor → Site Settings → Typography)

```
Montserrat: 400, 500, 600, 700, 800, 900
Inter: 400, 500, 600
Dancing Script: 400, 700
```

---

## SECCIÓN 1: HERO

### Contenedor principal

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | Section (Full Width) |
| **Clase CSS** | `kivo-hero` |
| **Dirección** | Column |
| **Min Height** | 100vh (desktop), auto (mobile) |
| **Padding** | 24px 20px 48px (mobile) / 40px 24px 64px (tablet) / 48px 32px 80px (desktop) |
| **Margin** | 0 |
| **Background** | `#F8F7F5` con formas geométricas vía CSS (`::before`, `::after`) |
| **Overflow** | Hidden |
| **Z-index base** | 1 |

### Contenedor interno (Inner Section)

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | Inner Section |
| **Clase CSS** | `kivo-hero__inner` |
| **Max Width** | 480px (mobile) / 600px (tablet) / 720px (desktop) |
| **Dirección** | Column |
| **Gap** | 0 (espaciado controlado por widgets) |
| **Align** | Center |

### Sub-elementos del Hero

#### 1.1 Logo
| Widget | Image o Heading |
|--------|-----------------|
| **Clase** | `kivo-hero__logo` |
| **Contenido** | Logo KIVO + tagline "— PERFORMANCE WEAR —" |
| **Margin Bottom** | 16px |
| **Z-index** | 10 |

#### 1.2 Badge "PACK EXCLUSIVO"
| Widget | Button o HTML |
|--------|---------------|
| **Clase** | `kivo-hero__badge` |
| **Background** | `#FF85A2` |
| **Border Radius** | 50px |
| **Padding** | 8px 24px |
| **Typography** | Montserrat 700, 11px, uppercase, letter-spacing 2px, white |
| **Margin Bottom** | 20px |

#### 1.3 Headline "2 OUTFITS" + "Premium"
| Widget | HTML (recomendado para overlay script) |
|--------|----------------------------------------|
| **Clase** | `kivo-hero__headline` |
| **Estructura** | `<h1>` con span para "Premium" posicionado absolute |
| **Font** | Montserrat 900, 72px mobile / 96px desktop |
| **Color** | `#1A1A1A` |
| **Script accent** | Dancing Script, `#FF85A2`, 48px, rotate -8deg |

#### 1.4 Price Box
| Widget | Inner Section (2 columnas) |
|--------|---------------------------|
| **Clase** | `kivo-hero__price-box` |
| **Background** | `#FFFFFF` |
| **Border Radius** | 16px |
| **Box Shadow** | `0 10px 30px rgba(0,0,0,0.05)` |
| **Padding** | 16px 24px |
| **Gap** | 0 |
| **Dirección** | Row (50% / 50%) |
| **Divider** | Border-right 1px `#E5E5E5` en columna izquierda |

#### 1.5 Sub-headline
| Widget | Icon Box o HTML |
|--------|-----------------|
| **Clase** | `kivo-hero__subheadline` |
| **Icon** | Heart (Font Awesome o SVG inline), color `#FF85A2` |
| **Text** | "Escoge cualquier combinación de colores y paga al recibir." |
| **Font** | Inter 500, 14px, `#666666` |
| **Margin** | 16px 0 24px |

#### 1.6 Visual Centerpiece (Modelos)
| Widget | Image + HTML overlay |
|--------|---------------------|
| **Clase contenedor** | `kivo-hero__visual` |
| **Posición** | Relative |
| **Z-index** | 5 |
| **Círculo rosa** | `kivo-hero__circle` — absolute, 280px, `#FF85A2` opacity 0.15, right -20% |
| **Imagen** | PNG transparente, 3 modelos, width 100%, max 400px |
| **Floating bar** | `kivo-hero__floating-bar` — absolute bottom, white pill, shadow |

#### 1.7 Beneficios inline (4 iconos)
| Widget | Icon Box × 4 en Inner Section |
|--------|------------------------------|
| **Clase** | `kivo-hero__benefits` |
| **Dirección** | Row (4 cols desktop) / 2×2 (mobile) |
| **Gap** | 16px |
| **Icon style** | Círculo outline rosa, 48px |
| **Text** | Montserrat 700, 10px, uppercase |

#### 1.8 CTA Principal
| Widget | Button |
|--------|--------|
| **Clase** | `kivo-hero__cta` |
| **Background** | `#64BC26` |
| **Border Radius** | 50px |
| **Padding** | 18px 32px |
| **Width** | 100% |
| **Shadow** | `0 6px 0 #4A9A1A` (efecto 3D) |
| **Hover** | translateY(-2px), shadow aumentada |
| **Icon** | Shopping bag blanco |

#### 1.9 Trust Badge
| Widget | Icon Box |
|--------|----------|
| **Clase** | `kivo-hero__trust` |
| **Icon** | Padlock rosa |
| **Text** | "COMPRA 100% SEGURA" |
| **Font** | 10px, uppercase, letter-spacing 1.5px |

### Responsive Hero

| Breakpoint | Cambios |
|------------|---------|
| **Mobile (<768px)** | Headline 56px, beneficios 2×2, modelos max-width 320px, padding reducido |
| **Tablet (768-1024px)** | Headline 80px, max-width 600px |
| **Desktop (>1024px)** | Headline 96px, max-width 720px, círculo más grande |

---

## SECCIÓN 2: BENEFICIOS

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | Section |
| **Clase** | `kivo-benefits` |
| **Background** | `#FFFFFF` |
| **Padding** | 60px 24px |
| **Dirección** | Column |

### Inner Section
| Propiedad | Valor |
|-----------|-------|
| **Clase** | `kivo-benefits__grid` |
| **Dirección** | Row |
| **Gap** | 32px |
| **Columns** | 4 (desktop) / 2 (tablet) / 1 (mobile) |

### Widget por beneficio: Icon Box
- Clase: `kivo-benefit-card`
- Icon: 64px, color `#FF85A2`
- Título: Montserrat 700, 14px
- Descripción: Inter 400, 14px, `#666`

---

## SECCIÓN 3: CÓMO FUNCIONA

| Propiedad | Valor |
|-----------|-------|
| **Clase** | `kivo-how` |
| **Background** | `#F8F7F5` |
| **Padding** | 80px 24px |

### Grid de pasos
| Propiedad | Valor |
|-----------|-------|
| **Clase** | `kivo-how__steps` |
| **Dirección** | Row |
| **Gap** | 40px |
| **Columns** | 3 (desktop) / 1 (mobile, horizontal cards) |

### Widget por paso: Icon Box + número
- Número grande: `kivo-step__number` — 72px, `#FF85A2` opacity 0.2
- Conector línea punteada entre pasos (CSS `::after`)

---

## SECCIÓN 4: PRODUCTOS

| Propiedad | Valor |
|-----------|-------|
| **Clase** | `kivo-products` |
| **Background** | `#FFFFFF` |
| **Padding** | 80px 24px |

### Grid
| Propiedad | Valor |
|-----------|-------|
| **Clase** | `kivo-products__grid` |
| **Dirección** | Row (wrap) |
| **Gap** | 24px |
| **Columns** | 3 (desktop) / 2 (tablet) / 1 (mobile) |

### Card de producto
| Widget | Image Box + Heading + Button |
|--------|------------------------------|
| **Clase** | `kivo-product-card` |
| **Border Radius** | 16px |
| **Overflow** | Hidden |
| **Hover** | translateY(-8px), shadow `0 20px 40px rgba(0,0,0,0.1)` |
| **Badge color** | Pill con nombre del color |
| **Botón** | "Agregar al dúo" — outline rosa |

---

## SECCIÓN 5: CONSTRUCTOR DEL DÚO

| Propiedad | Valor |
|-----------|-------|
| **Clase** | `kivo-duo-builder` |
| **Background** | Gradiente `linear-gradient(135deg, #FFF5F7 0%, #F8F7F5 100%)` |
| **Padding** | 80px 24px |

### Estructura interna
```
kivo-duo-builder
├── kivo-duo-builder__header (título + descripción)
├── kivo-duo-builder__slots (Row, 2 columnas)
│   ├── kivo-duo-slot (Producto 1) — dashed border si vacío
│   └── kivo-duo-slot (Producto 2)
├── kivo-duo-builder__status (barra de progreso)
└── kivo-duo-builder__cta (botón finalizar, disabled hasta completar)
```

| Widget recomendado | HTML Widget con estructura + JS |
|--------------------|--------------------------------|
| **Gap slots** | 24px |
| **Slot border** | 2px dashed `#FF85A2` (vacío) / solid (lleno) |
| **Border Radius** | 16px |
| **Z-index** | 10 |

---

## SECCIÓN 6: OFERTA

| Propiedad | Valor |
|-----------|-------|
| **Clase** | `kivo-offer` |
| **Background** | `#FF85A2` con overlay pattern |
| **Padding** | 60px 24px |
| **Border Radius** | 0 (full bleed) |

### Contenido
- Descuento grande: 48px, white, Montserrat 900
- Countdown opcional (JS)
- CTA secundario blanco

---

## SECCIÓN 7: TESTIMONIOS

| Propiedad | Valor |
|-----------|-------|
| **Clase** | `kivo-testimonials` |
| **Background** | `#FFFFFF` |
| **Padding** | 80px 24px |

### Grid
| Propiedad | Valor |
|-----------|-------|
| **Dirección** | Row |
| **Gap** | 24px |
| **Columns** | 3 (desktop) / 1 (mobile, slider opcional) |

### Card
- Clase: `kivo-testimonial-card`
- Estrellas: SVG amarillo `#FFC107`
- Avatar: círculo 48px
- Quote: Inter italic
- Border: 1px `#F0F0F0`, radius 16px

---

## SECCIÓN 8: FAQ

| Propiedad | Valor |
|-----------|-------|
| **Clase** | `kivo-faq` |
| **Background** | `#F8F7F5` |
| **Padding** | 80px 24px |
| **Max Width** | 720px, centered |

### Widget
- **Elementor Accordion** o HTML custom con JS
- Clase item: `kivo-faq__item`
- Icon toggle: `+` / `−` rosa
- Transición: max-height 0.3s ease

---

## SECCIÓN 9: CTA FINAL

| Propiedad | Valor |
|-----------|-------|
| **Clase** | `kivo-cta-final` |
| **Background** | `#1A1A1A` |
| **Padding** | 80px 24px |
| **Text align** | Center |

### Elementos
- Headline blanco 36px
- Subtext gris `#999`
- Botón verde grande (mismo estilo hero CTA)
- Animación pulse sutil en botón

---

## SECCIÓN 10: FOOTER

| Propiedad | Valor |
|-----------|-------|
| **Clase** | `kivo-footer` |
| **Background** | `#FFFFFF` |
| **Padding** | 32px 24px |
| **Border Top** | 1px `#F0F0F0` |

### Contenido
- Logo pequeño
- Links legales (Términos, Privacidad)
- Copyright
- Redes sociales (iconos outline)

---

## Widgets de Elementor recomendados por sección

| Sección | Widgets principales |
|---------|---------------------|
| Hero | HTML, Image, Button, Icon Box |
| Beneficios | Icon Box × 4 |
| Cómo funciona | Icon Box, Heading |
| Productos | Loop Grid o Image Box × N |
| Constructor Dúo | HTML Widget + Custom JS |
| Oferta | Heading, Button |
| Testimonios | Testimonial Carousel o HTML |
| FAQ | Accordion |
| CTA Final | Heading, Button |
| Footer | Nav Menu, Social Icons, Text Editor |

---

## Animaciones Elementor (Motion Effects)

| Elemento | Efecto |
|----------|--------|
| Hero headline | Fade In Up, delay 0.2s |
| Price box | Fade In Up, delay 0.4s |
| Modelos | Fade In, delay 0.6s |
| Floating bar | Slide In Up, delay 0.8s |
| CTA button | Fade In Up, delay 1s |
| Product cards | Fade In on scroll |
| Testimonials | Stagger fade in |

---

## Implementación recomendada

1. Crear página con template **Elementor Canvas**
2. Importar fuentes en Site Settings
3. Crear sección Hero con widget **HTML** pegando el bloque hero de `index.html`
4. Añadir CSS global desde `kivo-landing.css`
5. Añadir JS global desde `kivo-landing.js`
6. Replicar secciones restantes con widgets nativos siguiendo clases CSS
7. Configurar responsive en cada breakpoint de Elementor
8. Probar constructor del dúo y FAQ en frontend
