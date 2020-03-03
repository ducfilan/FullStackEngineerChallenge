import { ObjectID } from 'mongodb'
import MongoClientConfigs from '../common/configs/mongodb-client.config'

let _users
let db

let defaultProjection = { projection: { hashedPassword: 0, salt: 0, jwtToken: 0 } }

export default class UsersDao {
  static async injectDB(conn) {
    if (_users) {
      return
    }

    try {
      db = await conn.db(MongoClientConfigs.DatabaseName)
      _users = await conn.db(MongoClientConfigs.DatabaseName).collection('users')
    } catch (e) {
      console.error(
        `Unable to establish a collection handle in usersDao: ${e}`,
      )
    }
  }

  static async find(skip, limit, projection) {
    try {
      projection = projection || defaultProjection

      const users = await _users.find({}, projection).skip(parseInt(skip)).limit(parseInt(limit)).toArray()
      const usersCount = await _users.countDocuments()

      return { users, usersCount }
    } catch (e) {
      console.error(`Unable to issue find command, ${e}`)
      return false
    }
  }

  static async findOne(query) {
    return await _users.findOne(query)
  }

  static async findByEmail(email) {
    try {
      var user = await _users.findOne({ 'email': email })
      return user
    } catch (e) {
      console.error(`Unable to issue find command, ${e}`)
      return false
    }
  }

  static async delete(_id) {
    try {
      var deleteResult = await _users.findOneAndDelete({ _id: ObjectID(_id) })
      return deleteResult
    } catch (e) {
      console.error(`Unable to issue delete command, ${e}`)
      return false
    }
  }

  static async updateOne(_id, updateOperations) {
    try {
      var updateResult = await _users.findOneAndUpdate({ _id }, updateOperations)
      return updateResult
    } catch (e) {
      console.error(`Unable to issue update command, ${e}`)
      return false
    }
  }
}
