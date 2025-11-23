# SantaPalma Backend

API REST para Gastrobar SantaPalma — servidor Node.js + Express (ES modules) usando Supabase como base de datos y autenticación.

## Contenido
- [Descripción](#descripción)
- [Arquitectura](#arquitectura)
- [Requisitos](#requisitos)
- [Instalación y ejecución](#instalación-y-ejecución-local)
- [Variables de entorno](#variables-de-entorno-mínimas)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Testing](#testing)
- [Endpoints principales](#endpoints-principales-resumen)
- [Autenticación y roles](#autenticación-y-roles)
- [Módulos](#módulos)

## Descripción
Este repositorio contiene el backend para la aplicación de SantaPalma. Proporciona recursos para gestionar: usuarios, productos, categorías, pedidos, mesas, pagos y auditoría.

El backend está diseñado para soportar dos tipos de usuarios principales:
- **cliente**: puede registrarse públicamente y usar la app cliente para ver productos y realizar pedidos.
- **admin**: gestiona productos, categorías, pedidos, mesas y usuarios desde el panel administrativo.

## Arquitectura
El proyecto sigue una **Arquitectura por Capas** para asegurar la separación de responsabilidades, mantenibilidad y testabilidad:

1.  **Routes (`src/routes/`)**: Definen los endpoints y aplican middlewares (autenticación, validación).
2.  **Controllers (`src/controllers/`)**: Manejan la petición HTTP, extraen datos y llaman a los servicios.
3.  **Services (`src/services/`)**: Contienen la lógica de negocio pura. No saben de HTTP (req/res).
4.  **Repositories (`src/repositories/`)**: Encapsulan el acceso a datos (Supabase).
5.  **Schemas (`src/schemas/`)**: Definiciones de validación con Joi.

## Requisitos
- Node.js 18+ (recomendado)
- npm
- Cuenta y proyecto en Supabase (URL + API KEY)

## Instalación y ejecución (local)
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

El servidor por defecto corre en el puerto `4000`.

## Variables de entorno (mínimas)
Coloca estas variables en tu `.env`:

```env
SUPABASE_URL=<your-supabase-url>
SUPABASE_KEY=<your-supabase-key>
JWT_SECRET=<una-cadena-secreta-larga-para-firmar-jwt>
CLIENT_URL=http://localhost:5173
PORT=4000
WOMPI_PUB_KEY=<wompi-public-key>
WOMPI_PRV_KEY=<wompi-private-key>
WOMPI_INTEGRITY_SECRET=<wompi-integrity-secret>
WOMPI_EVENT_SECRET=<wompi-event-secret>
```

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/         # Configuración (Supabase client)
│   ├── controllers/    # Controladores (HTTP handlers)
│   ├── middlewares/    # Middlewares (Auth, ErrorHandler, Upload, Validate)
│   ├── repositories/   # Acceso a datos (Supabase queries)
│   ├── routes/         # Definición de rutas Express
│   ├── schemas/        # Esquemas de validación Joi
│   ├── services/       # Lógica de negocio
│   ├── utils/          # Utilidades (cálculos, formateo)
│   └── server.js       # Punto de entrada
├── tests/              # Tests unitarios (Jest)
└── scripts/            # Scripts de utilidad/migración
```

## Testing
El proyecto utiliza **Jest** para pruebas unitarias. Los tests están ubicados en `backend/tests/`.

Para ejecutar todos los tests:
```powershell
npm test
```

## Endpoints principales (Referencia API)

### Autenticación (`/api/auth`)
| Método | Endpoint | Descripción | Auth | Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/signup` | Registrar un nuevo cliente | Público | `{ nombre, correo, contrasena }` |
| `POST` | `/login` | Iniciar sesión | Público | `{ correo, contrasena }` |
| `GET` | `/me` | Obtener datos del usuario actual | Token | - |

### Usuarios (`/api/usuarios`)
| Método | Endpoint | Descripción | Auth | Body |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Listar todos los usuarios | Token | - |
| `GET` | `/:id` | Obtener detalle de usuario | Token | - |
| `POST` | `/` | Crear usuario (Admin) | Público* | `{ nombre, correo, contrasena, rol }` |
| `PUT` | `/:id` | Actualizar usuario | Token | `{ nombre, correo, rol }` |
| `DELETE` | `/:id` | Eliminar usuario | Token | - |
> (*) Nota: El endpoint de creación de usuarios sigue público para facilitar el registro inicial o admin, pero debería protegerse en producción.

### Admin (`/api/admin`)
| Método | Endpoint | Descripción | Auth | Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/create` | Crear otro administrador | Admin | `{ nombre, correo, contrasena }` |
| `PUT` | `/users/:id/role` | Cambiar rol de usuario | Admin | `{ rol }` |

### Productos (`/api/productos`)
| Método | Endpoint | Descripción | Auth | Body |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Listar productos (filtros: `page`, `limit`, `category`, `search`) | Token | - |
| `GET` | `/:id` | Obtener producto por ID | Público | - |
| `POST` | `/` | Crear producto | Admin | `multipart/form-data` (incluye `image`) |
| `PUT` | `/:id` | Actualizar producto | Admin | `multipart/form-data` |
| `DELETE` | `/:id` | Eliminar producto | Admin | - |
| `POST` | `/:id/calificacion` | Calificar producto | Token | `{ puntuacion, comentario }` |
| `GET` | `/:id/comentarios` | Ver comentarios | Público | - |

### Categorías (`/api/categorias`)
| Método | Endpoint | Descripción | Auth | Body |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Listar categorías | Público | - |
| `GET` | `/:id` | Obtener categoría | Público | - |
| `POST` | `/` | Crear categoría | Admin | `{ nombre, descripcion }` |
| `PUT` | `/:id` | Actualizar categoría | Admin | `{ nombre, descripcion }` |
| `DELETE` | `/:id` | Eliminar categoría | Admin | - |

### Mesas (`/api/mesas`)
| Método | Endpoint | Descripción | Auth | Body |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Listar mesas | Público | - |
| `GET` | `/:id` | Obtener mesa | Público | - |
| `POST` | `/` | Crear mesa | Token | `{ numero, capacidad, ubicacion }` |
| `PUT` | `/:id` | Actualizar mesa | Token | `{ numero, capacidad, ubicacion }` |
| `DELETE` | `/:id` | Eliminar mesa | Token | - |
| `POST` | `/:id/generate-qr` | Generar QR (PNG/PDF) | Admin | Query: `?format=pdf` |

### Pedidos (`/api/pedidos`)
| Método | Endpoint | Descripción | Auth | Body |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Listar todos los pedidos | Staff/Admin | - |
| `GET` | `/cliente/mis-pedidos` | Ver mis pedidos | Token | - |
| `GET` | `/:id` | Ver detalle de pedido | Token | - |
| `POST` | `/` | Crear pedido | Token | `{ id_mesa, items: [{id_producto, cantidad}] }` |
| `PUT` | `/:id` | Modificar pedido | Token | `{ items, estado }` |
| `DELETE` | `/:id` | Cancelar/Eliminar pedido | Staff/Admin | - |
| `PATCH` | `/:id/estado` | Cambiar estado (pendiente -> preparando...) | Staff/Admin | `{ estado }` |
| `PATCH` | `/:id/mesa` | Cambiar mesa de pedido | Staff/Admin | `{ id_mesa }` |
| `PATCH` | `/:id/pago` | Actualizar estado de pago | Staff/Admin | `{ pago: 'pagado' }` |

### Pagos (`/api/pagos`)
| Método | Endpoint | Descripción | Auth | Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/create` | Iniciar transacción Wompi | Token | `{ amount_in_cents, currency, customer_email, reference }` |
| `POST` | `/webhooks/wompi` | Webhook de Wompi | Público | (Payload de Wompi) |

### Auditoría (`/api/auditoria`)
| Método | Endpoint | Descripción | Auth | Body |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Ver historial de eventos | Admin | Query: `page`, `limit`, `id_pedido` |

### Debug (`/api/debug`)
> **Nota:** Endpoints solo para desarrollo.
| Método | Endpoint | Descripción | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/pedidos/:id` | Ver pedido raw | Público |
| `POST` | `/pedidos/:id/update` | Forzar update | Público |

## Autenticación y roles
- El proyecto usa JWT firmado con `JWT_SECRET`.
- Header requerido para rutas protegidas: `Authorization: Bearer <token>`.
- Roles soportados: `admin`, `cliente`, `mesero`.

## Módulos
- **Auth**: Gestión de registro y login.
- **Usuarios**: Gestión de perfiles y roles.
- **Productos/Categorías**: Catálogo del menú.
- **Mesas**: Gestión de mesas y códigos QR.
- **Pedidos**: Ciclo de vida del pedido (pendiente -> preparando -> listo -> entregado).
- **Pagos**: Integración con pasarela de pagos (Wompi).
- **Auditoria**: Registro de eventos críticos del sistema.
