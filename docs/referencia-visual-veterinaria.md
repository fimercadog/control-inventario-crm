# Referencia visual del sitio público — vertical veterinaria

El sitio de marketing de esta rama (`vertical/veterinaria`) incorpora fotografía
e iconografía del pack **"Veterinarian" (DiviVet)** de Divi / Elegant Themes.
Mismo fundamento de licencia que `referencia-visual.md` (pack base de
CRM+Inventario): Fidel tiene membresía **Divi "Themes & Plugins" Lifetime**,
uso y adaptación autorizados sin volver a preguntar.

## Enlaces oficiales

| Qué | URL |
| --- | --- |
| Página del layout en la librería Divi (pack "Veterinarian") | https://www.elegantthemes.com/layouts/business/veterinarian-home-page |
| Referencia de estilo para el post individual del blog | https://www.elegantthemes.com/layouts/lifestyle/blogger-post-page/live-demo |

La página de venta del pack **no expone los assets directamente** (fotos/
íconos reales bloqueados detrás del login del área de miembros) — Fidel los
descargó desde su cuenta y los pasó para este build. El pack "Veterinarian"
trae 7 layouts: **About, Blog, Veterinarian Service Page, Services, Contact,
Home, Landing**. El pack "Blogger Post Page" es de otra categoría (Lifestyle)
y **sus assets no se descargaron** — el post individual del blog se rediseñó
con la misma riqueza visual (foto destacada, autor, relacionados,
anterior/siguiente) pero con las fotos e íconos del pack "Veterinarian" que sí
están disponibles, no con assets propios de ese segundo pack.

## Qué se usó y dónde vive

Solo se tomaron **fotos e íconos reales** del pack (no la paleta azul/rosa
original del layout — se mantuvo la identidad teal/ámbar ya establecida del
sitio, ver `globals.css`, para no romper consistencia entre páginas).

- `frontend/public/gallery/*.jpg` (10 fotos: `hero-bulldog-exam`,
  `vet-clipboard`, `paw-procedure`, `pet-1`…`pet-13`) — fuente:
  `original/Photos/veterinarian-*.jpg` del pack descargado.
- `frontend/public/gallery/icons/icon-*.png` (12 íconos ilustrados) —
  fuente: `original/icons/2x/veterinarian-icon-*.png`. Mapeo semántico a
  servicios en `service-card.tsx` (`SERVICE_ICON`).
- `original/Illustrations/` (14 ilustraciones circulares tipo "vet con
  cachorro") y `original/Backgrounds/` (solo `.ai`/`.psd`, sin exportar a
  PNG/SVG) **no se usaron** — quedan disponibles para una pasada futura.

## Páginas cubiertas por el rediseño (2026-09-16)

| Ruta | Referencia | Qué cambió |
| --- | --- | --- |
| `/` (Home) | Veterinarian Home | Hero con foto real + tarjetas flotantes; 2 secciones foto+texto |
| `/servicios` | Veterinarian Services | Sección foto+texto de apertura + grid con íconos reales del pack |
| `/servicios/[slug]` | Veterinarian Service Page | Foto del servicio + ícono ilustrado en vez de lucide |
| `/nosotros` | Veterinarian About | 2 secciones foto+texto alternadas (historia + instalaciones) |
| `/equipo` | Veterinarian About (adaptado) | Sección foto+texto de continuidad antes de la grilla de perfiles |
| `/blog` | Veterinarian Blog | Artículo destacado grande + cards con foto + filtro por categoría funcional |
| `/blog/[slug]` | Blogger Post Page (adaptado con assets del pack Veterinarian) | Imagen destacada, autor (`AuthorBlock`), contenido real por artículo (ya no placeholder genérico), anterior/siguiente, relacionados |
| `/contacto` | Veterinarian Contact | Foto + ícono de sede sobre los datos de contacto — el formulario (`ContactForm`) no se tocó |
| `/urgencias` | Landing de alta prioridad (adaptado) | Sección foto+texto con ícono de primeros auxilios |
| `/agendar-cita`, `/solicitar-cita`, `/portal` | — | **Sin tocar a propósito** — lógica con tests pesados (S13/S14); ya heredan la identidad visual vía `MarketingLayout`/`PageHero` |
| `/testimonios`, `/preguntas-frecuentes` | — | Sin tocar — ya usan patrones específicos (grid de testimonios con rating, acordeón de FAQ) que no encajan en el reclamo de "grids genéricos" |

## Componentes nuevos (reutilizables, no una page-a-page desde cero)

- `blog-card.tsx` — `BlogCard` (tarjeta con foto) + `FeaturedPost` (bloque destacado grande).
- `author-block.tsx` — `AuthorBlock`, autor con link a su perfil de `/equipo`.
- `related-posts.tsx` — `RelatedPosts`, grid de `BlogCard` reutilizado.
- `image-text-section.tsx` — `ImageTextSection`, extrae el patrón foto+texto
  alternado que se repetía a mano en Home/Servicios/Nosotros/Equipo/Urgencias.
- `service-card.tsx` — `SERVICE_ICON`, mapeo de slug de servicio → ícono
  ilustrado del pack (antes: ícono lucide genérico).

`marketing-data.tsx`: `BlogPost` ganó `image`, `authorSlug`, `date`,
`readMinutes`, `body` (contenido real por artículo, no genérico); nuevos
helpers `relatedPosts()` y `adjacentPosts()`.

## Deliberadamente sin tocar

- **`/app/*`** (panel de staff) — fuera de alcance, instrucción explícita.
- **`/agendar-cita`, `/solicitar-cita`, `/portal`** — lógica de S13/S14 con
  cobertura de tests pesada (disponibilidad, anti-doble-booking, magic link);
  el riesgo de tocar el layout ahí no se justificaba frente al beneficio.
- Paleta de colores del pack original (azul/rosa) — se mantuvo teal/ámbar.
