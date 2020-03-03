import { Router } from 'express'
import ReviewRequestsController from '../controllers/review-requests.controller'
import multer from 'multer'
import auth from '../middlewares/global/auth.mw'

const reviewRequestsRouter = new Router()

const upload = multer()

reviewRequestsRouter.route('/').put(auth, upload.none(), ReviewRequestsController.put)
reviewRequestsRouter.route('/:_id').patch(auth, upload.none(), ReviewRequestsController.update)
reviewRequestsRouter.route('/').get(auth, upload.none(), ReviewRequestsController.get)

export default reviewRequestsRouter
