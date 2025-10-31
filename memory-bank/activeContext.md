# Active Context

Estado actual del trabajo
- Branch actual: `feature/HU1.1-products-pagination` (trabajo en progreso: productos paginados).
- Código existente: servidor Express (ES modules) en `backend/src/server.js`, controladores CRUD básicos para `usuarios`, `productos`, `pedidos`, `mesas`. Servicios de pago y auditoría incompletos.

Decisiones activas
- Usar Supabase (cliente en `backend/src/config/supabaseClient.js`) para datos, storage y realtime.
- Mantener rutas y controladores separados: `routes/*` -> `controllers/*`.

Próximos pasos prioritarios (rápido):
- Implementar orders: aceptar `{ userId, items[], total }`, validar total y persistir items.
- Publicar actualizaciones de pedidos vía Supabase Realtime y documentar suscripción.
- Implementar pagos (Wompi) y webhook.

Commits y flujo de trabajo
- Hacer commits frecuentes y atómicos: cada pequeño avance (fix, endpoint funcional, test agregado) debe tener su propio commit.
- Trabajar en ramas `feature/<hu-id>` y abrir PR cuando se cumpla la DoD de la historia.
- Mensajes de commit claros y si es posible referenciar el HU: `feature/HU0.1: signup endpoint`.

Bloqueos conocidos
- Falta de tests y CI; cambios de esquema requieren coordinación con DB/infra.

Tarea de desarrollo activa (memoria)
- Tarea actual: **Orders (HU2.1)** — status: in-progress.
  - Objetivos: implementar `POST /orders` que reciba `{ userId, items[], total }`, validar `total` con `backend/src/utils/calcularTotal.js`, persistir `items` (JSON column for MVP) y devolver `201` con `orderId`.
  - Rama objetivo: `feature/HU2.1-orders`.
  - Reglas: commits atómicos por cambio; push a `feature/<hu-id>`; abrir PR cuando la DoD esté completa.

Registro de progreso
- Quick cleanup realizado y comiteado en `feature/david` (remoción de `contrasena_hash`, limpieza de rutas).
- Signup y login implementados y comiteados en `feature/HU0.1-signup`.
- Productos paginados implementados y comiteados en `feature/HU1.1-products-pagination`.
