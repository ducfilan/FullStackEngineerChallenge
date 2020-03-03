import { Router } from 'express'
import EmployeesController from '../../controllers/admin/employees.controller'
import ReviewBoardController from '../../controllers/admin/review-boards.controller'

import auth from '../../middlewares/auth.mw'

var router = new Router()

router.route(['/', '/employees']).get(auth, EmployeesController.getEmployeesPage)
router.route('/reviews').get(auth, ReviewBoardController.getReviewBoardsPage)

export default router
