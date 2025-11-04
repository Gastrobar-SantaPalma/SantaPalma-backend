(async () => {
  try {
    const url = process.env.SERVER_URL || 'http://localhost:3000'
    const id = process.env.PEDIDO_ID || '5'
    const res = await fetch(`${url}/api/debug/pedidos/${id}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'preparando' })
    })
    const text = await res.text()
    console.log('Status:', res.status)
    try { console.log('Body:', JSON.parse(text)) } catch (e) { console.log('Body (raw):', text) }
  } catch (err) {
    console.error('Request failed:', err)
    process.exit(1)
  }
})()
