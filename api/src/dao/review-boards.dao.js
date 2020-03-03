import MongoClientConfigs from '../common/configs/mongodb-client.config'

let _reviewBoards
let db

export default class ReviewBoardsDao {
  static async injectDB(conn) {
    if (_reviewBoards) {
      return
    }

    try {
      db = await conn.db(MongoClientConfigs.DatabaseName)
      _reviewBoards = await conn.db(MongoClientConfigs.DatabaseName).collection('reviewBoards')
    } catch (e) {
      console.error(
        `Unable to establish a collection handle in reviewBoardsDao: ${e}`,
      )
    }
  }

  static async find(skip, limit) {
    try {
      const reviewBoards = await _reviewBoards.find().skip(parseInt(skip)).limit(parseInt(limit)).toArray()
      const reviewBoardsCount = await _reviewBoards.countDocuments()

      return { reviewBoards, reviewBoardsCount }
    } catch (e) {
      console.error(`Unable to issue find command, ${e}`)
      return false
    }
  }
}
