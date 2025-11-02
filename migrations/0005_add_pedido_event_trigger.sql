-- Migration: create trigger/function to log pedido events on INSERT and UPDATE
-- Run this in Supabase SQL editor or via psql

BEGIN;

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION public.fn_pedido_eventos_trigger()
RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.pedido_eventos(id_pedido, descripcion, estado_anterior, estado_nuevo, created_at)
    VALUES (NEW.id_pedido, 'Pedido creado (trigger)', NULL, NEW.estado, now());
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Only log when estado actually changes
    IF (OLD.estado IS DISTINCT FROM NEW.estado) THEN
      INSERT INTO public.pedido_eventos(id_pedido, descripcion, estado_anterior, estado_nuevo, created_at)
      VALUES (NEW.id_pedido, concat('Cambio de estado ', COALESCE(OLD.estado,''), ' → ', COALESCE(NEW.estado,'')), OLD.estado, NEW.estado, now());
    END IF;
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers: after insert and after update (update trigger only fires when estado changed)

DROP TRIGGER IF EXISTS trg_pedido_eventos_on_pedidos_insert ON public.pedidos;
CREATE TRIGGER trg_pedido_eventos_on_pedidos_insert
AFTER INSERT ON public.pedidos
FOR EACH ROW
EXECUTE FUNCTION public.fn_pedido_eventos_trigger();

DROP TRIGGER IF EXISTS trg_pedido_eventos_on_pedidos_update ON public.pedidos;
CREATE TRIGGER trg_pedido_eventos_on_pedidos_update
AFTER UPDATE ON public.pedidos
FOR EACH ROW
WHEN (OLD.estado IS DISTINCT FROM NEW.estado)
EXECUTE FUNCTION public.fn_pedido_eventos_trigger();

COMMIT;
