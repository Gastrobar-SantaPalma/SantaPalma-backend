# PROGRESS.md

Proyecto: SantaPalma-Backend
Fecha: 2025-11-03

Estado general:

- Implementaciones completadas:
  - Gestión de productos (HU5.1) con subida de imágenes — listo.
  - Cálculo y validación de precios en pedidos — implementado.
  - Depuración y corrección de actualización de `estado` en pedidos — trigger y normalización corregidos.

- Migraciones:
  - `0004_ensure_estado_pedido_enum.sql` — aplicada por el usuario.
  - `0005_fix_fn_pedido_eventos_trigger.sql` — añadida al repositorio; ejecutar en SQL editor para aplicar.

Próximos pasos:
- Ejecutar pruebas autenticadas (PATCH /api/pedidos/:id/estado) con JWT válido.
- Añadir tests unitarios para `updatePedidoEstado` (happy path + invalid transition).
- Limpiar rutas de debug antes de merge a main.
# Proyecto — PROGRESS

Resumen rápido del estado de historias de usuario (fecha: 2025-11-02):

- HU0.1 — Registro de usuarios: COMPLETADO
- HU0.2 — Inicio de sesión: COMPLETADO
- HU1.1 — Listado y paginación de productos: COMPLETADO (endpoints GET implementados)
- HU1.2 — Orden y filtros de catálogo: PARCIAL (filtros básicos implementados)
- HU5.1 — Gestión de productos (admin) + subida de imágenes: EN PROGRESO (backend implementado; confirmar uploads a Supabase)
- HU_PAYMENTS — Integración con Wompi: BLOQUEADO (falta configurar WOMPI_KEY y signature secret)

Acciones pendientes (prioritarias):
1. Verificar persistencia de imágenes en Supabase (confirmar bucket y permisos). 
2. Aplicar migraciones en Supabase (migrations/0001..0006).
3. Añadir tests de integración para crear pedidos y subir imágenes.
4. Resolver ESM/CJS en tests o adaptar Jest a ESM.

Dónde buscar evidencia de cambios:
- Código: `backend/src/controllers/*`, `backend/src/routes/*`, `backend/src/middlewares/*`
- Migraciones: `migrations/`
- Documentación y estado: `memory-bank/progress.md`, `USER_STORIES_STATUS.md`
