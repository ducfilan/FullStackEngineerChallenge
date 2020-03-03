import { Router } from 'express'
import multer from 'multer'
import LoginController from '../../controllers/login.controller'

var router = new Router()

const upload = multer()

router.route('/').get(LoginController.getLoginPage)

router.route('/').post(upload.none(), LoginController.loginUser)

export default router