import MongoClientConfigs from '../common/configs/mongodb-client.config'

let _reviewResults
let db

export default class ReviewResultsDao {
  static async injectDB(conn) {
    if (_reviewResults) {
      return
    }

    try {
      db = await conn.db(MongoClientConfigs.DatabaseName)
      _reviewResults = await conn.db(MongoClientConfigs.DatabaseName).collection('reviewResults')
    } catch (e) {
      console.error(
        `Unable to establish a collection handle in reviewResultsDao: ${e}`,
      )
    }
  }

  static async insertOne(reviewResults) {
    try {
      var { insertedCount, insertedIds } = await _reviewResults.insertOne(reviewResults)
      return { insertedCount, insertedIds }
    } catch (e) {
      console.error(`Unable to issue find command, ${e}`)
      return false
    }
  }
}
