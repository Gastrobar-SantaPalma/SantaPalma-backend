(The file `c:\Users\usuario\OneDrive\Documents\ACADEMICO\SEPTIMO SEMESTRE\INTRODUCCI\u00d3N A LA GESTI\u00d3N DE PROYECTOS DE SOFTWARE\backen andres\SantaPalma-Backend\README.md` exists, but is empty)
## SantaPalma Backend

API REST para Gastrobar SantaPalma — servidor Node.js + Express (ES modules) usando Supabase como base de datos y autenticación.

Contenido
- Descripción
- Requisitos
- Instalación y ejecución
- Variables de entorno
- Endpoints principales
- Flujo de autenticación y roles
- Cómo crear el primer admin
- Validaciones y reglas importantes
- Recomendaciones de despliegue
- Contribuir

Descripción
-----------
Este repositorio contiene el backend para la aplicación de SantaPalma. Proporciona recursos en español para gestionar: usuarios (`usuarios`), productos (`productos`), categorías (`categorias`), pedidos (`pedidos`), mesas (`mesas`) y pagos (`pagos`).

El backend está diseñado para soportar dos tipos de usuarios principales:
- cliente: puede registrarse públicamente y usar la app cliente para ver productos y realizar pedidos.
- admin: gestiona productos, categorías y pedidos desde el panel administrativo.

Requisitos
----------
- Node.js 18+ (recomendado) o la versión que tengas disponible
- npm
- Cuenta y proyecto en Supabase (URL + API KEY)

Instalación y ejecución (local)
--------------------------------
1. Clona el repositorio y entra al directorio:

```powershell
cd "C:\ruta\a\SantaPalma-Backend"
```

2. Instala dependencias:

```powershell
npm install
```

3. Crea un fichero `.env` en la raíz con las variables indicadas abajo.

4. Ejecuta en modo desarrollo:

```powershell
npm run dev
```

El servidor por defecto corre en el puerto `4000` (o el que pongas en `PORT`).

Variables de entorno (mínimas)
-----------------------------
Coloca estas variables en tu `.env` (no subir `.env` al repo):

- SUPABASE_URL=<your-supabase-url>
- SUPABASE_KEY=<your-supabase-key>
- JWT_SECRET=<una-cadena-secreta-larga-para-firmar-jwt>
- CLIENT_URL=http://localhost:5173 (opcional, para CORS)
- PORT=4000 (opcional)

Endpoints principales (resumen)
------------------------------
Rutas principales (montadas bajo `/api`):
- `POST /api/auth/signup` — registrar cliente (público). Body: { nombre, correo, contrasena }
- `POST /api/usuarios/login` — login. Body: { correo, contrasena } -> devuelve { token, usuario }
- `GET /api/productos` — listar productos (soporta page, limit, category, search)
- `POST /api/productos` — crear producto (admin-only)
- `PUT /api/productos/:id` — actualizar producto (admin-only)
- `DELETE /api/productos/:id` — eliminar producto (admin-only)
- `GET /api/categorias` — listar categorías
- `POST /api/categorias` — crear categoría (admin-only)
- `PUT /api/categorias/:id` — actualizar categoría (admin-only)
- `DELETE /api/categorias/:id` — eliminar categoría (admin-only)
- `POST /api/pedidos` — crear pedido (pendiente: validación total/items)

Autenticación y roles
----------------------
- El proyecto usa JWT firmado con `JWT_SECRET`. El login devuelve un token JWT con el payload mínimo `{ id, correo, rol }`.
- Para rutas protegidas, añade el header:

```
Authorization: Bearer <token>
```

- El middleware `authMiddleware` valida el token. Para restringir una ruta a administradores, las rutas usan `requireRole('admin')`.

Cómo crear el primer admin
--------------------------
Hay dos maneras seguras para crear/promover un admin:

1) SQL directo (recomendado para el primer admin).

	a) Genera el hash bcrypt localmente (en tu máquina):

```powershell
node -e "console.log(require('bcryptjs').hashSync('AdminPass123!', 10))"
```

	b) Copia el hash y ejecuta en el editor SQL del proyecto Supabase:

```sql
INSERT INTO usuarios (nombre, correo, contrasena_hash, rol, fecha_registro)
VALUES ('Admin Inicial', 'admin@example.com', '<COPIA_EL_HASH_AQUI>', 'admin', now());
```

2) Promover un usuario existente a admin (también por SQL):

```sql
UPDATE usuarios SET rol = 'admin' WHERE correo = 'usuario@example.com';
```

Nota: el proyecto incluye un endpoint admin-only `POST /api/admin/create` para que un admin autenticado pueda crear otros admins sin tocar la DB.

Validaciones y restricciones importantes
---------------------------------------
- Los controladores del servidor validan campos requeridos y evitan duplicados a nivel de aplicación:
	- `productos`: `nombre`, `precio` y `id_categoria` no pueden ser nulos al crear. Se evita crear productos con el mismo nombre dentro de la misma categoría (case-insensitive).
	- `categorias`: `nombre` es requerido y único (case-insensitive).

- Recomendación fuerte: aplicar restricciones a nivel de base de datos para evitar condiciones de carrera y garantizar integridad:
	- Índice único en categorías: `CREATE UNIQUE INDEX unique_categoria_nombre ON categorias (LOWER(nombre));`
	- Índice único en productos por categoría: `CREATE UNIQUE INDEX unique_producto_categoria_nombre ON productos (id_categoria, LOWER(nombre));`
	- Marcar columnas obligatorias (`NOT NULL`) en migraciones para `nombre`, `precio`, `id_categoria`, etc.

Pruebas rápidas (PowerShell examples)
-------------------------------------
- Signup (cliente):
```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/auth/signup -Body (ConvertTo-Json @{ nombre = "Cliente"; correo = "cliente@example.com"; contrasena = "ClientePass1!" }) -ContentType 'application/json'
```

- Login:
```powershell
$login = Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/usuarios/login -Body (ConvertTo-Json @{ correo = "admin@example.com"; contrasena = "AdminPass123!" }) -ContentType 'application/json'
$token = $login.token
```

- Crear categoría (admin):
```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/categorias -Headers @{ Authorization = "Bearer $token" } -Body (ConvertTo-Json @{ nombre = "Bebidas"; descripcion = "Refrescos" }) -ContentType 'application/json'
```

Despliegue y recomendaciones
----------------------------
- No subir `.env` al repositorio. Configura las mismas variables en el panel de tu proveedor (Render/Vercel/Heroku).
- Asegura `JWT_SECRET` con un valor largo y aleatorio en producción.
- Aplica índices únicos y NOT NULL en la base de datos para garantizar integridad.
- Añade pruebas automatizadas y un workflow de CI para ejecutar pruebas en PRs.

Contribuir
----------
- Sigue la convención de ramas: `feature/<hu-id>` o `fix/<issue-id>`.
- Haz commits pequeños y atómicos y abre PRs cuando la historia de usuario esté completa.

Contacto
--------
Para preguntas sobre el backend o el flujo de despliegue contacta al equipo de desarrollo del proyecto.

