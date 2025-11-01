-- Migration: create pedido_eventos audit table
-- Run this in Supabase SQL editor or via psql
CREATE TABLE IF NOT EXISTS pedido_eventos (
  id serial PRIMARY KEY,
  id_pedido integer NOT NULL,
  descripcion text,
  estado_anterior text,
  estado_nuevo text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pedido_eventos_id_pedido ON pedido_eventos(id_pedido);
CREATE INDEX IF NOT EXISTS idx_pedido_eventos_created_at ON pedido_eventos(created_at DESC);
