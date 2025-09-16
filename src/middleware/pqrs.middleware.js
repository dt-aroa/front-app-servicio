import { useAuthStore } from '@/stores/auth/auth.store'

export default async (to, from, next) => {
  const authStore = useAuthStore()
   let permissionToFind = "";

  // Verificar acceso según la ruta
  if (to.name === 'pharmasan.siau.pqrs.crear-pqrs') {
    permissionToFind = 'pharmasan.siau.pqrs.crear'

    if (!authStore.getPermissions.includes(permissionToFind)) {
      return next({
        name: 'pharmasan.siau.pqrs.inicio',
        query: { error: 'no-access' },
      })
    }
  }

    // Verificar acceso según la ruta
  if (to.name === 'pharmasan.siau.pqrs.import-pqrs') {
    permissionToFind = 'pharmasan.siau.pqrs.crear'

    if (!authStore.getPermissions.includes(permissionToFind)) {
      return next({
        name: 'pharmasan.siau.pqrs.inicio',
        query: { error: 'no-access' },
      })
    }
  }

  return next()
}
