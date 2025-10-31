# Progress

Resumen del progreso actual (corte: 2025-10-30)

Hecho / implementado (parcialmente o totalmente)
- Usuarios: CRUD y login JWT implementados (`backend/src/controllers/usuarios.controller.js`). Falta validación de fuerza de contraseña y chequeo de email duplicado.
- Productos: CRUD básico implementado (`backend/src/controllers/productos.controller.js`). Falta paginación/filtrado y gestión de imágenes en Supabase Storage.
- Pedidos: CRUD básico implementado (`backend/src/controllers/pedidos.controller.js`). Falta persistencia de `items[]`, validación de `total` y publicación a Realtime.
- Mesas: CRUD básico y campo `codigo_qr` en esquema; falta servicio para generar QR.

No implementado / pendiente
- Pagos (Wompi) — solo placeholder en `services/wompi.service.js`.
- Webhook de pagos, Realtime completo, reportes, recomendaciones y tests/CI.

Bloqueos y riesgos
- Contraseñas potencialmente devueltas en respuestas (revisar selects).
- Rutas con duplicados y middleware aplicado inconsistently.
- Falta de tests hace que cambios mayores sean riesgosos.

Próximos pasos (prioritarios)
1. Corregir exposición de `contrasena_hash` inmediatamente.
2. Limpiar y unificar las rutas (remover duplicados y asegurar middleware).
3. Implementar `/auth/signup` con validación y 409 para duplicados.
4. Añadir paginación y filtros a `GET /products`.

Medidas de éxito
- Endpoints críticos cubiertos por tests/smoke scripts.
- No devolver datos sensibles.
- Paginated product responses matching backlog contract.
