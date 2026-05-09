import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/Home.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/Login.vue'),
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../pages/Admin.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/admin/accounts',
      },
      {
        path: 'accounts',
        name: 'AdminAccounts',
        component: () => import('../pages/admin/Accounts.vue'),
      },
      {
        path: 'content',
        name: 'AdminContent',
        component: () => import('../pages/admin/Content.vue'),
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('../pages/admin/Settings.vue'),
      },
      {
        path: 'live',
        name: 'AdminLive',
        component: () => import('../pages/admin/Live.vue'),
      },
    ],
  },
  {
    path: '/live/schedule',
    name: 'LiveSchedule',
    component: () => import('../pages/LiveSchedule.vue'),
  },
  {
    path: '/live/stream/:id',
    name: 'LiveStream',
    component: () => import('../pages/LiveStream.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/admin')
  } else {
    next()
  }
})

export default router