import UsersDao from '../../dao/users.dao';
import jwtTokenService from '../support/jwt-token.service'
import passwordHashingService from '../support/password-hashing.service'

export default {
  get: async ({ skip, limit }) => {
    const { users, usersCount } = await UsersDao.find(skip, limit)

    return { users, usersCount }
  },
  login: async ({ email, password }) => {
    const user = await UsersDao.findByEmail(email)
    if (!user)
      throw new Error('Login failed! User with your provided email does not exist!')

    if (!passwordHashingService.isPasswordMatchedHashWithSalt(password, user.hashedPassword, user.salt))
      throw new Error('Login failed! Check authentication credentials!')

    const jwtToken = jwtTokenService.generateAuthToken(user._id)

    await UsersDao.updateOne(user._id, { $set: { jwtToken } })

    delete user.hashedPassword
    delete user.salt

    user.jwtToken = jwtToken

    return user
  },
  delete: async (_id) => {
    return await UsersDao.delete(_id)
  },
  logout: async ({ _id }) => {
    await UsersDao.updateOne(_id, { $set: { jwtToken: null } })
  }
}
