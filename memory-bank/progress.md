
# Progress

Resumen del progreso (corte: 2025-10-30)


Hecho / implementado recientemente
- Se eliminó la exposición de `contrasena_hash` en las selecciones de usuarios.
- `POST /api/auth/signup` implementado; login reforzado con limitador de intentos.
- Productos: paginación y filtros añadidos; `GET /api/productos` devuelve `{ page, limit, total, totalPages, products[] }`.
- Categorías: CRUD añadido y rutas de escritura protegidas por `requireRole('admin')`.
- Admin flow: se eliminó `ADMIN_SECRET`; creación de admins ahora debe hacerse via SQL o por un admin autenticado usando `POST /api/admin/create`.
- Validaciones de integridad: se añadieron comprobaciones en controladores para evitar duplicados (productos por categoría y categorías por nombre) y rechazar campos nulos en creación/actualización.
- Pedidos (HU2.1): `createPedido` y `updatePedido` implementados a nivel de controlador. Validan `items[]`, calculan subtotales y total con `utils/calculateTotal.js`, y verifican existencia de `id_cliente` y `id_mesa` antes de insertar/actualizar.
- Mejorada la resolución de `id_mesa`: ahora acepta ids numéricos y `codigo_qr` como fallback; normaliza el `id_mesa` antes de persistir para evitar errores de FK.
- Se creó la migración `migrations/0001_add_pedidos_items_and_indexes.sql` para agregar `items jsonb` a `pedidos` y crear índices únicos. (La migración debe aplicarse en la BD.)


Pendiente / siguientes prioridades
- Aplicar la migración para añadir `items` a la tabla `pedidos` en Supabase (archivo: `migrations/0001_add_pedidos_items_and_indexes.sql`).
- Añadir pruebas automatizadas (Jest + supertest) y pipeline CI para coverage básica de endpoints críticos.
- Ejecutar pruebas de integración para pedidos (crear pedido con `id_mesa` por id y por `codigo_qr`) y corregir cualquier mismatch de esquema restante (enums, columnas faltantes).
- Opcional: normalizar modelo de pedidos a `order_items` relacional si se requiere reporting y consistencia transaccional más estricta.

Pendiente / siguientes prioridades (actualizado)
1. HU2.3 — Mesas: seed + enum alignment (ALTA)
	- Ejecutar consulta para listar valores de `estado_mesa` y decidir estrategia (ajustar seeds o `ALTER TYPE`).
	- Crear `migrations/seed_mesas.sql` con valores compatibles y ejecutar en dev/staging.

2. HU3 — Pagos (Wompi) (ALTA)
	- Implementar `backend/src/services/wompi.service.js` (completar o dejar stub) y añadir `POST /payments/create` y `POST /webhooks/wompi`.
	- Validar firma del webhook con `WOMPI_SIGNATURE_SECRET` y actualizar `pedidos` a `pagado`/`fallido` según corresponda.

3. HU4 — Realtime pedidos (MEDIA)
	- Confirmar suscripción en frontend (Supabase Realtime) y asegurar que `updatePedido` provoca eventos visibles para clientes suscritos.

4. HU5 — Gestión avanzada de pedidos (MEDIA)
	- Añadir endpoints de list/filter y de cambio de estado con reglas de transición y permisos.

5. HU6 / HU7 — Docs/Runbook y CI (BAJA-MEDIA)
	- Documentar el proceso de migraciones, backups y verificación (`docs/migrations.md`).
	- Configurar GitHub Actions básico que ejecute linters/unit tests.

Notas operativas
- Se decidió posponer los tests de integración automatizados por ahora y continuar con pruebas manuales y smoke tests para cada HU implementada.
- La migración crítica ya fue aplicada (items + índices). Verificar seeds y enums antes de ejecutar inserciones masivas.

Bloqueos y riesgos actuales
- Falta de tests automatizados; cambios grandes sin cobertura son riesgosos.
- Posible desajuste de esquema (columna `activo` en `categorias`): añadimos un fallback temporal al crear categorías, pero la solución robusta es alinear el esquema y migrar tablas.

Próximos pasos recomendados
1. Aplicar migración `migrations/0001_add_pedidos_items_and_indexes.sql` en el proyecto Supabase y verificar que `pedidos.items` existe.
2. Implementar y ejecutar pruebas de integración para pedidos y mesas.
3. Añadir índices/constraints a nivel de DB y desplegar cambios en staging antes de producción.
4. Añadir CI (GitHub Actions) que ejecute tests básicos en cada PR.

