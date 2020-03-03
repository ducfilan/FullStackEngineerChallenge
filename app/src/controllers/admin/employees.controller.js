import roles from '../../consts/authorization-roles.consts'

import employeesServices from '../../services/pages/admin/employees.services'

import pageTitles from '../../consts/page-titles.consts'

export default class EmployeesController {
  static async getEmployeesPage(req, res, next) {
    res.render('pages/admin/employees', { title: pageTitles.employees, user: req.user, roles })
  }
}
