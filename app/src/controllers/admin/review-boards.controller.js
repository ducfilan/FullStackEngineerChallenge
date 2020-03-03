import roles from '../../consts/authorization-roles.consts'

import employeesServices from '../../services/pages/admin/employees.services'

import pageTitles from '../../consts/page-titles.consts'

export default class EmployeesController {
  static async getReviewBoardsPage(req, res, next) {
    res.render('pages/admin/review-boards', { title: pageTitles.reviewBoards, user: req.user, roles })
  }
}
