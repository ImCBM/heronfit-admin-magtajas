import { createRouter, createWebHistory } from 'vue-router'
import LoadingScreen from '../views/LoadingScreen.vue'
import AuthLayout from '../layouts/AuthLayout.vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: LoadingScreen,
      props: {
        duration: 2000,
        transition: 'fade'
      }
    },
    {
      path: '/authentication',
      component: AuthLayout,
      name: 'auth'
    },
    {
      path: '/dashboard',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/Dashboard.vue')
        },
        {
          path: 'booking',
          name: 'booking',
          component: () => import('../views/BookingManagement.vue')
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('../views/UserManagement.vue')
        },
        {
          path: 'sessions',
          name: 'sessions',
          component: () => import('../views/SessionManagement.vue')
        },
        {
          path: 'announcements',
          name: 'announcements',
          component: () => import('../views/Announcements.vue')
        },
        {
          path: 'analytics',
          name: 'data-reports',
          component: () => import('../views/Analytics.vue')
        }
      ]
    }
  ]
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/authentication')
  } else {
    next()
  }
})

export default router