import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { useAuthStore } from 'stores/auth'

const api = axios.create({ baseURL: process.env.Q_API_BASE_URL })

export default boot(({ app, router }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api

  // 1) Attach token to each request
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  // 2) Catch 401 in any response
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        const auth = useAuthStore()
        auth.logout() // clears store + localStorage + headers
        router.push('/login') // send user back to login page
      }
      return Promise.reject(error)
    },
  )
})

export { api }
