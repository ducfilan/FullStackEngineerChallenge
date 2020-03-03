import roles from '../consts/authorization-roles.consts'

import homeServices from '../services/pages/home.services'

import pageTitles from '../consts/page-titles.consts'

export default class UsersController {
  static async getHomePage(req, res, next) {
    res.render('pages/home', { title: pageTitles.home, user: req.user, roles })
  }

  static async homeUser(req, res, next) {
    try {
      const { user, jwtToken } = await homeServices.home(req.body)

      res.status(200).json({ user, jwtToken })
    } catch (e) {
      res.status(400).send({ error: e.message })
    }
  }
}
