# Project Brief

SantaPalma Backend — Node.js + Express backend using Supabase for data storage and auth.

Purpose: provide REST API for Gastrobar SantaPalma (usuarios, productos, categorias, pedidos, mesas, pagos).

Goals:
- Secure authentication with JWT and bcrypt password hashing.
- Clear separation of roles (cliente vs admin) for write operations.
- Keep developer-facing memory in `memory-bank/` for the AI agent and team.
# Project Brief

Plataforma de pedidos digitales para un gastrobar (SantaPalma). Permite a clientes ver el catálogo, crear pedidos desde mesa o dispositivo, pagar (Wompi) y seguir el estado del pedido en tiempo real. Incluye panel de staff para gestionar pedidos y un admin para productos y reportes.

Objetivo primario: entregar una API backend robusta que soporte autenticación, catálogo paginado, creación/seguimiento de pedidos, integración con pasarela de pagos y notificaciones en tiempo real, con despliegue en Render y frontend en Vercel.
