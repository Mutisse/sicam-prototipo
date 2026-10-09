<template>
  <q-page class="al-page">
    <!-- ============================================================ -->
    <!-- CABEÇALHO                                                     -->
    <!-- ============================================================ -->
    <header class="page-head">
      <div>
        <h1 class="page-head__title">Alertas</h1>
        <p class="page-head__sub">
          Alertas operacionais activos e histórico de ocorrências
        </p>
      </div>

      <div class="page-head__actions">
        <button class="page-btn page-btn--outline" @click="marcarTodosLidos">
          <q-icon name="done_all" size="18px" />
          Marcar lidos
        </button>
        <button class="page-btn page-btn--primary">
          <q-icon name="add" size="18px" />
          Novo alerta
        </button>
      </div>
    </header>

    <!-- ============================================================ -->
    <!-- KPIs                                                          -->
    <!-- ============================================================ -->
    <section class="kpi-grid">
      <article
        v-for="(k, i) in kpisVisiveis"
        :key="i"
        class="kpi-card"
        :class="`kpi-card--${k.variant}`"
      >
        <span class="kpi-card__glow" />

        <header class="kpi-card__head">
          <span class="kpi-card__label">{{ k.label }}</span>
        </header>

        <div class="kpi-card__body">
          <div class="kpi-card__value">
            {{ k.valor }}<span v-if="k.unidade" class="kpi-card__unid">{{ k.unidade }}</span>
          </div>

          <div class="kpi-card__icon">
            <q-icon :name="k.icon" size="26px" />
          </div>
        </div>

        <footer class="kpi-card__foot">
          <span
            v-if="k.trend"
            class="kpi-card__trend"
            :class="`kpi-card__trend--${k.trend.tipo}`"
          >
            <q-icon
              :name="k.trend.tipo === 'up' ? 'trending_up' : 'trending_down'"
              size="14px"
            />
            {{ k.trend.valor }}
          </span>
          <span v-if="k.sub" class="kpi-card__sub">{{ k.sub }}</span>
        </footer>
      </article>
    </section>

    <!-- ============================================================ -->
    <!-- FILTROS                                                       -->
    <!-- ============================================================ -->
    <section class="filters">
      <div class="filter filter--search">
        <q-icon name="search" size="20px" class="filter__icon" />
        <input
          v-model="pesquisa"
          type="text"
          class="filter__input"
          placeholder="Pesquisar alertas…"
        />
      </div>

      <select v-model="filtroNivel" class="filter filter__select">
        <option value="">Todos os níveis</option>
        <option value="critico">Crítico</option>
        <option value="atencao">Atenção</option>
        <option value="info">Informativo</option>
      </select>

      <select v-model="filtroTipo" class="filter filter__select">
        <option value="">Todos os tipos</option>
        <option value="hotlist">Hotlist</option>
        <option value="clonagem">Clonagem</option>
        <option value="sinistro">Sinistro</option>
        <option value="sistema">Sistema</option>
      </select>
    </section>

    <!-- ============================================================ -->
    <!-- ALERTAS ACTIVOS — estilo B (tag + título + meta)              -->
    <!-- ============================================================ -->
    <section v-if="alertasActivos.length" class="section">
      <header class="section__head">
        <h2 class="section__title">Alertas activos</h2>
        <span class="section__count">{{ alertasActivos.length }}</span>
      </header>

      <div class="alert-grid">
        <article
          v-for="a in alertasActivos"
          :key="a.id"
          class="alert-card"
          :class="`alert-card--${a.nivel}`"
        >
          <!-- Cabeçalho: tag tipo + hora -->
          <header class="alert-card__head">
            <span class="alert-tag" :class="`alert-tag--${a.tipo}`">
              {{ labelTipo(a.tipo) }}
            </span>
            <span class="alert-card__time">{{ a.hora }}</span>
          </header>

          <!-- Título + mensagem -->
          <h3 class="alert-card__title">{{ a.titulo }}</h3>
          <p class="alert-card__msg">{{ a.mensagem }}</p>

          <!-- Rodapé: referência/origem + acção -->
          <footer class="alert-card__foot">
            <div class="alert-card__refs">
              <span v-if="a.referencia" class="alert-ref">
                <q-icon name="directions_car" size="12px" />
                {{ a.referencia }}
              </span>
              <span v-if="a.origem" class="alert-orig">{{ a.origem }}</span>
            </div>

            <button class="alert-btn" @click="marcarLido(a.id)">
              <q-icon name="check" size="14px" />
              Lido
            </button>
          </footer>
        </article>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- HISTÓRICO — lista compacta                                    -->
    <!-- ============================================================ -->
    <section v-if="alertasLidos.length" class="section">
      <header class="section__head">
        <h2 class="section__title">Histórico</h2>
        <span class="section__count">{{ alertasLidos.length }}</span>
      </header>

      <div class="history-list">
        <div
          v-for="a in alertasLidos"
          :key="a.id"
          class="history-item"
        >
          <div class="history-item__left">
            <span class="alert-tag alert-tag--sm" :class="`alert-tag--${a.tipo}`">
              {{ labelTipo(a.tipo) }}
            </span>
          </div>

          <div class="history-item__body">
            <b class="history-item__title">{{ a.titulo }}</b>
            <p class="history-item__msg">{{ a.mensagem }}</p>
          </div>

          <span class="history-item__time">{{ a.hora }}</span>
        </div>
      </div>
    </section>

    <!-- Empty -->
    <div v-if="!filtrados.length" class="alert-empty">
      <q-icon name="notifications_off" size="48px" />
      <p>Nenhum alerta encontrado com estes filtros.</p>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// ============================================================
// Tipos
// ============================================================
type Nivel = 'critico' | 'atencao' | 'info'
type Tipo = 'hotlist' | 'clonagem' | 'sinistro' | 'sistema'

interface Alerta {
  id: number
  nivel: Nivel
  tipo: Tipo
  titulo: string
  mensagem: string
  hora: string
  referencia?: string
  origem?: string
  lido: boolean
}

interface KpiVisivel {
  variant: 'critico' | 'atencao' | 'regular' | 'info' | 'neutral'
  icon: string
  valor: number
  unidade?: string
  label: string
  sub?: string
  trend?: { tipo: 'up' | 'down'; valor: string }
}

// ============================================================
// Estado
// ============================================================
const pesquisa = ref('')
const filtroNivel = ref('')
const filtroTipo = ref('')

// ============================================================
// Dados fictícios
// ============================================================
const alertas = ref<Alerta[]>([
  {
    id: 1,
    nivel: 'critico',
    tipo: 'hotlist',
    titulo: 'Veículo em Hotlist detectado',
    mensagem: 'Matrícula AGL-482-MC detectada em Posto Baixa. Alerta enviado a todos os agentes da zona.',
    hora: 'há 3 min',
    referencia: 'AGL-482-MC',
    origem: 'Sistema automático',
    lido: false,
  },
  {
    id: 2,
    nivel: 'critico',
    tipo: 'clonagem',
    titulo: 'Suspeita de clonagem em curso',
    mensagem: 'Divergência detectada entre registo INATRO e observação em campo no Posto Namaacha. Confiança: 96%.',
    hora: 'há 18 min',
    referencia: 'AGL-482-MC',
    origem: 'Integração INATRO',
    lido: false,
  },
  {
    id: 3,
    nivel: 'atencao',
    tipo: 'hotlist',
    titulo: 'Veículo procurado avistado',
    mensagem: 'AEK-017-MP avistado na zona de Machava. Confirme abordagem com apoio.',
    hora: 'há 1 h',
    referencia: 'AEK-017-MP',
    origem: 'Agente Sitoe',
    lido: false,
  },
  {
    id: 4,
    nivel: 'atencao',
    tipo: 'sistema',
    titulo: 'Latência elevada na integração GESTMUL',
    mensagem: 'Tempo de resposta acima de 400 ms nos últimos 10 minutos. Consultas podem estar lentas.',
    hora: 'há 2 h',
    origem: 'Monitorização SICAM',
    lido: false,
  },
  {
    id: 5,
    nivel: 'atencao',
    tipo: 'sinistro',
    titulo: 'Sinistro reportado em Maputo Cidade',
    mensagem: 'Apólice referente à matrícula ABR-771-MP com sinistro aberto. Última actualização há 4 horas.',
    hora: 'há 4 h',
    referencia: 'ABR-771-MP',
    origem: 'Integração ISSM',
    lido: false,
  },
  // --- LIDOS ---
  {
    id: 6,
    nivel: 'info',
    tipo: 'sistema',
    titulo: 'Hotlist sincronizada',
    mensagem: '128 veículos sincronizados para 34 dispositivos móveis com sucesso.',
    hora: 'há 6 h',
    origem: 'Sincronização automática',
    lido: true,
  },
  {
    id: 7,
    nivel: 'info',
    tipo: 'hotlist',
    titulo: 'Veículo removido da Hotlist',
    mensagem: 'ABM-390-GZ foi removido após resolução do caso. Caso encerrado.',
    hora: 'há 8 h',
    referencia: 'ABM-390-GZ',
    origem: 'Chefe Mabunda',
    lido: true,
  },
  {
    id: 8,
    nivel: 'info',
    tipo: 'sistema',
    titulo: 'Backup diário concluído',
    mensagem: 'Backup automático da base de dados executado com sucesso às 03:00.',
    hora: 'há 12 h',
    origem: 'Sistema SICAM',
    lido: true,
  },
])

// ============================================================
// KPIs
// ============================================================
const totalCriticos = computed(() => alertas.value.filter((a) => a.nivel === 'critico' && !a.lido).length)
const totalAtencao = computed(() => alertas.value.filter((a) => a.nivel === 'atencao' && !a.lido).length)
const totalInfo = computed(() => alertas.value.filter((a) => a.nivel === 'info' && !a.lido).length)
const totalLidos = computed(() => alertas.value.filter((a) => a.lido).length)

const kpisVisiveis = computed<KpiVisivel[]>(() => [
  {
    variant: 'critico',
    icon: 'error',
    valor: totalCriticos.value,
    label: 'Críticos activos',
    sub: 'Requerem acção imediata',
    trend: { tipo: 'up', valor: '+2' },
  },
  {
    variant: 'atencao',
    icon: 'warning',
    valor: totalAtencao.value,
    label: 'Atenção',
    sub: 'Monitorizar',
    trend: { tipo: 'up', valor: '+1' },
  },
  {
    variant: 'info',
    icon: 'info',
    valor: totalInfo.value,
    label: 'Informativo',
    sub: 'Sem acção necessária',
  },
  {
    variant: 'regular',
    icon: 'check_circle',
    valor: totalLidos.value,
    label: 'Lidos',
    sub: 'No histórico',
    trend: { tipo: 'up', valor: '+5' },
  },
])

// ============================================================
// Filtrados
// ============================================================
const filtrados = computed(() => {
  return alertas.value.filter((a) => {
    if (pesquisa.value) {
      const q = pesquisa.value.toLowerCase()
      if (
        !a.titulo.toLowerCase().includes(q) &&
        !a.mensagem.toLowerCase().includes(q)
      ) return false
    }
    if (filtroNivel.value && a.nivel !== filtroNivel.value) return false
    if (filtroTipo.value && a.tipo !== filtroTipo.value) return false
    return true
  })
})

const alertasActivos = computed(() => filtrados.value.filter((a) => !a.lido))
const alertasLidos = computed(() => filtrados.value.filter((a) => a.lido))

// ============================================================
// Helpers
// ============================================================
function labelTipo(t: Tipo): string {
  if (t === 'hotlist') return 'Hotlist'
  if (t === 'clonagem') return 'Clonagem'
  if (t === 'sinistro') return 'Sinistro'
  return 'Sistema'
}

function marcarLido(id: number) {
  const a = alertas.value.find((x) => x.id === id)
  if (a && !a.lido) {
    a.lido = true
    $q.notify({
      type: 'positive',
      message: 'Alerta marcado como lido.',
      position: 'top',
      timeout: 1500,
    })
  }
}

function marcarTodosLidos() {
  alertas.value.forEach((a) => (a.lido = true))
  $q.notify({
    type: 'positive',
    message: 'Todos os alertas marcados como lidos.',
    position: 'top',
  })
}
</script>

<style scoped lang="scss">
.al-page { padding: 24px 20px 48px; max-width: 1180px; margin: 0 auto; }

// ============================================================
// Cabeçalho
// ============================================================
.page-head {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 16px; margin-bottom: 24px;
  @media (max-width: 700px) { flex-direction: column; }

  &__title { font-size: 24px; font-weight: 700; color: var(--sicam-ink); margin: 0 0 6px; }
  &__sub { font-size: 14px; color: var(--sicam-muted); margin: 0; }
  &__actions { display: flex; gap: 10px; flex-wrap: wrap; }
}

.page-btn {
  display: inline-flex; align-items: center; gap: 8px;
  border: 0; border-radius: 10px; padding: 10px 18px;
  font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit;
  transition: all 0.15s;

  &--primary { background: var(--sicam-primary-light); color: #fff;
    &:hover { background: var(--sicam-primary); } }
  &--outline { background: #fff; color: var(--sicam-ink); border: 1px solid var(--sicam-line);
    &:hover { background: var(--sicam-surface-hover); } }
}

// ============================================================
// KPIs
// ============================================================
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 450px) { grid-template-columns: 1fr; }
}

.kpi-card {
  position: relative;
  background: #fff;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--sicam-line-soft);
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
  transition: all 0.25s ease;

  &__glow {
    position: absolute;
    top: -40px; right: -40px;
    width: 120px; height: 120px;
    border-radius: 50%;
    opacity: 0.10;
    filter: blur(20px);
    transition: opacity 0.25s ease;
    pointer-events: none;
  }

  &:hover {
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
    transform: translateY(-4px);
    .kpi-card__glow { opacity: 0.18; }
  }

  &__head {
    display: flex; align-items: center; justify-content: space-between;
  }

  &__label {
    font-size: 11px; color: var(--sicam-muted);
    font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em;
  }

  &__body {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
  }

  &__value {
    font-size: 40px; font-weight: 700; color: var(--sicam-ink);
    line-height: 1; letter-spacing: -0.03em;
  }

  &__unid {
    font-size: 20px; font-weight: 600; color: var(--sicam-muted); margin-left: 2px;
  }

  &__icon {
    width: 52px; height: 52px; border-radius: 14px;
    display: grid; place-items: center; flex-shrink: 0;
    transition: transform 0.25s ease;

    .kpi-card:hover & { transform: scale(1.08) rotate(-3deg); }
  }

  &__foot {
    display: flex; align-items: center; justify-content: space-between;
    gap: 10px; padding-top: 12px;
    border-top: 1px solid var(--sicam-line-soft);
    margin-top: auto;
  }

  &__trend {
    display: inline-flex; align-items: center; gap: 3px;
    font-size: 11px; font-weight: 700;
    padding: 3px 8px; border-radius: 99px; flex-shrink: 0;

    &--up { background: var(--sicam-success-bg); color: var(--sicam-success-ink); }
    &--down { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
  }

  &__sub {
    font-size: 11px; color: var(--sicam-muted);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    text-align: right;
  }

  &--critico { .kpi-card__glow { background: var(--sicam-critical); } .kpi-card__icon { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); } }
  &--atencao { .kpi-card__glow { background: var(--sicam-warning); } .kpi-card__icon { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); } }
  &--regular { .kpi-card__glow { background: var(--sicam-success); } .kpi-card__icon { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); } }
  &--info    { .kpi-card__glow { background: #2563eb; } .kpi-card__icon { background: #dbeafe; color: #2563eb; } }
  &--neutral { .kpi-card__glow { background: var(--sicam-neutral); } .kpi-card__icon { background: var(--sicam-neutral-bg); color: var(--sicam-neutral-ink); } }
}

// ============================================================
// Filtros
// ============================================================
.filters { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }

.filter {
  display: flex; align-items: center; background: #fff;
  border: 1px solid var(--sicam-line); border-radius: 10px;
  padding: 0 14px; height: 42px; font-family: inherit;

  &--search { flex: 1; min-width: 240px; }
  &__icon { color: var(--sicam-muted); margin-right: 8px; flex-shrink: 0; }
  &__input {
    flex: 1; border: 0; background: transparent; font-size: 14px;
    color: var(--sicam-ink); height: 100%;
    &:focus { outline: 0; }
    &::placeholder { color: var(--sicam-muted); }
  }
  &__select {
    border: 0; background: transparent; font-size: 14px;
    color: var(--sicam-ink); height: 100%; cursor: pointer; min-width: 160px;
    &:focus { outline: 0; }
  }
}

// ============================================================
// Secções
// ============================================================
.section { margin-bottom: 32px;
  &__head {
    display: flex; align-items: baseline; gap: 10px;
    margin-bottom: 14px; padding: 0 4px;
  }
  &__title {
    font-size: 14px; font-weight: 700; color: var(--sicam-ink);
    margin: 0; text-transform: uppercase; letter-spacing: 0.05em;
  }
  &__count {
    background: var(--sicam-line-soft); color: var(--sicam-muted);
    font-size: 11px; font-weight: 700;
    padding: 2px 10px; border-radius: 99px;
  }
}

// ============================================================
// GRID DE ALERTAS ACTIVOS — estilo B
// ============================================================
.alert-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (max-width: 800px) { grid-template-columns: 1fr; }
}

.alert-card {
  position: relative;
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--sicam-line-soft);
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.07);
    transform: translateY(-2px);
  }

  // Cabeçalho: tag tipo + hora
  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 14px;
  }

  &__time {
    font-size: 12px;
    color: var(--sicam-muted);
    font-weight: 500;
  }

  // Título
  &__title {
    font-size: 16px;
    font-weight: 700;
    color: var(--sicam-ink);
    margin: 0 0 8px;
    line-height: 1.35;
  }

  // Mensagem
  &__msg {
    font-size: 13px;
    color: var(--sicam-ink-soft);
    line-height: 1.55;
    margin: 0 0 18px;
    flex: 1;
  }

  // Rodapé
  &__foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding-top: 14px;
    border-top: 1px solid var(--sicam-line-soft);
    margin-top: auto;
  }

  &__refs {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    min-width: 0;
  }
}

// ============================================================
// TAG DE TIPO
// ============================================================
.alert-tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;

  &--hotlist  { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
  &--clonagem { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
  &--sinistro { background: #dbeafe;                  color: #2563eb; }
  &--sistema  { background: var(--sicam-neutral-bg);  color: var(--sicam-neutral-ink); }

  &--sm { font-size: 9px; padding: 3px 8px; }
}

// ============================================================
// REFERÊNCIA E ORIGEM
// ============================================================
.alert-ref {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--sicam-line-soft);
  padding: 4px 10px;
  border-radius: 8px;
  font-weight: 700;
  color: var(--sicam-ink);
  font-size: 12px;
  letter-spacing: 0.02em;
}

.alert-orig {
  color: var(--sicam-muted);
  font-size: 12px;
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 160px;
}

// ============================================================
// BOTÃO LIDO
// ============================================================
.alert-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--sicam-primary-bg-alt);
  border: 1px solid var(--sicam-primary-bg);
  color: var(--sicam-primary);
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  flex-shrink: 0;

  &:hover {
    background: var(--sicam-primary-bg);
    border-color: #6ee7b7;
  }
}

// ============================================================
// HISTÓRICO (lidos) — lista compacta
// ============================================================
.history-list {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.history-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--sicam-line-soft);
  transition: background 0.15s;

  &:last-child { border-bottom: 0; }
  &:hover { background: var(--sicam-surface-alt); }

  &__left {
    flex-shrink: 0;
    width: 90px;
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__title {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: var(--sicam-ink);
    margin-bottom: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__msg {
    font-size: 12px;
    color: var(--sicam-muted);
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__time {
    font-size: 12px;
    color: var(--sicam-muted);
    flex-shrink: 0;
  }
}

// ============================================================
// Empty
// ============================================================
.alert-empty {
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  .q-icon { color: var(--sicam-line-strong); margin-bottom: 12px; }
  p { margin: 0; color: var(--sicam-muted); font-size: 14px; }
}
</style>