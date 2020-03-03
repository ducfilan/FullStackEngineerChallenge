import loginServices from '../services/pages/login.services'

import pageTitles from '../consts/page-titles.consts'

export default class UsersController {
  static async getLoginPage(req, res, next) {
    res.render('pages/login', { title: pageTitles.login })
  }

  static async loginUser(req, res, next) {
    try {
      const user = await loginServices.login(req.body)

      res.cookie('AuthToken', user.jwtToken)

      res.status(200).json(user)
    } catch (e) {
      res.status(400).send({ error: e.message })
    }
  }
}
