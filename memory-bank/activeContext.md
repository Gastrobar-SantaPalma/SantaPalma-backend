# Active Context

Resumen de acciones recientes
- Se implementó `POST /api/auth/signup` (clientes reciben `rol: 'cliente'`).
- Login reforzado: rate limiting en login y no se retornan hashes de contraseñas en las respuestas.
- Productos: paginación y filtros (`page`, `limit`, `category`, `search`) implementados y desplegados en `productos.controller.js`.
- Categorías: controlador y rutas añadidos; las rutas de escritura ahora requieren `authMiddleware` + `requireRole('admin')`.
- Flujo admin ajustado: se eliminó el uso de `ADMIN_SECRET`. Ahora la creación de admins se hace mediante:
  - SQL directo (recomendado para primer admin), o
  - Promoción por SQL (`UPDATE usuarios SET rol = 'admin' ...`), o
  - Por un admin ya existente usando `POST /api/admin/create` (endpoint protegido por admin).
- Validaciones añadidas:
  - `productos`: `nombre`, `precio`, `id_categoria` son obligatorios al crear; `precio` debe ser numérico >= 0; no se permiten duplicados por nombre dentro de la misma categoría (case-insensitive).
  - `categorias`: `nombre` obligatorio y único (case-insensitive).
- Manejo de esquema: se añadió un fallback temporal al crear categoría para entornos donde la columna `activo` no exista (reintento sin `activo`). Esto es temporal y se sugiere alinear el esquema.

Estado del código y rama activa
- Rama actual de trabajo: `feature/HU1.1-products-pagination` (productos paginados) pero el trabajo se ha extendido para cubrir validaciones y admin flow.

Decisiones y convenciones en uso
- Supabase como fuente de datos y realtime.
- Rutas en español, controladores en `backend/src/controllers`, rutas en `backend/src/routes`.
- Auth: JWT firmado con `JWT_SECRET`. `authMiddleware` valida token; `requireRole('admin')` protege rutas admin.


Próximos pasos inmediatos
- Implementar Orders (HU2.1): `POST /api/pedidos` que valide items y total (usar `utils/calculateTotal.js`), persistir items (json/jsonb en `pedidos.items` o usar tabla `order_items` normalizada), y publicar actualizaciones por Supabase Realtime.
- Aplicar migración para añadir `items` a `pedidos` y crear índices únicos (archivo creado: `migrations/0001_add_pedidos_items_and_indexes.sql`).
- Agregar pruebas de integración para pedidos (crear pedido con `id_mesa` por id y por `codigo_qr`).

Bloqueos / riesgos
- Falta de tests automatizados y pipeline CI.
- Dependencia de esquema en la BD: los controladores ahora asumen la columna `items` en `pedidos`. Se creó la migración en el repositorio, pero debe aplicarse en Supabase (no aplicada automáticamente).
- Alineación de enums/valores (por ejemplo `estado` en `mesas`) puede requerir ajustes en la base de datos antes de ejecutar seeds.

Cambios recientes importantes
- Controlador `pedidos.controller.js`: implementado `createPedido` y `updatePedido` que aceptan `items[]`, calculan subtotales por item, validan el total con `utils/calculateTotal.js` y verifican existencia de `id_cliente`/`id_mesa` antes de insertar.
- Mejoras en validación de `id_mesa`: ahora el controlador acepta ids numéricos (o strings numéricos) y hace fallback a buscar por `codigo_qr`; si encuentra por `codigo_qr` normaliza el `id_mesa` antes de persistir.
- Archivo de migración creado: `migrations/0001_add_pedidos_items_and_indexes.sql` (añade `items jsonb` y crea índices únicos para `categorias` y `productos`).

Notas operativas
- `memory-bank/` sigue en `.gitignore` y debe actualizarse cada vez que se reinicie la memoria del agente o cuando se hagan cambios de contexto importante.
- Después de aplicar la migración, se recomienda ejecutar pruebas manuales de flujo: signup -> login -> crear mesa (si no existen) -> crear pedido con items.

Notas operativas
- memory-bank/ está en `.gitignore` por diseño (no versionar esta memoria local).
- Se aconseja crear el primer admin por SQL y luego usar `POST /api/admin/create` para añadir más administradores.

Plan de desarrollo inmediato (prioridades)
- HU2.3 — Mesas: seed + enum alignment (prioridad ALTA)
  - Objetivo: insertar seeds de mesas sin provocar errores de enum; decidir si se ajustan seeds a enum existente o se añade valor con `ALTER TYPE`.
  - Resultado esperado: `INSERT` de mesas funciona en dev/staging y `GET /api/mesas` devuelve las filas.

- HU3 — Pagos (Wompi) (prioridad ALTA)
  - Objetivo: endpoints `POST /payments/create` y `POST /webhooks/wompi` para iniciar y confirmar pagos.
  - Notas: usar variables de entorno `WOMPI_KEY` y `WOMPI_SIGNATURE_SECRET`; webhooks deben ser idempotentes y validados por firma.

- HU4 — Realtime pedidos (prioridad MEDIA)
  - Objetivo: garantizar que cambios en `pedidos` (estado) sean recibidos por el panel staff en tiempo real. Preferir Supabase Realtime (subscribe a tabla `pedidos`).

- HU5 — Gestión avanzada de pedidos (prioridad MEDIA)
  - Objetivo: filtros y endpoints administrativos para listar y actualizar pedidos; control de transiciones de estado y asignación de mesas.

Decisión de alcance — tests de integración
- Nota del equipo: por ahora se han decidido saltar los tests de integración automatizados para acelerar la entrega de funcionalidades. Seguiremos con pruebas manuales y smoke tests tras cada HU. Tests unitarios y CI básico se planificarán y añadirán después de las entregas críticas.
