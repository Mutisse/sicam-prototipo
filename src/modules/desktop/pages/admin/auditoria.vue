<template>
  <q-page class="rel-page">
    <header class="page-head">
      <div>
        <h1 class="page-head__title">Relatórios</h1>
        <p class="page-head__sub">
          Operações, frota e utilização de viaturas
        </p>
      </div>

      <div class="page-head__actions">
        <button class="page-btn">
          <q-icon name="file_download" size="18px" />
          Excel
        </button>
        <button class="page-btn">
          <q-icon name="picture_as_pdf" size="18px" />
          PDF
        </button>
      </div>
    </header>

    <!-- Período -->
    <section class="period">
      <div class="period__field">
        <label class="period__label">De</label>
        <input v-model="dataDe" type="date" class="period__input" />
      </div>
      <div class="period__field">
        <label class="period__label">Até</label>
        <input v-model="dataAte" type="date" class="period__input" />
      </div>
      <button class="period__btn">Aplicar</button>
    </section>

    <!-- KPIs -->
    <section class="kpi-grid">
      <div class="kpi">
        <div class="kpi__label">Operações</div>
        <div class="kpi__value">19</div>
      </div>
      <div class="kpi">
        <div class="kpi__label">Concluídas</div>
        <div class="kpi__value">14</div>
        <div class="kpi__sub">73,7%</div>
      </div>
      <div class="kpi">
        <div class="kpi__label">No prazo</div>
        <div class="kpi__value">84,6%</div>
      </div>
      <div class="kpi">
        <div class="kpi__label">Distância</div>
        <div class="kpi__value">551,6<span class="kpi__unid"> km</span></div>
      </div>
      <div class="kpi">
        <div class="kpi__label">Duração</div>
        <div class="kpi__value">174<span class="kpi__unid"> min</span></div>
      </div>
    </section>

    <!-- Utilização de viaturas -->
    <section class="block">
      <header class="block__head">
        <div>
          <h2 class="block__title">Utilização de viaturas</h2>
          <p class="block__sub">
            Distância registada por GPS face ao odómetro — diferenças grandes merecem verificação
          </p>
        </div>
      </header>

      <table class="data-table">
        <thead>
          <tr>
            <th>Viatura</th>
            <th>Operações</th>
            <th>GPS</th>
            <th>Odómetro</th>
            <th>Variação</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in viaturas" :key="v.viatura">
            <td><b>{{ v.viatura }}</b></td>
            <td>{{ v.operacoes }}</td>
            <td>{{ v.gps }}</td>
            <td>{{ v.odometro }}</td>
            <td>
              <span class="variacao" :class="v.anomalia ? 'variacao--critico' : ''">
                {{ v.variacao }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Operações -->
    <section class="block">
      <header class="block__head">
        <h2 class="block__title">Operações</h2>
      </header>

      <table class="data-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Tipo</th>
            <th>Viatura</th>
            <th>Agendada</th>
            <th>Distância</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="op in operacoes" :key="op.codigo">
            <td><b>{{ op.codigo }}</b></td>
            <td>{{ op.tipo }}</td>
            <td>{{ op.viatura }}</td>
            <td class="table-time">{{ op.agendada }}</td>
            <td>{{ op.distancia }}</td>
            <td>
              <span class="badge" :class="`badge--${badgeEstado(op.estado)}`">
                {{ op.estado }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// ------------------------------------------------------------
// Período
// ------------------------------------------------------------
const dataDe = ref('')
const dataAte = ref('')

// ------------------------------------------------------------
// Viaturas
// ------------------------------------------------------------
const viaturas = [
  { viatura: 'MAP-7781', operacoes: '4/4', gps: '175,5 km', odometro: '116 km', variacao: '51,3%',  anomalia: true },
  { viatura: 'MAP-4413', operacoes: '3/4', gps: '166,3 km', odometro: '35 km',  variacao: '375,1%', anomalia: true },
  { viatura: 'MAP-2290', operacoes: '5/7', gps: '138,8 km', odometro: '151 km', variacao: '-8,1%',  anomalia: false },
  { viatura: 'MAP-4412', operacoes: '2/3', gps: '71,1 km',  odometro: '69 km',  variacao: '3%',     anomalia: false },
]

// ------------------------------------------------------------
// Operações
// ------------------------------------------------------------
const operacoes = [
  { codigo: 'OP-26-00016', tipo: 'Especial',      viatura: '—',        agendada: '23/09 06:07', distancia: '—',    estado: 'Planeada' },
  { codigo: 'OP-26-00008', tipo: 'Fiscalização',  viatura: 'MAP-4412', agendada: '23/09 06:00', distancia: '—',    estado: 'Cancelada' },
  { codigo: 'OP-26-00007', tipo: 'Fiscalização',  viatura: 'MAP-4413', agendada: '22/09 06:00', distancia: '42 km', estado: 'Concluída' },
]

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
function badgeEstado(estado: string): 'regular' | 'atencao' | 'critico' | 'neutral' {
  const e = estado.toLowerCase()
  if (e === 'concluída' || e === 'concluida') return 'regular'
  if (e === 'cancelada') return 'critico'
  if (e === 'planeada') return 'neutral'
  return 'neutral'
}
</script>

<style scoped lang="scss">
.rel-page { padding: 24px 20px 48px; max-width: 1180px; margin: 0 auto; }

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
  gap: 14px; margin-bottom: 24px;
  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 450px) { grid-template-columns: 1fr; }
}

.kpi {
  background: #fff; border-radius: 14px; padding: 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  &__label {
    font-size: 11px; color: var(--sicam-muted);
    text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;
    margin-bottom: 8px;
  }

  &__value {
    font-size: 24px; font-weight: 700; color: var(--sicam-ink); line-height: 1;
  }

  &__unid { font-size: 14px; font-weight: 500; color: var(--sicam-muted); }

  &__sub { font-size: 11px; color: var(--sicam-muted); margin-top: 4px; }
}

// ============================================================
// Blocos (secções)
// ============================================================
.block {
  background: #fff; border-radius: 14px; overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04); margin-bottom: 20px;

  &__head {
    padding: 18px 20px 14px;
    border-bottom: 1px solid var(--sicam-line-soft);
  }

  &__title { font-size: 15px; font-weight: 700; color: var(--sicam-ink); margin: 0; }
  &__sub { font-size: 12px; color: var(--sicam-muted); margin: 4px 0 0; line-height: 1.4; }
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

.variacao {
  font-weight: 600;
  color: var(--sicam-ink);
  &--critico { color: var(--sicam-critical); }
}

.badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 3px 10px; border-radius: 99px; font-size: 12px; font-weight: 600;

  &::before {
    content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor;
  }

  &--regular { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
  &--atencao { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
  &--critico { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
  &--neutral { background: var(--sicam-neutral-bg);  color: var(--sicam-neutral-ink); }
}
</style>