# Active Context

Estado actual del trabajo
- Branch actual: `feature/david`.
- Código existente: servidor Express (ES modules) en `backend/src/server.js`, controladores CRUD básicos para `usuarios`, `productos`, `pedidos`, `mesas`. Servicios de pago y auditoría incompletos.

Decisiones activas
- Usar Supabase (cliente en `backend/src/config/supabaseClient.js`) para datos, storage y realtime.
- Mantener rutas y controladores separados: `routes/*` -> `controllers/*`.

Próximos pasos prioritarios (rápido):
- Corregir exposición de `contrasena_hash` en respuestas.
- Limpiar rutas duplicadas y asegurar middleware de auth donde aplica.
- Implementar `/auth/signup` con validación y 409 para correos duplicados.

Commits y flujo de trabajo
- Hacer commits frecuentes y atómicos: cada pequeño avance (fix, endpoint funcional, test agregado) debe tener su propio commit.
- Trabajar en ramas `feature/<hu-id>` y abrir PR cuando se cumpla la DoD de la historia.
- Mensajes de commit claros y si es posible referenciar el HU: `feature/HU0.1: signup endpoint`.

Bloqueos conocidos
- Falta de tests y CI; cambios de esquema requieren coordinación con DB/infra.
