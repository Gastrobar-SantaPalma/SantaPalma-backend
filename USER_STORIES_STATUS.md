# Estado actual de Historias de Usuario — SantaPalma Backend

Corte: 2025-11-01

Este archivo resume cada historia de usuario del backlog con su estado actual (Pendiente, En desarrollo, Terminada), notas rápidas, archivos/implementaciones relacionados y próximos pasos.

---

## HU0.1 — Registro de Cliente
- Estado: Terminada
- Resumen: Registro con validaciones y hash de contraseña (bcrypt) implementado.
- Archivos relevantes: `backend/src/controllers/usuarios.controller.js`, `backend/src/routes/usuarios.routes.js`.
- Notas: Endpoint `POST /api/auth/signup` implementado y maneja colisiones de correo (409) y validaciones de contraseña; pruebas automatizadas pendientes y documentación final por completar.
- Próximo paso: Añadir pruebas unitarias e integración (E2E), y revisar cobertura para cumplir DoD.

---

## HU0.2 — Inicio de Sesión
- Estado: Terminada
- Resumen: Login con emisión de JWT implementado.
- Archivos relevantes: `backend/src/controllers/usuarios.controller.js`.
- Notas: Endpoint `POST /api/auth/login` implementado y devuelve token y datos de usuario; es necesario definir política de expiración/refresh y agregar tests de seguridad.
- Próximo paso: Añadir E2E y pruebas de expiración/refresh token si se requiere, y documentar el esquema de tokens en la API.

---

## HU1.1 — Visualización del Catálogo (Catálogo privado - opción A)
- Estado: En desarrollo
- Resumen: Endpoint `GET /api/productos` con paginación; protegido por `authMiddleware`.
- Implementación: `backend/src/controllers/productos.controller.js` y `backend/src/routes/productos.routes.js`.
- DoD Parcial: Validaciones de `page/limit`, check de categoría (404), orden por `nombre`. Tests scaffold añadido (skip).
- Próximo paso: Convertir tests scaffold en tests reales; documentar OpenAPI.

---

## HU1.2 — Filtrado y Paginación de Productos
- Estado: En desarrollo
- Resumen: Endpoint `/api/productos` acepta `category`, `page`, `limit` y devuelve `{ page, limit, total, totalPages, products[] }`.
- Implementación parcial: controlador devuelve forma de respuesta; migración `migrations/0006_index_productos_id_categoria.sql` añadida para rendimiento.
- Próximo paso: Aplicar migración en Supabase, añadir tests y OpenAPI.

---

## HU2.1 — Creación del Pedido
- Estado: Pendiente/Implementado parcialmente
- Resumen: `POST /api/pedidos` con items y total validado.
- Implementación: `backend/src/controllers/pedidos.controller.js` (createPedido presente, usa `utils/calculateTotal.js`).
- Notas: Requiere migración `migrations/0001_add_pedidos_items_and_indexes.sql` aplicada.
- Próximo paso: Aplicar migración y pruebas de integración.

---

## HU2.2 — Seguimiento de Pedido (Cliente)
 - Evidencia:
   - `backend/src/controllers/auth.controller.js` → `signup(req,res)` valida fuerza de contraseña, comprueba existencia de correo y crea usuario con `contrasena_hash` (bcrypt) y `rol: 'cliente'`.
   - Ruta montada en `backend/src/routes/auth.routes.js` como `POST /api/auth/signup`.
---
 - Evidencia:
   - `backend/src/controllers/usuarios.controller.js` → `loginUsuario(req,res)` realiza búsqueda por `correo`, compara `contrasena` con `contrasena_hash` (bcrypt), aplica rate limiting simple y firma JWT con `process.env.JWT_SECRET` (8h).
   - Ruta disponible en `backend/src/routes/usuarios.routes.js` como `POST /api/usuarios/login` (nota: login está en `/api/usuarios/login` mientras que signup está en `/api/auth/signup`).
- Próximo paso: Tests de integración y aplicar triggers/migrations para auditoría si no están aplicadas.
 - Evidencia:
   - `backend/src/controllers/productos.controller.js` → `getProductos(req,res)` acepta `page`, `limit`, `category`, `search`; valida parámetros, ordena por `nombre` y responde `{ page, limit, total, totalPages, products }`.
   - Ruta montada en `backend/src/routes/productos.routes.js` como `GET /api/productos` y protegida con `authMiddleware`.
- Resumen: Servicio para generar QR PNG/PDF, subir opcionalmente a Storage y persistir `mesas.qr_url`.
 - Evidencia:
   - `backend/src/controllers/productos.controller.js` → `getProductos` implementa filtros por `id_categoria`, búsqueda `ilike('nombre', ...)`, conteo exacto (count: 'exact') y respuesta con `total` y `totalPages`.
   - `migrations/0006_index_productos_id_categoria.sql` presente en repo para crear índice sobre `id_categoria`.

 - Evidencia:
   - `backend/src/controllers/pedidos.controller.js` → `createPedido(req,res)` valida `id_cliente`/`id_mesa`, valida items (id_producto, cantidad, precio), calcula total con `calcularTotal(items)` y realiza `supabase.from('pedidos').insert(...)` retornando `201`.
   - Ruta montada en `backend/src/routes/pedidos.routes.js` como `POST /api/pedidos` (requiere `authMiddleware`).

 - Evidencia:
   - `backend/src/controllers/pedidos.controller.js` → `getPedidoById(req,res)` devuelve `pedido` y construye `history` buscando en `pedido_eventos` o tablas candidatas (fallback) y retorna últimos eventos.
   - Ruta montada en `backend/src/routes/pedidos.routes.js` como `GET /api/pedidos/:id` (protegida por `authMiddleware`).
- Resumen: CRUD admin para productos con validaciones y subida de imagen a Supabase Storage (<=5 MB).
 - Evidencia:
   - `backend/src/controllers/pedidos.controller.js` → `getPedidos`, `updatePedidoEstado`, `updatePedidoMesa` implementados (incluyen validaciones y logging best-effort con `logPedidoEvent`).
   - `backend/src/routes/pedidos.routes.js` expone `GET /api/pedidos` (staff/admin) y `PATCH /api/pedidos/:id/estado` (staff/admin).
  - Se agregó lógica para eliminar imagen anterior al actualizar producto.
 - Evidencia:
   - `backend/src/services/qr.service.js` → `generatePngBuffer` y `generatePdfBuffer` producen buffers de QR (PNG/PDF).
   - `backend/src/controllers/qr.controller.js` → `generateQr(req,res)` genera el archivo, opcionalmente sube a Storage y persiste `qr_url` en `mesas`.

 - Evidencia:
   - `backend/src/controllers/payments.controller.js` → `createPayment(req,res)` invoca `wompiService.createPayment(...)`, persiste registro en `pagos` (best-effort); `wompiWebhook(req,res)` verifica firma usando `wompiService.verifyWebhookSignature` y actualiza `pedidos` y `pagos` según payload.
   - `backend/src/services/wompi.service.js` contiene `createPayment` (simulada) y `verifyWebhookSignature` (HMAC-SHA256) — requiere claves reales para E2E.
- Próximo paso: Verificar en un proyecto Supabase con migraciones aplicadas.
 - Evidencia:
   - `backend/src/middlewares/upload.middleware.js` → middleware multer (memoryStorage) configurado (límite 5 MB y tipos permitidos).
   - `backend/src/routes/productos.routes.js` → write routes usan `authMiddleware`, `requireRole('admin')` y `upload.single('image')` para `POST`/`PUT`.
   - `backend/src/controllers/productos.controller.js` → `createProducto` y `updateProducto` suben `req.file.buffer` a Supabase Storage (`PRODUCT_IMAGES_BUCKET`), obtienen `publicUrl` y guardan `imagen_url`; `updateProducto` intenta eliminar la imagen anterior (best-effort) usando `getStoragePathFromPublicUrl`.
- Estado: En desarrollo
 - Evidencia:
   - `docs/realtime.md` describe el enfoque y el uso de Supabase Realtime. Controladores (`pedidos.controller.js`) están preparados para trabajar con eventos (e.g., `logPedidoEvent`) pero requieren habilitación del canal Realtime en el proyecto.

- Migraciones pendientes a aplicar en Supabase:
  - `migrations/0001_add_pedidos_items_and_indexes.sql` (items en pedidos)
  - `migrations/0002_create_pagos_table.sql` (pagos)
  - `migrations/0004_create_pedido_eventos_table.sql` y `0005_add_pedido_event_trigger.sql` (auditoría)
  - `migrations/0006_index_productos_id_categoria.sql` (índice) — añadida en repo
- Docs importantes: `README_AI_GUIDE.md`, `docs/products.md`, `docs/pedidos_admin.md`, `docs/qr-generation.md`, `docs/realtime.md`.
- Variables de entorno críticas: `SUPABASE_URL`, `SUPABASE_KEY`, `JWT_SECRET`, `PRODUCT_IMAGES_BUCKET`, `WOMPI_KEY`, `WOMPI_SIGNATURE_SECRET`, `CLIENT_URL`, `SAVE_QR_TO_STORAGE`, `QR_BUCKET`.

---

### Estado general y recomendaciones
- Prioridad inmediata: aplicar migraciones en Supabase (0001..0006) y crear buckets con permisos.
- Asegurar que `SUPABASE_KEY` que usa el backend tenga permisos de Storage y para insertar en `pedido_eventos` (si se aplica auditoría).
- Tests: configurar Jest ESM o convertir tests a mocks CJS; por ahora los tests son scaffolds y están skippeados.
- CI/CD: crear workflow básico para ejecutar linter/tests en PRs.

---

Si quieres, puedo:
- A) Añadir un checklist automático en la PR con la lista de migraciones y pasos de verificación.
- B) Generar un `docs/openapi.yaml` básico para los endpoints de productos/pedidos/auth.
- C) Implementar la eliminación de imagen en `deleteProducto` ahora.

Indica qué acción prefieres y la inicio.

---

ACTUALIZACIÓN DEL 2025-11-02
- Se creó un "Memory Bank" con archivos en `memory-bank/` que contienen: `projectbrief.md`, `productContext.md`, `activeContext.md`, `systemPatterns.md`, `techContext.md` y `progress.md`.
- Se añadió `PROGRESS.md` en la raíz con el estado resumido de las historias de usuario.
- Cambios principales relacionados: subida de imágenes de productos (multer + Supabase Storage), precios de pedidos calculados server-side, ajustes de CORS para PATCH y correcciones en `getProductoById`.

Consulta `memory-bank/progress.md` para una vista sincronizada del estado y los próximos pasos.
