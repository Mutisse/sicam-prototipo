<template>
  <q-page class="postos-page">
    <!-- Cabeçalho -->
    <header class="page-head">
      <div>
        <h1 class="page-head__title">Postos</h1>
        <p class="page-head__sub">Áreas de fiscalização dentro de cada província</p>
      </div>
      <button class="page-btn page-btn--primary">
        <q-icon name="add" size="18px" />
        Novo posto
      </button>
    </header>

    <!-- KPIs -->
    <section class="kpi-grid">
      <div class="kpi">
        <div class="kpi__icon kpi__icon--primary"><q-icon name="location_city" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ postos.length }}</div>
          <div class="kpi__label">Total</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--success"><q-icon name="verified" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ totalAgentes }}</div>
          <div class="kpi__label">Agentes</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--critical"><q-icon name="warning" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ totalCriticos }}</div>
          <div class="kpi__label">Veíc. críticos</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--info"><q-icon name="map" size="22px" /></div>
        <div>
          <div class="kpi__value">2</div>
          <div class="kpi__label">Províncias</div>
        </div>
      </div>
    </section>

    <!-- Tabela -->
    <section class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nome</th>
            <th>Província</th>
            <th>Agentes</th>
            <th>Críticos</th>
            <th class="data-table__th-actions" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in postos" :key="p.codigo" class="data-table__row">
            <td>
              <div class="posto-code">
                <span class="posto-code__dot" :style="{ background: p.cor }" />
                <b>{{ p.codigo }}</b>
              </div>
            </td>
            <td><b>{{ p.nome }}</b></td>
            <td>{{ p.provincia }}</td>
            <td>{{ p.agentes }}</td>
            <td>
              <span :class="p.criticos > 0 ? 'text-critical' : ''">
                <b>{{ p.criticos }}</b>
              </span>
            </td>
            <td class="data-table__actions">
              <button class="row-action" title="Editar">
                <q-icon name="edit" size="18px" />
              </button>
              <button class="row-action row-action--danger" title="Remover">
                <q-icon name="delete" size="18px" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Posto {
  codigo: string
  nome: string
  provincia: string
  agentes: number
  criticos: number
  cor: string
}

const postos = ref<Posto[]>([
  { codigo: 'P-BAIXA',  nome: 'Posto Baixa',          provincia: 'Maputo Cidade',    agentes: 14, criticos: 3, cor: '#2563eb' },
  { codigo: 'P-KAMP',   nome: 'Posto KaMpfumo',       provincia: 'Maputo Cidade',    agentes: 12, criticos: 2, cor: '#0d9488' },
  { codigo: 'P-MATOLA', nome: 'Posto Matola',         provincia: 'Maputo Província', agentes: 16, criticos: 3, cor: '#7c3aed' },
  { codigo: 'P-MACH',   nome: 'Posto Machava',        provincia: 'Maputo Província', agentes: 10, criticos: 1, cor: '#b45309' },
  { codigo: 'P-NAMA',   nome: 'Posto Namaacha (EN4)', provincia: 'Maputo Província', agentes: 8,  criticos: 0, cor: '#db2777' },
])

const totalAgentes = computed(() => postos.value.reduce((s, p) => s + p.agentes, 0))
const totalCriticos = computed(() => postos.value.reduce((s, p) => s + p.criticos, 0))
</script>

<style scoped lang="scss">
.postos-page { padding: 24px 20px 48px; max-width: 1180px; margin: 0 auto; }

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
    &--critical { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
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

.posto-code { display: flex; align-items: center; gap: 8px;
  &__dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  b { font-weight: 700; }
}

.row-action {
  display: inline-grid; place-items: center; width: 34px; height: 34px;
  border: 0; border-radius: 8px; background: transparent; color: var(--sicam-muted);
  cursor: pointer; margin-left: 2px; transition: all 0.15s;
  &:hover { background: var(--sicam-surface-hover); color: var(--sicam-ink); }
  &--danger:hover { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
}

.text-critical { color: var(--sicam-critical); }
</style>