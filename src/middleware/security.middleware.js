import { useAuthStore } from '@/stores/auth/auth.store'
import Swal from 'sweetalert2'
import router from '@/router'

export default async (to, from, next) => {
  const store = useAuthStore()
  const { admin } = store.getUser
  const permissions = store.getPermissions

  // Si es admin, tiene acceso total
  if (admin) {
    return next()
  }

  // Si la ruta no requiere permisos específicos
  const { access } = to.meta
  if (!access || !access.length) {
    return next()
  }

  // Verificar si tiene alguno de los permisos requeridos
  const hasPermission = access.some((permission) => permissions.includes(permission))

  if (hasPermission) {
    return next()
  }

  // Si no tiene permisos, mostrar alerta y redirigir
  await Swal.fire({
    icon: 'warning',
    title: 'Acceso No Autorizado',
    text: 'No tienes los permisos necesarios para acceder a esta sección',
  })

  const user = store.getUser

  // Si no hay usuario, ir al login
  if (!user.id) {
    return next({ name: 'login' })
  }

  // Si no hay grupo o ruta por defecto, ir a 401
  if (!user.group?.routeName) {
    return next({ name: 'error.401' })
  }

  // Verificar si la ruta del grupo existe
  if (!router.hasRoute(user.group.routeName)) {
    return next({ name: 'error.404' })
  }

  // Redirigir a la ruta por defecto del grupo
  return next({ name: user.group.routeName })
}
