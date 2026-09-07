# Estado De Desarrollo

## Implementado

- Auditoria inicial del repositorio.
- Monorepo con `backend/` Laravel 12 y `frontend/` Next.js 16.
- Sitio publico multipagina HRTech SaaS bajo rutas raiz.
- Header publico con dropdowns de Producto y Soluciones.
- Paginas publicas: inicio, producto, modulos, soluciones, reclutamiento, precios, nosotros, blog, articulo, contacto, demo y login visual.
- Componentes marketing reutilizables: layout, header, footer, hero/dashboard preview, feature grid, problem-solution, CTA, AI chat, product page, mockups, contact form.
- SEO tecnico inicial con metadata, sitemap y robots.
- SQLite con migraciones del dominio CRM + Inventario (ver [docs/database.md](database.md)).
- Seeders demo: empresa, clientes, deals, actividades, productos, bodegas, proveedores, ordenes de compra (una recibida), pedidos (algunos confirmados), leads y usuarios por rol.
- Usuarios demo deterministicos por rol para pruebas: Super Admin, Administrador de empresa, Ventas, Inventario y Usuario.
- Login demo funcional con token Sanctum para usuarios sembrados.
- Rutas API privadas protegidas con Sanctum.
- Guard frontend para `/app`, validacion de sesion con `/auth/me`, limpieza de sesion expirada y logout.
- Navegacion privada filtrada por permisos seed.
- Dashboard frontend conectado a API real (metricas de CRM + Inventario).
- DataTable reusable con TanStack Table, busqueda, paginacion backend, loading, error, vacio y export CSV/PDF.
- Modulos conectados: leads, clientes, deals, actividades, productos, bodegas, movimientos de inventario, proveedores, ordenes de compra, pedidos, usuarios, roles y auditoria.
- CRUD visual (crear/editar/deshabilitar) para la mayoria de modulos; pedidos y ordenes de compra tienen ademas una pantalla de detalle para gestionar lineas y confirmar/recibir.
- El puente CRM-Inventario (confirmar pedido descuenta stock, recibir orden de compra lo repone) esta implementado y cubierto por un test end-to-end.
- Exportaciones CSV/PDF backend.
- Documentacion actualizada al dominio CRM + Inventario.
- Sitio publico reescrito al dominio CRM + Inventario y restilado con el sistema
  visual Divi "SaaS Product" (verde `#15803d` / navy / peso 900 / tarjetas widget
  sobre blobs / capturas en perspectiva 3D). 8 plantillas: Home `/`, Features
  `/producto` + `/producto/{crm,inventario,pedidos,compras,reportes,ia}`, Pricing
  `/precios`, About `/nosotros`, Blog `/blog`, Contact `/contacto`, Documentation
  `/documentacion`, Landing `/demo`. Paleta aplicada a todo (`:root`) incluido el
  panel `/app`; unica excepcion: los colores de series de los graficos del
  dashboard interno. Ref: [docs/referencia-visual.md](referencia-visual.md).

## Parcial

- Formularios publicos son visuales; no envian datos todavia.
- La referencia Job Recruiter se adapto como direccion visual/estructural, no como copia literal ni importacion de assets.
- Form Requests existen con reglas, pero el CRUD base todavia no inyecta todos los requests tipados por metodo.
- Roles/permisos estan sembrados, pero faltan policies/gates finos por recurso.
- La pantalla de login autentica contra backend y el shell privado filtra navegacion por permisos; faltan pantallas 403 dedicadas por ruta profunda.
- Reportes muestran catalogo, no todos los reportes tabulares dedicados.
- IA tiene interfaz preparada, sin proveedor conectado.
- Modo contingencia (offline) sigue activo como infraestructura, pero sin ningun modulo de CRM/Inventario elegible todavia (`ContingencyModuleRegistry` vacio).
- Screenshots del producto en `frontend/public/product/*.png` son placeholders traidos del proyecto `crm y contro de inventario1`; falta recapturar el panel real (backend arriba).

## Pendiente

- Reescribir el copy del sitio publico de marketing para el nuevo dominio.
- Selects conectados por relacion (cliente, producto, proveedor, bodega) en vez de campos de ID numerico en los formularios.
- CRUD visual completo con formularios shadcn para el resto de modulos.
- Tests amplios por workflow critico.
