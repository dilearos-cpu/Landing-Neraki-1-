# KIVO Landing Page — Elementor Pro Template

Landing page de alta conversión para **KIVO Performance Wear**. Template completo compatible con Elementor Pro, replicando fielmente el diseño de referencia del hero y extendiendo con secciones de ecommerce premium.

## Estructura del proyecto

```
├── index.html                          # HTML completo de la landing
├── css/
│   └── kivo-landing.css                # Estilos con variables CSS, responsive, animaciones
├── js/
│   └── kivo-landing.js                 # Constructor del dúo, FAQ, countdown, scroll reveal
├── docs/
│   ├── elementor-estructura-kivo.md    # Guía detallada de implementación en Elementor Pro
│   └── optimizacion-rendimiento.md     # Recomendaciones de performance
└── assets/
    └── README.md                       # Especificaciones de imágenes requeridas
```

## Secciones incluidas

1. **Hero** — Réplica exacta del diseño de referencia
2. **Beneficios** — 4 iconos con descripción
3. **Cómo funciona** — 3 pasos del proceso
4. **Productos** — Grid con cards y hover
5. **Constructor del Dúo** — Selección interactiva de 2 productos
6. **Oferta** — Banner con descuento y countdown
7. **Testimonios** — Cards con estrellas y avatares
8. **FAQ** — Acordeón accesible
9. **CTA Final** — Llamada a la acción con animación pulse
10. **Footer** — Minimalista con redes sociales

## Implementación en Elementor Pro

Ver guía completa en [`docs/elementor-estructura-kivo.md`](docs/elementor-estructura-kivo.md).

### Pasos rápidos

1. Crear página con template **Elementor Canvas**
2. Importar fuentes: Montserrat, Inter, Dancing Script
3. Pegar bloque hero desde `index.html` en widget HTML
4. Añadir `css/kivo-landing.css` en CSS adicional del tema
5. Añadir `js/kivo-landing.js` en footer (defer)
6. Subir imágenes a `assets/` según especificaciones
7. Replicar secciones restantes siguiendo la guía de Elementor

## Tecnologías

- HTML5 semántico
- CSS3 con Custom Properties (variables)
- Vanilla JavaScript (sin jQuery, sin Bootstrap, sin Tailwind)
- SVG inline para iconografía
- Mobile-first responsive design

## Paleta de colores

| Color | Hex | Uso |
|-------|-----|-----|
| Pink | `#FF85A2` | Acentos, badges, script text |
| Green | `#64BC26` | CTA principal |
| Black | `#1A1A1A` | Headings |
| Background | `#F8F7F5` | Fondo general |

## Performance

Ver [`docs/optimizacion-rendimiento.md`](docs/optimizacion-rendimiento.md) para checklist completo.

Objetivo: PageSpeed 90+ mobile, LCP < 2.5s.
