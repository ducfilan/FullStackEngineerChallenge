import { Router } from 'express'
import loginRouter from './public.routes/login.routes'

var router = Router()

router.use('/login', loginRouter)

export default router
