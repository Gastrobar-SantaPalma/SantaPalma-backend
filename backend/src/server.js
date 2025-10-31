import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
//import auditoriaRoutes from './routes/auditoria.routes.js'
import mesasRoutes from './routes/mesas.route.js'
import paymentsRoutes from './routes/payments.routes.js'
import paymentsController from './controllers/payments.controller.js'
//import pagosRoutes from './routes/pagos.routes.js'
import pedidosRoutes from './routes/pedidos.routes.js'
import productosRoutes from './routes/productos.routes.js'
import usuariosRoutes from './routes/usuarios.routes.js'
import authRoutes from './routes/auth.routes.js'
import categoriasRoutes from './routes/categorias.routes.js'
import adminRoutes from './routes/admin.routes.js'



const app = express()

// Request logging
app.use(morgan('dev'))

// CORS configuration
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl) or from the configured client
    if (!origin || origin === CLIENT_URL) return callback(null, true)
    return callback(new Error('CORS policy: This origin is not allowed'))
  },
  credentials: true, // Allow cookies/credentials to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions))

// Mount webhook route with raw body parser BEFORE express.json so we can verify signatures
app.post('/api/webhooks/wompi', express.raw({ type: 'application/json' }), paymentsController.wompiWebhook)

// Note: avoid app.options('*', ...) because path-to-regexp rejects '*'.
// app.use(cors(corsOptions)) is sufficient to handle preflight requests.
app.use(express.json())

app.use('/api/mesas', mesasRoutes)
app.use('/api/payments', paymentsRoutes)
//app.use('/api/auditoria', auditoriaRoutes)
//app.use('/api/pagos', pagosRoutes)
app.use('/api/pedidos', pedidosRoutes)
app.use('/api/productos', productosRoutes)
app.use('/api/categorias', categoriasRoutes)
app.use('/api/usuarios', usuariosRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)


app.listen(process.env.PORT || 4000, () => {
  console.log(`🚀 Servidor corriendo en puerto ${process.env.PORT || 4000}`)
})
