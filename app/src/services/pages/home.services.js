import axios from 'axios'

import apis from '../../consts/apis.consts'

let apiBaseUrl = process.env.API_BASE_URL

export default {
  login: async ({ email, password }) => {
    try {
      const { data }
        = await axios.post(`${apiBaseUrl}${apis.login}`, { email, password })

      return { user: data.user, jwtToken: data.jwtToken }
    } catch ({ response: { data: { error } } }) {
      throw new Error(error)
    }
  },
  update: async (_id, updateItems) => {
  },
  logout: async ({ _id }) => {
  }
}
