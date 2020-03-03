import { Router } from 'express'
import usersRouter from './users.route'
import reviewBoardsRouter from './review-boards.route'
import reviewRequestsRouter from './review-requests.route'
import reviewResultsRouter from './review-results.route'

var router = Router()

router.use('/users', usersRouter)
router.use('/review-boards', reviewBoardsRouter)
router.use('/review-requests', reviewRequestsRouter)
router.use('/review-results', reviewResultsRouter)

export default router
