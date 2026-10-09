import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { createPinia, type Pinia } from 'pinia'
import { useAuthStore } from '../stores/auth'
import type { Perfil } from '../css/design/palette'

import { routesDesktop } from './routes.desktop'
import { routesMobile } from './routes.mobile'
import { routesPortal } from './routes.portal'

// ============================================================
// SICAM — Router principal
// ============================================================

const routesAuth: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('../auth/layouts/AuthLayout.vue'),
    children: [
      { path: '', name: 'login', component: () => import('../auth/pages/login.vue') },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    name: 'not-found',
    component: () => import('../auth/pages/ErrorNotFound.vue'),
  },
]

const routes: RouteRecordRaw[] = [
  ...routesAuth,
  ...routesDesktop,
  ...routesMobile,
  ...routesPortal,
]

// Pinia — instância ÚNICA partilhada
export const pinia: Pinia = createPinia()

export default function () {
  const router = createRouter({
    history: createWebHashHistory(),
    routes,
  })

  router.beforeEach((to) => {
    const auth = useAuthStore(pinia)
    if (!auth.autenticado) auth.restaurar()

    if (to.path === '/login') {
      if (auth.autenticado) return { path: auth.rotaInicial }
      return true
    }

    if (to.path.startsWith('/cidadao')) return true

    if (!auth.autenticado) return { path: '/login' }

    const perfisPermitidos = to.meta.perfis as Perfil[] | undefined
    if (perfisPermitidos && auth.perfil) {
      if (!perfisPermitidos.includes(auth.perfil)) {
        return { path: auth.rotaInicial }
      }
    }

    return true
  })

  return router
}