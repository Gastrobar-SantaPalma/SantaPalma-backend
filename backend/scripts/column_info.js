import supabase from '../src/config/supabaseClient.js'

const run = async () => {
  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('udt_name, data_type')
      .eq('table_name', 'pedidos')
      .eq('column_name', 'estado')
      .maybeSingle()

    console.log({ data, error })
  } catch (err) {
    console.error(err)
  }
}

run()
