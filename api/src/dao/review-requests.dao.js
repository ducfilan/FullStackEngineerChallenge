import MongoClientConfigs from '../common/configs/mongodb-client.config'

let _reviewRequests
let db

export default class ReviewRequestsDao {
  static async injectDB(conn) {
    if (_reviewRequests) {
      return
    }

    try {
      db = await conn.db(MongoClientConfigs.DatabaseName)
      _reviewRequests = await conn.db(MongoClientConfigs.DatabaseName).collection('reviewRequests')
    } catch (e) {
      console.error(
        `Unable to establish a collection handle in reviewRequestsDao: ${e}`,
      )
    }
  }

  static async find(fromEmail, skip, limit) {
    try {
      const reviewRequests = await _reviewRequests.aggregate([{
        '$match': {
          'fromEmail': fromEmail
        }
      }, {
        '$lookup': {
          'from': 'users',
          'localField': 'targetEmail',
          'foreignField': 'email',
          'as': 'targetInfo'
        }
      }, {
        $unwind: "$targetInfo"
      }, {
        '$project': {
          'reviewBoard': {
            '$toObjectId': "$reviewBoard"
          },
          'fromEmail': 1,
          'targetEmail': 1,
          'requesterEmail': 1,
          'status': 1,
          'targetInfo': 1
        }
      }, {
        '$lookup': {
          'from': 'reviewBoards',
          'localField': 'reviewBoard',
          'foreignField': '_id',
          'as': 'reviewBoardInfo'
        }
      }, {
        $unwind: "$reviewBoardInfo"
      }, {
        '$lookup': {
          'from': 'reviewFactors',
          'localField': 'reviewBoardInfo.reviewFactors',
          'foreignField': '_id',
          'as': 'reviewFactors'
        }
      }, {
        '$project': {
          "targetInfo._id": 0,
          "targetInfo.role": 0,
          "targetInfo.hashedPassword": 0,
          "targetInfo.salt": 0,
          "targetInfo.email": 0,
        }
      }
      ])
        .skip(parseInt(skip)).limit(parseInt(limit)).toArray()
      const reviewRequestsCount = await _reviewRequests.countDocuments({
        'fromEmail': fromEmail
      })

      return { reviewRequests, reviewRequestsCount }
    } catch (e) {
      console.error(`Unable to issue find command, ${e}`)
      return false
    }
  }

  static async updateOne(_id, updateOperations) {
    try {
      var updateResult = await _reviewRequests.findOneAndUpdate({ _id }, updateOperations)
      return updateResult
    } catch (e) {
      console.error(`Unable to issue find command, ${e}`)
      return false
    }
  }

  static async insertMany(reviewRequests) {
    try {
      var { insertedCount, insertedIds } = await _reviewRequests.insertMany(reviewRequests)
      return { insertedCount, insertedIds }
    } catch (e) {
      console.error(`Unable to issue find command, ${e}`)
      return false
    }
  }
}
