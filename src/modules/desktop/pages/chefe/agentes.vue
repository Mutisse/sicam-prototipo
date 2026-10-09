<template>
  <q-page class="ag-page">
    <!-- ============================================================ -->
    <!-- CABEÇALHO                                                     -->
    <!-- ============================================================ -->
    <header class="page-head">
      <div>
        <h1 class="page-head__title">Agentes</h1>
        <p class="page-head__sub">
          Gestão dos agentes sob a sua supervisão
        </p>
      </div>

      <div class="page-head__actions">
        <button class="page-btn page-btn--outline" @click="exportarCSV">
          <q-icon name="file_download" size="18px" />
          Excel
        </button>
        <button class="page-btn page-btn--primary">
          <q-icon name="person_add" size="18px" />
          Novo agente
        </button>
      </div>
    </header>

    <!-- ============================================================ -->
    <!-- KPIs                                                          -->
    <!-- ============================================================ -->
    <section class="kpi-grid">
      <div class="kpi">
        <div class="kpi__icon kpi__icon--primary"><q-icon name="people" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ agentes.length }}</div>
          <div class="kpi__label">Total</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--success"><q-icon name="wifi_tethering" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ totalOnline }}</div>
          <div class="kpi__label">Online</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--warning"><q-icon name="directions_car" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ totalEmPatrulha }}</div>
          <div class="kpi__label">Em patrulha</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--critical"><q-icon name="cloud_off" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ totalOffline }}</div>
          <div class="kpi__label">Offline</div>
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
          placeholder="Pesquisar por nome, nº de série…"
        />
      </div>

      <select v-model="filtroEstado" class="filter filter__select">
        <option value="">Todos os estados</option>
        <option value="Online">Online</option>
        <option value="Em patrulha">Em patrulha</option>
        <option value="Offline">Offline</option>
      </select>

      <select v-model="filtroTurno" class="filter filter__select">
        <option value="">Todos os turnos</option>
        <option value="Manhã">Manhã</option>
        <option value="Tarde">Tarde</option>
        <option value="Noite">Noite</option>
      </select>
    </section>

    <!-- ============================================================ -->
    <!-- TABELA                                                        -->
    <!-- ============================================================ -->
    <section class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Agente</th>
            <th>Nº Série</th>
            <th>Turno</th>
            <th>Viatura</th>
            <th>Estado</th>
            <th>Última sinc.</th>
            <th>Consultas hoje</th>
            <th class="data-table__th-actions" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in filtrados" :key="a.nSerie" class="data-table__row">
            <td>
              <div class="agente">
                <div class="agente__avatar">{{ iniciais(a.nome) }}</div>
                <div>
                  <b>{{ a.nome }}</b>
                  <small>{{ a.email }}</small>
                </div>
              </div>
            </td>
            <td class="table-serie"><b>{{ a.nSerie }}</b></td>
            <td>{{ a.turno }}</td>
            <td>
              <span class="viatura">
                <q-icon name="directions_car" size="14px" />
                {{ a.viatura }}
              </span>
            </td>
            <td>
              <span class="badge" :class="`badge--${estadoClasse(a.estado)}`">
                {{ a.estado }}
              </span>
            </td>
            <td class="table-time">{{ a.ultimaSinc }}</td>
            <td>
              <div class="consultas">
                <b>{{ a.consultasHoje }}</b>
                <small>consultas</small>
              </div>
            </td>
            <td class="data-table__actions">
              <button class="row-action" title="Ver detalhes">
                <q-icon name="visibility" size="18px" />
              </button>
              <button class="row-action" title="Mensagem">
                <q-icon name="chat" size="18px" />
              </button>
            </td>
          </tr>

          <tr v-if="!filtrados.length">
            <td colspan="8" class="data-table__empty">
              Nenhum agente encontrado com estes filtros.
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
type Estado = 'Online' | 'Em patrulha' | 'Offline'
type Turno = 'Manhã' | 'Tarde' | 'Noite'

interface Agente {
  nome: string
  email: string
  nSerie: string
  turno: Turno
  viatura: string
  estado: Estado
  ultimaSinc: string
  consultasHoje: number
}

// ============================================================
// Estado
// ============================================================
const pesquisa = ref('')
const filtroEstado = ref('')
const filtroTurno = ref('')

// ============================================================
// Dados fictícios
// ============================================================
const agentes = ref<Agente[]>([
  { nome: 'Agente Chissano',  email: 'chissano@sicam.gov.mz',  nSerie: 'SN-AGT-001', turno: 'Manhã', viatura: 'MAP-2290', estado: 'Em patrulha', ultimaSinc: '22/09 17:07', consultasHoje: 18 },
  { nome: 'Agente Nhaca',     email: 'nhaca@sicam.gov.mz',     nSerie: 'SN-AGT-002', turno: 'Manhã', viatura: 'MAP-4413', estado: 'Online',      ultimaSinc: '23/09 01:07', consultasHoje: 12 },
  { nome: 'Agente Sitoe',     email: 'sitoe@sicam.gov.mz',     nSerie: 'SN-AGT-004', turno: 'Tarde', viatura: 'MAP-4412', estado: 'Em patrulha', ultimaSinc: '22/09 19:07', consultasHoje: 9 },
  { nome: 'Agente Cumbe',     email: 'cumbe@sicam.gov.mz',     nSerie: 'SN-AGT-007', turno: 'Tarde', viatura: 'MAP-7781', estado: 'Online',      ultimaSinc: '21/09 00:07', consultasHoje: 6 },
  { nome: 'Agente Bila',      email: 'bila@sicam.gov.mz',      nSerie: 'SN-AGT-008', turno: 'Noite', viatura: '—',        estado: 'Offline',     ultimaSinc: '10/09 08:07', consultasHoje: 0 },
  { nome: 'Agente Tembe',     email: 'tembe@sicam.gov.mz',     nSerie: 'SN-AGT-011', turno: 'Noite', viatura: 'MAP-2290', estado: 'Online',      ultimaSinc: '22/09 21:07', consultasHoje: 4 },
])

// ============================================================
// KPIs
// ============================================================
const totalOnline = computed(() => agentes.value.filter((a) => a.estado === 'Online').length)
const totalEmPatrulha = computed(() => agentes.value.filter((a) => a.estado === 'Em patrulha').length)
const totalOffline = computed(() => agentes.value.filter((a) => a.estado === 'Offline').length)

// ============================================================
// Filtragem
// ============================================================
const filtrados = computed(() => {
  return agentes.value.filter((a) => {
    if (pesquisa.value) {
      const q = pesquisa.value.toLowerCase()
      if (
        !a.nome.toLowerCase().includes(q) &&
        !a.nSerie.toLowerCase().includes(q) &&
        !a.email.toLowerCase().includes(q)
      ) return false
    }
    if (filtroEstado.value && a.estado !== filtroEstado.value) return false
    if (filtroTurno.value && a.turno !== filtroTurno.value) return false
    return true
  })
})

// ============================================================
// Helpers
// ============================================================
function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/)
  const p = partes[0]?.[0] ?? ''
  const u = partes.length > 1 ? partes[partes.length - 1]?.[0] ?? '' : ''
  return (p + u).toUpperCase()
}

function estadoClasse(estado: Estado): 'regular' | 'atencao' | 'critico' {
  if (estado === 'Online') return 'regular'
  if (estado === 'Em patrulha') return 'atencao'
  return 'critico'
}

function exportarCSV() {
  const linhas: string[][] = [
    ['SICAM — CHEFE DE POSTO — Agentes'],
    [`Gerado em: ${new Date().toLocaleString('pt-PT')}`],
    [],
    ['Nome', 'E-mail', 'Nº Série', 'Turno', 'Viatura', 'Estado', 'Última sinc.', 'Consultas hoje'],
    ...filtrados.value.map((a) => [
      a.nome, a.email, a.nSerie, a.turno, a.viatura, a.estado, a.ultimaSinc, String(a.consultasHoje),
    ]),
  ]

  const csv = linhas
    .map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `chefe-agentes-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)

  $q.notify({ type: 'positive', message: 'CSV exportado.', position: 'top' })
}
</script>

<style scoped lang="scss">
.ag-page { padding: 24px 20px 48px; max-width: 1180px; margin: 0 auto; }

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
    &--primary  { background: var(--sicam-primary-bg);  color: var(--sicam-primary); }
    &--success  { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
    &--warning  { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
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
    color: var(--sicam-ink); height: 100%; cursor: pointer; min-width: 160px;
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

.table-time { color: var(--sicam-muted); font-size: 13px; white-space: nowrap; }
.table-serie { color: var(--sicam-ink-soft); font-size: 13px; }

// Agente
.agente {
  display: flex; align-items: center; gap: 10px;

  &__avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: var(--sicam-primary-bg);
    color: var(--sicam-primary);
    display: grid; place-items: center;
    font-size: 12px; font-weight: 700;
    flex-shrink: 0;
    letter-spacing: 0.02em;
  }

  b {
    display: block; font-size: 14px;
    color: var(--sicam-ink); font-weight: 600;
  }

  small {
    display: block; font-size: 11px;
    color: var(--sicam-muted); margin-top: 1px;
  }
}

// Viatura
.viatura {
  display: inline-flex; align-items: center; gap: 5px;
  color: var(--sicam-ink-soft); font-size: 13px;
  font-weight: 600;

  .q-icon { color: var(--sicam-muted); }
}

// Consultas
.consultas {
  display: flex; flex-direction: column; align-items: flex-start;

  b {
    font-size: 16px; font-weight: 700;
    color: var(--sicam-primary); line-height: 1;
  }

  small {
    font-size: 10px; color: var(--sicam-muted);
    margin-top: 2px; text-transform: uppercase;
    letter-spacing: 0.05em;
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
}

// Acções
.row-action {
  display: inline-grid; place-items: center; width: 34px; height: 34px;
  border: 0; border-radius: 8px; background: transparent; color: var(--sicam-muted);
  cursor: pointer; margin-left: 2px; transition: all 0.15s;

  &:hover { background: var(--sicam-surface-hover); color: var(--sicam-ink); }
}
</style>