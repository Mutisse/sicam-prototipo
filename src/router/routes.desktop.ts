import type { RouteRecordRaw } from "vue-router";
import type { Perfil } from "../css/design/palette";

// ============================================================
// Rotas DESKTOP — Admin, Chefe, INATRO, GESTMUL, ISSM, PRM
// ============================================================
export const routesDesktop: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("../modules/desktop/layouts/MainLayout.vue"),
    children: [
      // ============== ADMIN ==============
      {
        path: "admin/dashboard",
        component: () => import("../modules/desktop/pages/admin/dashboard.vue"),
        meta: { perfis: ["admin"] as Perfil[] },
      },
      {
        path: "admin/utilizadores",
        component: () =>
          import("../modules/desktop/pages/admin/utilizadores.vue"),
        meta: { perfis: ["admin"] as Perfil[] },
      },
      {
        path: "admin/postos",
        component: () => import("../modules/desktop/pages/admin/postos.vue"),
        meta: { perfis: ["admin"] as Perfil[] },
      },
      {
        path: "admin/dispositivos",
        component: () =>
          import("../modules/desktop/pages/admin/dispositivos.vue"),
        meta: { perfis: ["admin"] as Perfil[] },
      },
      {
        path: "admin/integracoes",
        component: () =>
          import("../modules/desktop/pages/admin/integracoes.vue"),
        meta: { perfis: ["admin"] as Perfil[] },
      },
      {
        path: "admin/auditoria",
        component: () => import("../modules/desktop/pages/admin/auditoria.vue"),
        meta: { perfis: ["admin"] as Perfil[] },
      },
      {
        path: "admin/relatorios",
        component: () =>
          import("../modules/desktop/pages/admin/relatorios.vue"),
        meta: { perfis: ["admin"] as Perfil[] },
      },
      {
        path: "admin/monitorizacao",
        component: () =>
          import("../modules/desktop/pages/admin/monitorizacao.vue"),
        meta: { perfis: ["admin"] as Perfil[] },
      },

      // ============== CHEFE DE POSTO ==============
      {
        path: "chefe/dashboard",
        component: () => import("../modules/desktop/pages/chefe/dashboard.vue"),
        meta: { perfis: ["chefe"] as Perfil[] },
      },
      {
        path: "chefe/agentes",
        component: () => import("../modules/desktop/pages/chefe/agentes.vue"),
        meta: { perfis: ["chefe"] as Perfil[] },
      },
      {
        path: "chefe/patrulhas",
        component: () => import("../modules/desktop/pages/chefe/patrulhas.vue"),
        meta: { perfis: ["chefe"] as Perfil[] },
      },
      {
        path: "chefe/aprovacoes",
        component: () =>
          import("../modules/desktop/pages/chefe/aprovacoes.vue"),
        meta: { perfis: ["chefe"] as Perfil[] },
      },
      {
        path: "chefe/relatorios",
        component: () =>
          import("../modules/desktop/pages/chefe/relatorios.vue"),
        meta: { perfis: ["chefe"] as Perfil[] },
      },

      // ============== INATRO ==============
      {
        path: "inatro/painel",
        component: () => import("../modules/desktop/pages/inatro/painel.vue"),
        meta: { perfis: ["inatro"] as Perfil[] },
      },
      {
        path: "inatro/veiculos",
        component: () => import("../modules/desktop/pages/inatro/veiculos.vue"),
        meta: { perfis: ["inatro"] as Perfil[] },
      },
      {
        path: "inatro/inspecoes",
        component: () =>
          import("../modules/desktop/pages/inatro/inspecoes.vue"),
        meta: { perfis: ["inatro"] as Perfil[] },
      },
      {
        path: "inatro/exportacao",
        component: () =>
          import("../modules/desktop/pages/inatro/exportacao.vue"),
        meta: { perfis: ["inatro"] as Perfil[] },
      },
      {
        path: "inatro/relatorios",
        component: () =>
          import("../modules/desktop/pages/inatro/relatorios.vue"),
        meta: { perfis: ["inatro"] as Perfil[] },
      },

      // ============== GESTMUL ==============
      {
        path: "gestmul/painel",
        component: () => import("../modules/desktop/pages/gestmul/painel.vue"),
        meta: { perfis: ["gestmul"] as Perfil[] },
      },
      {
        path: "gestmul/multas",
        component: () => import("../modules/desktop/pages/gestmul/multas.vue"),
        meta: { perfis: ["gestmul"] as Perfil[] },
      },
      {
        path: "gestmul/pagamentos",
        component: () =>
          import("../modules/desktop/pages/gestmul/pagamentos.vue"),
        meta: { perfis: ["gestmul"] as Perfil[] },
      },
      {
        path: "gestmul/relatorios",
        component: () =>
          import("../modules/desktop/pages/gestmul/relatorios.vue"),
        meta: { perfis: ["gestmul"] as Perfil[] },
      },

      // ============== ISSM ==============
      {
        path: "issm/painel",
        component: () => import("../modules/desktop/pages/issm/painel.vue"),
        meta: { perfis: ["issm"] as Perfil[] },
      },
      {
        path: "issm/apolices",
        component: () => import("../modules/desktop/pages/issm/apolices.vue"),
        meta: { perfis: ["issm"] as Perfil[] },
      },
      {
        path: "issm/sinistros",
        component: () => import("../modules/desktop/pages/issm/sinistros.vue"),
        meta: { perfis: ["issm"] as Perfil[] },
      },
      {
        path: "issm/validacao",
        component: () => import("../modules/desktop/pages/issm/validacao.vue"),
        meta: { perfis: ["issm"] as Perfil[] },
      },
      {
        path: "issm/relatorios",
        component: () => import("../modules/desktop/pages/issm/relatorios.vue"),
        meta: { perfis: ["issm"] as Perfil[] },
      },

      // ============== PRM ==============
      {
        path: "prm/painel",
        component: () => import("../modules/desktop/pages/prm/painel.vue"),
        meta: { perfis: ["prm"] as Perfil[] },
      },
      {
        path: "prm/hotlist",
        component: () => import("../modules/desktop/pages/prm/hotlist.vue"),
        meta: { perfis: ["prm"] as Perfil[] },
      },
      {
        path: "prm/abordagens",
        component: () => import("../modules/desktop/pages/prm/abordagens.vue"),
        meta: { perfis: ["prm"] as Perfil[] },
      },
      {
        path: "prm/alertas",
        component: () => import("../modules/desktop/pages/prm/alertas.vue"),
        meta: { perfis: ["prm"] as Perfil[] },
      },
      {
        path: "prm/relatorios",
        component: () => import("../modules/desktop/pages/prm/relatorios.vue"),
        meta: { perfis: ["prm"] as Perfil[] },
      },
    ],
  },
];
