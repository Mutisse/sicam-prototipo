<template>
  <q-page class="rel-page">
    <!-- ============================================================ -->
    <!-- CABEÇALHO                                                     -->
    <!-- ============================================================ -->
    <header class="page-head">
      <div>
        <h1 class="page-head__title">Relatórios</h1>
        <p class="page-head__sub">
          Análise de desempenho do posto — agentes, patrulhas e conformidade
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
      <!-- Linha — Consultas por dia -->
      <section class="chart-card">
        <header class="chart-card__head">
          <h2 class="chart-card__title">Consultas por dia</h2>
          <span class="chart-card__sub">Últimos 7 dias</span>
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

      <!-- Anel — Taxa de conformidade -->
      <section class="chart-card">
        <header class="chart-card__head">
          <h2 class="chart-card__title">Taxa de conformidade</h2>
          <span class="chart-card__sub">Documentos válidos</span>
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
              <div class="ring__value">{{ taxaConformidade }}</div>
              <div class="ring__label">%</div>
            </div>
          </div>

          <div class="ring-legend">
            <div class="ring-legend__item">
              <span class="ring-legend__dot ring-legend__dot--success" />
              Conformes
              <b>{{ formatar(4204) }}</b>
            </div>
            <div class="ring-legend__item">
              <span class="ring-legend__dot ring-legend__dot--critical" />
              Não conformes
              <b>{{ formatar(1144) }}</b>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- ============================================================ -->
    <!-- BARRAS — Consultas por agente                                 -->
    <!-- ============================================================ -->
    <section class="chart-card">
      <header class="chart-card__head">
        <h2 class="chart-card__title">Consultas por agente</h2>
        <span class="chart-card__sub">Este mês</span>
      </header>

      <div class="chart-card__body">
        <div class="bar-chart">
          <div
            v-for="(b, i) in consultasPorAgente"
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
            <div class="bar-chart__value">{{ b.valor }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- TABELA — Desempenho por agente                                -->
    <!-- ============================================================ -->
    <section class="block">
      <header class="block__head">
        <h2 class="block__title">Desempenho por agente</h2>
        <span class="block__sub">Este mês</span>
      </header>

      <table class="data-table">
        <thead>
          <tr>
            <th>Agente</th>
            <th>Consultas</th>
            <th>Autos</th>
            <th>Abordagens</th>
            <th>Regularidade</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in desempenhoPorAgente" :key="a.nome">
            <td>
              <div class="agente-cell">
                <div class="agente-cell__avatar">{{ iniciais(a.nome) }}</div>
                <b>{{ a.nome }}</b>
              </div>
            </td>
            <td>{{ a.consultas }}</td>
            <td>{{ a.autos }}</td>
            <td>{{ a.abordagens }}</td>
            <td>
              <div class="taxa">
                <div class="taxa__bar">
                  <div class="taxa__fill" :style="{ width: `${a.regularidade}%` }" />
                </div>
                <span class="taxa__value">{{ a.regularidade }}%</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- ============================================================ -->
    <!-- TABELA — Resumo por patrulha                                  -->
    <!-- ============================================================ -->
    <section class="block">
      <header class="block__head">
        <h2 class="block__title">Resumo por patrulha</h2>
        <span class="block__sub">Últimos 30 dias</span>
      </header>

      <table class="data-table">
        <thead>
          <tr>
            <th>Patrulha</th>
            <th>Data</th>
            <th>Agente</th>
            <th>Duração</th>
            <th>Veículos</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in resumoPatrulhas" :key="p.codigo">
            <td><b>{{ p.codigo }}</b></td>
            <td class="table-time">{{ p.data }}</td>
            <td>{{ p.agente }}</td>
            <td>{{ p.duracao }}</td>
            <td>{{ p.veiculos }}</td>
            <td>
              <span class="badge" :class="`badge--${p.estadoClasse}`">
                {{ p.estado }}
              </span>
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
const kpis = ref({
  consultas: 5348,
  autos: 46,
  abordagens: 342,
  conformidade: 78.6,
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
    icon: 'search',
    valor: formatar(kpis.value.consultas),
    label: 'Consultas',
    sub: 'Este mês',
    trend: { tipo: 'up', valor: '+12%' },
  },
  {
    variant: 'atencao',
    icon: 'receipt_long',
    valor: kpis.value.autos,
    label: 'Autos emitidos',
    sub: 'Este mês',
    trend: { tipo: 'up', valor: '+8%' },
  },
  {
    variant: 'regular',
    icon: 'visibility',
    valor: kpis.value.abordagens,
    label: 'Abordagens',
    sub: 'Últimos 30d',
    trend: { tipo: 'up', valor: '+18%' },
  },
  {
    variant: 'regular',
    icon: 'verified_user',
    valor: kpis.value.conformidade.toFixed(1).replace('.', ','),
    unidade: '%',
    label: 'Conformidade',
    sub: 'Documentos válidos',
    trend: { tipo: 'up', valor: '+2%' },
  },
])

function formatar(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/)
  const p = partes[0]?.[0] ?? ''
  const u = partes.length > 1 ? partes[partes.length - 1]?.[0] ?? '' : ''
  return (p + u).toUpperCase()
}

// ============================================================
// Gráfico de linha — Consultas por dia
// ============================================================
const valores: number[] = [680, 720, 890, 810, 920, 780, 548]
const labelsX: string[] = ['17', '18', '19', '20', '21', '22', '23']

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
// Anel — Taxa de conformidade
// ============================================================
const RAIO = 42
const circunferencia = 2 * Math.PI * RAIO

const taxaConformidade = computed(() => kpis.value.conformidade.toFixed(1).replace('.', ','))

const offsetRing = computed(() => {
  const p = kpis.value.conformidade
  return circunferencia * (1 - p / 100)
})

// ============================================================
// Barras — Consultas por agente
// ============================================================
const consultasPorAgente = computed(() => {
  const dados = [
    { nome: 'Chissano', valor: 1480 },
    { nome: 'Nhaca',    valor: 1220 },
    { nome: 'Sitoe',    valor: 980 },
    { nome: 'Cumbe',    valor: 760 },
    { nome: 'Tembe',    valor: 908 },
  ]
  const max = Math.max(...dados.map((d) => d.valor))
  return dados.map((d) => ({
    ...d,
    percentagem: (d.valor / max) * 100,
  }))
})

// ============================================================
// Tabelas
// ============================================================
interface DesempenhoAgente {
  nome: string
  consultas: number
  autos: number
  abordagens: number
  regularidade: number
}

const desempenhoPorAgente: DesempenhoAgente[] = [
  { nome: 'Agente Chissano', consultas: 1480, autos: 12, abordagens: 68, regularidade: 89 },
  { nome: 'Agente Nhaca',    consultas: 1220, autos: 9,  abordagens: 54, regularidade: 82 },
  { nome: 'Agente Sitoe',    consultas: 980,  autos: 6,  abordagens: 46, regularidade: 78 },
  { nome: 'Agente Cumbe',    consultas: 760,  autos: 4,  abordagens: 38, regularidade: 76 },
  { nome: 'Agente Tembe',    consultas: 908,  autos: 5,  abordagens: 39, regularidade: 74 },
]

interface ResumoPatrulha {
  codigo: string
  data: string
  agente: string
  duracao: string
  veiculos: string
  estado: string
  estadoClasse: 'regular' | 'atencao' | 'critico' | 'neutral'
}

const resumoPatrulhas: ResumoPatrulha[] = [
  { codigo: 'PT-26-00020', data: '23/09', agente: 'Agente Chissano', duracao: '3h 12m', veiculos: '5/10', estado: 'Em curso',   estadoClasse: 'atencao' },
  { codigo: 'PT-26-00017', data: '22/09', agente: 'Agente Cumbe',    duracao: '4h 30m', veiculos: '9/10', estado: 'Concluída',  estadoClasse: 'regular' },
  { codigo: 'PT-26-00016', data: '22/09', agente: 'Agente Nhaca',    duracao: '4h 05m', veiculos: '8/10', estado: 'Concluída',  estadoClasse: 'regular' },
  { codigo: 'PT-26-00015', data: '22/09', agente: 'Agente Chissano', duracao: '2h 45m', veiculos: '3/5',  estado: 'Concluída',  estadoClasse: 'regular' },
  { codigo: 'PT-26-00014', data: '21/09', agente: 'Agente Sitoe',    duracao: '4h 00m', veiculos: '9/10', estado: 'Concluída',  estadoClasse: 'regular' },
]

// ============================================================
// Exportar
// ============================================================
function exportarCSV() {
  const linhas: string[][] = [
    ['SICAM — CHEFE DE POSTO — Relatório de Desempenho'],
    [`Gerado em: ${new Date().toLocaleString('pt-PT')}`],
    [],
    ['RESUMO'],
    ['Consultas', String(kpis.value.consultas)],
    ['Autos emitidos', String(kpis.value.autos)],
    ['Abordagens', String(kpis.value.abordagens)],
    ['Conformidade', `${kpis.value.conformidade}%`],
    [],
    ['DESEMPENHO POR AGENTE'],
    ['Agente', 'Consultas', 'Autos', 'Abordagens', 'Regularidade'],
    ...desempenhoPorAgente.map((a) => [
      a.nome, String(a.consultas), String(a.autos), String(a.abordagens), `${a.regularidade}%`,
    ]),
    [],
    ['RESUMO POR PATRULHA'],
    ['Código', 'Data', 'Agente', 'Duração', 'Veículos', 'Estado'],
    ...resumoPatrulhas.map((p) => [
      p.codigo, p.data, p.agente, p.duracao, p.veiculos, p.estado,
    ]),
  ]

  const csv = linhas
    .map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `chefe-relatorio-${new Date().toISOString().slice(0, 10)}.csv`
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
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
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
  &__value { font-size: 30px; font-weight: 700; color: var(--sicam-ink); line-height: 1; }
  &__label { font-size: 14px; font-weight: 600; color: var(--sicam-muted); padding-bottom: 4px; }
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

.bar-chart {
  display: flex; flex-direction: column; gap: 14px;

  &__row {
    display: grid; grid-template-columns: 130px 1fr 70px;
    align-items: center; gap: 12px;
    @media (max-width: 600px) { grid-template-columns: 100px 1fr 60px; }
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

.table-time { color: var(--sicam-muted); font-size: 13px; white-space: nowrap; }

// Agente cell
.agente-cell {
  display: flex; align-items: center; gap: 10px;

  b { font-weight: 600; }

  &__avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: var(--sicam-primary-bg);
    color: var(--sicam-primary);
    display: grid; place-items: center;
    font-size: 11px; font-weight: 700;
    flex-shrink: 0;
    letter-spacing: 0.02em;
  }
}

// Taxa
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

// Badge
.badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 3px 10px; border-radius: 99px;
  font-size: 12px; font-weight: 600;

  &::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

  &--regular { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
  &--atencao { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
  &--critico { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
  &--neutral { background: var(--sicam-neutral-bg);  color: var(--sicam-neutral-ink); }
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