import axios from 'axios'

import apis from '../../consts/apis.consts'

let apiBaseUrl = process.env.API_BASE_URL

export default {
  login: async ({ email, password }) => {
    try {
      const { data: user }
        = await axios.post(`${apiBaseUrl}${apis.login}`, { email, password })

      return user
    } catch ({ response: { data: { error } } }) {
      throw new Error(error)
    }
  },
  update: async (_id, updateItems) => {
  },
  logout: async ({ _id }) => {
  }
}
