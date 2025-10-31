# Product Context

Why: Provide backend APIs so the frontend (customer & admin apps) can manage menu, orders, payments and tables.

Key users:
- Clientes: register via public signup, browse products, place orders.
- Admins: manage products, categories, view orders, handle payments.

Constraints:
- Keep signup public and frictionless for customers.
- Protect write routes (products, categories) behind admin role checks.
# Product Context

Por qué existe este proyecto
- Reducir fricción en la atención en mesa y ofrecer pedidos digitales desde el móvil o tablet mediante QR por mesa.

Problema que resuelve
- Largas esperas y errores en pedidos manuales, necesidad de un flujo de pedidos/pagos centralizado y trazable.

Principales usuarios y escenarios
- Cliente: registra cuenta, ve catálogo (paginado), arma carrito, paga y sigue su pedido.
- Staff: recibe pedidos en panel, actualiza estado, entrega y gestiona cobros.
- Admin: gestiona productos, reportes y configura mesas/QR.
