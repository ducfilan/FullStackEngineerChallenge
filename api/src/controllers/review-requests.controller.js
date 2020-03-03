import reviewRequestsService from '../services/api/review-requests.services'
import { ObjectId } from 'mongodb'

export default class UsersController {
  static async get(req, res) {
    try {
      const { reviewRequests, reviewRequestsCount } = await reviewRequestsService.get({ fromEmail: req.user.email, ...req.query })

      res.status(200).json({ reviewRequests, reviewRequestsCount })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  }

  static async update(req, res) {
    try {
      const updateResult = await reviewRequestsService.update(ObjectId(req.params._id), req.body)
      if (!updateResult.ok) {
        res.status(400).json({ error: 'User not found' })
      }

      res.sendStatus(200)
    } catch (e) {
      res.status(400).send({ error: e.message })
    }
  }

  static async put(req, res) {
    try {
      let { fromEmail, reviewBoard, targetEmails, requesterEmail } = req.body

      let reviewRequests = targetEmails.split(/\s*;\s*/).map(targetEmail => ({ fromEmail, targetEmail, reviewBoard, requesterEmail, status: "0" }))

      const insertResult = await reviewRequestsService.insertMany(reviewRequests)

      res.status(200).send(insertResult)
      if (!updateResult.ok) {
        res.status(400).json({ error: 'User not found' })
      }

      res.sendStatus(200)
    } catch (e) {
      res.status(400).send({ error: e.message })
    }
  }
}
