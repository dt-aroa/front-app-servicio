import Cookie from 'js-cookie'
import { useAuthStore } from '@/stores/auth/auth.store'
import AuthService from '@/services/auth/auth.service'

const _AuthService = new AuthService()

export default async (to, from, next) => {
  const auth = useAuthStore()

  // Verificar si tenemos token, pero falta información del usuario
  if (auth.getToken && (!auth.getUser || !auth.getPeople?.id)) {
    try {
      const response = await _AuthService.getUser()

      // Restaurar toda la información básica
      auth.saveUser(response.data)
      auth.savePeople(response.data.people)
      auth.savePermissions(response.data.permissions || [])

      // Si intentaba ir al login, redirigir a inicio
      if (to.name === 'login') {
        return next({ name: 'pharmasan.siau.pqrs.inicio' })
      }
      return next()
    } catch (error) {
      // Si falla, limpiar todo
      Cookie.remove('token')
      Cookie.remove('user')
      return next({ name: 'login' })
    }
  }

  return next()
}
