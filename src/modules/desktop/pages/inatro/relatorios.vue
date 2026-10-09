<template>
  <q-page class="rel-page">
    <!-- ============================================================ -->
    <!-- CABEÇALHO                                                     -->
    <!-- ============================================================ -->
    <header class="page-head">
      <div>
        <h1 class="page-head__title">Relatórios</h1>
        <p class="page-head__sub">
          Análise de registos, inspecções e cobertura por província
        </p>
      </div>

      <div class="page-head__actions">
        <button class="page-btn" @click="exportarCSV">
          <q-icon name="grid_on" size="18px" />
          Excel (CSV)
        </button>
        <button class="page-btn" @click="exportarPDF">
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
      <div class="kpi">
        <div class="kpi__label">Total registados</div>
        <div class="kpi__value">{{ formatar(kpis.total) }}</div>
        <div class="kpi__sub">+128 este mês</div>
      </div>
      <div class="kpi">
        <div class="kpi__label">Inspecção válida</div>
        <div class="kpi__value">{{ formatar(kpis.validas) }}</div>
        <div class="kpi__sub">{{ kpis.taxa }}% do total</div>
      </div>
      <div class="kpi">
        <div class="kpi__label">Inspecção expirada</div>
        <div class="kpi__value kpi__value--critico">{{ formatar(kpis.expiradas) }}</div>
        <div class="kpi__sub">requer contacto</div>
      </div>
      <div class="kpi">
        <div class="kpi__label">Tempo médio</div>
        <div class="kpi__value">{{ kpis.tempoMedio }}<span class="kpi__unid"> min</span></div>
        <div class="kpi__sub">por inspecção</div>
      </div>
      <div class="kpi">
        <div class="kpi__label">Taxa aprovação</div>
        <div class="kpi__value">{{ kpis.taxaAprovacao }}%</div>
        <div class="kpi__sub">este mês</div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- GRÁFICOS                                                      -->
    <!-- ============================================================ -->
    <div class="charts-grid">
      <!-- Gráfico de linha — Registos por mês -->
      <section class="chart-card">
        <header class="chart-card__head">
          <h2 class="chart-card__title">Registos por mês</h2>
          <span class="chart-card__sub">Últimos 6 meses</span>
        </header>

        <div class="chart-card__body">
          <svg viewBox="0 0 420 220" class="line-chart">
            <!-- Grelha horizontal -->
            <line
              v-for="(y, i) in gridY"
              :key="`gy-${i}`"
              :x1="40"
              :y1="y"
              :x2="410"
              :y2="y"
              class="line-chart__grid"
            />

            <!-- Rótulos Y -->
            <text
              v-for="(label, i) in labelsY"
              :key="`ly-${i}`"
              :x="30"
              :y="gridY[i]! + 4"
              class="line-chart__axis"
              text-anchor="end"
            >
              {{ label }}
            </text>

            <!-- Área -->
            <path :d="areaPath" class="line-chart__area" />

            <!-- Linha -->
            <path :d="linePath" class="line-chart__line" />

            <!-- Pontos -->
            <circle
              v-for="(p, i) in pontos"
              :key="`p-${i}`"
              :cx="p.x"
              :cy="p.y"
              r="4"
              class="line-chart__dot"
            />

            <!-- Rótulos X -->
            <text
              v-for="(label, i) in labelsX"
              :key="`lx-${i}`"
              :x="40 + i * (370 / (labelsX.length - 1))"
              :y="215"
              class="line-chart__axis"
              text-anchor="middle"
            >
              {{ label }}
            </text>
          </svg>
        </div>
      </section>

      <!-- Anel — Distribuição por estado -->
      <section class="chart-card">
        <header class="chart-card__head">
          <h2 class="chart-card__title">Estado das inspecções</h2>
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
              <div class="ring__value">{{ kpis.taxa }}</div>
              <div class="ring__label">%</div>
            </div>
          </div>

          <div class="ring-legend">
            <div class="ring-legend__item">
              <span class="ring-legend__dot ring-legend__dot--success" />
              Válidas
              <b>{{ formatar(kpis.validas) }}</b>
            </div>
            <div class="ring-legend__item">
              <span class="ring-legend__dot ring-legend__dot--critical" />
              Expiradas
              <b>{{ formatar(kpis.expiradas) }}</b>
            </div>
            <div class="ring-legend__item">
              <span class="ring-legend__dot ring-legend__dot--warning" />
              A expirar
              <b>{{ formatar(kpis.aExpirar) }}</b>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- ============================================================ -->
    <!-- BARRAS — Registos por província                               -->
    <!-- ============================================================ -->
    <section class="chart-card">
      <header class="chart-card__head">
        <h2 class="chart-card__title">Registos por província</h2>
        <span class="chart-card__sub">Distribuição nacional</span>
      </header>

      <div class="chart-card__body">
        <div class="bar-chart">
          <div
            v-for="(b, i) in registosPorProvincia"
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
    <!-- TABELA — Inspecções por posto                                 -->
    <!-- ============================================================ -->
    <section class="block">
      <header class="block__head">
        <h2 class="block__title">Inspecções por posto</h2>
        <span class="block__sub">Este mês</span>
      </header>

      <table class="data-table">
        <thead>
          <tr>
            <th>Posto</th>
            <th>Província</th>
            <th>Realizadas</th>
            <th>Aprovadas</th>
            <th>Reprovadas</th>
            <th>Taxa</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in inspecoesPorPosto" :key="p.posto">
            <td><b>{{ p.posto }}</b></td>
            <td>{{ p.provincia }}</td>
            <td>{{ p.realizadas }}</td>
            <td class="text-success">{{ p.aprovadas }}</td>
            <td class="text-critical">{{ p.reprovadas }}</td>
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

    <!-- ============================================================ -->
    <!-- TABELA — Top marcas                                           -->
    <!-- ============================================================ -->
    <section class="block">
      <header class="block__head">
        <h2 class="block__title">Top marcas registadas</h2>
        <span class="block__sub">Top 5 nacional</span>
      </header>

      <table class="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Marca</th>
            <th>Veículos</th>
            <th>% do total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(m, i) in topMarcas" :key="m.marca">
            <td><b>{{ i + 1 }}</b></td>
            <td><b>{{ m.marca }}</b></td>
            <td>{{ formatar(m.veiculos) }}</td>
            <td>{{ m.percentagem }}%</td>
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
  $q.notify({
    type: 'positive',
    message: 'Filtro aplicado.',
    position: 'top',
  })
}

// ============================================================
// KPIs
// ============================================================
const kpis = ref({
  total: 1284,
  validas: 872,
  expiradas: 312,
  aExpirar: 100,
  taxa: 73.6,
  tempoMedio: 24,
  taxaAprovacao: 87,
})

function formatar(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')
}

// ============================================================
// Gráfico de linha — Registos por mês
// ============================================================
const valores: number[] = [120, 148, 165, 142, 189, 210]
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
// Anel — Distribuição
// ============================================================
const RAIO = 42
const circunferencia = 2 * Math.PI * RAIO

const offsetRing = computed(() => {
  const p = kpis.value.taxa
  return circunferencia * (1 - p / 100)
})

// ============================================================
// Barras — Registos por província
// ============================================================
const registosPorProvincia = computed(() => {
  const dados = [
    { nome: 'Maputo Cidade',    valor: 623 },
    { nome: 'Maputo Província', valor: 412 },
    { nome: 'Gaza',             valor: 128 },
    { nome: 'Sofala',           valor: 87 },
    { nome: 'Inhambane',        valor: 34 },
  ]
  const max = Math.max(...dados.map((d) => d.valor))
  return dados.map((d) => ({
    ...d,
    percentagem: (d.valor / max) * 100,
  }))
})

// ============================================================
// Tabela — Inspecções por posto
// ============================================================
const inspecoesPorPosto = [
  { posto: 'Posto Baixa',     provincia: 'Maputo Cidade',    realizadas: 248, aprovadas: 212, reprovadas: 36, taxa: 85 },
  { posto: 'Posto Matola',    provincia: 'Maputo Província', realizadas: 186, aprovadas: 162, reprovadas: 24, taxa: 87 },
  { posto: 'Posto KaMpfumo',  provincia: 'Maputo Cidade',    realizadas: 142, aprovadas: 118, reprovadas: 24, taxa: 83 },
  { posto: 'Posto Machava',   provincia: 'Maputo Província', realizadas: 98,  aprovadas: 84,  reprovadas: 14, taxa: 86 },
  { posto: 'Posto Namaacha',  provincia: 'Maputo Província', realizadas: 64,  aprovadas: 52,  reprovadas: 12, taxa: 81 },
]

// ============================================================
// Tabela — Top marcas
// ============================================================
const topMarcas = [
  { marca: 'Toyota',      veiculos: 342, percentagem: 26.6 },
  { marca: 'Nissan',      veiculos: 218, percentagem: 17.0 },
  { marca: 'Mazda',       veiculos: 156, percentagem: 12.2 },
  { marca: 'Honda',       veiculos: 128, percentagem: 10.0 },
  { marca: 'Volkswagen',  veiculos: 96,  percentagem: 7.5 },
]

// ============================================================
// Exportar CSV
// ============================================================
function exportarCSV() {
  const linhas: string[][] = [
    ['SICAM — INATRO — Relatório de Registos e Inspecções'],
    [`Gerado em: ${new Date().toLocaleString('pt-PT')}`],
    [],
    ['RESUMO'],
    ['Total registados', String(kpis.value.total)],
    ['Inspecção válida', String(kpis.value.validas)],
    ['Inspecção expirada', String(kpis.value.expiradas)],
    ['Taxa de regularidade', `${kpis.value.taxa}%`],
    [],
    ['INSPECÇÕES POR POSTO'],
    ['Posto', 'Província', 'Realizadas', 'Aprovadas', 'Reprovadas', 'Taxa'],
    ...inspecoesPorPosto.map((p) => [
      p.posto, p.provincia, String(p.realizadas), String(p.aprovadas), String(p.reprovadas), `${p.taxa}%`,
    ]),
    [],
    ['TOP MARCAS'],
    ['#', 'Marca', 'Veículos', '% do total'],
    ...topMarcas.map((m, i) => [
      String(i + 1), m.marca, String(m.veiculos), `${m.percentagem}%`,
    ]),
  ]

  const csv = linhas
    .map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `inatrо-relatorio-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)

  $q.notify({ type: 'positive', message: 'CSV exportado.', position: 'top' })
}

// ============================================================
// Exportar PDF
// ============================================================
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
  background: #fff; border: 1px solid var(--sicam-line); border-radius: 10px;
  padding: 10px 18px; font-size: 14px; font-weight: 600; color: var(--sicam-ink);
  cursor: pointer; font-family: inherit;
  transition: all 0.15s;
  &:hover { background: var(--sicam-surface-hover); }
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
    text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; font-weight: 600;
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
  display: grid; grid-template-columns: repeat(5, 1fr);
  gap: 14px; margin-bottom: 20px;
  @media (max-width: 1000px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 450px)  { grid-template-columns: 1fr; }
}

.kpi {
  background: #fff; border-radius: 14px; padding: 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  &__label {
    font-size: 11px; color: var(--sicam-muted);
    text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;
    margin-bottom: 8px;
  }
  &__value { font-size: 24px; font-weight: 700; color: var(--sicam-ink); line-height: 1; }
  &__value--critico { color: var(--sicam-critical); }
  &__unid { font-size: 14px; font-weight: 500; color: var(--sicam-muted); }
  &__sub { font-size: 11px; color: var(--sicam-muted); margin-top: 4px; }
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

// ------------------------------------------------------------
// Gráfico de linha
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// Anel
// ------------------------------------------------------------
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
    &--warning  { background: var(--sicam-warning); }
  }
}

// ------------------------------------------------------------
// Barras
// ------------------------------------------------------------
.bar-chart {
  display: flex; flex-direction: column; gap: 14px;

  &__row {
    display: grid; grid-template-columns: 160px 1fr 60px;
    align-items: center; gap: 12px;
    @media (max-width: 600px) { grid-template-columns: 100px 1fr 50px; }
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
.text-critical { color: var(--sicam-critical); font-weight: 600; }

// Taxa bar
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

// ============================================================
// Impressão
// ============================================================
@media print {
  .page-head__actions,
  .period,
  .page-btn { display: none !important; }

  .rel-page { padding: 0; max-width: 100%; }

  .chart-card, .block, .kpi {
    box-shadow: none; border: 1px solid var(--sicam-line);
    page-break-inside: avoid;
  }
}
</style>