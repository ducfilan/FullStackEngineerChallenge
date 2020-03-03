import ReviewRequestsDao from '../../dao/review-requests.dao';

export default {
  get: async ({ fromEmail, skip, limit }) => {
    const { reviewRequests, reviewRequestsCount } = await ReviewRequestsDao.find(fromEmail, skip, limit)

    return { reviewRequests, reviewRequestsCount }
  },
  update: async (_id, updateItems) => {
    return await ReviewRequestsDao.updateOne(_id, { $set: updateItems })
  },
  insertMany: async (reviewRequests) => {
    return await ReviewRequestsDao.insertMany(reviewRequests)
  }
}
