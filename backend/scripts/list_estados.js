import supabase from '../src/config/supabaseClient.js'

const run = async () => {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('estado')
      .limit(100)

    if (error) {
      console.error('error fetching estados:', error)
      process.exit(1)
    }

    const unique = [...new Set((data || []).map(d => d.estado))]
    console.log({ unique, sample: data && data.length ? data[0] : null })
  } catch (err) {
    console.error(err)
  }
}

run()
