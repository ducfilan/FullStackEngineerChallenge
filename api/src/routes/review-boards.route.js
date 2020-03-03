import { Router } from 'express'
import ReviewBoardsController from '../controllers/review-boards.controller'
import multer from 'multer'
import auth from '../middlewares/global/auth.mw'

const reviewBoardsRouter = new Router()

const upload = multer()

reviewBoardsRouter.route('/').get(auth, upload.none(), ReviewBoardsController.get)

export default reviewBoardsRouter
