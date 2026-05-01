import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor: attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor: handle 401 and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken })
          localStorage.setItem('accessToken', data.accessToken)
          localStorage.setItem('refreshToken', data.refreshToken)
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
          return api(originalRequest)
        } catch {
          localStorage.clear()
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

// ─── Auth ───────────────────────────────────────────────
export const authAPI = {
  signup: (data) => api.post('/api/auth/signup', data),
  login: (data) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  refresh: (refreshToken) => api.post('/api/auth/refresh', { refreshToken }),
}

// ─── Users ──────────────────────────────────────────────
export const userAPI = {
  getMe: () => api.get('/api/users/me'),
  searchUsers: (keyword) => api.get(`/api/users/search?keyword=${encodeURIComponent(keyword)}`),
  updateProfile: (data) => api.put('/api/users/profile', data),
  updatePicture: (profilePicture) => api.put('/api/users/profile/picture', { profilePicture }),
}

// ─── Chats ──────────────────────────────────────────────
export const chatAPI = {
  accessChat: (userId) => api.post('/api/chats', { userId }),
  getUserChats: () => api.get('/api/chats'),
  createGroup: (data) => api.post('/api/chats/group', data),
  addToGroup: (chatId, userId) => api.put(`/api/chats/group/${chatId}/add`, { userId }),
  removeFromGroup: (chatId, userId) => api.put(`/api/chats/group/${chatId}/remove`, { userId }),
  renameGroup: (chatId, chatName) => api.put(`/api/chats/group/${chatId}/rename`, { chatName }),
  deleteChat: (chatId) => api.delete(`/api/chats/${chatId}`),
}

// ─── Messages ───────────────────────────────────────────
export const messageAPI = {
  send: (data) => api.post('/api/messages', data),
  getMessages: (chatId) => api.get(`/api/messages/${chatId}`),
  markAsRead: (chatId) => api.put(`/api/messages/${chatId}/read`),
  clearHistory: (chatId) => api.delete(`/api/messages/${chatId}/clear`),
  deleteMessage: (messageId) => api.delete(`/api/messages/message/${messageId}`),
}

// ─── Files ──────────────────────────────────────────────
export const fileAPI = {
  upload: (formData) => api.post('/api/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getUrl: (path) => `${BASE_URL}${path}`,
}

export default api
