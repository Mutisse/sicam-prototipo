<template>
  <q-page class="pt-page">
    <!-- ============================================================ -->
    <!-- CABEÇALHO                                                     -->
    <!-- ============================================================ -->
    <header class="page-head">
      <div>
        <h1 class="page-head__title">Patrulhas</h1>
        <p class="page-head__sub">
          Planeamento e acompanhamento das patrulhas do posto
        </p>
      </div>

      <div class="page-head__actions">
        <button class="page-btn page-btn--outline" @click="exportarCSV">
          <q-icon name="file_download" size="18px" />
          Excel
        </button>
        <button class="page-btn page-btn--primary">
          <q-icon name="add" size="18px" />
          Nova patrulha
        </button>
      </div>
    </header>

    <!-- ============================================================ -->
    <!-- KPIs                                                          -->
    <!-- ============================================================ -->
    <section class="kpi-grid">
      <div class="kpi">
        <div class="kpi__icon kpi__icon--info"><q-icon name="event" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ totalPlaneadas }}</div>
          <div class="kpi__label">Planeadas</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--warning"><q-icon name="play_circle" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ totalEmCurso }}</div>
          <div class="kpi__label">Em curso</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--success"><q-icon name="check_circle" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ totalConcluidas }}</div>
          <div class="kpi__label">Concluídas</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--critical"><q-icon name="cancel" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ totalCanceladas }}</div>
          <div class="kpi__label">Canceladas</div>
        </div>
      </div>
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
          placeholder="Pesquisar por código, agente, viatura…"
        />
      </div>

      <select v-model="filtroEstado" class="filter filter__select">
        <option value="">Todos os estados</option>
        <option value="Planeada">Planeada</option>
        <option value="Em curso">Em curso</option>
        <option value="Concluída">Concluída</option>
        <option value="Cancelada">Cancelada</option>
      </select>

      <select v-model="filtroAgente" class="filter filter__select">
        <option value="">Todos os agentes</option>
        <option value="Agente Chissano">Agente Chissano</option>
        <option value="Agente Nhaca">Agente Nhaca</option>
        <option value="Agente Sitoe">Agente Sitoe</option>
        <option value="Agente Cumbe">Agente Cumbe</option>
      </select>
    </section>

    <!-- ============================================================ -->
    <!-- TABELA                                                        -->
    <!-- ============================================================ -->
    <section class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nome</th>
            <th>Data</th>
            <th>Agente</th>
            <th>Viatura</th>
            <th>Progresso</th>
            <th>Estado</th>
            <th class="data-table__th-actions" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in filtrados" :key="p.codigo" class="data-table__row">
            <td><b>{{ p.codigo }}</b></td>
            <td class="table-nome">{{ p.nome }}</td>
            <td class="table-time">{{ p.data }}</td>
            <td>
              <div class="agente">
                <div class="agente__avatar">{{ iniciais(p.agente) }}</div>
                <span>{{ p.agente }}</span>
              </div>
            </td>
            <td>
              <span v-if="p.viatura !== '—'" class="viatura">
                <q-icon name="directions_car" size="14px" />
                {{ p.viatura }}
              </span>
              <span v-else class="viatura viatura--empty">—</span>
            </td>
            <td>
              <div class="progress">
                <div class="progress__bar">
                  <div
                    class="progress__fill"
                    :class="`progress__fill--${progressoClasse(p.progresso, p.estado)}`"
                    :style="{ width: `${progressoPercent(p.progresso)}%` }"
                  />
                </div>
                <span class="progress__value">{{ p.progresso }}</span>
              </div>
            </td>
            <td>
              <span class="badge" :class="`badge--${estadoClasse(p.estado)}`">
                {{ p.estado }}
              </span>
            </td>
            <td class="data-table__actions">
              <button class="row-action" title="Ver detalhes">
                <q-icon name="visibility" size="18px" />
              </button>
              <button class="row-action" title="Editar">
                <q-icon name="edit" size="18px" />
              </button>
            </td>
          </tr>

          <tr v-if="!filtrados.length">
            <td colspan="8" class="data-table__empty">
              Nenhuma patrulha encontrada com estes filtros.
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
// Tipos
// ============================================================
type Estado = 'Planeada' | 'Em curso' | 'Concluída' | 'Cancelada'

interface Patrulha {
  codigo: string
  nome: string
  data: string
  agente: string
  viatura: string
  progresso: string
  estado: Estado
}

// ============================================================
// Estado
// ============================================================
const pesquisa = ref('')
const filtroEstado = ref('')
const filtroAgente = ref('')

// ============================================================
// Dados fictícios
// ============================================================
const patrulhas = ref<Patrulha[]>([
  { codigo: 'PT-26-00020', nome: 'Patrulha Baixa manhã',    data: '23 Set 2026', agente: 'Agente Chissano', viatura: 'MAP-2290', progresso: '5/10', estado: 'Em curso' },
  { codigo: 'PT-26-00019', nome: 'Patrulha EN4 manhã',      data: '23 Set 2026', agente: 'Agente Sitoe',    viatura: 'MAP-4412', progresso: '0/10', estado: 'Planeada' },
  { codigo: 'PT-26-00018', nome: 'Ronda KaMpfumo',          data: '23 Set 2026', agente: 'Agente Nhaca',    viatura: 'MAP-4413', progresso: '0/8',  estado: 'Planeada' },
  { codigo: 'PT-26-00017', nome: 'Controlo Machava',        data: '22 Set 2026', agente: 'Agente Cumbe',    viatura: 'MAP-7781', progresso: '9/10', estado: 'Concluída' },
  { codigo: 'PT-26-00016', nome: 'Patrulha Matola manhã',   data: '22 Set 2026', agente: 'Agente Nhaca',    viatura: 'MAP-4413', progresso: '8/10', estado: 'Concluída' },
  { codigo: 'PT-26-00015', nome: 'Ronda Baixa — teste',     data: '22 Set 2026', agente: 'Agente Chissano', viatura: 'MAP-2290', progresso: '3/5',  estado: 'Concluída' },
  { codigo: 'PT-26-00014', nome: 'Patrulha EN4 tarde',      data: '21 Set 2026', agente: 'Agente Sitoe',    viatura: 'MAP-4412', progresso: '9/10', estado: 'Concluída' },
  { codigo: 'PT-26-00013', nome: 'Controlo Matola',         data: '21 Set 2026', agente: 'Agente Nhaca',    viatura: 'MAP-4413', progresso: '10/10', estado: 'Concluída' },
  { codigo: 'PT-26-00012', nome: 'Patrulha Baixa tarde',    data: '20 Set 2026', agente: 'Agente Cumbe',    viatura: 'MAP-7781', progresso: '9/10', estado: 'Concluída' },
  { codigo: 'PT-26-00011', nome: 'Patrulha EN4 especial',   data: '19 Set 2026', agente: '—',               viatura: '—',        progresso: '0/10', estado: 'Cancelada' },
])

// ============================================================
// KPIs
// ============================================================
const totalPlaneadas = computed(() => patrulhas.value.filter((p) => p.estado === 'Planeada').length)
const totalEmCurso = computed(() => patrulhas.value.filter((p) => p.estado === 'Em curso').length)
const totalConcluidas = computed(() => patrulhas.value.filter((p) => p.estado === 'Concluída').length)
const totalCanceladas = computed(() => patrulhas.value.filter((p) => p.estado === 'Cancelada').length)

// ============================================================
// Filtragem
// ============================================================
const filtrados = computed(() => {
  return patrulhas.value.filter((p) => {
    if (pesquisa.value) {
      const q = pesquisa.value.toLowerCase()
      if (
        !p.codigo.toLowerCase().includes(q) &&
        !p.nome.toLowerCase().includes(q) &&
        !p.agente.toLowerCase().includes(q) &&
        !p.viatura.toLowerCase().includes(q)
      ) return false
    }
    if (filtroEstado.value && p.estado !== filtroEstado.value) return false
    if (filtroAgente.value && p.agente !== filtroAgente.value) return false
    return true
  })
})

// ============================================================
// Helpers
// ============================================================
function iniciais(nome: string): string {
  if (!nome || nome === '—') return '—'
  const partes = nome.trim().split(/\s+/)
  const p = partes[0]?.[0] ?? ''
  const u = partes.length > 1 ? partes[partes.length - 1]?.[0] ?? '' : ''
  return (p + u).toUpperCase()
}

function estadoClasse(estado: Estado): 'regular' | 'atencao' | 'critico' | 'neutral' {
  if (estado === 'Concluída') return 'regular'
  if (estado === 'Em curso') return 'atencao'
  if (estado === 'Cancelada') return 'critico'
  return 'neutral'
}

function progressoPercent(progresso: string): number {
  const [a, b] = progresso.split('/').map(Number)
  if (!a || !b) return 0
  return Math.round((a / b) * 100)
}

function progressoClasse(progresso: string, estado: Estado): 'regular' | 'atencao' | 'critico' {
  if (estado === 'Cancelada') return 'critico'
  const p = progressoPercent(progresso)
  if (p === 100) return 'regular'
  if (p >= 50) return 'atencao'
  return 'critico'
}

function exportarCSV() {
  const linhas: string[][] = [
    ['SICAM — CHEFE DE POSTO — Patrulhas'],
    [`Gerado em: ${new Date().toLocaleString('pt-PT')}`],
    [],
    ['Código', 'Nome', 'Data', 'Agente', 'Viatura', 'Progresso', 'Estado'],
    ...filtrados.value.map((p) => [
      p.codigo, p.nome, p.data, p.agente, p.viatura, p.progresso, p.estado,
    ]),
  ]

  const csv = linhas
    .map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `chefe-patrulhas-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)

  $q.notify({ type: 'positive', message: 'CSV exportado.', position: 'top' })
}
</script>

<style scoped lang="scss">
.pt-page { padding: 24px 20px 48px; max-width: 1180px; margin: 0 auto; }

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
    width: 44px; height: 44px; border-radius: 12px;
    display: grid; place-items: center; flex-shrink: 0;
    &--info     { background: #dbeafe;                  color: #2563eb; }
    &--warning  { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
    &--success  { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
    &--critical { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
  }
  &__value { font-size: 22px; font-weight: 700; color: var(--sicam-ink); line-height: 1; }
  &__label { font-size: 12px; color: var(--sicam-muted); margin-top: 2px; }
}

// ============================================================
// Filtros
// ============================================================
.filters { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }

.filter {
  display: flex; align-items: center; background: #fff;
  border: 1px solid var(--sicam-line); border-radius: 10px;
  padding: 0 14px; height: 44px; font-family: inherit;

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
    color: var(--sicam-ink); height: 100%; cursor: pointer; min-width: 180px;
    &:focus { outline: 0; }
  }
}

// ============================================================
// Tabela
// ============================================================
.table-wrap {
  background: #fff; border-radius: 14px; overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.data-table {
  width: 100%; border-collapse: collapse;
  min-width: 1100px;

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
  &__th-actions { width: 100px; text-align: right; }
  &__actions { text-align: right; white-space: nowrap; }
  &__empty {
    text-align: center; color: var(--sicam-muted);
    padding: 40px 16px !important; font-size: 14px;
  }
}

.table-nome { color: var(--sicam-ink-soft); font-size: 13px; }
.table-time { color: var(--sicam-muted); font-size: 13px; white-space: nowrap; }

// Agente
.agente {
  display: flex; align-items: center; gap: 8px;

  &__avatar {
    width: 28px; height: 28px; border-radius: 50%;
    background: var(--sicam-primary-bg);
    color: var(--sicam-primary);
    display: grid; place-items: center;
    font-size: 10px; font-weight: 700;
    flex-shrink: 0;
    letter-spacing: 0.02em;
  }

  span {
    font-size: 13px;
    color: var(--sicam-ink-soft);
    white-space: nowrap;
  }
}

// Viatura
.viatura {
  display: inline-flex; align-items: center; gap: 5px;
  color: var(--sicam-ink-soft); font-size: 13px;
  font-weight: 600;

  .q-icon { color: var(--sicam-muted); }

  &--empty { color: var(--sicam-muted); }
}

// Progresso
.progress {
  display: flex; align-items: center; gap: 10px;

  &__bar {
    width: 70px;
    height: 6px;
    background: var(--sicam-line-soft);
    border-radius: 99px;
    overflow: hidden;
    flex-shrink: 0;
  }

  &__fill {
    height: 100%;
    border-radius: 99px;
    transition: width 0.4s ease;

    &--regular { background: var(--sicam-success); }
    &--atencao { background: var(--sicam-warning); }
    &--critico { background: var(--sicam-critical); }
  }

  &__value {
    font-size: 13px;
    font-weight: 700;
    color: var(--sicam-ink);
    letter-spacing: 0.02em;
  }
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

// Acções
.row-action {
  display: inline-grid; place-items: center; width: 34px; height: 34px;
  border: 0; border-radius: 8px; background: transparent; color: var(--sicam-muted);
  cursor: pointer; margin-left: 2px; transition: all 0.15s;

  &:hover { background: var(--sicam-surface-hover); color: var(--sicam-ink); }
}
</style>