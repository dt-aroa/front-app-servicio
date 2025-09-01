import { createRouter, createWebHistory } from 'vue-router'
import authMiddleware from '@/middleware/auth.middleware'
import checkMiddleware from '@/middleware/check.middleware'
import securityMiddleware from '@/middleware/security.middleware'
import routesAuth from '@/router/auth/auth.route.js'

// Constante para el título por defecto
const DEFAULT_TITLE = 'PQRS - CLIENTES'

const routes = [
  ...routesAuth,
  {
    path: '/',
    redirect: { name: 'pharmasan.siau.pqrs.inicio' },
    component: () => import('@/views/pages/layout/index.vue'),
    beforeEnter: authMiddleware,
    children: [
      {
        path: 'inicio',
        name: 'pharmasan.siau.pqrs.inicio',
        component: () => import('@/views/pages/pqrs/home.vue'),
        meta: {
          title: 'Inicio',
        },
      },
      {
        path: 'crear-pqrs',
        name: 'pharmasan.siau.pqrs.crear-pqrs',
        component: () => import('@/views/pages/pqrs/crear.vue'),
        meta: {
          title: 'Crear PQRS',
        },
      },
      // Rutas de error
      {
        path: '401',
        name: 'error.401',
        component: () => import('@/views/errors/401.vue'),
        meta: {
          title: 'No Autorizado',
        },
      },
      {
        path: '/:pathMatch(.*)*',
        name: 'error.404',
        component: () => import('@/views/errors/404.vue'),
        meta: {
          title: 'Pagina no encontrada',
        },
      },
    ],
  },
]

// Función para manejar el título de la página
const handlePageTitle = (pageTitle) => {
  if (!pageTitle) return DEFAULT_TITLE

  const formattedTitle = pageTitle
    .split('.')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' - ')

  return `${DEFAULT_TITLE} - ${formattedTitle}`
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  base: import.meta.BASE_URL,
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  },
})

// Primero el check para verificar y recuperar datos si es necesario
router.beforeEach(checkMiddleware)

// Luego el auth para protección de rutas
router.beforeEach(authMiddleware)

//
router.beforeEach(securityMiddleware)

// Luego manejamos el título y los middleware específicos
router.beforeEach((to, from, next) => {
  // Actualizar título de la página
  document.title = handlePageTitle(to.meta.title || to.name)

  // Manejar middleware específicos de la ruta
  if (to.meta.middleware) {
    const middleware = Array.isArray(to.meta.middleware) ? to.meta.middleware : [to.meta.middleware]

    return middleware[0]({ to, from, next })
  }

  return next()
})

export default router
