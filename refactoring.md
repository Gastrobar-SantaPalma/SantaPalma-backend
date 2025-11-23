# Estado de la Refactorización - SantaPalma Backend

Este documento rastrea el progreso de la refactorización del backend hacia una arquitectura en capas (Layered Architecture), asegurando escalabilidad, mantenibilidad y calidad de código.

## 🎯 Objetivo General
Migrar de una arquitectura monolítica (lógica en controladores) a una arquitectura de 3 capas:
1.  **Controladores (Controllers)**: Manejo de peticiones HTTP.
2.  **Servicios (Services)**: Lógica de negocio y validaciones.
3.  **Repositorios (Repositories)**: Acceso a datos (Supabase).

## 📏 Estándares de Calidad
*   **Documentación**: Todo código nuevo debe tener JSDoc.
*   **Validación**: Uso de `Joi` para validar entradas en rutas de escritura.
*   **Testing**: Tests unitarios con `Jest` para todos los servicios (cobertura de lógica de negocio).
*   **Manejo de Errores**: Uso consistente de códigos HTTP y mensajes claros.

## 📊 Estado de los Módulos

| Módulo | Estado | Repositorio | Servicio | Controlador | Tests | JSDoc | Notas |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Pedidos** | ✅ Completado | ✅ | ✅ | ✅ | ✅ | ✅ | Primer módulo piloto. |
| **Productos** | ✅ Completado | ✅ | ✅ | ✅ | ✅ | ✅ | Incluye validación de precios y stock. |
| **Categorías** | ✅ Completado | ✅ | ✅ | ✅ | ✅ | ✅ | Validación de duplicados y relaciones. |
| **Mesas** | ✅ Completado | ✅ | ✅ | ✅ | ✅ | ✅ | Sincronización de secuencia ID. |
| **Usuarios** | ✅ Completado | ✅ | ✅ | ✅ | ✅ | ✅ | Incluye lógica de autenticación en servicio. |
| **Auth** | ⏳ Pendiente | ❌ | ❌ | ❌ | ❌ | ❌ | Requiere cuidado especial con seguridad. |
| **Pagos** | ⏳ Pendiente | ❌ | ❌ | ❌ | ❌ | ❌ | Integración con Wompi. |
| **Auditoría** | ⏳ Pendiente | ❌ | ❌ | ❌ | ❌ | ❌ | |
| **Debug/Admin**| ⏳ Pendiente | ❌ | ❌ | ❌ | ❌ | ❌ | |

## 🛠️ Detalles de la Arquitectura

### Estructura de Archivos
```
src/
├── controllers/    # Lógica HTTP (req, res)
├── services/       # Lógica de Negocio (independiente de HTTP)
├── repositories/   # Consultas a Base de Datos (Supabase)
├── schemas/        # Esquemas de validación Joi
├── routes/         # Definición de endpoints y middlewares
└── middlewares/    # Middlewares globales (Auth, Validation, Error)
```

### Flujo de Datos
`Request` -> `Route` -> `Middleware (Auth/Validation)` -> `Controller` -> `Service` -> `Repository` -> `Database`

## 📝 Historial de Cambios Relevantes

### Fase 1: Inicio y Piloto (Pedidos)
*   Definición de la arquitectura.
*   Implementación de `PedidoRepository` y `PedidoService`.
*   Configuración de Jest para soporte de módulos ES6.

### Fase 2: Expansión (Productos y Categorías)
*   Refactorización completa de Productos.
*   Refactorización completa de Categorías.
*   Estandarización de respuestas de error.
*   Implementación estricta de JSDoc.

### Fase 3: Mesas
*   Refactorización completa de Mesas.
*   Manejo de sincronización de secuencias de ID en el servicio.
*   Validación de estados permitidos con Joi.

### Fase 4: Usuarios
*   Refactorización completa de Usuarios.
*   Implementación de `UsuarioService` con lógica de hashing (bcrypt).
*   Centralización de lógica de autenticación en el servicio.
*   Validación estricta de correos y contraseñas.

---
*Última actualización: 22 de Noviembre, 2025*
