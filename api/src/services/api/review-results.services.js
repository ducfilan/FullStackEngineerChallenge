import ReviewResultsDao from '../../dao/review-results.dao';

export default {
  insertOne: async (reviewResults) => {
    return await ReviewResultsDao.insertOne(reviewResults)
  }
}
