import supabase from '../src/config/supabaseClient.js'

const PEDIDO_ID = process.env.PEDIDO_ID || '5'
const NEW_ESTADO = process.env.NEW_ESTADO || 'preparando'

async function run() {
  try {
    console.log('Attempting direct Supabase update:', { PEDIDO_ID, NEW_ESTADO })
    const { data, error } = await supabase
      .from('pedidos')
      .update({ estado: NEW_ESTADO })
      .eq('id_pedido', PEDIDO_ID)
      .select('*')

    if (error) {
      console.error('Supabase update error:', error.message)
      process.exit(1)
    }

    console.log('Supabase update success:', data)
  } catch (err) {
    console.error('Unexpected error:', err)
    process.exit(1)
  }
}

run()
