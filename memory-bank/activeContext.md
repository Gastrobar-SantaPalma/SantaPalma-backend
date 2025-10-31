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

Tarea de desarrollo activa (memoria)
- Tarea actual: **Fix auth & signup (HU0.1)** — status: in-progress.
	- Objetivos: crear `/auth/signup` con validación de contraseña (>=8, 1 mayúscula, 1 número, 1 símbolo), detectar correo duplicado y devolver `409`, hashear contraseña con bcrypt y devolver `201` con `id_usuario`.
	- Rama objetivo: `feature/HU0.1-signup` (crear si no existe).
	- Reglas: commits atómicos por cambio; push a `feature/<hu-id>`; abrir PR cuando DoD esté completa.

Registro de progreso
- Quick cleanup realizado y comiteado en `feature/david` (remoción de `contrasena_hash`, limpieza de rutas).
