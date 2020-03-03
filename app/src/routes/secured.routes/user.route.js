import { Router } from 'express'
import HomeController from '../../controllers/home.controller'

import auth from '../../middlewares/auth.mw'

var router = new Router()

router.route('/').get(auth, HomeController.getHomePage)

export default router
