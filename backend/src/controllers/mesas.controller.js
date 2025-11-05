import supabase from '../config/supabaseClient.js'

// Obtener todos los mesas
export const getMesas = async (req, res) => {
  const { data, error } = await supabase
    .from('mesas')
    .select(`
      id_mesa,
      estado,
      ubicacion
    `)

  if (error) {
    console.error('Error al obtener mesas:', error.message)
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json(data)
}

// Obtener un mesa por ID
export const getMesaById = async (req, res) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from('mesas')
    .select(`
      id_mesa,
      estado,
      ubicacion
    `)
    .eq('id_mesa', id)
    .single()

  if (error) {
    console.error('Error al obtener mesa:', error.message)
    return res.status(404).json({ error: 'Mesa no encontrada' })
  }

  res.status(200).json(data)
}

// Crear una nueva mesa
export const createMesa = async (req, res) => {
  // Accept optional id_mesa from client. Best practice is to let the DB
  // manage the primary key, but some frontends expect to control the numeric
  // id. If provided, we will attempt to insert it and then sync the serial
  // sequence so future inserts don't conflict.
  // Defensive: log incoming body briefly to help diagnose unexpected fields
  try { console.debug('[mesas] createMesa body keys:', Object.keys(req.body || {})) } catch (e) {}

  // Strip deprecated/removed fields (codigo_qr) if the client still sends them.
  if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'codigo_qr')) {
    console.warn('[mesas] createMesa: ignoring deprecated field codigo_qr from client')
    try { delete req.body.codigo_qr } catch (e) {}
  }

  const { id_mesa, estado, ubicacion } = req.body || {}

  // Build a minimal insert object to avoid passing unexpected columns to Supabase
  const insertObj = {}
  if (estado !== undefined) insertObj.estado = estado
  if (ubicacion !== undefined) insertObj.ubicacion = ubicacion
  if (id_mesa !== undefined && id_mesa !== null) insertObj.id_mesa = Number(id_mesa)

  const { data, error } = await supabase
    .from('mesas')
    .insert([insertObj])
    .select(`
      id_mesa,
      estado,
      ubicacion
    `)

  if (error) {
    console.error('Error al crear mesa:', error.message)
    return res.status(400).json({ error: error.message })
  }

  // If we inserted an explicit id_mesa, sync the sequence to avoid future
  // conflicts with the serial sequence. This calls a lightweight DB helper
  // function created by migrations/0008_sync_mesas_id_sequence.sql.
  try {
    if (id_mesa !== undefined && id_mesa !== null) {
      const { error: syncErr } = await supabase.rpc('sync_mesas_id_sequence')
      if (syncErr) console.error('sync_mesas_id_sequence error:', syncErr.message)
    }
  } catch (e) {
    console.error('Error calling sync_mesas_id_sequence:', e)
  }

  res.status(201).json(data[0])
}


// Actualizar una mesa existente
export const updateMesa = async (req, res) => {
  const { id } = req.params
  const { estado, ubicacion } = req.body

  const { data, error } = await supabase
    .from('mesas')
    .update({ estado, ubicacion })
    .eq('id_mesa', id)
    .select(`
      id_mesa,
      estado,
      ubicacion
    `)

  if (error) {
    console.error('Error al actualizar mesa:', error.message)
    return res.status(400).json({ error: error.message })
  }

  res.status(200).json(data[0])
}

// Eliminar mesa
export const deleteMesa = async (req, res) => {
  const { id } = req.params

  const { error } = await supabase
    .from('mesas')
    .delete()
    .eq('id_mesa', id)

  if (error) {
    console.error('Error al eliminar mesa:', error.message)
    return res.status(400).json({ error: error.message })
  }

  res.status(204).send()
}
