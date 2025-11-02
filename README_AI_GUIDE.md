README_AI_GUIDE — SantaPalma Backend (AI-friendly guide)

Purpose
- This file is an AI-friendly, actionable guide describing how the backend works and what the frontend must use to fully consume the API.
- Keep this document as the single source-of-truth for automated agents and developers integrating the frontend.

Quick facts
- Tech: Node.js (ES modules) + Express.
- DB & Auth: Supabase (Postgres + Auth + Storage + Realtime) via `@supabase/supabase-js`.
- Entry: `backend/src/server.js`.
- Routes: Spanish resource names: `/api/usuarios`, `/api/productos`, `/api/pedidos`, `/api/mesas`, `/api/payments`, `/api/webhooks/wompi`, etc.
- Environment: `SUPABASE_URL`, `SUPABASE_KEY`, `JWT_SECRET`, `PRODUCT_IMAGES_BUCKET`, `CLIENT_URL`, `WOMPI_KEY`, `WOMPI_SIGNATURE_SECRET`.

Contract / conventions for the frontend
- All endpoints return JSON. Error responses follow `{ error: string }` or `{ error: <object> }`.
- Auth: Bearer JWT in `Authorization` header. Example: `Authorization: Bearer <token>`.
- Roles: `cliente` (customer), `staff`, `admin`. Protected routes require `authMiddleware` and some require `requireRole('admin')` or `requireAnyRole(...)`.
- Paging: endpoints that support pagination use `?page=<n>&limit=<m>` and return `{ page, limit, total, totalPages, items: [...] }` or on products: `{ page, limit, total, totalPages, products: [...] }`.

Key endpoints (what frontend needs to know)

1) Auth
- POST /api/auth/signup
  - Body: { nombres, apellidos, correo, contrasena }
  - Success: 201 and { userId }
  - Errors: 409 if email exists, 400 for validation
- POST /api/auth/login
  - Body: { correo, contrasena }
  - Success: 200 and { token, user }
  - Use token for subsequent requests

2) Productos (catalogo)
- GET /api/productos?category=<id>&page=<n>&limit=<m>&search=<q>
  - Auth: required (HU1.1 choice). Pass Bearer token in header.
  - Response: 200 { page, limit, total, totalPages, products: [ { id_producto, nombre, descripcion, precio, disponible, imagen_url, id_categoria, categorias: { id_categoria, nombre } } ] }
  - 404 if `category` (id) provided but not found.
  - Ordering: alphabetically by `nombre` by default.
- GET /api/productos/:id
  - Response: 200 product object or 404
- POST /api/productos (admin)
  - Protected: admin
  - Content-Type: multipart/form-data when uploading image. Field name for image: `image`.
  - Form fields: nombre, descripcion, precio, id_categoria, disponible (image is optional)
  - On success: 201 with created product object. If image uploaded, `imagen_url` will be a public URL from Supabase Storage.
- PUT /api/productos/:id (admin)
  - Protected: admin
  - Same multipart/form-data contract as POST. If updating image, new image uploaded and `imagen_url` updated.
- DELETE /api/productos/:id (admin)
  - Protected: admin. Returns 204 on success.

3) Pedidos (orders)
- POST /api/pedidos
  - Auth required.
  - Body: { id_usuario (or token), id_mesa, items: [ { id_producto, cantidad } ], total }
  - Backend validates items and total with `utils/calculateTotal.js`. Returns 201 with { id_pedido }
- GET /api/pedidos/:id
  - Auth required (customer accessing their order or staff/admin). Returns: { pedido, history } where `history` is recent events (last 5) — from audit table or best-effort fallback.
- GET /api/pedidos (staff) — filtering/pagination
  - Protected: requireAnyRole('staff','admin') or similar.
- PATCH /api/pedidos/:id/estado
  - Protected: staff/admin. Body: { estado: 'Pendiente'|'En preparación'|'Listo'|'Entregado' }.
  - Backend logs state changes to audit table and triggers realtime notifications.
- PATCH /api/pedidos/:id/mesa
  - Protected: staff/admin. Body: { id_mesa }

4) Mesas / QR
- POST /api/mesas/:id/generate-qr (admin)
  - Generates QR for `/m/{venueId}/table/{tableId}` and returns PNG or URL (implementation uploads to storage optionally and saves `mesas.qr_url`).

5) Payments (HU4 / Wompi scaffold)
- POST /api/payments/create
  - Auth required. Creates a payment session and returns `checkout_url` (currently a stub until WOMPI keys provided).
- POST /api/webhooks/wompi
  - Webhook endpoint — server mounts `express.raw({ type: 'application/json' })` before `express.json()` to verify signature.
  - Backend validates HMAC signature using `WOMPI_SIGNATURE_SECRET`. On payment success, backend updates `pagos` table and `pedidos` status to `Pagado`.

Storage and images
- IMAGE UPLOAD: product images use multipart/form-data field `image`. The backend uses `multer` (memoryStorage) and then uploads to Supabase Storage in bucket `PRODUCT_IMAGES_BUCKET` (default `product-images`).
- The backend currently requests public URLs via `getPublicUrl()`. If you require signed URLs for access control, update server logic to use signed URLs and inform frontend to fetch them.

Realtime
- The platform intends to use Supabase Realtime for `pedidos` updates.
- Frontend should subscribe to the `pedidos` table (or a specific channel) and fall back to polling every 5s when realtime is unavailable.

Database / migrations (must be applied in Supabase)
- Important migration files (in repo `migrations/`):
  - `0001_add_pedidos_items_and_indexes.sql` — adds `items` JSONB to `pedidos` and required indexes.
  - `0002_create_pagos_table.sql` — creates `pagos` table.
  - `0003_add_qr_url_to_mesas.sql` — adds `qr_url` column to `mesas`.
  - `0004_create_pedido_eventos_table.sql`, `0005_add_pedido_event_trigger.sql` — audit table and triggers for pedidos events.
  - `0006_index_productos_id_categoria.sql` — index to speed up filtering by category.
- Apply migrations in order on Supabase SQL editor. The backend assumes these exist; otherwise some features will fall back or error.

Environment variables (minimum)
- SUPABASE_URL — Supabase project URL
- SUPABASE_KEY — Service key with write access (used by backend). Must be kept secret.
- JWT_SECRET — token signing secret
- PRODUCT_IMAGES_BUCKET — optional bucket name for product images (default `product-images`)
- CLIENT_URL — frontend origin (for building links in QR payload)
- WOMPI_KEY, WOMPI_SIGNATURE_SECRET — for payments (optional until Wompi integration is enabled)
- SAVE_QR_TO_STORAGE (true|false) — whether QR images are uploaded to storage
- QR_BUCKET — bucket name for QR images if SAVE_QR_TO_STORAGE=true

Errors, logging and observability
- Controllers return `res.status(code).json({ error: message })` for failures. Inspect logs for `console.error` traces.
- In dev, enable detailed logs. In production use `SUPABASE_KEY` carefully and avoid logging secrets.

Examples for frontend (PowerShell / curl)
- Get products (page=1, limit=12):
  - curl:
    curl -H "Authorization: Bearer <TOKEN>" "http://localhost:3000/api/productos?page=1&limit=12"
  - PowerShell:
    Invoke-RestMethod -Uri "http://localhost:3000/api/productos?page=1&limit=12" -Headers @{ Authorization = "Bearer <TOKEN>" }

- Create product with image (admin):
  - curl:
    curl -X POST "http://localhost:3000/api/productos" -H "Authorization: Bearer <ADMIN_TOKEN>" -F "nombre=Ensalada" -F "precio=12.5" -F "id_categoria=1" -F "image=@./ensalada.jpg;type=image/jpeg"

- Subscribe to realtime (frontend JS using @supabase/supabase-js):
  const supabase = createClient(SUPABASE_URL, PUBLIC_ANON_KEY);
  supabase
    .channel('public:pedidos')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, payload => {
      // handle update
    })
    .subscribe()

Notes for integrators / AI agents
- When automating E2E tests or CI, either mock Supabase or spin a dedicated test project in Supabase where migrations are applied.
- The backend is ESM — when writing tests, configure Jest to support ESM or use a common setup that uses `node --experimental-vm-modules` and appropriate transform.
- For payments, Wompi integration is scaffolded but requires `WOMPI_KEY` and `WOMPI_SIGNATURE_SECRET` to be supplied. Webhook endpoint expects raw body parsing for signature validation.

Contact / next steps
- Apply migrations on Supabase before running E2E tests.
- Create the product images bucket and set `PRODUCT_IMAGES_BUCKET`.
- Provide Wompi sandbox keys to enable payments flows or keep payment flows as stubs for now.

This guide is intended to be machine-readable and human-friendly. Update when server routes or DB schema change.
