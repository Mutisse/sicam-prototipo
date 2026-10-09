import type { RouteRecordRaw } from "vue-router";
import type { Perfil } from "../css/design/palette";

// ============================================================
// Rotas MOBILE — Agente de Trânsito
// ============================================================
export const routesMobile: RouteRecordRaw[] = [
  {
    path: "/agente",
    component: () => import("../modules/mobile/layouts/AgenteLayout.vue"),
    children: [
      {
        path: "inicio",
        component: () => import("../modules/mobile/pages/inicio.vue"),
        meta: { perfis: ["agente"] as Perfil[] },
      },
      {
        path: "consulta",
        component: () => import("../modules/mobile/pages/consulta.vue"),
        meta: { perfis: ["agente"] as Perfil[] },
      },
      {
        path: "camera",
        component: () => import("../modules/mobile/pages/camera.vue"),
        meta: { perfis: ["agente"] as Perfil[] },
      },
      {
        path: "resultado",
        component: () => import("../modules/mobile/pages/resultado.vue"),
        meta: { perfis: ["agente"] as Perfil[] },
      },
      {
        path: "autos",
        component: () => import("../modules/mobile/pages/autos.vue"),
        meta: { perfis: ["agente"] as Perfil[] },
      },
      {
        path: "historico",
        component: () => import("../modules/mobile/pages/historico.vue"),
        meta: { perfis: ["agente"] as Perfil[] },
      },
      {
        path: "perfil",
        component: () => import("../modules/mobile/pages/perfil.vue"),
        meta: { perfis: ["agente"] as Perfil[] },
      },
       {
        path: "chat",
        component: () => import("../modules/mobile/pages/chat.vue"),
        meta: { perfis: ["agente"] as Perfil[] },
      },


    ],
  },
];
