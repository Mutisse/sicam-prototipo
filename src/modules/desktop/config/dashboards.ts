// ============================================================
// SICAM — Configuração dos Dashboards por perfil
// Perfis que usam: chefe, inatro, gestmul, issm, prm
// ============================================================

export type KpiVariant = 'regular' | 'atencao' | 'critico' | 'sem-dados' | 'info'

export interface KpiConfig {
  key: string
  label: string
  variant: KpiVariant
}

export interface FiltroConfig {
  key: string
  label: string
  tipo: 'date' | 'select'
  opcoes?: string[]
}

export interface CardConfig {
  titulo: string
  linhas: { label: string; valor: string; destaque?: 'positive' | 'negative' }[]
}

export interface DashboardConfig {
  titulo: string
  subtitulo: string
  kpis: KpiConfig[]
  filtros: FiltroConfig[]
  cards: CardConfig[]
  tabelaTitulo: string
  tabelaColunas: string[]
  linhasTabela: string[][]
  valoresKpi: Record<string, { valor: number; percentagem: string; barra: number | null }>
  legendaTipo: 'score' | 'generico'
}

// ============================================================
// CHEFE DE POSTO
// ============================================================
const CHEFE: DashboardConfig = {
  titulo: 'Painel do Posto',
  subtitulo: 'Estado dos veículos do posto, desempenho dos agentes e patrulhas.',
  kpis: [
    { key: 'critico',   label: 'Crítico',    variant: 'critico' },
    { key: 'atencao',   label: 'Atenção',    variant: 'atencao' },
    { key: 'regular',   label: 'Regular',    variant: 'regular' },
    { key: 'agentesOn', label: 'Agentes on', variant: 'info' },
  ],
  filtros: [
    { key: 'de',     label: 'De',     tipo: 'date' },
    { key: 'ate',    label: 'Até',    tipo: 'date' },
    { key: 'agente', label: 'Agente', tipo: 'select', opcoes: ['Todos', 'Agente Chissano', 'Agente Nhaca', 'Agente Sitoe', 'Agente Cumbe'] },
  ],
  cards: [
    {
      titulo: 'Patrulhas de hoje',
      linhas: [
        { label: 'Planeadas',  valor: '3' },
        { label: 'Em curso',   valor: '1' },
        { label: 'Concluídas', valor: '2' },
      ],
    },
    {
      titulo: 'Agentes do posto',
      linhas: [
        { label: 'Total',    valor: '14' },
        { label: 'On-line',  valor: '11', destaque: 'positive' },
        { label: 'Off-line', valor: '3',  destaque: 'negative' },
      ],
    },
  ],
  tabelaTitulo: 'Por agente',
  tabelaColunas: ['Agente', 'Consultas', 'Autos', 'Patrulhas', 'Regularidade'],
  linhasTabela: [
    ['Agente Chissano', '148', '12', '8', '89%'],
    ['Agente Nhaca',    '122', '9',  '7', '82%'],
    ['Agente Sitoe',    '98',  '6',  '5', '78%'],
  ],
  valoresKpi: {
    critico:   { valor: 3,  percentagem: '18%', barra: 18 },
    atencao:   { valor: 2,  percentagem: '12%', barra: 12 },
    regular:   { valor: 9,  percentagem: '53%', barra: 53 },
    agentesOn: { valor: 11, percentagem: '79%', barra: 79 },
  },
  legendaTipo: 'score',
}

// ============================================================
// INATRO
// ============================================================
const INATRO: DashboardConfig = {
  titulo: 'Painel INATRO',
  subtitulo: 'Registo de veículos, inspecções técnicas e pendências.',
  kpis: [
    { key: 'registados',  label: 'Registados',         variant: 'info' },
    { key: 'inspecaoOk',  label: 'Inspecção válida',   variant: 'regular' },
    { key: 'inspecaoExp', label: 'Inspecção expirada', variant: 'critico' },
    { key: 'pendentes',   label: 'Pendentes',          variant: 'atencao' },
  ],
  filtros: [
    { key: 'de',        label: 'De',        tipo: 'date' },
    { key: 'ate',       label: 'Até',       tipo: 'date' },
    { key: 'provincia', label: 'Província', tipo: 'select', opcoes: ['Todas', 'Maputo Cidade', 'Maputo Província'] },
    { key: 'estado',    label: 'Estado',    tipo: 'select', opcoes: ['Todos', 'Válida', 'Expirada', 'Pendente'] },
  ],
  cards: [
    {
      titulo: 'Inspecções este mês',
      linhas: [
        { label: 'Aprovadas',  valor: '87', destaque: 'positive' },
        { label: 'Reprovadas', valor: '13', destaque: 'negative' },
        { label: 'Agendadas',  valor: '42' },
      ],
    },
    {
      titulo: 'Registos',
      linhas: [
        { label: 'Novos veículos',      valor: '128' },
        { label: 'Alterações prop.',    valor: '37' },
        { label: 'Pendentes validação', valor: '12', destaque: 'negative' },
      ],
    },
  ],
  tabelaTitulo: 'Por província',
  tabelaColunas: ['Província', 'Veículos', 'Inspecções OK', 'Expiradas', 'Taxa'],
  linhasTabela: [
    ['Maputo Cidade',   '68', '54', '14', '79%'],
    ['Maputo Província', '60', '33', '18', '55%'],
  ],
  valoresKpi: {
    registados:  { valor: 128, percentagem: '+12%', barra: 62 },
    inspecaoOk:  { valor: 87,  percentagem: '68%',  barra: 68 },
    inspecaoExp: { valor: 32,  percentagem: '25%',  barra: 25 },
    pendentes:   { valor: 12,  percentagem: '9%',   barra: 9 },
  },
  legendaTipo: 'generico',
}

// ============================================================
// GESTMUL
// ============================================================
const GESTMUL: DashboardConfig = {
  titulo: 'Painel GESTMUL',
  subtitulo: 'Multas emitidas, pagamentos e valores cobrados.',
  kpis: [
    { key: 'emitidas',  label: 'Emitidas',    variant: 'info' },
    { key: 'pagas',     label: 'Pagas',       variant: 'regular' },
    { key: 'pendentes', label: 'Pendentes',   variant: 'atencao' },
    { key: 'contesta',  label: 'Contestadas', variant: 'critico' },
  ],
  filtros: [
    { key: 'de',        label: 'De',        tipo: 'date' },
    { key: 'ate',       label: 'Até',       tipo: 'date' },
    { key: 'provincia', label: 'Província', tipo: 'select', opcoes: ['Todas', 'Maputo Cidade', 'Maputo Província'] },
    { key: 'estado',    label: 'Estado',    tipo: 'select', opcoes: ['Todos', 'Emitida', 'Paga', 'Pendente', 'Contestada'] },
  ],
  cards: [
    {
      titulo: 'Valores (este mês)',
      linhas: [
        { label: 'Cobrado',      valor: '1 245 000 MT', destaque: 'positive' },
        { label: 'Pendente',     valor: '580 300 MT',   destaque: 'negative' },
        { label: 'Ticket médio', valor: '2 340 MT' },
      ],
    },
    {
      titulo: 'Top infracções',
      linhas: [
        { label: 'Excesso velocidade', valor: '42%' },
        { label: 'Seguro expirado',    valor: '28%' },
        { label: 'Inspecção atraso',   valor: '18%' },
      ],
    },
  ],
  tabelaTitulo: 'Por província',
  tabelaColunas: ['Província', 'Emitidas', 'Pagas', 'Cobrado (MT)', 'Taxa'],
  linhasTabela: [
    ['Maputo Cidade',   '182', '128', '218 400 MT', '70%'],
    ['Maputo Província', '160', '90',  '361 900 MT', '56%'],
  ],
  valoresKpi: {
    emitidas:  { valor: 342, percentagem: '100%', barra: 100 },
    pagas:     { valor: 218, percentagem: '64%',  barra: 64 },
    pendentes: { valor: 89,  percentagem: '26%',  barra: 26 },
    contesta:  { valor: 35,  percentagem: '10%',  barra: 10 },
  },
  legendaTipo: 'generico',
}

// ============================================================
// ISSM
// ============================================================
const ISSM: DashboardConfig = {
  titulo: 'Painel ISSM',
  subtitulo: 'Apólices activas, sinistros e seguradoras licenciadas.',
  kpis: [
    { key: 'activas',     label: 'Activas',     variant: 'regular' },
    { key: 'expiradas',   label: 'Expiradas',   variant: 'critico' },
    { key: 'sinistros',   label: 'Sinistros',   variant: 'atencao' },
    { key: 'seguradoras', label: 'Seguradoras', variant: 'info' },
  ],
  filtros: [
    { key: 'de',         label: 'De',         tipo: 'date' },
    { key: 'ate',        label: 'Até',        tipo: 'date' },
    { key: 'seguradora', label: 'Seguradora', tipo: 'select', opcoes: ['Todas', 'Seguradora A', 'Seguradora B', 'Seguradora C'] },
    { key: 'estado',     label: 'Estado',     tipo: 'select', opcoes: ['Todos', 'Activa', 'Expirada', 'Sinistro'] },
  ],
  cards: [
    {
      titulo: 'Apólices',
      linhas: [
        { label: 'Emitidas este mês', valor: '342' },
        { label: 'A expirar (30d)',   valor: '58', destaque: 'negative' },
        { label: 'Renovadas',         valor: '201', destaque: 'positive' },
      ],
    },
    {
      titulo: 'Sinistros',
      linhas: [
        { label: 'Abertos',     valor: '24', destaque: 'negative' },
        { label: 'Resolvidos',  valor: '87', destaque: 'positive' },
        { label: 'Valor médio', valor: '45 300 MT' },
      ],
    },
  ],
  tabelaTitulo: 'Por seguradora',
  tabelaColunas: ['Seguradora', 'Apólices', 'Sinistros', 'Activas', 'Taxa'],
  linhasTabela: [
    ['Seguradora A', '180', '12', '158', '88%'],
    ['Seguradora B', '142', '8',  '128', '90%'],
    ['Seguradora C', '90',  '4',  '78',  '87%'],
  ],
  valoresKpi: {
    activas:     { valor: 412, percentagem: '82%', barra: 82 },
    expiradas:   { valor: 58,  percentagem: '12%', barra: 12 },
    sinistros:   { valor: 24,  percentagem: '5%',  barra: 5 },
    seguradoras: { valor: 8,   percentagem: '—',   barra: null },
  },
  legendaTipo: 'generico',
}

// ============================================================
// PRM
// ============================================================
const PRM: DashboardConfig = {
  titulo: 'Painel PRM',
  subtitulo: 'Hotlist activa, abordagens policiais e alertas operacionais.',
  kpis: [
    { key: 'hotlist',    label: 'Hotlist activa',   variant: 'critico' },
    { key: 'abordagens', label: 'Abordagens (12m)', variant: 'info' },
    { key: 'alertas',    label: 'Alertas abertos',  variant: 'atencao' },
    { key: 'perigoAlto', label: 'Perigo alto',      variant: 'critico' },
  ],
  filtros: [
    { key: 'de',     label: 'De',     tipo: 'date' },
    { key: 'ate',    label: 'Até',    tipo: 'date' },
    { key: 'motivo', label: 'Motivo', tipo: 'select', opcoes: ['Todos', 'Furtado', 'Clonagem suspeita', 'Mandado de captura'] },
    { key: 'nivel',  label: 'Nível',  tipo: 'select', opcoes: ['Todos', 'Alto', 'Médio', 'Baixo'] },
  ],
  cards: [
    {
      titulo: 'Hotlist',
      linhas: [
        { label: 'Furtados',          valor: '72', destaque: 'negative' },
        { label: 'Clonagem suspeita', valor: '34', destaque: 'negative' },
        { label: 'Mandados captura',  valor: '22' },
      ],
    },
    {
      titulo: 'Abordagens (últimos 30d)',
      linhas: [
        { label: 'Realizadas',     valor: '245' },
        { label: 'Com detenção',   valor: '18', destaque: 'negative' },
        { label: 'Sem incidentes', valor: '227', destaque: 'positive' },
      ],
    },
  ],
  tabelaTitulo: 'Hotlist por motivo',
  tabelaColunas: ['Motivo', 'Activos', 'Resolvidos', 'Tempo médio', 'Taxa'],
  linhasTabela: [
    ['Furtado',           '72', '38', '3,2 dias', '52%'],
    ['Clonagem suspeita', '34', '18', '5,1 dias', '34%'],
    ['Mandado captura',   '22', '12', '1,8 dias', '35%'],
  ],
  valoresKpi: {
    hotlist:    { valor: 128, percentagem: '100%', barra: 100 },
    abordagens: { valor: 245, percentagem: '—',    barra: null },
    alertas:    { valor: 12,  percentagem: '9%',   barra: 9 },
    perigoAlto: { valor: 34,  percentagem: '27%',  barra: 27 },
  },
  legendaTipo: 'generico',
}

// ============================================================
// Mapa final
// ============================================================
export const DASHBOARDS: Record<string, DashboardConfig> = {
  chefe:   CHEFE,
  inatro:  INATRO,
  gestmul: GESTMUL,
  issm:    ISSM,
  prm:     PRM,
}

export function getDashboard(perfil: string): DashboardConfig | null {
  return DASHBOARDS[perfil] ?? null
}