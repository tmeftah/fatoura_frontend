import { route } from 'quasar/wrappers'
import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import { useAuthStore } from 'stores/auth'

const router = createRouter({
  history: createWebHistory(process.env.MODE === 'spa' ? process.env.VUE_ROUTER_BASE : undefined),
  routes,
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const publicPages = ['/login']
  const authRequired = !publicPages.includes(to.path)
  const auth = useAuthStore()

  if (!auth.token) auth.initialize() // Load token from storage if available

  if (authRequired && !auth.token) {
    return next('/login')
  }
  next()
})

export default route(() => router)
