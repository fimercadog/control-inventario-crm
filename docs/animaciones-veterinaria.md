# Sistema de animación por sección — vertical veterinaria

Motor único (`frontend/src/components/marketing/reveal.tsx`, IntersectionObserver
+ CSS transitions, sin librería nueva) con `direction`/`duration`/`delay`
configurables por uso, para que cada tipo de composición tenga su propia
entrada en vez de repetir un solo `fadeUp`. Comparten easing
(`cubic-bezier(0.16,1,0.3,1)`), rango de duración (0.6–1.1s) y distancias
cortas (12–32px, más cortas en mobile vía `sm:`). `prefers-reduced-motion`
desactiva transform/blur y deja solo un fade rápido (300ms).

## Por componente / patrón (aplica a todas las páginas que lo usan)

| Componente | Elemento | Dirección | Duración | Delay | Stagger | Mobile |
| --- | --- | --- | --- | --- | --- | --- |
| `HomeHero` | Foto de fondo | `zoom-out` (1.05→1) | 1.1s | 0 | — | igual, distancia de zoom ya es sutil |
| | Eyebrow + título | `up` | 0.6s | 0.25s | — | distancia reducida (12px vs 24px) |
| | Lead | `up` | 0.6s | 0.38s | — | ídem |
| | Botón 1 (Agendar) | `up` | 0.6s | 0.52s | — | ídem |
| | Botón 2 (Ver servicios) | `up` | 0.6s | 0.62s | 0.1s vs botón 1 | ídem |
| | Tarjeta de contacto flotante | interna (ver `FloatingContactCard`) | — | base 0.72s | — | ídem |
| `SplitHero` (Servicios, Productos, Equipo, Nosotros, Blog) | Eyebrow + título | `up` | 0.6s | 0 | — | distancia reducida |
| | Lead | `up` | 0.6s | 0.12s | — | ídem |
| | Acciones/CTAs | `up` | 0.6s | 0.24s | — | ídem |
| | Ilustración | `zoom-in` (0.96→1) | 0.8s | 0.15s | — | ídem |
| `PageHero` (utilitarias: agendar-cita, portal, testimonios, FAQ…) | Badge/eyebrow/título/lead/acciones/nota | `up` | 0.6s | 0→0.34s escalonado | 0.08–0.1s entre elementos | ya existía, sin cambios de fondo |
| `PhotoFeatureStack` (Home, Nosotros ×2, Equipo, Urgencias) | Foto | `left`/`right` (según `reverse`) | 0.7s | 0 | — | mismo, distancia reducida |
| | Cards | `right`/`left` (opuesto a la foto) | 0.6s | 0.2s + i·0.09s | 90ms | cards trepan sobre el borde inferior de la foto (`-mt-16`) en vez de solo apilarse |
| `OffsetBlobBlock` (Nosotros, Home "Atención preventiva") | Blob | `zoom-in` | 0.8s | 0 | — | igual |
| | Texto (eyebrow+título+bullets+CTA) | `up` | 0.6s | 0.15s | — | igual |
| | Foto | `fade` (sin desplazamiento) | 0.8s | 0.2s | — | igual |
| `CircularPhotoAbout` (Servicios, Servicio detalle) | Foto circular | `zoom-in` | 0.7s | 0 | — | igual |
| | Texto | `fade` | 0.6s | 0.2s | — | igual |
| `TeamProfileRow` (Nosotros, Equipo) | Foto | `zoom-in` | 0.6s | por miembro (0, 0.08, 0.16…) | 80ms entre miembros | igual |
| | Card de texto | `right` | 0.6s | +0.12s sobre la foto | — | igual |
| `IconFeatureFloatCard` (Servicios "All Vet Services", Home) | Cada ícono | `up` | 0.6s | 0.1s + (i%3)·0.08s | 80ms | igual |
| `ServiceGrid`/`ServiceCard` (Home, Servicio detalle relacionados) | Cada card | `up` | 0.6s | 0.08s + (i%3)·0.08s | 80ms | igual |
| `TestimonialGrid`/`TestimonialCard` | Cada testimonio | `up` | 0.7s (más lenta, "se asienta") | (i%3)·0.12s | 120ms | igual |
| `FaqAccordion` (Home, /preguntas-frecuentes) | Cada pregunta | `up` | 0.6s | min(i,6)·0.07s | 70ms | acordeón abre/cierra con `grid-template-rows` 300ms, sin cambios (no es scroll-reveal) |
| `FaqColumns` (Servicios, Contacto) | Cada pregunta | `up` | 0.6s | ⌊i/2⌋·0.1s | por fila (2 items comparten delay), no por ítem | igual |
| `BlogCard` (grid del listado) | Cada card | `up` | 0.6s | (i%3)·0.1s | 100ms | igual |
| `FeaturedPost` (Blog) | Tarjeta destacada completa | `zoom-in` (0.97→1, sin desplazamiento) | 0.7s | 0 | — | igual |
| `FloatingContactCard` (Home hero, Contacto, Servicios) | Título/subtítulo | `up` | 0.6s | `delay` base | — | igual |
| | Columna "Contacto" | `left` | 0.6s | base + 0.12s | — | igual |
| | Columna "Horario" | `right` | 0.6s | base + 0.18s | — | igual |
| Contacto — formulario | Todo el form | `up` | 0.7s | 0.1s | — | igual |
| Contacto — mapa | Bloque completo | `fade` (sin desplazamiento, elemento de utilidad) | 0.8s | 0 | — | igual |
| Urgencias — tarjeta de señales, pasos | `up` | 0.6s | escalonado por índice | 50–80ms | igual |

## Reglas técnicas aplicadas

- Solo se anima `opacity`/`transform`/`filter` (blur en las variantes
  `up`/`down`) — nunca `width`/`height`/`top`/`left`, para no causar layout
  shift.
- `prefers-reduced-motion`: transición cae a solo `opacity`, 300ms, sin
  transform ni blur (ver clases `motion-reduce:*` en `reveal.tsx`).
- Mobile: las variantes `up`/`down`/`left`/`right`/`zoom-*` usan distancias
  más cortas por debajo del breakpoint `sm:` (12px/20px/97% en vez de
  24px/32px/96%), sin desactivar la animación — solo reduce el recorrido.
- El elemento con foto protagonista siempre anima primero (o en paralelo
  con delay 0) y el texto/las cards entran después, siguiendo la regla
  pedida: "si la sección tiene foto protagonista, animá primero la foto".
