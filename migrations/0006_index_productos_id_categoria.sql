-- Migration: add index for faster category filtering on productos
-- Creates a B-tree index on id_categoria to speed up WHERE and ORDER BY operations

CREATE INDEX IF NOT EXISTS idx_productos_id_categoria ON productos (id_categoria);

-- Optional: if queries often use lower(nombre) for case-insensitive sorts/searches,
-- consider adding an index on (lower(nombre)). Uncomment if needed:
-- CREATE INDEX IF NOT EXISTS idx_productos_nombre_lower ON productos (lower(nombre));
