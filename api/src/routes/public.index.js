import { Router } from 'express'
import authRouter from './auth.route.js'

var router = Router()

router.use('/auth', authRouter)

module.exports = router
