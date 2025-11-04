import jwt from 'jsonwebtoken'

// Configure these as needed or rely on process.env
const SERVER = process.env.SERVER_URL || 'http://localhost:3000'
const JWT_SECRET = process.env.JWT_SECRET || 'secret'

// The pedido id and desired estado to test
const PEDIDO_ID = process.env.PEDIDO_ID || '5'
const NEW_ESTADO = process.env.NEW_ESTADO || 'preparando' // must match DB enum
const ROLE = process.env.TEST_ROLE || 'staff' // try 'staff' or 'admin' or 'cliente'

async function run() {
  // Create a token that the backend's auth.middleware will accept as having the given role
  const token = jwt.sign({ sub: 'test-user', rol: ROLE }, JWT_SECRET, { expiresIn: '1h' })

  console.log('Testing PATCH /api/pedidos/%s/estado as role=%s', PEDIDO_ID, ROLE)

  const res = await fetch(`${SERVER}/api/pedidos/${PEDIDO_ID}/estado`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ estado: NEW_ESTADO })
  })

  const text = await res.text()
  console.log('Status:', res.status)
  try {
    console.log('Body:', JSON.parse(text))
  } catch (e) {
    console.log('Body (raw):', text)
  }
}

run().catch(err => {
  console.error('Test failed:', err)
  process.exit(1)
})
