<template>
  <q-page class="vg-page">
    <!-- ============================================================ -->
    <!-- CABEÇALHO                                                     -->
    <!-- ============================================================ -->
    <header class="page-head">
      <div>
        <h1 class="page-head__title">Visão Geral</h1>
        <p class="page-head__sub">
          Resumo de multas, cobrança e desempenho do mês
        </p>
      </div>

      <div class="page-head__actions">
        <button class="page-btn page-btn--outline" @click="exportarCSV">
          <q-icon name="file_download" size="18px" />
          Excel
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
    <!-- GRÁFICOS                                                      -->
    <!-- ============================================================ -->
    <div class="charts-grid">
      <!-- Linha — Cobrança mensal -->
      <section class="chart-card">
        <header class="chart-card__head">
          <h2 class="chart-card__title">Cobrança mensal</h2>
          <span class="chart-card__sub">Últimos 6 meses (mil MT)</span>
        </header>

        <div class="chart-card__body">
          <svg viewBox="0 0 420 220" class="line-chart">
            <line
              v-for="(y, i) in gridY"
              :key="`gy-${i}`"
              :x1="40" :y1="y" :x2="410" :y2="y"
              class="line-chart__grid"
            />

            <text
              v-for="(label, i) in labelsY"
              :key="`ly-${i}`"
              :x="30" :y="gridY[i]! + 4"
              class="line-chart__axis"
              text-anchor="end"
            >{{ label }}</text>

            <path :d="areaPath" class="line-chart__area" />
            <path :d="linePath" class="line-chart__line" />

            <circle
              v-for="(p, i) in pontos"
              :key="`p-${i}`"
              :cx="p.x" :cy="p.y" r="4"
              class="line-chart__dot"
            />

            <text
              v-for="(label, i) in labelsX"
              :key="`lx-${i}`"
              :x="40 + i * (370 / (labelsX.length - 1))"
              :y="215"
              class="line-chart__axis"
              text-anchor="middle"
            >{{ label }}</text>
          </svg>
        </div>
      </section>

      <!-- Anel — Taxa de cobrança -->
      <section class="chart-card">
        <header class="chart-card__head">
          <h2 class="chart-card__title">Taxa de cobrança</h2>
          <span class="chart-card__sub">Este mês</span>
        </header>

        <div class="chart-card__body chart-card__body--ring">
          <div class="ring">
            <svg viewBox="0 0 100 100" class="ring__svg">
              <circle cx="50" cy="50" r="42" class="ring__track" />
              <circle
                cx="50" cy="50" r="42"
                class="ring__progress"
                :stroke-dasharray="circunferencia"
                :stroke-dashoffset="offsetRing"
              />
            </svg>
            <div class="ring__center">
              <div class="ring__value">{{ taxaCobranca }}</div>
              <div class="ring__label">%</div>
            </div>
          </div>

          <div class="ring-legend">
            <div class="ring-legend__item">
              <span class="ring-legend__dot ring-legend__dot--success" />
              Cobrado
              <b>{{ formatar(1284) }}</b>
            </div>
            <div class="ring-legend__item">
              <span class="ring-legend__dot ring-legend__dot--critical" />
              Pendente
              <b>{{ formatar(580) }}</b>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- ============================================================ -->
    <!-- BARRAS — Top infrações                                        -->
    <!-- ============================================================ -->
    <section class="chart-card">
      <header class="chart-card__head">
        <h2 class="chart-card__title">Top infrações</h2>
        <span class="chart-card__sub">Distribuição percentual</span>
      </header>

      <div class="chart-card__body">
        <div class="bar-chart">
          <div
            v-for="(b, i) in topInfracoes"
            :key="i"
            class="bar-chart__row"
          >
            <div class="bar-chart__label">{{ b.nome }}</div>
            <div class="bar-chart__bar">
              <div
                class="bar-chart__fill"
                :style="{ width: `${b.percentagem}%` }"
              />
            </div>
            <div class="bar-chart__value">{{ b.percentagem }}%</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- TABELA — Desempenho por província                             -->
    <!-- ============================================================ -->
    <section class="block">
      <header class="block__head">
        <h2 class="block__title">Desempenho por província</h2>
        <span class="block__sub">Este mês</span>
      </header>

      <table class="data-table">
        <thead>
          <tr>
            <th>Província</th>
            <th>Emitidas</th>
            <th>Pagas</th>
            <th>Cobrado (MT)</th>
            <th>Taxa</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in desempenhoProvincia" :key="p.provincia">
            <td><b>{{ p.provincia }}</b></td>
            <td>{{ p.emitidas }}</td>
            <td class="text-success">{{ p.pagas }}</td>
            <td class="text-bold">{{ p.cobrado }}</td>
            <td>
              <div class="taxa">
                <div class="taxa__bar">
                  <div class="taxa__fill" :style="{ width: `${p.taxa}%` }" />
                </div>
                <span class="taxa__value">{{ p.taxa }}%</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// ============================================================
// KPIs
// ============================================================
const kpis = ref({
  emitidas: 342,
  pagas: 218,
  pendentes: 89,
  contestadas: 35,
  cobrado: 1245000,
  pendenteValor: 580300,
  ticketMedio: 2340,
  taxaCobranca: 64,
})

interface KpiVisivel {
  variant: 'critico' | 'atencao' | 'regular' | 'info' | 'neutral'
  icon: string
  valor: string | number
  unidade?: string
  label: string
  sub?: string
  trend?: { tipo: 'up' | 'down'; valor: string }
}

const kpisVisiveis = computed<KpiVisivel[]>(() => [
  {
    variant: 'info',
    icon: 'receipt_long',
    valor: kpis.value.emitidas,
    label: 'Emitidas (mês)',
    sub: 'Total este mês',
    trend: { tipo: 'up', valor: '+12%' },
  },
  {
    variant: 'regular',
    icon: 'check_circle',
    valor: kpis.value.pagas,
    label: 'Pagas',
    sub: `${kpis.value.taxaCobranca}% do total`,
    trend: { tipo: 'up', valor: '+8%' },
  },
  {
    variant: 'regular',
    icon: 'attach_money',
    valor: formatar(kpis.value.cobrado),
    unidade: 'MT',
    label: 'Cobrado',
    sub: 'Valor total',
    trend: { tipo: 'up', valor: '+15%' },
  },
  {
    variant: 'atencao',
    icon: 'hourglass_top',
    valor: formatar(kpis.value.pendenteValor),
    unidade: 'MT',
    label: 'Pendente',
    sub: 'Por cobrar',
    trend: { tipo: 'down', valor: '-4%' },
  },
  {
    variant: 'neutral',
    icon: 'receipt',
    valor: formatar(kpis.value.ticketMedio),
    unidade: 'MT',
    label: 'Ticket médio',
    sub: 'Por multa',
  },
])

function formatar(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')
}

// ============================================================
// Gráfico de linha — Cobrança mensal (mil MT)
// ============================================================
const valores: number[] = [820, 1050, 980, 1180, 1090, 1245]
const labelsX: string[] = ['Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set']

const maxY = Math.ceil(Math.max(...valores) / 200) * 200
const labelsY: number[] = [0, maxY / 2, maxY]
const gridY: number[] = [20, 110, 200]

interface Ponto { x: number; y: number }

const pontos = computed<Ponto[]>(() =>
  valores.map((v, i) => ({
    x: 40 + i * (370 / (valores.length - 1)),
    y: 200 - (v / maxY) * 180,
  })),
)

const linePath = computed(() => {
  const pts = pontos.value
  if (pts.length === 0) return ''
  return pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ')
})

const areaPath = computed(() => {
  const pts = pontos.value
  if (pts.length === 0) return ''
  const first = pts[0]
  const last = pts[pts.length - 1]
  if (!first || !last) return ''
  const line = pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ')
  return `${line} L${last.x},200 L${first.x},200 Z`
})

// ============================================================
// Anel — Taxa de cobrança
// ============================================================
const RAIO = 42
const circunferencia = 2 * Math.PI * RAIO

const taxaCobranca = computed(() => kpis.value.taxaCobranca)

const offsetRing = computed(() => {
  const p = taxaCobranca.value
  return circunferencia * (1 - p / 100)
})

// ============================================================
// Barras — Top infrações
// ============================================================
const topInfracoes = [
  { nome: 'Excesso de velocidade', percentagem: 42 },
  { nome: 'Seguro expirado',       percentagem: 28 },
  { nome: 'Inspecção em atraso',   percentagem: 18 },
  { nome: 'Documentos em falta',   percentagem: 12 },
]

// ============================================================
// Tabela — Desempenho por província
// ============================================================
const desempenhoProvincia = [
  { provincia: 'Maputo Cidade',    emitidas: 182, pagas: 128, cobrado: '718 400', taxa: 70 },
  { provincia: 'Maputo Província', emitidas: 160, pagas: 90,  cobrado: '361 900', taxa: 56 },
  { provincia: 'Gaza',             emitidas: 42,  pagas: 28,  cobrado: '124 800', taxa: 67 },
  { provincia: 'Sofala',           emitidas: 34,  pagas: 18,  cobrado: '68 200',  taxa: 53 },
  { provincia: 'Inhambane',        emitidas: 18,  pagas: 12,  cobrado: '41 700',  taxa: 67 },
]

// ============================================================
// Exportar
// ============================================================
function exportarCSV() {
  const linhas: string[][] = [
    ['SICAM — GESTMUL — Visão Geral'],
    [`Gerado em: ${new Date().toLocaleString('pt-PT')}`],
    [],
    ['RESUMO'],
    ['Emitidas', String(kpis.value.emitidas)],
    ['Pagas', String(kpis.value.pagas)],
    ['Pendentes', String(kpis.value.pendentes)],
    ['Contestadas', String(kpis.value.contestadas)],
    ['Cobrado (MT)', String(kpis.value.cobrado)],
    ['Pendente (MT)', String(kpis.value.pendenteValor)],
    [],
    ['DESEMPENHO POR PROVÍNCIA'],
    ['Província', 'Emitidas', 'Pagas', 'Cobrado (MT)', 'Taxa'],
    ...desempenhoProvincia.map((p) => [
      p.provincia, String(p.emitidas), String(p.pagas), p.cobrado, `${p.taxa}%`,
    ]),
  ]

  const csv = linhas
    .map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `gestmul-visao-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)

  $q.notify({ type: 'positive', message: 'CSV exportado.', position: 'top' })
}
</script>

<style scoped lang="scss">
.vg-page { padding: 24px 20px 48px; max-width: 1180px; margin: 0 auto; }

// ============================================================
// Cabeçalho
// ============================================================
.page-head {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 16px; margin-bottom: 20px;
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

  &--outline { background: #fff; color: var(--sicam-ink); border: 1px solid var(--sicam-line);
    &:hover { background: var(--sicam-surface-hover); } }
}

// ============================================================
// KPIs modernos
// ============================================================
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
  margin-bottom: 24px;

  @media (max-width: 1100px) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 800px)  { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 450px)  { grid-template-columns: 1fr; }
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
    font-size: 28px; font-weight: 700; color: var(--sicam-ink);
    line-height: 1; letter-spacing: -0.03em;
  }

  &__unid {
    font-size: 16px; font-weight: 600; color: var(--sicam-muted); margin-left: 2px;
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
// Charts
// ============================================================
.charts-grid {
  display: grid; grid-template-columns: 1.4fr 1fr;
  gap: 20px; margin-bottom: 20px;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
}

.chart-card {
  background: #fff; border-radius: 14px; padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04); margin-bottom: 20px;

  &__head {
    display: flex; align-items: baseline; justify-content: space-between;
    margin-bottom: 16px;
  }
  &__title { font-size: 15px; font-weight: 700; color: var(--sicam-ink); margin: 0; }
  &__sub { font-size: 12px; color: var(--sicam-muted); }
  &__body { width: 100%; }
  &__body--ring {
    display: flex; align-items: center; justify-content: space-around;
    gap: 24px;
    @media (max-width: 500px) { flex-direction: column; }
  }
}

// Linha
.line-chart {
  width: 100%; height: auto;

  &__grid { stroke: var(--sicam-line-soft); stroke-width: 1; }
  &__axis { font-size: 10px; fill: var(--sicam-muted); font-family: var(--sicam-font-family); }
  &__area { fill: rgba(5, 150, 105, 0.12); }
  &__line {
    fill: none; stroke: var(--sicam-primary-light); stroke-width: 2.5;
    stroke-linecap: round; stroke-linejoin: round;
  }
  &__dot { fill: #fff; stroke: var(--sicam-primary-light); stroke-width: 2.5; }
}

// Anel
.ring {
  position: relative; width: 160px; height: 160px; flex-shrink: 0;

  &__svg { width: 100%; height: 100%; transform: rotate(-90deg); }
  &__track { fill: none; stroke: var(--sicam-line-soft); stroke-width: 10; }
  &__progress {
    fill: none; stroke: var(--sicam-success); stroke-width: 10;
    stroke-linecap: round; transition: stroke-dashoffset 0.6s ease;
  }
  &__center {
    position: absolute; inset: 0; display: flex; align-items: center;
    justify-content: center; gap: 2px; pointer-events: none;
  }
  &__value { font-size: 34px; font-weight: 700; color: var(--sicam-ink); line-height: 1; }
  &__label { font-size: 16px; font-weight: 600; color: var(--sicam-muted); padding-bottom: 4px; }
}

.ring-legend {
  display: flex; flex-direction: column; gap: 12px;

  &__item {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; color: var(--sicam-ink-soft);
    b { color: var(--sicam-ink); font-weight: 700; margin-left: auto; }
  }
  &__dot {
    width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
    &--success  { background: var(--sicam-success); }
    &--critical { background: var(--sicam-critical); }
  }
}

// Barras
.bar-chart {
  display: flex; flex-direction: column; gap: 14px;

  &__row {
    display: grid; grid-template-columns: 200px 1fr 60px;
    align-items: center; gap: 12px;
    @media (max-width: 600px) { grid-template-columns: 130px 1fr 50px; }
  }
  &__label {
    font-size: 13px; color: var(--sicam-ink); text-align: right;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  &__bar { height: 10px; background: var(--sicam-line-soft); border-radius: 99px; overflow: hidden; }
  &__fill {
    height: 100%; background: var(--sicam-primary-light);
    border-radius: 99px; transition: width 0.5s ease;
  }
  &__value { font-size: 13px; font-weight: 700; color: var(--sicam-ink); text-align: right; }
}

// ============================================================
// Blocos / Tabelas
// ============================================================
.block {
  background: #fff; border-radius: 14px; overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04); margin-bottom: 20px;

  &__head {
    display: flex; align-items: baseline; justify-content: space-between;
    padding: 18px 20px 14px;
    border-bottom: 1px solid var(--sicam-line-soft);
  }
  &__title { font-size: 15px; font-weight: 700; color: var(--sicam-ink); margin: 0; }
  &__sub { font-size: 12px; color: var(--sicam-muted); }
}

.data-table {
  width: 100%; border-collapse: collapse;

  th {
    text-align: left; font-size: 11px; font-weight: 600; color: var(--sicam-muted);
    letter-spacing: 0.05em; text-transform: uppercase; padding: 12px 16px;
    background: #fafbfa; border-bottom: 1px solid var(--sicam-line); white-space: nowrap;
  }
  td {
    padding: 14px 16px; font-size: 14px; color: var(--sicam-ink);
    border-bottom: 1px solid var(--sicam-line-soft); vertical-align: middle;
  }
  tr:last-child td { border-bottom: 0; }
  tbody tr:hover { background: #fbfdfc; }
}

.text-success { color: var(--sicam-success); font-weight: 600; }
.text-bold { font-weight: 700; }

.taxa {
  display: flex; align-items: center; gap: 10px;

  &__bar {
    width: 70px; height: 6px; background: var(--sicam-line-soft);
    border-radius: 99px; overflow: hidden;
  }
  &__fill {
    height: 100%; background: var(--sicam-primary-light);
    border-radius: 99px; transition: width 0.4s ease;
  }
  &__value { font-size: 13px; font-weight: 600; color: var(--sicam-ink); }
}
</style>