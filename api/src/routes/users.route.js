import { Router } from 'express'
import UsersController from '../controllers/users.controller'
import multer from 'multer'
import auth from '../middlewares/global/auth.mw'

const usersRouter = new Router()

const upload = multer()

usersRouter.route('/').get(auth, upload.none(), UsersController.get)
usersRouter.route('/:_id').delete(auth, upload.none(), UsersController.delete)
usersRouter.route('/me').get(auth, upload.none(), UsersController.me)

export default usersRouter