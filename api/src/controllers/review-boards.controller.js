import reviewBoardsService from '../services/api/review-boards.services'

export default class UsersController {
  static async get(req, res) {
    try {
      const { reviewBoards, reviewBoardsCount } = await reviewBoardsService.get(req.query)

      res.status(200).json({ reviewBoards, reviewBoardsCount })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  }
}
