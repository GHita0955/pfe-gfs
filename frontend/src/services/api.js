import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

// Attacher le token JWT à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Rediriger vers login en cas de 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me')
}

export const servicesAPI = {
  getAll: () => api.get('/services/'),
  getAllAdmin: () => api.get('/services/all'),
  getOne: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services/', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`)
}

export const slotsAPI = {
  getAll: (params) => api.get('/slots/', { params }),
  getOne: (id) => api.get(`/slots/${id}`),
  create: (data) => api.post('/slots/', data),
  generate: (data) => api.post('/slots/generate', data),
  update: (id, data) => api.put(`/slots/${id}`, data),
  delete: (id) => api.delete(`/slots/${id}`)
}

export const reservationsAPI = {
  getAll: (params) => api.get('/reservations/', { params }),
  getOne: (id) => api.get(`/reservations/${id}`),
  create: (data) => api.post('/reservations/', data),
  cancel: (id) => api.put(`/reservations/${id}/cancel`),
  update: (id, data) => api.put(`/reservations/${id}`, data),
  qr: (id) => api.get(`/reservations/${id}/qr`, { responseType: 'blob' }),
  receipt: (id) => api.get(`/reservations/${id}/receipt.pdf`, { responseType: 'blob' })
}

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRevenueChart: () => api.get('/dashboard/revenue-chart'),
  getOccupancyChart: () => api.get('/dashboard/occupancy-chart'),
  getStatusChart: () => api.get('/dashboard/status-chart'),
  getForecast: () => api.get('/dashboard/forecast'),
  getRecentReservations: () => api.get('/dashboard/recent-reservations'),
  refreshStatistics: () => api.post('/dashboard/refresh-statistics'),
  getStatistics: () => api.get('/dashboard/statistics'),
  report: () => api.get('/dashboard/report.pdf', { responseType: 'blob' })
}

export const menuAPI = {
  getAll: (params) => api.get('/menu/', { params }),
  getAllAdmin: () => api.get('/menu/all'),
  getOne: (id) => api.get(`/menu/${id}`),
  create: (data) => api.post('/menu/', data),
  update: (id, data) => api.put(`/menu/${id}`, data),
  delete: (id) => api.delete(`/menu/${id}`)
}

export const searchAPI = {
  advanced: (params) => api.get('/search/advanced', { params })
}

export default api
