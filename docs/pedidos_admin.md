# Pedidos — Endpoints para staff/admin

GET /api/pedidos
- Protegido: requiere rol `staff` o `admin`.
- Query params: page, limit, estado, id_mesa, id_cliente, from (fecha ISO), to (fecha ISO).
- Respuesta: `{ page, limit, total, totalPages, pedidos[] }`.

PATCH /api/pedidos/:id/estado
- Protegido: `staff` o `admin`.
- Body: `{ estado: 'preparacion' }`.
- Reglas de transición: pendiente → preparacion → listo → entregado.
- Retorna el pedido actualizado.

PATCH /api/pedidos/:id/mesa
- Protegido: `staff` o `admin`.
- Body: `{ id_mesa: 4 }`.
- Valida que la mesa exista.
- Retorna el pedido actualizado.

Auditoría
- Los cambios relevantes insertan filas en `pedido_eventos` (tabla + triggers/migraciones incluidas en `migrations/`).

