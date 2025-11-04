import supabase from '../src/config/supabaseClient.js'

const [, , cmd, id, estado] = process.argv

const run = async () => {
  if (!cmd || !id) {
    console.log('Usage: node debug_pedido.js get <id> | update <id> <estado>')
    process.exit(1)
  }

  if (cmd === 'get') {
    const { data: byIdPedido, error: err1 } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id_pedido', id)
      .maybeSingle()
    console.log({ byIdPedido, err1: err1 ? err1.message : null })
    process.exit(0)
  }

  if (cmd === 'update') {
    if (!estado) {
      console.log('Missing estado')
      process.exit(1)
    }

    const r1 = await supabase
      .from('pedidos')
      .update({ estado })
      .eq('id_pedido', id)
      .select('*')
    console.log({ r1: { data: r1.data, error: r1.error ? r1.error.message : null } })
    process.exit(0)
  }

  console.log('Unknown command')
  process.exit(1)
}

run().catch(err => { console.error(err); process.exit(1) })
