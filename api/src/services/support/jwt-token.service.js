import jwt from 'jsonwebtoken'
import consts from '../../common/consts'

export default {
  generateAuthToken: _id => {
    return jwt.sign({ _id }, process.env.JWT_SECRET_KEY, { expiresIn: consts.tokenExpiresIn })
  }
}
