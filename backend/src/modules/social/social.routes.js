import { Router } from 'express'
import { getActiveUsers, heartbeat  } from './social.controller.js'

const router = Router()

router.get('/active-users', getActiveUsers)
router.post('/heartbeat', heartbeat)

export default router
