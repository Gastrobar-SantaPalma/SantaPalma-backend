# System Patterns

- Project type: Node.js + Express (ES modules). Entry: `backend/src/server.js`.
- DB: Supabase client (`backend/src/config/supabaseClient.js`) used in controllers via `supabase.from('<table>')`.
- Auth: JWT signed with `process.env.JWT_SECRET`; passwords hashed with `bcryptjs` stored in `contrasena_hash`.
- Routes: Spanish resource names (`usuarios`, `productos`, `categorias`, `pedidos`, `mesas`). Write routes require `authMiddleware`; admin-only routes use `requireRole('admin')`.
- Error handling: controllers return `res.status(code).json({ error })` consistently.
# System Patterns

Arquitectura general
- Backend: Node.js + Express (ES modules). Entrada principal: `backend/src/server.js`.
- Base de datos y servicios: Supabase (client en `backend/src/config/supabaseClient.js`).
- Rutas: `backend/src/routes/*` → controladores en `backend/src/controllers/*`.

Patrones de implementación
- Controllers: llaman a `supabase.from('<table>')` y devuelven JSON; manejan `error` y usan códigos HTTP (200/201/400/404/500).
- Auth: middleware JWT en `backend/src/middlewares/auth.middleware.js` que verifica `Authorization: Bearer <token>` y añade `req.user`.
- Passwords: usar `bcryptjs` para hashear y nunca devolver `contrasena_hash` en respuestas públicas.

Integraciones
- Pagos: placeholder en `backend/src/services/wompi.service.js` — requiere implementación de `POST /payments/create` y webhook.
- Realtime: previsto usar Supabase Realtime para `pedidos` (canal) con fallback a polling.

Convenciones
- Nombres en español para rutas/tables (`usuarios`, `productos`, `pedidos`, `mesas`).
- Branches: `feature/<hu-id>` para trabajo por HU.

Commits y frecuencia
- Realizar commits pequeños y atómicos con frecuencia. Cada cambio lógico (bugfix, endpoint implementado, test agregado) debe tener su propio commit.
- Mensajes de commit deben referenciar la HU o issue cuando aplique. Ejemplos:
	- `feature/HU1.2: add products pagination`
	- `fix: remove password hash exposure`
- Empujar (push) al repositorio remoto en la rama `feature/<hu-id>` y abrir PR cuando la DoD esté cumplida para esa historia.
- No commitear secretos ni archivos `.env`. Si se necesita probar, usar variables de entorno locales o branches privados.
- Si existen tests/linter locales, ejecutar antes del commit; preferir commits que pasen las comprobaciones básicas.
