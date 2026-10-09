<template>
  <q-page class="disp-page">
    <header class="page-head">
      <div>
        <h1 class="page-head__title">Dispositivos</h1>
        <p class="page-head__sub">Terminais móveis atribuídos aos agentes</p>
      </div>
      <button class="page-btn page-btn--primary">
        <q-icon name="add" size="18px" />
        Registar dispositivo
      </button>
    </header>

    <!-- KPIs -->
    <section class="kpi-grid">
      <div class="kpi">
        <div class="kpi__icon kpi__icon--primary"><q-icon name="devices" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ dispositivos.length }}</div>
          <div class="kpi__label">Total</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--success"><q-icon name="wifi" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ totalActivos }}</div>
          <div class="kpi__label">Activos</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--warning"><q-icon name="pending" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ totalPorRegistar }}</div>
          <div class="kpi__label">Por registar</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--info"><q-icon name="battery_full" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ mediaBateria }}%</div>
          <div class="kpi__label">Bateria média</div>
        </div>
      </div>
    </section>

    <!-- Tabela -->
    <section class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nº de série</th>
            <th>Agente</th>
            <th>Estado</th>
            <th>Bateria</th>
            <th>Última sincronização</th>
            <th class="data-table__th-actions" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in dispositivos" :key="d.serie" class="data-table__row">
            <td><b>{{ d.serie }}</b></td>
            <td>{{ d.agente }}</td>
            <td>
              <span class="badge" :class="d.estado === 'Ativo' ? 'badge--success' : 'badge--warning'">
                {{ d.estado }}
              </span>
            </td>
            <td>
              <div class="battery">
                <div class="battery__bar">
                  <div class="battery__fill" :class="`battery__fill--${nivelBateria(d.bateria)}`" :style="{ width: `${d.bateria}%` }" />
                </div>
                <span class="battery__value">{{ d.bateria }}%</span>
              </div>
            </td>
            <td class="table-time">{{ d.ultimaSincronizacao }}</td>
            <td class="data-table__actions">
              <button class="row-action" title="Ver"><q-icon name="visibility" size="18px" /></button>
              <button class="row-action" title="Editar"><q-icon name="edit" size="18px" /></button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Dispositivo {
  serie: string
  agente: string
  estado: 'Ativo' | 'Por registar'
  bateria: number
  ultimaSincronizacao: string
}

const dispositivos = ref<Dispositivo[]>([
  { serie: 'SN-AGT-001', agente: 'Agente Chissano', estado: 'Ativo',       bateria: 93, ultimaSincronizacao: '22/09 17:07' },
  { serie: 'SN-AGT-002', agente: 'Agente Nhaca',    estado: 'Ativo',       bateria: 94, ultimaSincronizacao: '23/09 01:07' },
  { serie: 'SN-AGT-004', agente: 'Agente Sitoe',    estado: 'Ativo',       bateria: 95, ultimaSincronizacao: '22/09 19:07' },
  { serie: 'SN-AGT-005', agente: '—',               estado: 'Por registar', bateria: 96, ultimaSincronizacao: 'Nunca' },
  { serie: 'SN-AGT-007', agente: 'Agente Cumbe',    estado: 'Ativo',       bateria: 97, ultimaSincronizacao: '21/09 00:07' },
  { serie: 'SN-AGT-008', agente: 'Agente Bila',     estado: 'Ativo',       bateria: 98, ultimaSincronizacao: '22/09 17:07' },
  { serie: 'SN-AGT-010', agente: '—',               estado: 'Por registar', bateria: 99, ultimaSincronizacao: 'Nunca' },
  { serie: 'SN-AGT-011', agente: 'Agente Tembe',    estado: 'Ativo',       bateria: 60, ultimaSincronizacao: '22/09 21:07' },
  { serie: 'SN-CHF-001', agente: 'Chefe Mabunda',   estado: 'Ativo',       bateria: 73, ultimaSincronizacao: '22/09 22:07' },
  { serie: 'SN-CHF-002', agente: 'Chefe Zandamela', estado: 'Ativo',       bateria: 74, ultimaSincronizacao: '23/09 02:07' },
])

const totalActivos = computed(() => dispositivos.value.filter((d) => d.estado === 'Ativo').length)
const totalPorRegistar = computed(() => dispositivos.value.filter((d) => d.estado === 'Por registar').length)
const mediaBateria = computed(() =>
  Math.round(dispositivos.value.reduce((s, d) => s + d.bateria, 0) / dispositivos.value.length),
)

function nivelBateria(b: number): 'regular' | 'atencao' | 'critico' {
  if (b >= 70) return 'regular'
  if (b >= 40) return 'atencao'
  return 'critico'
}
</script>

<style scoped lang="scss">
.disp-page { padding: 24px 20px 48px; max-width: 1180px; margin: 0 auto; }

.page-head {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 16px; margin-bottom: 24px;
  @media (max-width: 700px) { flex-direction: column; }
  &__title { font-size: 24px; font-weight: 700; color: var(--sicam-ink); margin: 0 0 6px; }
  &__sub { font-size: 14px; color: var(--sicam-muted); margin: 0; }
}

.page-btn {
  display: inline-flex; align-items: center; gap: 8px;
  border: 0; border-radius: 10px; padding: 10px 18px;
  font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit;
  &--primary { background: var(--sicam-primary-light); color: #fff; &:hover { background: var(--sicam-primary); } }
}

.kpi-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 14px; margin-bottom: 20px;
  @media (max-width: 800px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 450px) { grid-template-columns: 1fr; }
}

.kpi {
  display: flex; align-items: center; gap: 14px;
  background: #fff; border-radius: 14px; padding: 16px 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  &__icon {
    width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; flex-shrink: 0;
    &--primary  { background: var(--sicam-primary-bg);  color: var(--sicam-primary); }
    &--success  { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
    &--warning  { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
    &--info     { background: #dbeafe;                  color: #2563eb; }
  }
  &__value { font-size: 22px; font-weight: 700; color: var(--sicam-ink); line-height: 1; }
  &__label { font-size: 12px; color: var(--sicam-muted); margin-top: 2px; }
}

.table-wrap { background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04); }

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
  &__row { transition: background 0.15s; &:hover { background: #fbfdfc; } &:last-child td { border-bottom: 0; } }
  &__th-actions { width: 120px; text-align: right; }
  &__actions { text-align: right; white-space: nowrap; }
}

.table-time { color: var(--sicam-muted); font-size: 13px; white-space: nowrap; }

.badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 3px 10px; border-radius: 99px; font-size: 12px; font-weight: 600;
  &::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  &--success { background: var(--sicam-success-bg); color: var(--sicam-success-ink); }
  &--warning { background: var(--sicam-warning-bg); color: var(--sicam-warning-ink); }
}

.battery {
  display: flex; align-items: center; gap: 10px;
  &__bar { width: 60px; height: 6px; background: var(--sicam-line); border-radius: 99px; overflow: hidden; }
  &__fill {
    height: 100%; border-radius: 99px; transition: width 0.3s;
    &--regular { background: var(--sicam-success); }
    &--atencao { background: var(--sicam-warning); }
    &--critico { background: var(--sicam-critical); }
  }
  &__value { font-size: 13px; color: var(--sicam-ink); font-weight: 600; }
}

.row-action {
  display: inline-grid; place-items: center; width: 34px; height: 34px;
  border: 0; border-radius: 8px; background: transparent; color: var(--sicam-muted);
  cursor: pointer; margin-left: 2px; transition: all 0.15s;
  &:hover { background: var(--sicam-surface-hover); color: var(--sicam-ink); }
}
</style>