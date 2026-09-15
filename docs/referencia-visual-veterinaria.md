# Referencia visual del sitio público — vertical veterinaria

El sitio de marketing de esta rama (`vertical/veterinaria`) incorpora fotografía
e iconografía del pack **"Veterinarian" (DiviVet)** de Divi / Elegant Themes.
Mismo fundamento de licencia que `referencia-visual.md` (pack base de
CRM+Inventario): Fidel tiene membresía **Divi "Themes & Plugins" Lifetime**,
uso y adaptación autorizados sin volver a preguntar.

## Enlaces oficiales

| Qué | URL |
| --- | --- |
| Página del layout en la librería Divi | https://www.elegantthemes.com/layouts/business/veterinarian-home-page |

La página de venta **no expone los assets directamente** (fotos/íconos reales
bloqueados detrás del login del área de miembros) — Fidel los descargó desde
su cuenta y los pasó para este build. El pack trae 7 layouts: **About, Blog,
Veterinarian Service Page, Services, Contact, Home, Landing**.

## Qué se usó y dónde vive

Solo se tomaron **fotos e íconos reales** del pack (no la paleta azul/rosa
original del layout — se mantuvo la identidad teal/ámbar ya establecida del
sitio, ver `globals.css`, para no romper consistencia con el resto de páginas
ya construidas).

- `frontend/public/gallery/hero-bulldog-exam.jpg` — hero de Home (`PageHero`
  visual="art" → `HeroArt` en `page-hero.tsx`). Veterinario revisando un
  bulldog en camilla, con las mismas tarjetas flotantes de confianza
  (12+ años / 3.500+ mascotas) que antes iban sobre una ilustración de blobs.
- `frontend/public/gallery/vet-clipboard.jpg` — sección "La clínica" de Home.
- `frontend/public/gallery/paw-procedure.jpg` — sección "Atención preventiva"
  de Home.

Fuente original de los tres: `Photos/veterinarian-9.jpg`,
`Photos/veterinarian-6.jpg`, `Photos/veterinarian-11.jpg` del pack descargado
(carpeta `original/Photos/` del ZIP de Elegant Themes).

Íconos e ilustraciones del pack (`original/icons/`, `original/Illustrations/`)
**todavía no se usaron** — quedan disponibles para las próximas páginas
(About, Services, Team, Contact) cuando se aborden.

## Pendiente / siguientes páginas

Este build cubrió **solo Home**, a pedido de Fidel (una página a la vez, la
revisa antes de seguir). El resto del pack (About, Services, Service Page,
Blog, Contact, Landing) queda para slices futuros — mismo criterio: fotos/
íconos reales del pack, paleta propia del sitio.
