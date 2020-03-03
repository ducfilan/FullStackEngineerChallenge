import axios from 'axios'

import apis from '../consts/apis.consts'

let apiBaseUrl = process.env.API_BASE_URL

export default async (req, res, next) => {
  try {
    const authToken = req.cookies['AuthToken']
    if (!authToken) throw new Error('No Authorization token provided!')

    const { data: user } = await axios.get(`${apiBaseUrl}${apis.me}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })

    if (!user) {
      throw new Error()
    }
    req.user = user

    next()
  } catch (error) {
    res.redirect('/login')
  }
}
