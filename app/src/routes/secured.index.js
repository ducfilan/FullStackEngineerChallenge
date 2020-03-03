import { Router } from 'express'
import userRouter from './secured.routes/user.route'
import adminRouter from './secured.routes/admin.route'

var router = Router()

router.use('/', userRouter)
router.use('/admin', adminRouter)

export default router
