<template>
  <q-page class="ina-page">
    <!-- ============================================================ -->
    <!-- CABEÇALHO                                                     -->
    <!-- ============================================================ -->
    <header class="page-head">
      <div>
        <h1 class="page-head__title">Visão Geral</h1>
        <p class="page-head__sub">
          Estado do registo de veículos e inspecções técnicas
        </p>
      </div>

      <div class="page-head__actions">
        <button class="page-btn page-btn--primary">
          <q-icon name="add" size="18px" />
          Registar veículo
        </button>
      </div>
    </header>

    <!-- ============================================================ -->
    <!-- KPIs — 4 colunas                                              -->
    <!-- ============================================================ -->
    <section class="kpi-grid">
      <div class="kpi">
        <div class="kpi__icon kpi__icon--primary">
          <q-icon name="directions_car" size="22px" />
        </div>
        <div>
          <div class="kpi__value">{{ kpis.registados }}</div>
          <div class="kpi__label">Veículos registados</div>
        </div>
      </div>

      <div class="kpi">
        <div class="kpi__icon kpi__icon--success">
          <q-icon name="verified" size="22px" />
        </div>
        <div>
          <div class="kpi__value">{{ kpis.inspecaoOk }}</div>
          <div class="kpi__label">Inspecção válida</div>
        </div>
      </div>

      <div class="kpi">
        <div class="kpi__icon kpi__icon--critical">
          <q-icon name="warning" size="22px" />
        </div>
        <div>
          <div class="kpi__value">{{ kpis.inspecaoExp }}</div>
          <div class="kpi__label">Inspecção expirada</div>
        </div>
      </div>

      <div class="kpi">
        <div class="kpi__icon kpi__icon--warning">
          <q-icon name="pending_actions" size="22px" />
        </div>
        <div>
          <div class="kpi__value">{{ kpis.pendentes }}</div>
          <div class="kpi__label">Pendentes</div>
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- GRÁFICOS — 2 colunas                                          -->
    <!-- ============================================================ -->
    <div class="charts-grid">
      <!-- Anel — Taxa de inspecção válida -->
      <section class="chart-card">
        <header class="chart-card__head">
          <h2 class="chart-card__title">Taxa de inspecção válida</h2>
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
              <div class="ring__value">{{ taxaValida }}</div>
              <div class="ring__label">%</div>
            </div>
          </div>

          <div class="ring-legend">
            <div class="ring-legend__item">
              <span class="ring-legend__dot ring-legend__dot--success" />
              Válidas: <b>{{ kpis.inspecaoOk }}</b>
            </div>
            <div class="ring-legend__item">
              <span class="ring-legend__dot ring-legend__dot--critical" />
              Expiradas: <b>{{ kpis.inspecaoExp }}</b>
            </div>
          </div>
        </div>
      </section>

      <!-- Barras — Veículos por província -->
      <section class="chart-card">
        <header class="chart-card__head">
          <h2 class="chart-card__title">Veículos por província</h2>
        </header>

        <div class="chart-card__body">
          <div class="bar-chart">
            <div
              v-for="(b, i) in veiculosPorProvincia"
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
    </div>

    <!-- ============================================================ -->
    <!-- INSPECÇÕES RECENTES                                           -->
    <!-- ============================================================ -->
    <section class="block">
      <header class="block__head">
        <h2 class="block__title">Inspecções recentes</h2>
        <router-link to="/inatro/inspecoes" class="block__link">
          Ver todas →
        </router-link>
      </header>

      <table class="data-table">
        <thead>
          <tr>
            <th>Matrícula</th>
            <th>Tipo</th>
            <th>Data</th>
            <th>Posto</th>
            <th>Resultado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in inspecoesRecentes" :key="i">
            <td><b>{{ r.matricula }}</b></td>
            <td>{{ r.tipo }}</td>
            <td class="table-time">{{ r.data }}</td>
            <td>{{ r.posto }}</td>
            <td>
              <span
                class="badge"
                :class="`badge--${r.resultado === 'Aprovada' ? 'regular' : 'critico'}`"
              >
                {{ r.resultado }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

// ============================================================
// KPIs
// ============================================================
const kpis = ref({
  registados: 1284,
  inspecaoOk: 872,
  inspecaoExp: 312,
  pendentes: 100,
})

// ============================================================
// Anel — Taxa de válidas
// ============================================================
const RAIO = 42
const circunferencia = 2 * Math.PI * RAIO

const taxaValida = computed(() => {
  const { inspecaoOk, inspecaoExp } = kpis.value
  const total = inspecaoOk + inspecaoExp
  return Math.round((inspecaoOk / total) * 1000) / 10
})

const offsetRing = computed(() => {
  const p = taxaValida.value
  return circunferencia * (1 - p / 100)
})

// ============================================================
// Barras — Veículos por província
// ============================================================
const veiculosPorProvincia = computed(() => {
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
// Inspecções recentes
// ============================================================
const inspecoesRecentes = ref([
  { matricula: 'AGL-482-MC', tipo: 'Ligeiro', data: '23/09 08:12', posto: 'Posto Baixa',    resultado: 'Aprovada' },
  { matricula: 'ABR-771-MP', tipo: 'Pesado',  data: '23/09 07:40', posto: 'Posto Matola',   resultado: 'Aprovada' },
  { matricula: 'AFC-205-MC', tipo: 'Ligeiro', data: '22/09 16:15', posto: 'Posto Baixa',    resultado: 'Reprovada' },
  { matricula: 'ACD-918-MP', tipo: 'Ligeiro', data: '22/09 14:30', posto: 'Posto Machava',  resultado: 'Aprovada' },
  { matricula: 'AHN-304-MC', tipo: 'Pesado',  data: '22/09 11:00', posto: 'Posto KaMpfumo', resultado: 'Reprovada' },
])
</script>

<style scoped lang="scss">
.ina-page { padding: 24px 20px 48px; max-width: 1180px; margin: 0 auto; }

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

  &--primary { background: var(--sicam-primary-light); color: #fff;
    &:hover { background: var(--sicam-primary); } }
}

// ============================================================
// KPIs
// ============================================================
.kpi-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 14px; margin-bottom: 20px;
  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 450px) { grid-template-columns: 1fr; }
}

.kpi {
  display: flex; align-items: center; gap: 14px;
  background: #fff; border-radius: 14px; padding: 16px 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  &__icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: grid; place-items: center; flex-shrink: 0;
    &--primary  { background: var(--sicam-primary-bg);  color: var(--sicam-primary); }
    &--success  { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
    &--critical { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
    &--warning  { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
  }
  &__value { font-size: 22px; font-weight: 700; color: var(--sicam-ink); line-height: 1; }
  &__label { font-size: 12px; color: var(--sicam-muted); margin-top: 2px; }
}

// ============================================================
// Charts grid
// ============================================================
.charts-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 20px; margin-bottom: 20px;
  @media (max-width: 800px) { grid-template-columns: 1fr; }
}

.chart-card {
  background: #fff; border-radius: 14px; padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  &__head {
    display: flex; align-items: baseline; justify-content: space-between;
    margin-bottom: 16px;
  }

  &__title { font-size: 15px; font-weight: 700; color: var(--sicam-ink); margin: 0; }
  &__body { width: 100%; }
  &__body--ring {
    display: flex; align-items: center; justify-content: space-around;
    gap: 24px;
    @media (max-width: 500px) { flex-direction: column; }
  }
}

// ============================================================
// Anel
// ============================================================
.ring {
  position: relative;
  width: 180px;
  height: 180px;
  flex-shrink: 0;

  &__svg { width: 100%; height: 100%; transform: rotate(-90deg); }

  &__track {
    fill: none; stroke: var(--sicam-line-soft); stroke-width: 10;
  }

  &__progress {
    fill: none;
    stroke: var(--sicam-success);
    stroke-width: 10;
    stroke-linecap: round;
    transition: stroke-dashoffset 0.6s ease;
  }

  &__center {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    gap: 2px;
    pointer-events: none;
  }

  &__value {
    font-size: 36px; font-weight: 700; color: var(--sicam-ink); line-height: 1;
  }

  &__label {
    font-size: 16px; font-weight: 600; color: var(--sicam-muted);
    align-self: center; padding-bottom: 4px;
  }
}

.ring-legend {
  display: flex; flex-direction: column; gap: 12px;

  &__item {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; color: var(--sicam-ink-soft);

    b { color: var(--sicam-ink); font-weight: 700; margin-left: 4px; }
  }

  &__dot {
    width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;

    &--success  { background: var(--sicam-success); }
    &--critical { background: var(--sicam-critical); }
  }
}

// ============================================================
// Barras
// ============================================================
.bar-chart {
  display: flex; flex-direction: column; gap: 14px;

  &__row {
    display: grid;
    grid-template-columns: 130px 1fr 50px;
    align-items: center;
    gap: 12px;
  }

  &__label {
    font-size: 13px; color: var(--sicam-ink);
    text-align: right; white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis;
  }

  &__bar {
    height: 10px; background: var(--sicam-line-soft);
    border-radius: 99px; overflow: hidden;
  }

  &__fill {
    height: 100%; background: var(--sicam-primary-light);
    border-radius: 99px; transition: width 0.5s ease;
  }

  &__value {
    font-size: 13px; font-weight: 700;
    color: var(--sicam-ink); text-align: right;
  }
}

// ============================================================
// Bloco
// ============================================================
.block {
  background: #fff; border-radius: 14px; overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  &__head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 20px 14px;
    border-bottom: 1px solid var(--sicam-line-soft);
  }

  &__title { font-size: 15px; font-weight: 700; color: var(--sicam-ink); margin: 0; }
  &__link {
    font-size: 13px; color: var(--sicam-primary);
    font-weight: 600; text-decoration: none;
  }
}

// ============================================================
// Tabela
// ============================================================
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

.badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 3px 10px; border-radius: 99px;
  font-size: 12px; font-weight: 600;

  &::before {
    content: ''; width: 6px; height: 6px;
    border-radius: 50%; background: currentColor;
  }

  &--regular { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
  &--critico { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
}
</style>