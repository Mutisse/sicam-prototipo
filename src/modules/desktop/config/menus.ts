import type { Perfil } from "@/css/design/palette";

// ============================================================
// SICAM — Configuração de menus por perfil
// ============================================================

export interface MenuItem {
  to: string;
  label: string;
  icon: string;
}

export interface MenuGroup {
  titulo: string;
  items: MenuItem[];
}

// ------------------------------------------------------------
// Admin — visão global do sistema
// ------------------------------------------------------------
const MENU_ADMIN: MenuGroup[] = [
  {
    titulo: "Visão Geral",
    items: [
      { to: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
      {
        to: "/admin/monitorizacao",
        label: "Monitorização",
        icon: "monitor_heart",
      },
    ],
  },
  {
    titulo: "Gestão",
    items: [
      { to: "/admin/utilizadores", label: "Utilizadores", icon: "people" },
      { to: "/admin/postos", label: "Postos", icon: "location_city" },
      { to: "/admin/dispositivos", label: "Dispositivos", icon: "devices" },
    ],
  },
  {
    titulo: "Sistema",
    items: [
      { to: "/admin/integracoes", label: "Integrações", icon: "api" },
      { to: "/admin/auditoria", label: "Auditoria", icon: "security" },
      { to: "/admin/relatorios", label: "Relatórios", icon: "bar_chart" },
    ],
  },
];

// ------------------------------------------------------------
// Chefe de Posto — supervisão do posto
// ------------------------------------------------------------
const MENU_CHEFE: MenuGroup[] = [
  {
    titulo: "Painel",
    items: [{ to: "/chefe/dashboard", label: "Dashboard", icon: "dashboard" }],
  },
  {
    titulo: "Operações",
    items: [
      { to: "/chefe/agentes", label: "Agentes", icon: "people" },
      { to: "/chefe/patrulhas", label: "Patrulhas", icon: "shield" },
    ],
  },
  {
    titulo: "Aprovações",
    items: [
      { to: "/chefe/aprovacoes", label: "Aprovações", icon: "check_circle" },
      { to: "/chefe/relatorios", label: "Relatórios", icon: "bar_chart" },
    ],
  },
];

// ------------------------------------------------------------
// INATRO — registo e inspecções
// ------------------------------------------------------------
const MENU_INATRO: MenuGroup[] = [
  {
    titulo: "Painel",
    items: [{ to: "/inatro/painel", label: "Visão Geral", icon: "dashboard" }],
  },
  {
    titulo: "Veículos",
    items: [
      { to: "/inatro/veiculos", label: "Veículos", icon: "directions_car" },
      { to: "/inatro/inspecoes", label: "Inspecções", icon: "build" },
    ],
  },
  {
    titulo: "Relatórios",
    items: [
      { to: "/inatro/exportacao", label: "Exportação", icon: "file_download" },
      { to: "/inatro/relatorios", label: "Relatórios", icon: "bar_chart" },
    ],
  },
];

// ------------------------------------------------------------
// GESTMUL — multas e pagamentos
// ------------------------------------------------------------
const MENU_GESTMUL: MenuGroup[] = [
  {
    titulo: "Painel",
    items: [{ to: "/gestmul/painel", label: "Visão Geral", icon: "dashboard" }],
  },
  {
    titulo: "Multas",
    items: [
      { to: "/gestmul/multas", label: "Multas", icon: "receipt_long" },
      { to: "/gestmul/pagamentos", label: "Pagamentos", icon: "payments" },
    ],
  },
  {
    titulo: "Análise",
    items: [
      { to: "/gestmul/relatorios", label: "Relatórios", icon: "bar_chart" },
    ],
  },
];

// ------------------------------------------------------------
// ISSM — seguros e sinistros
// ------------------------------------------------------------
const MENU_ISSM: MenuGroup[] = [
  {
    titulo: "Painel",
    items: [{ to: "/issm/painel", label: "Visão Geral", icon: "dashboard" }],
  },
  {
    titulo: "Seguros",
    items: [
      { to: "/issm/apolices", label: "Apólices", icon: "shield" },
      { to: "/issm/sinistros", label: "Sinistros", icon: "report_problem" },
      { to: "/issm/validacao", label: "Validação", icon: "verified_user" },
      { to: "/issm/relatorios", label: "Relatórios", icon: "bar_chart" },
    ],
  },
];

// ------------------------------------------------------------
// PRM — hotlist e abordagens
// ------------------------------------------------------------
const MENU_PRM: MenuGroup[] = [
  {
    titulo: "Painel",
    items: [{ to: "/prm/painel", label: "Visão Geral", icon: "dashboard" }],
  },
  {
    titulo: "Operações",
    items: [
      { to: "/prm/hotlist", label: "Hotlist", icon: "local_police" },
      { to: "/prm/abordagens", label: "Abordagens", icon: "visibility" },
    ],
  },
  {
    titulo: "Alertas",
    items: [
      { to: "/prm/alertas", label: "Alertas", icon: "notifications_active" },
      { to: "/prm/relatorios", label: "Relatórios", icon: "bar_chart" },
    ],
  },
];

// ------------------------------------------------------------
// Mapa perfil → grupos de menu
// ------------------------------------------------------------
export const MENUS: Record<string, MenuGroup[]> = {
  admin: MENU_ADMIN,
  chefe: MENU_CHEFE,
  inatro: MENU_INATRO,
  gestmul: MENU_GESTMUL,
  issm: MENU_ISSM,
  prm: MENU_PRM,
};

export function menuDoPerfil(perfil: Perfil | null): MenuGroup[] {
  if (!perfil) return [];
  return MENUS[perfil] ?? [];
}

// ------------------------------------------------------------
// Rota inicial por perfil
// ------------------------------------------------------------
export const ROTA_INICIAL: Record<Perfil, string> = {
  agente: "/agente/inicio",
  chefe: "/chefe/dashboard",
  admin: "/admin/dashboard",
  inatro: "/inatro/painel",
  gestmul: "/gestmul/painel",
  issm: "/issm/painel",
  prm: "/prm/painel",
  cidadao: "/cidadao/portal",
};
