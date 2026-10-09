<template>
  <q-page class="ap-page">
    <!-- ============================================================ -->
    <!-- CABEÇALHO                                                     -->
    <!-- ============================================================ -->
    <header class="page-head">
      <div>
        <h1 class="page-head__title">Apólices</h1>
        <p class="page-head__sub">
          Registo de apólices de seguro obrigatório e estados de validade
        </p>
      </div>

      <div class="page-head__actions">
        <button class="page-btn page-btn--outline" @click="exportarCSV">
          <q-icon name="file_download" size="18px" />
          Excel
        </button>
        <button class="page-btn page-btn--primary">
          <q-icon name="add" size="18px" />
          Nova apólice
        </button>
      </div>
    </header>

    <!-- ============================================================ -->
    <!-- KPIs                                                          -->
    <!-- ============================================================ -->
    <section class="kpi-grid">
      <div class="kpi">
        <div class="kpi__icon kpi__icon--primary"><q-icon name="shield" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ apolices.length }}</div>
          <div class="kpi__label">Total</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--success"><q-icon name="verified" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ totalActivas }}</div>
          <div class="kpi__label">Activas</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--warning"><q-icon name="hourglass_top" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ totalAExpirar }}</div>
          <div class="kpi__label">A expirar (30d)</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--critical"><q-icon name="cancel" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ totalExpiradas }}</div>
          <div class="kpi__label">Expiradas</div>
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
          placeholder="Pesquisar por matrícula, nº de apólice…"
        />
      </div>

      <select v-model="filtroSeguradora" class="filter filter__select">
        <option value="">Todas as seguradoras</option>
        <option value="Seguradora A">Seguradora A</option>
        <option value="Seguradora B">Seguradora B</option>
        <option value="Seguradora C">Seguradora C</option>
      </select>

      <select v-model="filtroTipo" class="filter filter__select">
        <option value="">Todos os tipos</option>
        <option value="Terceiros">Terceiros</option>
        <option value="Terceiros + Roubo">Terceiros + Roubo</option>
        <option value="Todos os riscos">Todos os riscos</option>
      </select>

      <select v-model="filtroEstado" class="filter filter__select">
        <option value="">Todos os estados</option>
        <option value="Activa">Activa</option>
        <option value="A expirar">A expirar</option>
        <option value="Expirada">Expirada</option>
      </select>
    </section>

    <!-- ============================================================ -->
    <!-- TABELA                                                        -->
    <!-- ============================================================ -->
    <section class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nº Apólice</th>
            <th>Matrícula</th>
            <th>Seguradora</th>
            <th>Tipo</th>
            <th>Início</th>
            <th>Fim</th>
            <th>Prémio</th>
            <th>Estado</th>
            <th class="data-table__th-actions" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in paginaVisivel" :key="a.numero" class="data-table__row">
            <td><b>{{ a.numero }}</b></td>
            <td>
              <div class="placa">
                <q-icon name="directions_car" size="14px" class="placa__icon" />
                <b>{{ a.matricula }}</b>
              </div>
            </td>
            <td>{{ a.seguradora }}</td>
            <td class="cell-tipo">{{ a.tipo }}</td>
            <td class="table-time">{{ a.inicio }}</td>
            <td class="table-time">{{ a.fim }}</td>
            <td class="cell-valor">{{ a.premio }}</td>
            <td>
              <span class="badge" :class="`badge--${estadoClasse(a.estado)}`">
                {{ a.estado }}
              </span>
            </td>
            <td class="data-table__actions">
              <button class="row-action" title="Ver">
                <q-icon name="visibility" size="18px" />
              </button>
              <button class="row-action" title="Editar">
                <q-icon name="edit" size="18px" />
              </button>
            </td>
          </tr>

          <tr v-if="!paginaVisivel.length">
            <td colspan="9" class="data-table__empty">
              Nenhuma apólice encontrada com estes filtros.
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginação -->
      <footer v-if="totalPaginas > 1" class="pagination">
        <div class="pagination__info">
          A mostrar <b>{{ inicioPagina + 1 }}–{{ fimPagina }}</b> de <b>{{ filtrados.length }}</b>
        </div>
        <div class="pagination__controls">
          <button
            class="pagination__btn"
            :disabled="paginaActual <= 1"
            @click="paginaActual--"
          >
            <q-icon name="chevron_left" size="18px" />
            Anterior
          </button>
          <span class="pagination__page">Página {{ paginaActual }} de {{ totalPaginas }}</span>
          <button
            class="pagination__btn"
            :disabled="paginaActual >= totalPaginas"
            @click="paginaActual++"
          >
            Próxima
            <q-icon name="chevron_right" size="18px" />
          </button>
        </div>
      </footer>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// ============================================================
// Tipos
// ============================================================
type Estado = 'Activa' | 'A expirar' | 'Expirada'
type Tipo = 'Terceiros' | 'Terceiros + Roubo' | 'Todos os riscos'

interface Apolice {
  numero: string
  matricula: string
  seguradora: string
  tipo: Tipo
  inicio: string
  fim: string
  premio: string
  estado: Estado
}

// ============================================================
// Estado
// ============================================================
const pesquisa = ref('')
const filtroSeguradora = ref('')
const filtroTipo = ref('')
const filtroEstado = ref('')

// ============================================================
// Dados fictícios
// ============================================================
const apolices = ref<Apolice[]>([
  { numero: 'AP-2026-000342', matricula: 'AGL-482-MC', seguradora: 'Seguradora A', tipo: 'Terceiros',         inicio: '12/08/2026', fim: '12/08/2027', premio: '18 500 MT', estado: 'Activa' },
  { numero: 'AP-2026-000341', matricula: 'ABR-771-MP', seguradora: 'Seguradora B', tipo: 'Todos os riscos',   inicio: '05/09/2025', fim: '05/09/2026', premio: '42 800 MT', estado: 'A expirar' },
  { numero: 'AP-2026-000340', matricula: 'AFC-205-MC', seguradora: 'Seguradora A', tipo: 'Terceiros',         inicio: '18/03/2024', fim: '18/03/2025', premio: '16 200 MT', estado: 'Expirada' },
  { numero: 'AP-2026-000339', matricula: 'ACD-918-MP', seguradora: 'Seguradora C', tipo: 'Terceiros + Roubo', inicio: '22/06/2026', fim: '22/06/2027', premio: '28 400 MT', estado: 'Activa' },
  { numero: 'AP-2026-000338', matricula: 'AHN-304-MC', seguradora: 'Seguradora B', tipo: 'Todos os riscos',   inicio: '10/11/2026', fim: '10/11/2027', premio: '58 900 MT', estado: 'Activa' },
  { numero: 'AP-2026-000337', matricula: 'ABX-556-MP', seguradora: 'Seguradora A', tipo: 'Terceiros',         inicio: '15/09/2025', fim: '15/09/2026', premio: '17 800 MT', estado: 'A expirar' },
  { numero: 'AP-2026-000336', matricula: 'AJK-120-MC', seguradora: 'Seguradora C', tipo: 'Terceiros + Roubo', inicio: '20/08/2025', fim: '20/08/2026', premio: '26 100 MT', estado: 'Expirada' },
  { numero: 'AP-2026-000335', matricula: 'ADT-873-MP', seguradora: 'Seguradora B', tipo: 'Todos os riscos',   inicio: '12/07/2026', fim: '12/07/2027', premio: '45 600 MT', estado: 'Activa' },
  { numero: 'AP-2026-000334', matricula: 'AEF-649-MC', seguradora: 'Seguradora A', tipo: 'Terceiros',         inicio: '08/10/2025', fim: '08/10/2026', premio: '19 200 MT', estado: 'A expirar' },
  { numero: 'AP-2026-000333', matricula: 'AGH-231-MP', seguradora: 'Seguradora C', tipo: 'Terceiros + Roubo', inicio: '14/05/2026', fim: '14/05/2027', premio: '29 800 MT', estado: 'Activa' },
  { numero: 'AP-2026-000332', matricula: 'ALM-507-MC', seguradora: 'Seguradora B', tipo: 'Todos os riscos',   inicio: '30/06/2026', fim: '30/06/2027', premio: '52 400 MT', estado: 'Activa' },
  { numero: 'AP-2026-000331', matricula: 'AKP-412-MP', seguradora: 'Seguradora A', tipo: 'Terceiros',         inicio: '25/02/2024', fim: '25/02/2025', premio: '15 800 MT', estado: 'Expirada' },
])

// ============================================================
// KPIs
// ============================================================
const totalActivas = computed(() => apolices.value.filter((a) => a.estado === 'Activa').length)
const totalAExpirar = computed(() => apolices.value.filter((a) => a.estado === 'A expirar').length)
const totalExpiradas = computed(() => apolices.value.filter((a) => a.estado === 'Expirada').length)

// ============================================================
// Filtragem
// ============================================================
const filtrados = computed(() => {
  return apolices.value.filter((a) => {
    if (pesquisa.value) {
      const q = pesquisa.value.toLowerCase()
      if (
        !a.matricula.toLowerCase().includes(q) &&
        !a.numero.toLowerCase().includes(q)
      ) return false
    }
    if (filtroSeguradora.value && a.seguradora !== filtroSeguradora.value) return false
    if (filtroTipo.value && a.tipo !== filtroTipo.value) return false
    if (filtroEstado.value && a.estado !== filtroEstado.value) return false
    return true
  })
})

// ============================================================
// Paginação
// ============================================================
const POR_PAGINA = 10
const paginaActual = ref(1)

watch([pesquisa, filtroSeguradora, filtroTipo, filtroEstado], () => {
  paginaActual.value = 1
})

const totalPaginas = computed(() =>
  Math.max(1, Math.ceil(filtrados.value.length / POR_PAGINA)),
)
const inicioPagina = computed(() => (paginaActual.value - 1) * POR_PAGINA)
const fimPagina = computed(() =>
  Math.min(paginaActual.value * POR_PAGINA, filtrados.value.length),
)
const paginaVisivel = computed(() =>
  filtrados.value.slice(inicioPagina.value, fimPagina.value),
)

// ============================================================
// Helpers
// ============================================================
function estadoClasse(estado: Estado): 'regular' | 'atencao' | 'critico' {
  if (estado === 'Activa') return 'regular'
  if (estado === 'A expirar') return 'atencao'
  return 'critico'
}

function exportarCSV() {
  const linhas: string[][] = [
    ['SICAM — ISSM — Apólices'],
    [`Gerado em: ${new Date().toLocaleString('pt-PT')}`],
    [],
    ['Nº Apólice', 'Matrícula', 'Seguradora', 'Tipo', 'Início', 'Fim', 'Prémio', 'Estado'],
    ...filtrados.value.map((a) => [
      a.numero, a.matricula, a.seguradora, a.tipo, a.inicio, a.fim, a.premio, a.estado,
    ]),
  ]

  const csv = linhas
    .map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `issm-apolices-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)

  $q.notify({ type: 'positive', message: 'CSV exportado.', position: 'top' })
}
</script>

<style scoped lang="scss">
.ap-page { padding: 24px 20px 48px; max-width: 1180px; margin: 0 auto; }

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
.cell-tipo { color: var(--sicam-ink-soft); font-size: 13px; }
.cell-valor { font-weight: 700; color: var(--sicam-ink); white-space: nowrap; }

.placa {
  display: flex; align-items: center; gap: 6px;
  b { font-weight: 700; letter-spacing: 0.02em; }
  &__icon { color: var(--sicam-muted); }
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

// Paginação
.pagination {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 14px 16px;
  border-top: 1px solid var(--sicam-line);
  flex-wrap: wrap;

  &__info { font-size: 13px; color: var(--sicam-muted);
    b { color: var(--sicam-ink); font-weight: 600; } }
  &__controls { display: flex; align-items: center; gap: 8px; }
  &__btn {
    display: inline-flex; align-items: center; gap: 4px;
    background: #fff; border: 1px solid var(--sicam-line); border-radius: 8px;
    padding: 8px 14px; font-size: 13px; font-weight: 600; color: var(--sicam-ink);
    cursor: pointer; font-family: inherit; transition: all 0.15s;
    &:hover:not(:disabled) { background: var(--sicam-surface-hover); border-color: var(--sicam-line-strong); }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
  }
  &__page { font-size: 12px; color: var(--sicam-muted); font-weight: 600; padding: 0 4px; white-space: nowrap; }
}
</style>