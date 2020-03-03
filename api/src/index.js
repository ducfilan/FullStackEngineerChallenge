import app from './app'
import { MongoClient } from 'mongodb'
import MongoClientConfigs from './common/configs/mongodb-client.config'

import UsersDao from './dao/users.dao'
import ReviewBoardsDao from './dao/review-boards.dao'
import ReviewRequestsDao from './dao/review-requests.dao'
import ReviewResultsDao from './dao/review-results.dao'

const port = process.env.NODE_PORT || 8080

MongoClient.connect(
  MongoClientConfigs.ConnectionString,
  MongoClientConfigs.Configs
)
  .catch(err => {
    console.error(err.stack)
    process.exit(1)
  })
  .then(async client => {
    await UsersDao.injectDB(client)
    await ReviewBoardsDao.injectDB(client)
    await ReviewRequestsDao.injectDB(client)
    await ReviewResultsDao.injectDB(client)
    app.listen(port, () => {
      console.log(`listening on port ${port}`)
    })
  })
