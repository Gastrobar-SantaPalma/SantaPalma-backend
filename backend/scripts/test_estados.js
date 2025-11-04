import supabase from '../src/config/supabaseClient.js'

const id = 5
const candidates = [
  'preparacion',
  'preparación',
  'Preparacion',
  'Preparación',
  'en preparacion',
  'en preparación',
  'En preparacion',
  'En preparación',
  'preparación',
  'PREPARACION'
]

const run = async () => {
  for (const c of candidates) {
    try {
      const r = await supabase
        .from('pedidos')
        .update({ estado: c })
        .eq('id_pedido', id)
        .select('*')

      console.log('try', c, '->', { data: r.data, error: r.error ? r.error.message : null })
    } catch (err) {
      console.error('err', c, err)
    }
  }
}

run().catch(e => { console.error(e); process.exit(1) })
