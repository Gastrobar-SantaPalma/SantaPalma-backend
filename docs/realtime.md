# Realtime — Pedidos (Cliente)

Objetivo: explicar cómo el cliente puede recibir actualizaciones del estado de su pedido en tiempo real.

1) Endpoint REST (fallback / initial fetch)
- GET /api/pedidos/:id
  - Devuelve: { pedido, history }
    - `pedido`: objeto con `id_pedido`, `estado`, `total`, `fecha_pedido`, `items`, etc.
    - `history`: array con los últimos 5 eventos (id, description, from, to, at).
  - Uso: cliente debe llamar esto al abrir la vista de pedido para mostrar estado y último historial.

2) Realtime (preferred) — Supabase Realtime (client-side)
- Supabase Realtime can push row changes for the `pedidos` table directly to clients. Recommended flow:

  - On the frontend (example with `@supabase/supabase-js`):

  ```js
  import { createClient } from '@supabase/supabase-js'
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  // subscribe to changes for a specific pedido
  const subscription = supabase
    .channel('public:pedidos')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos', filter: `id_pedido=eq.${pedidoId}` }, payload => {
      // payload contains new row data
      // update UI status accordingly
      console.log('Pedido change', payload)
    })
    .subscribe()
  ```

- Notes:
  - Use the client-side anon key for realtime subscriptions. Ensure RLS/policies allow SELECT on `pedidos` for authenticated users.
  - If you need server-mediated notifications (for example to hide sensitive fields), implement a publish to a custom realtime channel from backend when updating orders.

3) Fallback polling
- If realtime is not available, poll `GET /api/pedidos/:id` every 5 seconds. Keep this as a fallback.

4) Security
- Do not expose internal fields in realtime payloads; if needed, use RLS policies or server proxy endpoints.

5) Acceptance criteria
- Client sees state changes <1s in normal network conditions when using Supabase Realtime.
- Fallback polling every 5s works when realtime is unavailable.

