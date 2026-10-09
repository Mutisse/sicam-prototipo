// ============================================================
// SICAM — Portal do Cidadão (menu topo)
// ============================================================

export interface TabPortal {
  to: string
  label: string
  icon: string
}

export const TABS_PORTAL: TabPortal[] = [
  { to: '/cidadao/portal',     label: 'Início',      icon: 'home' },
  { to: '/cidadao/noticias',   label: 'Notícias',    icon: 'newspaper' },
  { to: '/cidadao/faq',        label: 'Leis & FAQ',  icon: 'gavel' },
  { to: '/cidadao/assistente', label: 'Assistente',  icon: 'chat' },
]