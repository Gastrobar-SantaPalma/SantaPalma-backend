BEGIN;

-- Create table for product ratings
CREATE TABLE IF NOT EXISTS calificaciones_producto (
  id_calificacion UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  id_producto INTEGER REFERENCES productos(id_producto) ON DELETE CASCADE,
  id_usuario UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  id_pedido INTEGER REFERENCES pedidos(id_pedido) ON DELETE SET NULL,
  puntuacion INTEGER NOT NULL CHECK (puntuacion >= 1 AND puntuacion <= 5),
  comentario TEXT,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(id_producto, id_usuario)
);

-- Add cached columns to productos table
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS promedio_calificacion DECIMAL(3, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS cantidad_calificaciones INTEGER DEFAULT 0;

-- Function to update product rating stats
CREATE OR REPLACE FUNCTION update_producto_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    UPDATE productos
    SET 
      promedio_calificacion = (SELECT COALESCE(AVG(puntuacion), 0) FROM calificaciones_producto WHERE id_producto = OLD.id_producto),
      cantidad_calificaciones = (SELECT COUNT(*) FROM calificaciones_producto WHERE id_producto = OLD.id_producto)
    WHERE id_producto = OLD.id_producto;
    RETURN OLD;
  ELSE
    UPDATE productos
    SET 
      promedio_calificacion = (SELECT COALESCE(AVG(puntuacion), 0) FROM calificaciones_producto WHERE id_producto = NEW.id_producto),
      cantidad_calificaciones = (SELECT COUNT(*) FROM calificaciones_producto WHERE id_producto = NEW.id_producto)
    WHERE id_producto = NEW.id_producto;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
DROP TRIGGER IF EXISTS trigger_update_producto_rating ON calificaciones_producto;
CREATE TRIGGER trigger_update_producto_rating
AFTER INSERT OR UPDATE OR DELETE ON calificaciones_producto
FOR EACH ROW
EXECUTE FUNCTION update_producto_rating_stats();

COMMIT;
