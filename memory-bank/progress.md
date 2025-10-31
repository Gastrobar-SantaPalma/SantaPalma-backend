# Progress

Resumen del progreso actual (corte: 2025-10-30)

Hecho / implementado (parcialmente o totalmente)
- Usuarios: CRUD y login JWT implementados (`backend/src/controllers/usuarios.controller.js`). Se añadió `/api/auth/signup` con validación de contraseña y chequeo de correo duplicado (`backend/src/controllers/auth.controller.js`). El login fue fortalecido con un limitador simple de intentos.
- Productos: CRUD básico implementado (`backend/src/controllers/productos.controller.js`). Paginación y filtros implementados (`page`, `limit`, `category`, `search`) y la respuesta cumple la estructura `{ page, limit, total, totalPages, products[] }`.
- Pedidos: CRUD básico implementado (`backend/src/controllers/pedidos.controller.js`). Falta persistencia de `items[]`, validación de `total` y publicación a Realtime.
- Mesas: CRUD básico y campo `codigo_qr` en esquema; falta servicio para generar QR.

No implementado / pendiente
- Pagos (Wompi) — solo placeholder en `services/wompi.service.js`.
- Webhook de pagos, Realtime completo, reportes, recomendaciones y tests/CI.

Bloqueos y riesgos
- Contraseñas potencialmente devueltas en respuestas (corregido en selecciones de usuarios).
- Rutas con duplicados y middleware aplicado inconsistently (limpiado en product/mesas/pedidos).
- Falta de tests hace que cambios mayores sean riesgosos.

Próximos pasos (prioritarios)
1. Orders: implementar payload completo para creación de pedidos (`userId`, `items[]`, `total`), validar `total` con `backend/src/utils/calcularTotal.js` y persistir `items` (JSON o tabla `order_items`). (in progress)
2. Realtime: publicar actualizaciones de pedido a Supabase Realtime en `updatePedido` y documentar la suscripción para frontend; implementar fallback de polling cada 5s.
3. Payments: implementar `POST /payments/create` y `POST /webhooks/wompi` con validación de firma e idempotencia.
4. Product images: integrar Supabase Storage para uploads firmados o server-side con validación de tamaño/tipo.
5. Tests & CI: añadir pruebas de humo y un workflow de GitHub Actions que ejecute pruebas en PRs.

Medidas de éxito
- Endpoints críticos cubiertos por tests/smoke scripts.
- No devolver datos sensibles.
- Paginated product responses matching backlog contract.
- Orders persistidos con totales validados y actualizaciones realtime funcionando.

