import { Router } from 'express'
import ReviewResultsController from '../controllers/review-results.controller'
import multer from 'multer'
import auth from '../middlewares/global/auth.mw'

const reviewResultsRouter = new Router()

const upload = multer()

reviewResultsRouter.route('/').put(auth, upload.none(), ReviewResultsController.put)

export default reviewResultsRouter
