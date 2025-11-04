-- Migration: Ensure enum estado_pedido contains required values
-- Adds any missing values among: pendiente, preparando, listo, entregado, cancelado
-- This file is safe to run multiple times: it checks pg_enum before attempting to add.

DO $$
BEGIN
  -- Helper to add a value if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'estado_pedido' AND e.enumlabel = 'pendiente'
  ) THEN
    -- Use EXECUTE without IF NOT EXISTS inside ALTER (older PG versions don't support it)
    EXECUTE 'ALTER TYPE estado_pedido ADD VALUE ''pendiente''';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'estado_pedido' AND e.enumlabel = 'preparando'
  ) THEN
    EXECUTE 'ALTER TYPE estado_pedido ADD VALUE ''preparando''';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'estado_pedido' AND e.enumlabel = 'listo'
  ) THEN
    EXECUTE 'ALTER TYPE estado_pedido ADD VALUE ''listo''';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'estado_pedido' AND e.enumlabel = 'entregado'
  ) THEN
    EXECUTE 'ALTER TYPE estado_pedido ADD VALUE ''entregado''';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'estado_pedido' AND e.enumlabel = 'cancelado'
  ) THEN
    EXECUTE 'ALTER TYPE estado_pedido ADD VALUE ''cancelado''';
  END IF;
END$$ LANGUAGE plpgsql;

-- Note: Some Postgres versions don't support the IF NOT EXISTS clause inside ALTER TYPE.
-- The DO+EXECUTE pattern above allows this migration to be safe across runs.
-- To apply: paste this SQL into Supabase SQL editor (Query) and run, or run with psql against your DB.
