import supabase from '../src/config/supabaseClient.js'

const run = async () => {
  try {
    // Query pg_enum for the enum type estado_pedido
    const { data, error } = await supabase
      .from('pg_enum')
      .select('enumlabel')
      .eq('enumtypid', (await supabase.from('pg_type').select('oid').eq('typname', 'estado_pedido').maybeSingle()).data?.oid)

    console.log({ data, error })
  } catch (err) {
    console.error('error', err)
  }
}

run()
