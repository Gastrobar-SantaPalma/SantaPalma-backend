-- Migration: create pagos table to record payment attempts and results
-- Run this in Supabase SQL editor or via psql.

BEGIN;

-- Table to store payment attempts
CREATE TABLE IF NOT EXISTS pagos (
  id_pago serial PRIMARY KEY,
  id_pedido integer REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
  transaction_id text,
  status text,
  amount numeric(12,2),
  currency varchar(10),
  raw jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pagos_id_pedido ON pagos(id_pedido);

COMMIT;
