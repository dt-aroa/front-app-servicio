const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/login.vue'),
    meta: {
      hide: true,
      title: 'Inicio de sesión',
    },
  },
]

export default routes
