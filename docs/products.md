# Productos — API

GET /api/productos

Descripción: Obtener catálogo paginado de productos.

Query params:
- page (integer, >=1) — página (default 1)
- limit (integer, 1..100) — items por página (default 12)
- category (integer) — id de categoría; si se provee y no existe → 404
- search (string) — búsqueda parcial sobre `nombre` (ilike)

Response 200:
{
  "page": 1,
  "limit": 12,
  "total": 123,
  "totalPages": 11,
  "products": [ /* objetos producto */ ]
}

Errors:
- 400 — parámetros inválidos (page/limit no numéricos o fuera de rango)
- 401 — token ausente o inválido (HU1.1 requiere auth)
- 404 — categoría no encontrada (cuando se usa `category`)
- 500 — error interno

Notas:
- Este endpoint ahora requiere autenticación (token Bearer) según HU1.1 (opción A).
- Para datasets muy grandes considerar migrar a paginación por keyset.
 
Ordenamiento:
- Los productos se ordenan alfabéticamente por `nombre` de forma ascendente (requisito HU1.2).

Optimización:
- Para mejoras de rendimiento en búsquedas por categoría se recomienda crear un índice en `productos(id_categoria)` y en `productos(nombre)` si se realizan ORDER BY frecuentes.
