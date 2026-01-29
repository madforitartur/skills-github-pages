import api from './api.js'

const ordersService = {
  async list() {
    const { data } = await api.get('/orders')
    return data
  },
  async getById(id) {
    const { data } = await api.get(`/orders/${id}`)
    return data
  },
}

export default ordersService
