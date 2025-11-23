# Instrucciones de Implementación Frontend: Sistema de Calificación de Productos

## Contexto
Se ha habilitado la funcionalidad para que los clientes puedan calificar (1-5 estrellas) y comentar los productos que han consumido.
**Regla de Oro:** Un usuario SOLO puede calificar un producto si tiene un pedido en estado `pagado` que incluya dicho producto.

## Endpoints Relevantes

### 1. Enviar Calificación
*   **Método:** `POST`
*   **URL:** `/api/productos/:id/calificacion`
*   **Auth:** Requerido (Token Bearer)
*   **Body (JSON):**
    ```json
    {
      "puntuacion": 5,       // Number (1-5)
      "comentario": "Excelente sabor, muy recomendado." // String (Opcional)
    }
    ```
*   **Respuestas:**
    *   `200 OK`: Calificación guardada/actualizada exitosamente.
    *   `403 Forbidden`: "Debes comprar y pagar el producto para calificarlo".
    *   `400 Bad Request`: "Puntuación inválida: debe ser entre 1 y 5".

### 2. Obtener Comentarios (Para mostrar en detalle de producto)
*   **Método:** `GET`
*   **URL:** `/api/productos/:id/comentarios?page=1&limit=5`
*   **Auth:** Público
*   **Respuesta:** Objeto con `comments` (array), `total`, `page`, `totalPages`.

### 3. Verificar Historial (Para lógica de UI)
*   **Método:** `GET`
*   **URL:** `/api/pedidos/cliente/mis-pedidos`
*   **Auth:** Requerido
*   **Uso:** El frontend puede usar esto para saber qué productos ha comprado el usuario y habilitar el botón de "Calificar".

## Flujo de Usuario Recomendado

### Opción A: Desde "Mis Pedidos" (Recomendada)
1.  El usuario navega a su historial de pedidos.
2.  El frontend filtra los pedidos con `pago: 'pagado'`.
3.  En la lista de items de esos pedidos, se muestra un botón "Calificar" o "Editar Reseña" junto a cada producto.
4.  Al hacer clic, se abre un Modal.
5.  El usuario ingresa estrellas y comentario.
6.  Al enviar, se llama a `POST /api/productos/:id/calificacion`.

### Opción B: Desde "Detalle de Producto"
1.  El usuario ve un producto.
2.  El frontend verifica (quizás consultando `mis-pedidos` en segundo plano o intentando enviar y manejando el error) si puede calificar.
3.  Si puede, muestra la sección de "Tu Calificación".

## Manejo de Errores Específicos
*   **Error 403:** Si recibes el mensaje "Debes comprar y pagar el producto para calificarlo", muestra una alerta al usuario indicando que esta función es exclusiva para compradores verificados.
*   **ID con dos puntos:** El backend ya es resiliente a IDs como `:14` o `14`, pero idealmente envía el ID limpio (ej: `14`).

## Tipos de Datos (TypeScript Interface Sugerida)

```typescript
interface RatingPayload {
  puntuacion: number; // 1 | 2 | 3 | 4 | 5
  comentario?: string;
}

interface RatingResponse {
  id_calificacion: number;
  id_producto: number;
  id_usuario: number; // BigInt/Number
  puntuacion: number;
  comentario: string;
  fecha_creacion: string;
}
```
