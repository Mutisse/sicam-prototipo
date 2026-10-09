<template>
  <q-page class="monitor-page">
    <!-- ============================================================ -->
    <!-- CABEÇALHO                                                     -->
    <!-- ============================================================ -->
    <header class="monitor-head">
      <div>
        <h1 class="monitor-head__title">Monitorização do Sistema</h1>
        <p class="monitor-head__sub">
          Estado dos serviços, recursos e integrações em tempo real
        </p>
      </div>

      <div class="monitor-head__actions">
        <span class="monitor-status" :class="`monitor-status--${estadoGeral}`">
          <span class="monitor-status__dot" />
          {{ estadoGeralTexto }}
        </span>

        <button class="monitor-refresh" @click="carregar">
          <q-icon name="refresh" size="18px" :class="{ spinning: carregando }" />
          Actualizar
        </button>
      </div>
    </header>

    <!-- ============================================================ -->
    <!-- KPIs DE RECURSOS — gráficos em anel                           -->
    <!-- ============================================================ -->
    <section class="monitor-kpis">
      <div
        v-for="kpi in kpisRecursos"
        :key="kpi.key"
        class="monitor-kpi"
        :class="`monitor-kpi--${kpi.nivel}`"
      >
        <div class="monitor-kpi__label">
          <q-icon :name="kpi.icon" size="16px" />
          {{ kpi.label }}
        </div>

        <div class="monitor-kpi__ring">
          <svg viewBox="0 0 100 100" class="monitor-kpi__svg">
            <!-- Trilho -->
            <circle
              cx="50"
              cy="50"
              r="42"
              class="monitor-kpi__track"
            />
            <!-- Progresso -->
            <circle
              cx="50"
              cy="50"
              r="42"
              class="monitor-kpi__progress"
              :class="`monitor-kpi__progress--${kpi.nivel}`"
              :stroke-dasharray="circunferencia"
              :stroke-dashoffset="offset(kpi.percentagem)"
            />
          </svg>

          <div class="monitor-kpi__center">
            <div class="monitor-kpi__value">{{ kpi.valor }}</div>
            <div class="monitor-kpi__unidade">{{ kpi.unidade }}</div>
          </div>
        </div>

        <div class="monitor-kpi__foot">{{ kpi.detalhe }}</div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- GRID: INTEGRAÇÕES + ACTIVIDADE                                -->
    <!-- ============================================================ -->
    <div class="monitor-grid">
      <!-- Integrações -->
      <section class="monitor-card">
        <header class="monitor-card__head">
          <h2 class="monitor-card__title">Integrações</h2>
          <span class="monitor-card__count">
            {{ integracoes.length }} conectores
          </span>
        </header>

        <ul class="monitor-integ">
          <li
            v-for="i in integracoes"
            :key="i.nome"
            class="monitor-integ__item"
          >
            <div class="monitor-integ__left">
              <span
                class="monitor-integ__status"
                :class="`monitor-integ__status--${i.estado}`"
              />
              <div>
                <b>{{ i.nome }}</b>
                <small>{{ i.descricao }}</small>
              </div>
            </div>

            <div class="monitor-integ__right">
              <span
                class="monitor-integ__lat"
                :class="`monitor-integ__lat--${i.estado}`"
              >
                {{ i.latencia }} ms
              </span>
              <small class="monitor-integ__time">{{ i.ultimaResposta }}</small>
            </div>
          </li>
        </ul>
      </section>

      <!-- Actividade -->
      <section class="monitor-card">
        <header class="monitor-card__head">
          <h2 class="monitor-card__title">Actividade</h2>
        </header>

        <div class="monitor-metric">
          <div class="monitor-metric__label">Uptime</div>
          <div class="monitor-metric__value">{{ metricas.uptime }}</div>
          <div class="monitor-metric__sub">desde {{ metricas.uptimeDesde }}</div>
        </div>

        <div class="monitor-metric">
          <div class="monitor-metric__label">Pedidos por minuto</div>
          <div class="monitor-metric__value">{{ metricas.pedidosMin }}</div>
          <div class="monitor-metric__sub">
            pico: {{ metricas.picoPedidos }}/min
          </div>
        </div>

        <div class="monitor-metric">
          <div class="monitor-metric__label">Tempo médio de resposta</div>
          <div class="monitor-metric__value">{{ metricas.tempoMedio }} ms</div>
          <div class="monitor-metric__sub">meta: &lt; 300 ms</div>
        </div>

        <div class="monitor-metric">
          <div class="monitor-metric__label">Cache</div>
          <div class="monitor-metric__value">{{ metricas.cacheHit }}%</div>
          <div class="monitor-metric__sub">taxa de acerto</div>
        </div>
      </section>
    </div>

    <!-- ============================================================ -->
    <!-- ALERTAS ACTIVOS                                               -->
    <!-- ============================================================ -->
    <section class="monitor-card">
      <header class="monitor-card__head">
        <h2 class="monitor-card__title">Alertas activos</h2>
        <span class="monitor-card__count">{{ alertas.length }}</span>
      </header>

      <ul v-if="alertas.length" class="monitor-alertas">
        <li
          v-for="(a, i) in alertas"
          :key="i"
          class="monitor-alerta"
          :class="`monitor-alerta--${a.nivel}`"
        >
          <q-icon :name="a.icon" size="20px" class="monitor-alerta__icon" />
          <div class="monitor-alerta__body">
            <b>{{ a.titulo }}</b>
            <span>{{ a.descricao }}</span>
          </div>
          <span class="monitor-alerta__time">{{ a.hora }}</span>
        </li>
      </ul>

      <div v-else class="monitor-vazio">
        <q-icon name="check_circle" size="40px" />
        <p>Sem alertas activos. Sistema a funcionar normalmente.</p>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// ============================================================
// Tipos
// ============================================================
type Nivel = 'regular' | 'atencao' | 'critico'

interface KpiRecurso {
  key: string
  label: string
  icon: string
  valor: number
  unidade: string
  percentagem: number
  nivel: Nivel
  detalhe: string
}

interface Integracao {
  nome: string
  descricao: string
  estado: Nivel
  latencia: number
  ultimaResposta: string
}

interface Alerta {
  nivel: 'atencao' | 'critico' | 'info'
  icon: string
  titulo: string
  descricao: string
  hora: string
}

// ============================================================
// Estado
// ============================================================
const carregando = ref(false)

// ------------------------------------------------------------
// Cálculo do anel SVG
// ------------------------------------------------------------
const RAIO = 42
const circunferencia = 2 * Math.PI * RAIO

function offset(percentagem: number): number {
  const p = Math.min(100, Math.max(0, percentagem))
  return circunferencia * (1 - p / 100)
}

// ------------------------------------------------------------
// KPIs de recursos (mock)
// ------------------------------------------------------------
const kpisRecursos = ref<KpiRecurso[]>([
  {
    key: 'cpu',
    label: 'CPU',
    icon: 'memory',
    valor: 42,
    unidade: '%',
    percentagem: 42,
    nivel: 'regular',
    detalhe: '4 vCPU · 2.4 GHz',
  },
  {
    key: 'ram',
    label: 'Memória',
    icon: 'developer_board',
    valor: 68,
    unidade: '%',
    percentagem: 68,
    nivel: 'atencao',
    detalhe: '5.4 GB de 8 GB',
  },
  {
    key: 'disco',
    label: 'Disco',
    icon: 'storage',
    valor: 34,
    unidade: '%',
    percentagem: 34,
    nivel: 'regular',
    detalhe: '68 GB de 200 GB',
  },
  {
    key: 'latencia',
    label: 'Latência',
    icon: 'speed',
    valor: 212,
    unidade: 'ms',
    percentagem: 71,
    nivel: 'regular',
    detalhe: 'meta: < 300 ms',
  },
])

// ------------------------------------------------------------
// Integrações (mock)
// ------------------------------------------------------------
const integracoes = ref<Integracao[]>([
  {
    nome: 'INATRO',
    descricao: 'Registo, matrícula e inspecção',
    estado: 'regular',
    latencia: 118,
    ultimaResposta: 'há 2 min',
  },
  {
    nome: 'PRM',
    descricao: 'Fiscalização e Hotlist',
    estado: 'regular',
    latencia: 64,
    ultimaResposta: 'há 1 min',
  },
  {
    nome: 'Gestão de Multas',
    descricao: 'Infrações e cobranças',
    estado: 'atencao',
    latencia: 412,
    ultimaResposta: 'há 9 min',
  },
  {
    nome: 'ISSM / Seguradoras',
    descricao: 'Seguro obrigatório',
    estado: 'regular',
    latencia: 187,
    ultimaResposta: 'há 4 min',
  },
])

// ------------------------------------------------------------
// Métricas gerais (mock)
// ------------------------------------------------------------
const metricas = ref({
  uptime: '14d 6h 32m',
  uptimeDesde: '09/09 03:15',
  pedidosMin: 142,
  picoPedidos: 380,
  tempoMedio: 212,
  cacheHit: 71,
})

// ------------------------------------------------------------
// Alertas (mock)
// ------------------------------------------------------------
const alertas = ref<Alerta[]>([
  {
    nivel: 'atencao',
    icon: 'warning',
    titulo: 'GESTMUL com latência elevada',
    descricao: 'Tempo de resposta acima de 400 ms nos últimos 10 minutos.',
    hora: 'há 9 min',
  },
  {
    nivel: 'info',
    icon: 'info',
    titulo: '17 dispositivos sem sincronizar',
    descricao: 'Última sincronização há mais de 24 horas.',
    hora: 'há 1 h',
  },
])

// ============================================================
// Estado geral
// ============================================================
const estadoGeral = computed<Nivel>(() => {
  if (alertas.value.some((a) => a.nivel === 'critico')) return 'critico'
  if (alertas.value.some((a) => a.nivel === 'atencao')) return 'atencao'
  return 'regular'
})

const estadoGeralTexto = computed(() => {
  if (estadoGeral.value === 'critico') return 'Estado crítico'
  if (estadoGeral.value === 'atencao') return 'Atenção'
  return 'Sistema saudável'
})

// ============================================================
// Acções
// ============================================================
function carregar() {
  carregando.value = true
  setTimeout(() => (carregando.value = false), 800)
}
</script>

<style scoped lang="scss">
.monitor-page {
  padding: 24px 20px 48px;
  max-width: 1180px;
  margin: 0 auto;
}

// ============================================================
// Cabeçalho
// ============================================================
.monitor-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 700px) { flex-direction: column; }

  &__title {
    font-size: 24px;
    font-weight: 700;
    color: var(--sicam-ink);
    margin: 0 0 6px;
  }

  &__sub {
    font-size: 14px;
    color: var(--sicam-muted);
    margin: 0;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }
}

.monitor-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 99px;
  font-size: 13px;
  font-weight: 600;

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
    animation: pulse 2s infinite;
  }

  &--regular { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
  &--atencao { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
  &--critico { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
}

.monitor-refresh {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border: 1px solid var(--sicam-line);
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--sicam-ink);
  cursor: pointer;
  font-family: inherit;
  transition: background var(--sicam-transition-fast);

  &:hover { background: var(--sicam-surface-hover); }

  .spinning { animation: spin 1s linear infinite; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

// ============================================================
// KPIs com anel
// ============================================================
.monitor-kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 20px;

  @media (max-width: 1000px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 500px)  { grid-template-columns: 1fr; }
}

.monitor-kpi {
  background: #fff;
  border-radius: 14px;
  padding: 20px 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  border-top: 3px solid transparent;

  &--regular { border-top-color: var(--sicam-success); }
  &--atencao { border-top-color: var(--sicam-warning); }
  &--critico { border-top-color: var(--sicam-critical); }

  &__label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    color: var(--sicam-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 14px;

    .q-icon { color: var(--sicam-muted); }
  }

  &__ring {
    position: relative;
    width: 120px;
    height: 120px;
    margin-bottom: 12px;
  }

  &__svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  &__track {
    fill: none;
    stroke: var(--sicam-line-soft);
    stroke-width: 8;
  }

  &__progress {
    fill: none;
    stroke-width: 8;
    stroke-linecap: round;
    transition: stroke-dashoffset 0.6s ease;

    &--regular { stroke: var(--sicam-success); }
    &--atencao { stroke: var(--sicam-warning); }
    &--critico { stroke: var(--sicam-critical); }
  }

  &__center {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  &__value {
    font-size: 26px;
    font-weight: 700;
    color: var(--sicam-ink);
    line-height: 1;
  }

  &__unidade {
    font-size: 12px;
    font-weight: 600;
    color: var(--sicam-muted);
    margin-left: 2px;
    padding-bottom: 2px;
  }

  &__foot {
    font-size: 11px;
    color: var(--sicam-muted);
    text-align: center;
  }
}

// ============================================================
// Grid
// ============================================================
.monitor-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 900px) { grid-template-columns: 1fr; }
}

// ============================================================
// Card
// ============================================================
.monitor-card {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  &__head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__title {
    font-size: 15px;
    font-weight: 700;
    color: var(--sicam-ink);
    margin: 0;
  }

  &__count {
    font-size: 12px;
    color: var(--sicam-muted);
    background: var(--sicam-line-soft);
    padding: 2px 10px;
    border-radius: 99px;
    font-weight: 600;
  }
}

// ============================================================
// Integrações
// ============================================================
.monitor-integ {
  list-style: none;
  padding: 0;
  margin: 0;

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 0;
    border-top: 1px solid var(--sicam-line-soft);

    &:first-child { border-top: 0; padding-top: 0; }
    &:last-child  { padding-bottom: 0; }
  }

  &__left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;

    b { display: block; font-size: 14px; color: var(--sicam-ink); margin-bottom: 2px; }
    small { display: block; font-size: 12px; color: var(--sicam-muted); }
  }

  &__status {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;

    &--regular { background: var(--sicam-success); box-shadow: 0 0 0 3px var(--sicam-success-bg); }
    &--atencao { background: var(--sicam-warning); box-shadow: 0 0 0 3px var(--sicam-warning-bg); }
    &--critico { background: var(--sicam-critical); box-shadow: 0 0 0 3px var(--sicam-critical-bg); }
  }

  &__right { text-align: right; flex-shrink: 0; }

  &__lat {
    display: block;
    font-size: 14px;
    font-weight: 700;

    &--regular { color: var(--sicam-success); }
    &--atencao { color: var(--sicam-warning); }
    &--critico { color: var(--sicam-critical); }
  }

  &__time {
    display: block;
    font-size: 11px;
    color: var(--sicam-muted);
    margin-top: 2px;
  }
}

// ============================================================
// Métricas
// ============================================================
.monitor-metric {
  padding: 14px 0;
  border-top: 1px solid var(--sicam-line-soft);

  &:first-child { border-top: 0; padding-top: 0; }
  &:last-child  { padding-bottom: 0; }

  &__label {
    font-size: 12px;
    color: var(--sicam-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 4px;
  }

  &__value {
    font-size: 22px;
    font-weight: 700;
    color: var(--sicam-ink);
    line-height: 1;
  }

  &__sub {
    font-size: 12px;
    color: var(--sicam-muted);
    margin-top: 4px;
  }
}

// ============================================================
// Alertas
// ============================================================
.monitor-alertas { list-style: none; padding: 0; margin: 0; }

.monitor-alerta {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border-radius: 10px;
  margin-bottom: 8px;

  &:last-child { margin-bottom: 0; }

  &--atencao {
    background: var(--sicam-warning-bg);
    .monitor-alerta__icon { color: var(--sicam-warning-ink); }
    b { color: var(--sicam-warning-ink); }
  }

  &--critico {
    background: var(--sicam-critical-bg);
    .monitor-alerta__icon { color: var(--sicam-critical-ink); }
    b { color: var(--sicam-critical-ink); }
  }

  &--info {
    background: var(--sicam-line-soft);
    .monitor-alerta__icon { color: var(--sicam-muted); }
    b { color: var(--sicam-ink); }
  }

  &__icon { flex-shrink: 0; margin-top: 2px; }

  &__body {
    flex: 1;
    min-width: 0;

    b { display: block; font-size: 14px; margin-bottom: 2px; }
    span { display: block; font-size: 12px; color: var(--sicam-ink-soft); line-height: 1.4; }
  }

  &__time {
    font-size: 11px;
    color: var(--sicam-muted);
    flex-shrink: 0;
    margin-top: 2px;
  }
}

.monitor-vazio {
  text-align: center;
  padding: 40px 20px;
  color: var(--sicam-muted);

  .q-icon { color: var(--sicam-success); margin-bottom: 8px; }
  p { margin: 0; font-size: 14px; }
}
</style>