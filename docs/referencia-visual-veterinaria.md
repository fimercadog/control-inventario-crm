# Referencia visual del sitio público — vertical veterinaria

El sitio de marketing de esta rama (`vertical/veterinaria`) usa el pack Divi
**"Veterinarian" (DiviVet)** de Elegant Themes como referencia visual
**vinculante**: no solo fotos/íconos, sino paleta, tipografía, navbar,
botones, cards, fondos de sección y composición de cada página, extraídos
directamente de los live-demos reales del pack (no interpretados a ojo).
Licencia: Fidel tiene membresía **Divi "Themes & Plugins" Lifetime**, uso y
adaptación autorizados sin volver a preguntar.

## Enlaces oficiales (7 layouts del pack + 1 de otra categoría)

| Layout | Live-demo |
| --- | --- |
| Home | https://www.elegantthemes.com/layouts/business/veterinarian-home-page/live-demo |
| About | https://www.elegantthemes.com/layouts/business/veterinarian-about-page/live-demo |
| Services | https://www.elegantthemes.com/layouts/business/veterinarian-services-page/live-demo |
| Service (detalle) | https://www.elegantthemes.com/layouts/business/veterinarian-service-page/live-demo |
| Blog | https://www.elegantthemes.com/layouts/business/veterinarian-blog-page/live-demo |
| Contact | https://www.elegantthemes.com/layouts/business/veterinarian-contact-page/live-demo |
| Landing | https://www.elegantthemes.com/layouts/business/veterinarian-landing-page/live-demo |
| Blogger Post Page (otra categoría, Lifestyle) | https://www.elegantthemes.com/layouts/lifestyle/blogger-post-page/live-demo |

La página de venta del pack no expone los assets directamente (bloqueados
detrás del login del área de miembros) — Fidel los descargó desde su cuenta.
El pack "Blogger Post Page" es de otra categoría y sus assets no se
descargaron — el post individual del blog usa las fotos/íconos del pack
"Veterinarian" que sí están disponibles, con la misma riqueza visual
(imagen destacada, autor, relacionados, anterior/siguiente).

## Tokens de diseño — extraídos, no inventados

Todo valor en `globals.css` (`.site-theme`) viene de `getComputedStyle()`
sobre el live-demo real o de muestreo de píxel sobre su propia captura,
documentado inline en el CSS con la fuente exacta. Reemplaza una primera
pasada (paleta teal/ámbar) que resultó ser una interpretación propia, no el
sistema real del pack — corregido tras auditoría explícita.

| Token | Valor | Fuente |
| --- | --- | --- |
| `--primary` (navy) | `#2f5c93` | Pixel-sample del botón "View All Services" del hero, live-demo Home |
| `--chart-4` (azul secundario) | `#2b87da` | `getComputedStyle` exacto, `.et_pb_promo_button` "Click Here" |
| `--cta` (naranja) | `#ff7000` | `getComputedStyle` exacto, `.et_pb_button` (rgb(255,112,0)) |
| `--section-cream` | `#fff6ef` | `getComputedStyle` exacto, sección "What We Do" (rgb(255,246,239)) |
| `--blob` / `--blob-warm` | navy→azul / salmón→durazno | Pixel-sample de los fondos orgánicos del pack |
| Nav: Poppins 500, 15px, `rgb(32,41,47)` | — | `getComputedStyle` exacto del menú del live-demo |
| Body: Open Sans | — | `getComputedStyle` exacto |
| Headings/botones: Nunito 700–800 | — | `getComputedStyle` exacto (h1 hero: 116px/700; botón: 14px/800/uppercase/tracking 1px) |
| Botón: `border-radius: 100px`, `padding: 13px 30px`, sombra `rgba(255,112,0,.32) 0 12px 18px -6px` | — | `getComputedStyle` exacto |
| Navbar: altura 80px, bg blanco, sombra scroll `rgba(7,51,84,.17) 0 0 30px 0` | — | `getComputedStyle` exacto |
| Eyebrows: Nunito 800/14px/uppercase/tracking 2px, naranja | — | `getComputedStyle` exacto |

## Qué se usó y dónde vive (assets)

- `frontend/public/gallery/*.jpg` (10 fotos: `hero-bulldog-exam`,
  `vet-clipboard`, `paw-procedure`, `pet-1`…`pet-13`) — fuente:
  `original/Photos/veterinarian-*.jpg` del pack descargado.
- `frontend/public/gallery/icons/icon-*.png` (12 íconos ilustrados) —
  fuente: `original/icons/2x/veterinarian-icon-*.png`. Mapeo semántico a
  servicios en `service-card.tsx` (`SERVICE_ICON`); reutilizados en Home
  ("Por qué elegirnos") y Nosotros (tira de valores) donde el pack también
  reutiliza sus propios íconos entre páginas.
- `frontend/public/gallery/illustrations/illustration-*.png` (5 de 14
  disponibles, usadas en Contacto/Blog/Servicios).
- `original/Backgrounds/` (solo `.ai`/`.psd`, sin exportar a PNG/SVG) **no
  se usó** — los fondos orgánicos se recrean con `GradientBlob` (SVG propio,
  colores tomados del pack).

## Páginas — auditoría estructural página por página (2026-09-16)

No todas las páginas reutilizan la composición de Home: cada una reproduce
la estructura de **su** layout específico del pack.

| Ruta | Layout de referencia | Secciones reproducidas |
| --- | --- | --- |
| `/` (Home) | Home | Hero foto full-bleed + 2 botones; "La clínica" (foto+cards apiladas); "Por qué elegirnos" (grid de íconos en tarjeta flotante); "Atención preventiva" (bloque blob asimétrico); equipo (preview); "Mascotas atendidas" (tarjeta flotante); FAQ; testimonios; mapa |
| `/nosotros` | About | Hero foto lavada; tira de 3 íconos plana (sin tarjeta, a diferencia de Services); "Nuestra misión y valores" (blob asimétrico); párrafo ancho de storytelling; equipo (`TeamProfileRow`, foto-bleed + card apilada); stats |
| `/servicios` | Services | Hero split; "Urgencias" (foto circular + banner); grid de íconos "All Vet Services"; **"Other Services"** (foto duotono azul + columnas de texto, `PhotoOverlayLinks`); tarjeta de contacto flotante; FAQ 2 columnas (`FaqColumns`); testimonios |
| `/servicios/[slug]` | Service | Hero con foto recuadrada + 2 botones apilados (agendar + WhatsApp) + link a FAQ; "Sobre el servicio" (foto circular, `CircularPhotoAbout`); testimonios; servicios relacionados |
| `/blog` | Blog | Hero centrado simple (sin ilustración lateral, a diferencia de Servicios); destacado como tarjeta blanca centrada solo-texto; grid de cards sin borde |
| `/blog/[slug]` | Blogger Post Page (adaptado con assets Veterinarian) | Imagen destacada, autor, contenido real por artículo, anterior/siguiente, relacionados |
| `/contacto` | Contact | Hero centrado + ilustraciones flanqueando; tarjeta de contacto flotante; formulario (inputs grises sin borde, botón naranja); mapa placeholder; FAQ 2 columnas |
| `/equipo` | About (adaptado, mismo patrón de equipo) | Hero; foto+texto de continuidad; `TeamProfileRow` (reemplaza el grid de `VetCard`) |
| `/urgencias` | Service (elegido por afinidad funcional sobre Landing — página de un solo tema, no el "kitchen sink" de Landing) | Hero foto full-bleed + banner de prioridad; señales (tarjeta flotante sin bordes por ítem); foto+cards apiladas; pasos (sin bordes por ítem) |
| `/agendar-cita`, `/solicitar-cita`, `/portal`, `/catalogo`, `/testimonios`, `/preguntas-frecuentes` | — | **Sin tocar a propósito** — lógica con tests pesados (S13/S14) o patrones ya funcionales (rating grid, acordeón FAQ largo) que no encajan en el reclamo de "grids genéricos"; heredan paleta/tipografía/navbar/botones vía los componentes compartidos |

## Componentes nuevos de esta pasada

- `team-profile-row.tsx` — `TeamProfileRow`/`TeamProfileList`: fila apilada
  foto-bleed + card superpuesta. Patrón "Highly Trained Veterinarians" de
  About. Sin fotografía real del staff, usa `InitialsAvatar` (no una foto de
  stock adivinada).
- `photo-overlay-links.tsx` — `PhotoOverlayLinks`: foto con duotono +
  columnas de texto plano. Patrón "Other Services" de Services.
- `faq-columns.tsx` — `FaqColumns`: FAQ en 2 columnas sin acordeón. Patrón
  real de Services/Contact (el acordeón de Home/`/preguntas-frecuentes` se
  mantiene, ahí la interactividad sí aporta con listas más largas).

## Deliberadamente sin tocar / diferencias por contenido real

- **`/app/*`** (panel de staff) y **`/agendar-cita`, `/solicitar-cita`,
  `/portal`** (lógica S13/S14) — fuera de alcance, instrucción explícita.
- Sin newsletter en Blog — no hay backend de suscripción; no se fabricó un
  formulario no funcional.
- Sin mapa de Google embebido — placeholder enlazado a Google Maps (mismo
  patrón que ya usaba Home), no hay API key de Maps configurada.
- Sin el bloque extra de 6 puntos en Servicio detalle — no hay un dato
  distinto de `service.bullets` (ya usado en "Sobre el servicio") para
  poblarlo sin inventar contenido lorem-ipsum.
- Container del navbar a `max-w-7xl` (1280px) centrado, no edge-to-edge
  como el live-demo (~40px de padding fijo a cada lado a 1440px de
  viewport) — `container` es una constante usada en decenas de componentes
  de todo el sitio; cambiarla ahora es un riesgo de layout desproporcionado
  frente a la ganancia de fidelidad. Documentado, no corregido.
