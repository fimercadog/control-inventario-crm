# Arquitectura

La plataforma queda separada en dos aplicaciones dentro del repositorio:

- Backend Laravel 12 en `backend/`, API REST y persistencia SQLite inicial.
- Frontend Next.js 16 en `frontend/`, experiencia administrativa privada bajo `/app`.

La API usa modelos Eloquent, migraciones, recursos JSON, services compartidos para consultas tabulares y auditoria, y rutas REST por modulo.

La arquitectura esta preparada para multiempresa mediante `company_id` en las entidades operativas principales. En esta fase demo se resuelve la empresa activa con el usuario autenticado cuando exista o con la primera empresa seed.

## El catálogo es data-driven (regla de proyecto)

Todo el contenido funcional del catálogo —categorías, productos, imágenes, marcas,
precios, stock, estados y los filtros derivados de esos datos— vive en la BD y
llega al frontend por la API. **La UI no define el catálogo; lo define la BD.**

- El frontend consume la API y renderiza lo que hay. Nada de catálogo se hardcodea
  en React (ni arrays de categorías/marcas, ni listas de productos, ni rutas de
  imagen fijas).
- `BD → API → React` para categorías (filtro dinámico), productos y ficha.
- Imágenes: `upload → backend → ruta controlada por el servidor → BD → API → React`.
  `image_url` **no es asignable en masa** ni se acepta en el payload de
  `POST/PUT/PATCH /products`; solo lo fija el servidor en
  `POST /products/{id}/image` con la ruta del archivo subido. Una URL externa
  arbitraria no puede introducirse ni terminar renderizada.
- Agregar una categoría, producto, marca o imagen desde el sistema se refleja en
  el catálogo sin tocar código del frontend.

## Estado de seguridad

Sanctum y Spatie Permissions estan instalados y se crean roles/permisos demo. La aplicacion aun no tiene flujo completo de login frontend ni policies por recurso, por lo que autorizacion fina queda parcial.
