import { create } from 'zustand'
import { authAPI, userAPI } from '../services/api'
import { wsService } from '../services/websocket'

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  init: async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      set({ loading: false })
      return
    }
    try {
      const { data } = await userAPI.getMe()
      set({ user: data, isAuthenticated: true, loading: false })
      wsService.connect(token)
    } catch {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      set({ loading: false })
    }
  },

  login: async (email, password) => {
    const { data } = await authAPI.login({ email, password })
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    set({ user: data.user, isAuthenticated: true })
    wsService.connect(data.accessToken)
    return data
  },

  signup: async (username, email, password) => {
    const { data } = await authAPI.signup({ username, email, password })
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    set({ user: data.user, isAuthenticated: true })
    wsService.connect(data.accessToken)
    return data
  },

  logout: async () => {
    try {
      await authAPI.logout()
    } catch {}
    wsService.disconnect()
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    set({ user: null, isAuthenticated: false })
  },

  updateUser: (updatedUser) => set({ user: updatedUser }),
}))
