import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.response?.data?.message || error.message || 'Error desconocido'
    return Promise.reject(new Error(message))
  }
)

export const ordersService = {
  getAll:       (params = {})  => api.get('/work-orders', { params }),
  getById:      (id)           => api.get(`/work-orders/${id}`),
  create:       (data)         => api.post('/work-orders', data),
  updateStatus: (id, status)   => api.patch(`/work-orders/${id}/status`, { status }),
  addItem:      (id, data)     => api.post(`/work-orders/${id}/items`, data),
  deleteItem:   (itemId)       => api.delete(`/work-orders/items/${itemId}`),
}

export const clientsService = {
  getAll:  (search = '') => api.get(`/clients${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getById: (id)          => api.get(`/clients/${id}`),
  create:  (data)        => api.post('/clients', data),
}

export const bikesService = {
  getAll:  (plate = '') => api.get(`/bikes${plate ? `?plate=${encodeURIComponent(plate)}` : ''}`),
  getById: (id)         => api.get(`/bikes/${id}`),
  create:  (data)       => api.post('/bikes', data),
}

export default api
