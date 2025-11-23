-- Fix id_usuario type in calificaciones_producto table
-- The table expects UUID but the application uses Integer IDs for users.
-- This migration changes the column to BIGINT.

ALTER TABLE calificaciones_producto 
  DROP CONSTRAINT IF EXISTS calificaciones_producto_id_usuario_fkey;

ALTER TABLE calificaciones_producto 
  ALTER COLUMN id_usuario TYPE BIGINT USING NULL; -- Resetting to NULL as UUID cannot be cast to Integer

-- Re-add foreign key if users table uses id_usuario as PK
-- ALTER TABLE calificaciones_producto 
--   ADD CONSTRAINT calificaciones_producto_id_usuario_fkey 
--   FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario);
