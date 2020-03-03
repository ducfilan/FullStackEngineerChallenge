import { Router } from 'express'
import UsersController from '../controllers/users.controller'
import multer from 'multer'
import auth from '../middlewares/global/auth.mw'

const router = new Router()

const upload = multer()

router.route('/login').post(upload.none(), UsersController.login)
router.route('/logout').get(auth, UsersController.logout)

export default router