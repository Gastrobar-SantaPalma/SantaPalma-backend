## SantaPalma Backend — Copilot / AI Agent Guidance

This file provides concise, repository-specific instructions so an AI coding agent can be immediately productive.

- Project type: Node.js Express backend (ES modules). Main server: `backend/src/server.js`.
- DB & auth: Supabase client at `backend/src/config/supabaseClient.js` (import default `supabase`).

Key patterns and conventions
- Routes live in `backend/src/routes/*` and import controller functions from `backend/src/controllers/*`.
  Example: `backend/src/routes/usuarios.routes.js` maps `/api/usuarios` to controller handlers.
- Controllers perform Supabase queries via `supabase.from('<table>')` and return JSON with appropriate HTTP codes.
  Example columns used in `usuarios` table: `id_usuario, nombre, correo, contrasena_hash, rol, fecha_registro`.
- Auth: `backend/src/middlewares/auth.middleware.js` extracts a Bearer JWT, verifies with `process.env.JWT_SECRET` and sets `req.user`.
  Use `authMiddleware` to protect write/update/delete routes and `requireRole(role)` for role checks.
- Password handling: controllers hash passwords with `bcryptjs` and store `contrasena_hash` (see `createUsuario`).
- Utilities: small helpers such as `backend/src/utils/calculateTotal.js` are synchronous pure functions (use directly in controllers/services).

Run / dev workflow (what works now)
- Start dev server locally: `npm run dev` (runs `node backend/src/server.js`).
- Production start: `npm start` (same entrypoint).
- Required environment variables (observed from code):
  - `SUPABASE_URL`, `SUPABASE_KEY` — used by Supabase client.
  - `JWT_SECRET` — JWT signing/verifying key (default falls back to `'secret'` in code; do not rely on this in prod).
  - `CLIENT_URL` — allowed origin for CORS (server defaults to `http://localhost:5173`).
  - `PORT` — optional; server defaults to `4000`.

Important implementation idioms (use these examples)
- Adding a new resource: create `controllers/<resource>.controller.js` exporting named handlers, then `routes/<resource>.routes.js` that imports them and exports an Express Router. Register the router in `server.js` under `/api/<resource>`.
- Supabase queries: prefer `.select(...).eq(...).single()` for single-row reads and handle `error` from Supabase response. Example pattern in `loginUsuario`.
- Token generation: controllers use `jsonwebtoken.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' })`.
- Error responses: controllers return res.status(code).json({ error: message }) consistently; follow this pattern for new handlers.

Integration points and expectations
- Payments: `backend/src/services/wompi.service.js` contains the payment processing placeholder. Backlog expects a `POST /payments/create` and a webhook endpoint `POST /webhooks/wompi` that validates signatures and updates order status.
- Realtime: backlog references Supabase Realtime for order updates — watch for Supabase realtime channel code or polling fallbacks.

Project-specific conventions worth noting
- ES module syntax (imports/exports) — files use `import`/`export default` or named exports; keep `type: "module"` in `package.json` in mind.
- Route naming: use Spanish resource names (e.g., `usuarios`, `productos`, `pedidos`, `mesas`) — mirror existing lowercase pluralization.
- Table and field names used in code are specific (e.g., `id_usuario`); when writing DB-related code, reuse these column names.
- CORS: server explicitly allows no-origin requests (mobile/curl) or a single `CLIENT_URL`. Avoid broad wildcard changes.

Commit & branch rules
- Make frequent, small, atomic commits for each logical change. Prefer one change per commit (bugfix, endpoint, test).
- Use branch naming `feature/<hu-id>` (or `fix/<issue-id>`) and push work to the remote branch. Open PRs when the DoD for the HU is met.
- Commit messages should reference the HU or a concise description, e.g. `feature/HU1.2: add products pagination` or `fix: remove password hash exposure`.
- Never commit secrets or `.env` files. Use environment variables locally and in deployment.

What to avoid / quick gotchas
- Don’t assume a test or lint pipeline exists — `package.json` has no test/lint scripts. Changes that introduce new dev dependencies should also add scripts and docs.
- Do not hardcode secrets — the code falls back to `'secret'` only for local convenience; prefer environment variable injection.
- Modifying server import/exports should respect ES module semantics (`type: "module"`).

If you change public behavior (APIs or DB schema)
- Update the corresponding controller, route, and any Supabase queries.
- Add/adjust documentation in the backlog or README and create a `feature/<hu-id>` branch (the backlog mentions branch naming like `feature/<hu-id>` in DoD).

Examples to copy/paste
- Registering a router in `server.js`:
  import productosRoutes from './routes/productos.routes.js'
  app.use('/api/productos', productosRoutes)
- Example protected route in `routes/usuarios.routes.js`:
  router.put('/:id', authMiddleware, updateUsuario)

If anything below is missing or unclear, tell me which files or flows you want expanded and I'll update this file.
