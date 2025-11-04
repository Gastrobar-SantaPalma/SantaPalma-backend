-- Fix fn_pedido_eventos_trigger: avoid implicit casts that try to convert '' to enum
-- Problem: the function used COALESCE(OLD.estado, '') and COALESCE(NEW.estado, '')
-- where OLD/NEW.estado is of enum type `estado_pedido`. Postgres attempts to
-- coerce the text literal '' to the enum type, which fails and produced the
-- error: invalid input value for enum estado_pedido: ""

-- This migration replaces the trigger function with a version that explicitly
-- casts enum values to text before using COALESCE or concat, preventing any
-- attempt to coerce an empty string to the enum type.

CREATE OR REPLACE FUNCTION public.fn_pedido_eventos_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.pedido_eventos(id_pedido, descripcion, estado_anterior, estado_nuevo, created_at)
    VALUES (NEW.id_pedido, 'Pedido creado (trigger)', NULL, NEW.estado::text, now());
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Only log when estado actually changes
    IF (OLD.estado IS DISTINCT FROM NEW.estado) THEN
      INSERT INTO public.pedido_eventos(id_pedido, descripcion, estado_anterior, estado_nuevo, created_at)
      VALUES (
        NEW.id_pedido,
        concat('Cambio de estado ', COALESCE(OLD.estado::text, ''), ' → ', COALESCE(NEW.estado::text, '')),
        OLD.estado::text,
        NEW.estado::text,
        now()
      );
    END IF;
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$function$;

-- Rollback (if needed): re-create the previous function body. Keep it here for
-- reference; apply only if you want to restore the old behavior.
--
-- CREATE OR REPLACE FUNCTION public.fn_pedido_eventos_trigger()
-- RETURNS trigger
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- AS $function$
-- BEGIN
--   IF (TG_OP = 'INSERT') THEN
--     INSERT INTO public.pedido_eventos(id_pedido, descripcion, estado_anterior, estado_nuevo, created_at)
--     VALUES (NEW.id_pedido, 'Pedido creado (trigger)', NULL, NEW.estado, now());
--     RETURN NEW;
--   ELSIF (TG_OP = 'UPDATE') THEN
--     -- Only log when estado actually changes
--     IF (OLD.estado IS DISTINCT FROM NEW.estado) THEN
--       INSERT INTO public.pedido_eventos(id_pedido, descripcion, estado_anterior, estado_nuevo, created_at)
--       VALUES (NEW.id_pedido, concat('Cambio de estado ', COALESCE(OLD.estado,''), ' → ', COALESCE(NEW.estado,'')), OLD.estado, NEW.estado, now());
--     END IF;
--     RETURN NEW;
--   END IF;
--   RETURN NEW;
-- END;
-- $function$;
