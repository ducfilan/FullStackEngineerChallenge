import ReviewBoardsDao from '../../dao/review-boards.dao';

export default {
  get: async ({ skip, limit }) => {
    const { reviewBoards, reviewBoardsCount } = await ReviewBoardsDao.find(skip, limit)

    return { reviewBoards, reviewBoardsCount }
  },
}
