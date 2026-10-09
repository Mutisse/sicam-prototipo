<template>
  <q-page class="rel-page">
    <!-- ============================================================ -->
    <!-- CABEÇALHO                                                     -->
    <!-- ============================================================ -->
    <header class="page-head">
      <div>
        <h1 class="page-head__title">Relatórios</h1>
        <p class="page-head__sub">
          Análise de apólices, sinistros e desempenho por seguradora
        </p>
      </div>

      <div class="page-head__actions">
        <button class="page-btn page-btn--outline" @click="exportarCSV">
          <q-icon name="grid_on" size="18px" />
          Excel (CSV)
        </button>
        <button class="page-btn page-btn--outline" @click="exportarPDF">
          <q-icon name="picture_as_pdf" size="18px" />
          PDF
        </button>
      </div>
    </header>

    <!-- ============================================================ -->
    <!-- PERÍODO                                                       -->
    <!-- ============================================================ -->
    <section class="period">
      <div class="period__field">
        <label class="period__label">De</label>
        <input v-model="dataDe" type="date" class="period__input" />
      </div>
      <div class="period__field">
        <label class="period__label">Até</label>
        <input v-model="dataAte" type="date" class="period__input" />
      </div>
      <button class="period__btn" @click="aplicarFiltro">Aplicar</button>
    </section>

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
      <!-- Linha — Apólices por mês -->
      <section class="chart-card">
        <header class="chart-card__head">
          <h2 class="chart-card__title">Apólices emitidas por mês</h2>
          <span class="chart-card__sub">Últimos 6 meses</span>
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

      <!-- Anel — Taxa de sinistralidade -->
      <section class="chart-card">
        <header class="chart-card__head">
          <h2 class="chart-card__title">Taxa de sinistralidade</h2>
          <span class="chart-card__sub">Sinistros / Apólices</span>
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
              <div class="ring__value">{{ taxaSinistralidade }}</div>
              <div class="ring__label">%</div>
            </div>
          </div>

          <div class="ring-legend">
            <div class="ring-legend__item">
              <span class="ring-legend__dot ring-legend__dot--success" />
              Apólices activas
              <b>{{ formatar(apolicesActivas) }}</b>
            </div>
            <div class="ring-legend__item">
              <span class="ring-legend__dot ring-legend__dot--critical" />
              Sinistros abertos
              <b>{{ formatar(sinistrosAbertos) }}</b>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- ============================================================ -->
    <!-- BARRAS — Apólices por seguradora                              -->
    <!-- ============================================================ -->
    <section class="chart-card">
      <header class="chart-card__head">
        <h2 class="chart-card__title">Apólices por seguradora</h2>
        <span class="chart-card__sub">Distribuição nacional</span>
      </header>

      <div class="chart-card__body">
        <div class="bar-chart">
          <div
            v-for="(b, i) in apolicesPorSeguradora"
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
            <div class="bar-chart__value">{{ formatar(b.valor) }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- TABELA — Desempenho por seguradora                            -->
    <!-- ============================================================ -->
    <section class="block">
      <header class="block__head">
        <h2 class="block__title">Desempenho por seguradora</h2>
        <span class="block__sub">Este ano</span>
      </header>

      <table class="data-table">
        <thead>
          <tr>
            <th>Seguradora</th>
            <th>Apólices</th>
            <th>Sinistros</th>
            <th>Taxa</th>
            <th>Valor médio</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in desempenhoPorSeguradora" :key="s.nome">
            <td><b>{{ s.nome }}</b></td>
            <td>{{ formatar(s.apolices) }}</td>
            <td class="text-critical">{{ s.sinistros }}</td>
            <td>
              <div class="taxa">
                <div class="taxa__bar">
                  <div class="taxa__fill" :style="{ width: `${s.taxa}%` }" />
                </div>
                <span class="taxa__value">{{ s.taxa }}%</span>
              </div>
            </td>
            <td class="cell-valor">{{ s.valorMedio }}</td>
            <td>
              <span class="badge" :class="`badge--${s.estado}`">
                {{ s.estadoLabel }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- ============================================================ -->
    <!-- TABELA — Top tipos de seguro                                  -->
    <!-- ============================================================ -->
    <section class="block">
      <header class="block__head">
        <h2 class="block__title">Top tipos de seguro</h2>
        <span class="block__sub">Últimos 90 dias</span>
      </header>

      <table class="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Tipo</th>
            <th>Apólices</th>
            <th>% do total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(t, i) in topTipos" :key="t.tipo">
            <td><b>{{ i + 1 }}</b></td>
            <td><b>{{ t.tipo }}</b></td>
            <td>{{ formatar(t.apolices) }}</td>
            <td>{{ t.percentagem }}%</td>
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
// Período
// ============================================================
const dataDe = ref('')
const dataAte = ref('')

function aplicarFiltro() {
  $q.notify({ type: 'positive', message: 'Filtro aplicado.', position: 'top' })
}

// ============================================================
// KPIs
// ============================================================
const apolicesActivas = 1284
const sinistrosAbertos = 87

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
    icon: 'shield',
    valor: formatar(apolicesActivas),
    label: 'Apólices activas',
    sub: 'Total nacional',
    trend: { tipo: 'up', valor: '+8%' },
  },
  {
    variant: 'critico',
    icon: 'report_problem',
    valor: sinistrosAbertos,
    label: 'Sinistros abertos',
    sub: 'Aguarda resolução',
    trend: { tipo: 'down', valor: '-4%' },
  },
  {
    variant: 'regular',
    icon: 'verified',
    valor: '94,2',
    unidade: '%',
    label: 'Taxa cobertura',
    sub: 'Veículos com seguro',
    trend: { tipo: 'up', valor: '+2%' },
  },
  {
    variant: 'atencao',
    icon: 'hourglass_top',
    valor: 156,
    label: 'A expirar (30d)',
    sub: 'Requerem renovação',
    trend: { tipo: 'up', valor: '+15%' },
  },
  {
    variant: 'neutral',
    icon: 'paid',
    valor: '3 240',
    unidade: 'MT',
    label: 'Prémio médio',
    sub: 'Por apólice',
  },
])

function formatar(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')
}

// ============================================================
// Gráfico de linha — Apólices por mês
// ============================================================
const valores: number[] = [180, 210, 245, 218, 260, 342]
const labelsX: string[] = ['Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set']

const maxY = Math.ceil(Math.max(...valores) / 50) * 50
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
// Anel — Taxa de sinistralidade
// ============================================================
const RAIO = 42
const circunferencia = 2 * Math.PI * RAIO

const taxaSinistralidade = computed(() =>
  Math.round((sinistrosAbertos / apolicesActivas) * 1000) / 10,
)

const offsetRing = computed(() => {
  const p = taxaSinistralidade.value
  return circunferencia * (1 - p / 100)
})

// ============================================================
// Barras — Apólices por seguradora
// ============================================================
const apolicesPorSeguradora = computed(() => {
  const dados = [
    { nome: 'Seguradora A', valor: 542 },
    { nome: 'Seguradora B', valor: 428 },
    { nome: 'Seguradora C', valor: 314 },
  ]
  const max = Math.max(...dados.map((d) => d.valor))
  return dados.map((d) => ({
    ...d,
    percentagem: (d.valor / max) * 100,
  }))
})

// ============================================================
// Tabela — Desempenho por seguradora
// ============================================================
interface DesempenhoSeguradora {
  nome: string
  apolices: number
  sinistros: number
  taxa: number
  valorMedio: string
  estado: 'regular' | 'atencao' | 'critico'
  estadoLabel: string
}

const desempenhoPorSeguradora: DesempenhoSeguradora[] = [
  { nome: 'Seguradora A', apolices: 542, sinistros: 34, taxa: 6.3, valorMedio: '3 100 MT', estado: 'regular', estadoLabel: 'Bom' },
  { nome: 'Seguradora B', apolices: 428, sinistros: 28, taxa: 6.5, valorMedio: '3 400 MT', estado: 'regular', estadoLabel: 'Bom' },
  { nome: 'Seguradora C', apolices: 314, sinistros: 25, taxa: 8.0, valorMedio: '3 200 MT', estado: 'atencao', estadoLabel: 'Atenção' },
]

// ============================================================
// Tabela — Top tipos
// ============================================================
const topTipos = [
  { tipo: 'Terceiros',         apolices: 642, percentagem: 50.0 },
  { tipo: 'Terceiros + Roubo', apolices: 412, percentagem: 32.1 },
  { tipo: 'Todos os riscos',   apolices: 230, percentagem: 17.9 },
]

// ============================================================
// Exportar CSV
// ============================================================
function exportarCSV() {
  const linhas: string[][] = [
    ['SICAM — ISSM — Relatório Anual'],
    [`Gerado em: ${new Date().toLocaleString('pt-PT')}`],
    [],
    ['RESUMO'],
    ['Apólices activas', String(apolicesActivas)],
    ['Sinistros abertos', String(sinistrosAbertos)],
    ['Taxa de sinistralidade', `${taxaSinistralidade.value}%`],
    [],
    ['DESEMPENHO POR SEGURADORA'],
    ['Seguradora', 'Apólices', 'Sinistros', 'Taxa', 'Valor médio', 'Estado'],
    ...desempenhoPorSeguradora.map((s) => [
      s.nome, String(s.apolices), String(s.sinistros), `${s.taxa}%`, s.valorMedio, s.estadoLabel,
    ]),
    [],
    ['TOP TIPOS DE SEGURO'],
    ['#', 'Tipo', 'Apólices', '% do total'],
    ...topTipos.map((t, i) => [
      String(i + 1), t.tipo, String(t.apolices), `${t.percentagem}%`,
    ]),
  ]

  const csv = linhas
    .map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `issm-relatorio-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)

  $q.notify({ type: 'positive', message: 'CSV exportado.', position: 'top' })
}

function exportarPDF() {
  window.print()
  $q.notify({
    type: 'info',
    message: 'Escolha "Guardar como PDF" no destino de impressão.',
    position: 'top',
  })
}
</script>

<style scoped lang="scss">
.rel-page { padding: 24px 20px 48px; max-width: 1180px; margin: 0 auto; }

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
// Período
// ============================================================
.period {
  display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap;
  background: #fff; border-radius: 14px; padding: 16px 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04); margin-bottom: 20px;

  &__field { flex: 1; min-width: 180px; }
  &__label {
    display: block; font-size: 11px; color: var(--sicam-muted);
    text-transform: uppercase; letter-spacing: 0.05em;
    margin-bottom: 6px; font-weight: 600;
  }
  &__input {
    width: 100%; border: 1px solid var(--sicam-line); border-radius: 8px;
    padding: 9px 12px; font-size: 14px; font-family: inherit;
    color: var(--sicam-ink); background: var(--sicam-surface-alt);
    &:focus { outline: 0; border-color: var(--sicam-primary-light); }
  }
  &__btn {
    background: var(--sicam-primary-light); color: #fff; border: 0;
    border-radius: 8px; padding: 10px 20px; font-size: 14px; font-weight: 600;
    cursor: pointer; font-family: inherit;
    &:hover { background: var(--sicam-primary); }
  }
}

// ============================================================
// KPIs
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

  &__head { display: flex; align-items: center; justify-content: space-between; }

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
    display: grid; grid-template-columns: 160px 1fr 60px;
    align-items: center; gap: 12px;
    @media (max-width: 600px) { grid-template-columns: 120px 1fr 50px; }
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

.text-critical { color: var(--sicam-critical); font-weight: 600; }
.cell-valor { font-weight: 700; }

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

.badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 3px 10px; border-radius: 99px;
  font-size: 12px; font-weight: 600;

  &::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

  &--regular { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
  &--atencao { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
  &--critico { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
}

// ============================================================
// Impressão
// ============================================================
@media print {
  .page-head__actions, .period, .page-btn { display: none !important; }
  .rel-page { padding: 0; max-width: 100%; }
  .chart-card, .block, .kpi-card {
    box-shadow: none; border: 1px solid var(--sicam-line);
    page-break-inside: avoid;
  }
}
</style>