
-- Migration: add UNIQUE constraint to pagos.transaction_id to support idempotent webhook processing
-- This migration is written defensively because some Postgres versions do not support
-- `ADD CONSTRAINT IF NOT EXISTS`. It checks pg_constraint and pg_class before acting.
-- Run this in Supabase SQL editor or via psql.

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pagos_transaction_id_unique'
  ) THEN
    ALTER TABLE pagos
      ADD CONSTRAINT pagos_transaction_id_unique UNIQUE (transaction_id);
  END IF;
END$$;

-- Create a non-unique index if a unique constraint already exists this will be a no-op
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class WHERE relname = 'idx_pagos_transaction_id'
  ) THEN
    CREATE INDEX idx_pagos_transaction_id ON pagos (transaction_id);
  END IF;
END$$;

COMMIT;
