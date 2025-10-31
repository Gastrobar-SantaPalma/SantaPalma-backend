# 📘 Product Backlog — Plataforma de Pedidos Digitales (Autenticación + Paginación)

## 🔐 HU0.1 — Registro de Cliente
**Descripción:**  
Como cliente quiero registrarme en la plataforma para acceder al catálogo y realizar pedidos de forma segura.

**Criterios de Aceptación (CA):**
- Al acceder a `/signup` se muestran los campos: Nombres, Apellidos, Correo electrónico, Contraseña (≥8 caracteres, 1 mayúscula, 1 número y 1 símbolo) y Confirmar contraseña.  
- Botón **Registrarse** deshabilitado hasta que todos los campos sean válidos.  
- Backend responde `201` con `userId` y redirige a `/login`.  
- Si el correo ya existe → `409 Conflict` y mensaje “Este correo ya está registrado”.  
- Errores `5xx` → mensaje genérico “Intenta más tarde”.  
- Contraseñas hasheadas con `bcrypt` (10 salt rounds).  

**Definición de Hecho (DoD):**
- Pruebas unitarias e integración del endpoint `/auth/signup` (≥80% coverage).  
- Documentación JSDoc + README flujo de registro.  
- Comprobado en 320/768/1024 px.  
- Deploy exitoso en **Vercel (frontend)** y **Render (backend)**.  

**Prioridad:** Alta  
**Complejidad:** Media  

---

## 🔑 HU0.2 — Inicio de Sesión
**Descripción:**  
Como cliente quiero iniciar sesión para acceder al catálogo y mantener mi sesión activa.

**Criterios de Aceptación (CA):**
- `/login` con correo y contraseña.  
- Token JWT o sesión Supabase al autenticar.  
- Redirección automática a `/menu` tras login.  
- `401` si credenciales incorrectas.  
- Sesión persiste 7 días (“Recordarme”).  
- Logout redirige a `/login`.  

**DoD:**
- Endpoint `/auth/login` con validación JWT.  
- E2E: login válido, inválido, expirado.  
- Logs de errores activados solo en modo dev.  
- Documentado flujo de sesión.  

**Prioridad:** Alta  
**Complejidad:** Media  

---

## 🍽️ HU1.1 — Visualización del Catálogo
**Descripción:**  
Como cliente autenticado quiero ver el catálogo de productos paginados por categoría para seleccionar fácilmente qué pedir.

**CA:**
- Solo accesible con token válido.  
- `GET /products?category=&page=&limit=` devuelve productos paginados (12 por página).  
- Categorías: Entradas, Platos fuertes, Bebidas, Postres.  
- Skeletons en carga inicial (LCP ≤1.5s).  
- Modal con detalle y “Agregar al pedido”.  
- Filtros y búsqueda (debounce 300 ms).  

**DoD:**
- Endpoint backend documentado con paginación.  
- Pruebas de integración paginación y filtros.  
- Responsivo y accesible (WCAG AA).  
- E2E login → catálogo → paginación.  

**Prioridad:** Alta  
**Complejidad:** Media  

---

## 🔄 HU1.2 — Filtrado y Paginación de Productos
**Descripción:**  
Como sistema debo entregar los productos paginados por categoría para optimizar la carga.

**CA:**
- Endpoint `/products` acepta `category`, `page`, `limit`.  
- Devuelve: `{ page, limit, total, totalPages, products[] }`.  
- `404` si categoría inexistente.  
- Tiempo de respuesta ≤500 ms.  
- Ordenados alfabéticamente o por prioridad.  

**DoD:**
- Query optimizada (índices en categoría).  
- Tests unit + integración.  
- Documentación OpenAPI (Swagger).  

**Prioridad:** Alta  
**Complejidad:** Baja  

---

## 🛍️ HU2.1 — Creación del Pedido
**Descripción:**  
Como cliente autenticado quiero crear un pedido seleccionando productos del catálogo.

**CA:**
- Carrito persistente localmente (session/localStorage).  
- `/cart` muestra lista, cantidades, subtotales y total.  
- “Confirmar pedido” → `POST /orders` con `{ userId, items[], total }`.  
- Respuesta `201` con `orderId`.  
- Toast “Pedido enviado con éxito”.  
- Si token expiró → redirige a `/login` con aviso.  

**DoD:**
- Endpoint `/orders` probado (payload válido/erróneo).  
- E2E login → catálogo → carrito → pedido.  
- Logs registrados con `userId` y `createdAt`.  

**Prioridad:** Alta  
**Complejidad:** Media  

---

## 📦 HU2.2 — Seguimiento de Pedido (Cliente)
**Descripción:**  
Como cliente quiero visualizar el estado de mi pedido en tiempo real.

**CA:**
- `/orders/{id}` muestra estado: Pendiente, En preparación, Listo, Entregado.  
- Actualización en tiempo real vía Supabase Realtime.  
- Fallback de polling (cada 5 s).  
- Toast o sonido al pasar a “Listo”.  
- Histórico de cambios (últimos 5 eventos).  

**DoD:**
- Canal realtime configurado y probado.  
- E2E validando actualización sin reload.  
- Tests de accesibilidad (announces ARIA).  

**Prioridad:** Media  
**Complejidad:** Media  

---

## 👨‍🍳 HU2.3 — Gestión de Pedidos (Staff)
**Descripción:**  
Como miembro del staff quiero recibir, visualizar y actualizar pedidos desde un panel.

**CA:**
- `/staff/orders` lista pedidos con mesa, estado y hora.  
- Cambiar estado (Pendiente → Preparación → Listo → Entregado).  
- Realtime: nuevo pedido aparece <1 s.  
- Filtro por estado y rango horario.  

**DoD:**
- Endpoints y canales realtime testeados.  
- Logs de cambios de estado registrados.  
- E2E cliente → pedido → staff update.  

**Prioridad:** Alta  
**Complejidad:** Alta  

---

## 🧾 HU3.1 — Generación y Gestión de QR
**Descripción:**  
Como administrador quiero generar un QR único por mesa para que el cliente acceda directamente a su menú.

**CA:**
- QR codifica URL `/m/{venueId}/table/{tableId}`.  
- Al escanear, redirige a `/login` si no autenticado.  
- QR impreso legible en 3 dispositivos distintos.  
- Error si `tableId` inválido.  

**DoD:**
- Servicio QR implementado (png/pdf).  
- Pruebas manuales documentadas.  
- URLs seguras, sin datos sensibles.  

**Prioridad:** Media  
**Complejidad:** Baja  

---

## 💳 HU4.1 — Integración con Pasarela Wompi
**Descripción:**  
Como cliente quiero pagar mi pedido con Wompi para finalizar la compra.

**CA:**
- `POST /payments/create` inicia sesión de pago con Wompi.  
- Al aprobar, Wompi envía webhook `POST /webhooks/wompi`.  
- Backend valida firma y marca `order.status=Pagado`.  
- UI muestra “Pago recibido”.  
- Error → opción “Reintentar” o “Pagar en efectivo”.  

**DoD:**
- Webhook probado con sandbox.  
- Logs de transacciones activos.  
- Documentación flujo de pago.  
- Retrys automáticos (3 veces) si webhook falla.  

**Prioridad:** Alta  
**Complejidad:** Alta  

---

## 🧰 HU5.1 — Gestión de Productos (Admin)
**Descripción:**  
Como administrador quiero crear, editar o eliminar productos para mantener actualizado el menú.

**CA:**
- CRUD `/admin/products` con validaciones: nombre obligatorio, precio ≥0.  
- Imagen cargada en Supabase Storage (≤5 MB).  
- Cambios reflejados en clientes en <5 s.  
- Control de versiones en ediciones.  

**DoD:**
- Endpoints CRUD testeados.  
- Upload con validación de tipo/tamaño.  
- Docs API + migraciones versionadas.  

**Prioridad:** Media  
**Complejidad:** Alta  

---

## 📊 HU6.1 — Reportes y Métricas Básicas
**Descripción:**  
Como administrador quiero ver métricas de ventas y productos más pedidos.

**CA:**
- Dashboard `/admin/reports` con: total ventas, top 5 productos, horas pico.  
- Filtros por fecha y categoría.  
- Exportar CSV.  

**DoD:**
- Consultas optimizadas y cacheadas.  
- UI accesible y responsive.  
- Documentación de endpoints.  

**Prioridad:** Media  
**Complejidad:** Media  

---

## 🤖 HU7.1 — Recomendaciones Inteligentes (MVP)
**Descripción:**  
Como cliente quiero recibir sugerencias personalizadas de productos.

**CA:**
- Sección “Recomendado para ti” con 3 ítems según últimos pedidos o top ventas.  
- Endpoint `/recommendations?userId=` o por mesa.  
- Cache 5 min.  
- Métrica CTR registrada.  

**DoD:**
- Pipeline rule-based implementado.  
- Dashboard con métricas CTR.  
- Tests unitarios del endpoint.  

**Prioridad:** Baja  
**Complejidad:** Media  

---

## ⚙️ Definición de Hecho (DoD) Global
Aplica a todas las HU del backlog:

- ✅ Código en rama `feature/<hu-id>` con PR revisado y aprobado.  
- ✅ CI/CD ejecuta lint, tests y build correctamente.  
- ✅ Pruebas unitarias ≥80% cobertura y al menos un test E2E crítico.  
- ✅ Responsivo validado (320, 768, 1024 px).  
- ✅ Accesibilidad básica (labels, contraste, foco visible).  
- ✅ Documentación API (OpenAPI/Swagger).  
- ✅ Logs y métricas básicas activas (info/error).  
- ✅ Deploy automático exitoso en **Vercel (frontend)** y **Render/Supabase Functions (backend)**.  

---

## 🧠 Stack Tecnológico Recomendado

| Área | Librerías / Frameworks | Motivo |
|------|------------------------|--------|
| **Frontend** | React + Vite / Next.js, Tailwind CSS, React Router, React Hook Form + Zod, React Query, Zustand, React Toastify, Headless UI | SPA rápida, validación robusta, UI accesible |
| **Backend** | Node.js + Express (TypeScript), Prisma ORM (Postgres Supabase), bcrypt, jsonwebtoken, zod, helmet, cors, express-rate-limit, multer | Seguridad, validación y modularidad |
| **Base de Datos** | Supabase (Postgres + Auth + Storage + Realtime) | Integración rápida y fiable |
| **Testing** | Jest, Vitest, React Testing Library, Playwright | Cobertura completa (unit + integración + E2E) |
| **CI/CD** | GitHub Actions + Vercel (frontend) + Render (backend) | Despliegue automatizado |
| **Monitoreo** | Sentry / Logtail | Logs y errores en producción |
