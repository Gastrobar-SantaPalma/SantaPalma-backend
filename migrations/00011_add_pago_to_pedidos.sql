-- Añadir columna "pago" a la tabla pedidos
ALTER TABLE pedidos
ADD COLUMN pago VARCHAR(20) NOT NULL DEFAULT 'no_pagado';
