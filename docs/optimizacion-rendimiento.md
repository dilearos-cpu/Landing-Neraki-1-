# KIVO Landing Page — Optimización de Rendimiento

Recomendaciones para mantener la velocidad de carga sin alterar el diseño visual.

---

## 1. Imágenes

### Hero (prioridad máxima)
- **Formato:** WebP con fallback JPEG/PNG
- **Dimensiones hero-models.png:** 800×1000px (2x para retina), peso objetivo < 150KB
- **Productos:** 720×900px WebP, < 80KB cada una
- **Avatares testimonios:** 96×96px WebP, < 10KB
- Usar `loading="eager"` + `fetchpriority="high"` solo en la imagen hero
- Usar `loading="lazy"` en todas las demás imágenes
- Implementar `<picture>` con srcset para responsive images:

```html
<picture>
  <source srcset="assets/hero-models.webp" type="image/webp">
  <img src="assets/hero-models.png" alt="..." width="400" height="500" loading="eager" fetchpriority="high">
</picture>
```

### Herramientas recomendadas
- [Squoosh](https://squoosh.app/) para compresión manual
- Plugin WordPress: ShortPixel, Imagify o WebP Express
- CDN con transformación automática (Cloudinary, imgix)

---

## 2. Fuentes

### Carga optimizada
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Inter:wght@400;500;600&family=Montserrat:wght@700;800;900&display=swap" rel="stylesheet">
```

- Cargar **solo los pesos usados:** Montserrat 700/800/900, Inter 400/500/600, Dancing Script 700
- Usar `font-display: swap` (incluido en Google Fonts con `display=swap`)
- Considerar **autohospedar fuentes** con plugin OMGF o Bunny Fonts para eliminar request a Google
- Subset latino si el sitio es solo español: `&subset=latin`

---

## 3. CSS

- El archivo `kivo-landing.css` (~25KB) es ligero; mantenerlo en un solo archivo evita requests extra
- **Minificar** en producción (Autoptimize, WP Rocket, o build step)
- Critical CSS: inline los estilos del hero above-the-fold (~8KB) en `<head>` para eliminar render-blocking
- El resto del CSS cargar con `media="print" onload="this.media='all'"` o defer

### En Elementor
- Pegar CSS en **Custom CSS** del tema o widget HTML del hero
- Evitar duplicar estilos entre Elementor y CSS custom
- Desactivar CSS/JS de widgets no usados con "Asset CleanUp" o "Perfmatters"

---

## 4. JavaScript

- `kivo-landing.js` (~8KB) sin dependencias — excelente para rendimiento
- Cargar con `defer` (ya incluido en el HTML)
- **No cargar jQuery** — el script es vanilla JS
- Minificar en producción
- El CountdownTimer usa `setInterval` de 1s — impacto mínimo; destruir en `beforeunload`

### En Elementor
- Cargar JS en footer vía "Insert Headers and Footers" o Code Snippets
- Marcar como "defer" o "async" según el plugin

---

## 5. WordPress / Elementor específico

### Plugins recomendados
| Plugin | Función |
|--------|---------|
| **WP Rocket** o **LiteSpeed Cache** | Cache de página, minificación, lazy load |
| **Autoptimize** | Minificar CSS/JS/HTML |
| **ShortPixel** | Optimización de imágenes WebP |
| **Perfmatters** | Desactivar scripts innecesarios por página |
| **OMGF** | Autohospedar Google Fonts |

### Elementor
- Usar **Elementor Canvas** (sin header/footer del tema = menos HTML)
- Desactivar Font Awesome de Elementor si usas SVG inline (como en este template)
- Desactivar Google Fonts de Elementor si cargas las fuentes manualmente
- **Experiments:** Activar "Optimized DOM Output" y "Improved Asset Loading"
- No usar Elementor Pro Popups en esta landing (añade JS extra)

### Tema
- Usar tema ligero: Hello Elementor, GeneratePress, o Kadence
- Sin page builder adicional encima de Elementor

---

## 6. Hosting y CDN

- **PHP 8.1+** con OPcache activo
- **Redis/Memcached** para object cache de WordPress
- CDN para assets estáticos (Cloudflare free tier es suficiente)
- Habilitar **Brotli/Gzip** compresión
- HTTP/2 o HTTP/3

---

## 7. Métricas objetivo (Core Web Vitals)

| Métrica | Objetivo | Cómo lograrlo |
|---------|----------|---------------|
| **LCP** | < 2.5s | Preload hero image, critical CSS inline, CDN |
| **FID/INP** | < 200ms | JS defer, sin jQuery, IntersectionObserver ligero |
| **CLS** | < 0.1 | width/height en todas las imágenes, reservar espacio para fonts |
| **TTFB** | < 600ms | Cache de página, hosting rápido, object cache |

### Preload crítico en `<head>`
```html
<link rel="preload" as="image" href="assets/hero-models.webp" type="image/webp">
<link rel="preload" as="style" href="css/kivo-landing.css">
```

---

## 8. SVG Icons

- Todos los iconos en este template son **SVG inline** — cero requests HTTP adicionales
- No usar Font Awesome ni icon fonts (ahorra ~50-80KB)
- Mantener SVGs inline en el HTML para iconos del hero; para secciones inferiores puede usarse un sprite SVG

---

## 9. Third-party scripts

- **Evitar** en la landing de conversión:
  - Chat widgets (cargar solo al click)
  - Pixel de Facebook (usar server-side CAPI)
  - Google Analytics (usar GA4 con `defer` o server-side)
  - Heatmaps (Hotjar/Clarity — cargar async después de 5s)

- Si necesitas WhatsApp flotante, cargar el script después del `load` event:

```javascript
window.addEventListener('load', function() {
  setTimeout(function() {
    // Cargar widget WhatsApp aquí
  }, 3000);
});
```

---

## 10. Checklist pre-lanzamiento

- [ ] Imágenes convertidas a WebP y comprimidas
- [ ] Fuentes: solo pesos necesarios, autohospedadas o Bunny Fonts
- [ ] CSS minificado, critical CSS inline para hero
- [ ] JS minificado con defer
- [ ] Cache de página activo (WP Rocket / LiteSpeed)
- [ ] CDN configurado (Cloudflare)
- [ ] Lazy load en imágenes below-the-fold
- [ ] width/height en todas las `<img>`
- [ ] Test PageSpeed Insights: objetivo 90+ mobile
- [ ] Test GTmetrix: Grade A, LCP < 2.5s
- [ ] Verificar que no hay CSS/JS duplicado de Elementor
- [ ] Desactivar emoji scripts de WordPress
- [ ] Desactivar embeds de WordPress (oEmbed)

---

## 11. Monitoreo continuo

- **PageSpeed Insights** semanal
- **Google Search Console** → Core Web Vitals
- **Real User Monitoring** con Cloudflare Web Analytics (gratis, sin cookie)
- Alertas si LCP sube de 2.5s tras cambios en Elementor
