import reviewResultsService from '../services/api/review-results.services'

export default class UsersController {
  static async put(req, res) {
    try {
      const insertResult = await reviewResultsService.insertOne(req.body)

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
