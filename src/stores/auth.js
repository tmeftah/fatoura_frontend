import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null,
    loading: false,
    error: null,
  }),
  actions: {
    async login(username, password) {
      this.loading = true
      this.error = null
      try {
        // Create x-www-form-urlencoded data
        const params = new URLSearchParams()
        params.append('username', username)
        params.append('password', password)

        const response = await api.post('/login', params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
        console.log(response)
        this.token = response.data.access_token

        localStorage.setItem('token', this.token)
        api.defaults.headers.common.Authorization = `Bearer ${this.token}`
      } catch (err) {
        this.error = err.response?.data?.message || 'Login failed'
        this.token = null
        this.user = null
      } finally {
        this.loading = false
      }
    },
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      delete api.defaults.headers.common.Authorization
    },
    initialize() {
      const token = localStorage.getItem('token')
      if (token) {
        this.token = token
        api.defaults.headers.common.Authorization = `Bearer ${token}`
      }
    },
  },
})
