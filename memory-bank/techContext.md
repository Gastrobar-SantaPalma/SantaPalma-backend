# Tech Context

- Node.js (ES modules), Express.
- Supabase client for DB and realtime.
- bcryptjs for password hashing, jsonwebtoken for JWTs.
- dotenv used for environment variables (`.env`).
- Tests: none yet—consider adding Jest + supertest.
# Tech Context

Stack y herramientas
- Node.js (ES modules) + Express
- Supabase (Postgres, Storage, Realtime)
- Dependencias principales: `@supabase/supabase-js`, `express`, `cors`, `dotenv`, `bcryptjs`, `jsonwebtoken`, `morgan`.

Variables de entorno importantes
- `SUPABASE_URL`, `SUPABASE_KEY` — conexión Supabase
- `JWT_SECRET` — firma/verificación de JWT (fallback `'secret'` en dev; NO usar en prod)
- `CLIENT_URL` — origen permitido para CORS (por defecto `http://localhost:5173`)
- `PORT` — puerto del servidor
- `WOMPI_KEY`, `WOMPI_SIGNATURE_SECRET` — para integración de pagos (cuando se implemente)

Comandos útiles (PowerShell)
```powershell
npm install
npm run dev     # inicia backend en backend/src/server.js
```

Estructura de carpetas relevante
- `backend/src/server.js` — app y registro de rutas
- `backend/src/routes/*` — routers por recurso
- `backend/src/controllers/*` — handlers que usan `supabase`
- `backend/src/middlewares/*` — auth y error handling
- `backend/src/services/*` — integraciones (wompi, pagos)
