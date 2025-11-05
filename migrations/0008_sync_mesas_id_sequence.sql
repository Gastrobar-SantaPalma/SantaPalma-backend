-- Migration: create helper to sync mesas.id_mesa sequence to current max(id_mesa)
-- This allows the backend to accept explicit id_mesa values and then
-- advance the sequence so future SERIAL inserts don't conflict.

CREATE OR REPLACE FUNCTION public.sync_mesas_id_sequence()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM setval(pg_get_serial_sequence('public.mesas','id_mesa'), COALESCE((SELECT MAX(id_mesa) FROM public.mesas), 1), true);
END;
$$;

-- Usage: SELECT public.sync_mesas_id_sequence();
