import usersService from '../services/api/users.services'

export default class UsersController {
  static async me(req, res) {
    return res.status(200).json(req.user);
  }

  static async get(req, res) {
    try {
      const { users, usersCount } = await usersService.get(req.query)

      res.status(200).json({ users, usersCount })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  }

  static async login(req, res) {
    try {
      const user = await usersService.login(req.body)

      res.status(200).json(user)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  }

  static async delete(req, res) {
    try {
      const deleteResult = await usersService.delete(req.params._id)
      res.status(200).send(deleteResult)
    } catch (e) {
      res.status(400).send({ error: e.message })
    }
  }

  static async logout(req, res) {
    try {
      await usersService.logout(req.user)

      res.sendStatus(200)
    } catch (e) {
      res.status(400).send({ error: e.message })
    }
  }
}
