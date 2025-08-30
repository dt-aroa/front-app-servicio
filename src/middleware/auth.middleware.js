import Cookie from 'js-cookie'
import { useAuthStore } from '@/stores/auth/auth.store'

export default async (to, from, next) => {
  const auth = useAuthStore()
  const isAuthenticated = auth.getToken && auth.getUser

  // Si intenta ir al login estando autenticado
  if (to.name === 'login' && isAuthenticated) {
    console.log('Already authenticated')
    return next({ name: 'pharmasan.siau.pqrs.inicio' })
  }

  // Si no está autenticado y va a una ruta protegida
  if (!isAuthenticated && to.name !== 'login') {
    Cookie.remove('token')
    Cookie.remove('user')
    Cookie.set('intended_url', to.path)
    return next({ name: 'login' })
  }

  return next()
}
