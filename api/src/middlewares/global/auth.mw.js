import { verify } from 'jsonwebtoken'
import UsersDao from '../../dao/users.dao'
import { ObjectId } from 'mongodb'

export default async (req, res, next) => {
    try {
        const jwtToken = req.header('Authorization')?.replace('Bearer ', '')
        if (!jwtToken) throw new Error('No Authorization token provided!')

        const data = verify(jwtToken, process.env.JWT_SECRET_KEY)

        const user = await UsersDao.findOne({ _id: ObjectId(data._id), jwtToken: jwtToken })
        if (!user) {
            throw new Error()
        }
        req.user = user
        req.jwtToken = jwtToken
        next()
    } catch (error) {
        res.status(401).send({ error: 'Not authorized to access this resource' })
    }
}
