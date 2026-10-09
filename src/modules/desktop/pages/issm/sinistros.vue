<template>
  <q-page class="sn-page">
    <!-- ============================================================ -->
    <!-- CABEÇALHO                                                     -->
    <!-- ============================================================ -->
    <header class="page-head">
      <div>
        <h1 class="page-head__title">Sinistros</h1>
        <p class="page-head__sub">
          Registo de sinistros associados a apólices activas
        </p>
      </div>

      <div class="page-head__actions">
        <button class="page-btn page-btn--outline" @click="exportarCSV">
          <q-icon name="file_download" size="18px" />
          Excel
        </button>
        <button class="page-btn page-btn--primary">
          <q-icon name="add" size="18px" />
          Registar sinistro
        </button>
      </div>
    </header>

    <!-- ============================================================ -->
    <!-- KPIs                                                          -->
    <!-- ============================================================ -->
    <section class="kpi-grid">
      <div class="kpi">
        <div class="kpi__icon kpi__icon--primary"><q-icon name="report_problem" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ sinistros.length }}</div>
          <div class="kpi__label">Total</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--critical"><q-icon name="pending" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ totalAbertos }}</div>
          <div class="kpi__label">Abertos</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--warning"><q-icon name="autorenew" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ totalEmAnalise }}</div>
          <div class="kpi__label">Em análise</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--success"><q-icon name="check_circle" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ totalResolvidos }}</div>
          <div class="kpi__label">Resolvidos</div>
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
          placeholder="Pesquisar por matrícula, nº sinistro…"
        />
      </div>

      <select v-model="filtroTipo" class="filter filter__select">
        <option value="">Todos os tipos</option>
        <option value="Colisão">Colisão</option>
        <option value="Furto">Furto</option>
        <option value="Incêndio">Incêndio</option>
        <option value="Inundação">Inundação</option>
        <option value="Vandalismo">Vandalismo</option>
      </select>

      <select v-model="filtroEstado" class="filter filter__select">
        <option value="">Todos os estados</option>
        <option value="Aberto">Aberto</option>
        <option value="Em análise">Em análise</option>
        <option value="Resolvido">Resolvido</option>
      </select>

      <select v-model="filtroSeguradora" class="filter filter__select">
        <option value="">Todas as seguradoras</option>
        <option value="Seguradora A">Seguradora A</option>
        <option value="Seguradora B">Seguradora B</option>
        <option value="Seguradora C">Seguradora C</option>
      </select>
    </section>

    <!-- ============================================================ -->
    <!-- TABELA                                                        -->
    <!-- ============================================================ -->
    <section class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nº Sinistro</th>
            <th>Matrícula</th>
            <th>Seguradora</th>
            <th>Tipo</th>
            <th>Data</th>
            <th>Valor estimado</th>
            <th>Estado</th>
            <th class="data-table__th-actions" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in paginaVisivel" :key="s.numero" class="data-table__row">
            <td><b>{{ s.numero }}</b></td>
            <td>
              <div class="placa">
                <q-icon name="directions_car" size="14px" class="placa__icon" />
                <b>{{ s.matricula }}</b>
              </div>
            </td>
            <td>{{ s.seguradora }}</td>
            <td>
              <span class="tipo" :class="`tipo--${tipoClasse(s.tipo)}`">
                <q-icon :name="tipoIcone(s.tipo)" size="14px" />
                {{ s.tipo }}
              </span>
            </td>
            <td class="table-time">{{ s.data }}</td>
            <td class="cell-valor">{{ s.valor }}</td>
            <td>
              <span class="badge" :class="`badge--${estadoClasse(s.estado)}`">
                {{ s.estado }}
              </span>
            </td>
            <td class="data-table__actions">
              <button class="row-action" title="Ver">
                <q-icon name="visibility" size="18px" />
              </button>
              <button class="row-action" title="Editar">
                <q-icon name="edit" size="18px" />
              </button>
              <button
                v-if="s.estado === 'Aberto'"
                class="row-action row-action--success"
                title="Marcar em análise"
                @click="marcarEmAnalise(s.numero)"
              >
                <q-icon name="hourglass_top" size="18px" />
              </button>
            </td>
          </tr>

          <tr v-if="!paginaVisivel.length">
            <td colspan="8" class="data-table__empty">
              Nenhum sinistro encontrado com estes filtros.
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
type Estado = 'Aberto' | 'Em análise' | 'Resolvido'
type Tipo = 'Colisão' | 'Furto' | 'Incêndio' | 'Inundação' | 'Vandalismo'

interface Sinistro {
  numero: string
  matricula: string
  seguradora: string
  tipo: Tipo
  data: string
  valor: string
  estado: Estado
}

// ============================================================
// Estado
// ============================================================
const pesquisa = ref('')
const filtroTipo = ref('')
const filtroEstado = ref('')
const filtroSeguradora = ref('')

// ============================================================
// Dados fictícios
// ============================================================
const sinistros = ref<Sinistro[]>([
  { numero: 'SN-2026-000087', matricula: 'AGL-482-MC', seguradora: 'Seguradora A', tipo: 'Colisão',    data: '22/09/2026', valor: '85 400 MT', estado: 'Aberto' },
  { numero: 'SN-2026-000086', matricula: 'ABR-771-MP', seguradora: 'Seguradora B', tipo: 'Furto',      data: '20/09/2026', valor: '420 000 MT', estado: 'Em análise' },
  { numero: 'SN-2026-000085', matricula: 'AFC-205-MC', seguradora: 'Seguradora A', tipo: 'Colisão',    data: '18/09/2026', valor: '62 800 MT', estado: 'Resolvido' },
  { numero: 'SN-2026-000084', matricula: 'ACD-918-MP', seguradora: 'Seguradora C', tipo: 'Vandalismo', data: '15/09/2026', valor: '18 200 MT', estado: 'Resolvido' },
  { numero: 'SN-2026-000083', matricula: 'AHN-304-MC', seguradora: 'Seguradora B', tipo: 'Colisão',    data: '12/09/2026', valor: '145 600 MT', estado: 'Em análise' },
  { numero: 'SN-2026-000082', matricula: 'ABX-556-MP', seguradora: 'Seguradora A', tipo: 'Inundação',  data: '08/09/2026', valor: '92 400 MT', estado: 'Resolvido' },
  { numero: 'SN-2026-000081', matricula: 'AJK-120-MC', seguradora: 'Seguradora C', tipo: 'Incêndio',   data: '05/09/2026', valor: '380 000 MT', estado: 'Aberto' },
  { numero: 'SN-2026-000080', matricula: 'ADT-873-MP', seguradora: 'Seguradora B', tipo: 'Furto',      data: '01/09/2026', valor: '560 000 MT', estado: 'Resolvido' },
  { numero: 'SN-2026-000079', matricula: 'AEF-649-MC', seguradora: 'Seguradora A', tipo: 'Colisão',    data: '28/08/2026', valor: '48 200 MT', estado: 'Resolvido' },
  { numero: 'SN-2026-000078', matricula: 'AGH-231-MP', seguradora: 'Seguradora C', tipo: 'Vandalismo', data: '25/08/2026', valor: '22 600 MT', estado: 'Em análise' },
  { numero: 'SN-2026-000077', matricula: 'ALM-507-MC', seguradora: 'Seguradora B', tipo: 'Colisão',    data: '22/08/2026', valor: '78 900 MT', estado: 'Aberto' },
  { numero: 'SN-2026-000076', matricula: 'AKP-412-MP', seguradora: 'Seguradora A', tipo: 'Furto',      data: '18/08/2026', valor: '395 000 MT', estado: 'Resolvido' },
])

// ============================================================
// KPIs
// ============================================================
const totalAbertos = computed(() => sinistros.value.filter((s) => s.estado === 'Aberto').length)
const totalEmAnalise = computed(() => sinistros.value.filter((s) => s.estado === 'Em análise').length)
const totalResolvidos = computed(() => sinistros.value.filter((s) => s.estado === 'Resolvido').length)

// ============================================================
// Filtragem
// ============================================================
const filtrados = computed(() => {
  return sinistros.value.filter((s) => {
    if (pesquisa.value) {
      const q = pesquisa.value.toLowerCase()
      if (
        !s.matricula.toLowerCase().includes(q) &&
        !s.numero.toLowerCase().includes(q)
      ) return false
    }
    if (filtroTipo.value && s.tipo !== filtroTipo.value) return false
    if (filtroEstado.value && s.estado !== filtroEstado.value) return false
    if (filtroSeguradora.value && s.seguradora !== filtroSeguradora.value) return false
    return true
  })
})

// ============================================================
// Paginação
// ============================================================
const POR_PAGINA = 10
const paginaActual = ref(1)

watch([pesquisa, filtroTipo, filtroEstado, filtroSeguradora], () => {
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
  if (estado === 'Resolvido') return 'regular'
  if (estado === 'Em análise') return 'atencao'
  return 'critico'
}

function tipoIcone(t: Tipo): string {
  if (t === 'Colisão') return 'car_crash'
  if (t === 'Furto') return 'local_police'
  if (t === 'Incêndio') return 'local_fire_department'
  if (t === 'Inundação') return 'water'
  return 'gavel'
}

function tipoClasse(t: Tipo): 'colisao' | 'furto' | 'incendio' | 'inundacao' | 'vandalismo' {
  if (t === 'Colisão') return 'colisao'
  if (t === 'Furto') return 'furto'
  if (t === 'Incêndio') return 'incendio'
  if (t === 'Inundação') return 'inundacao'
  return 'vandalismo'
}

function marcarEmAnalise(numero: string) {
  const s = sinistros.value.find((x) => x.numero === numero)
  if (s) {
    s.estado = 'Em análise'
    $q.notify({
      type: 'info',
      message: `Sinistro ${numero} marcado em análise.`,
      position: 'top',
    })
  }
}

function exportarCSV() {
  const linhas: string[][] = [
    ['SICAM — ISSM — Sinistros'],
    [`Gerado em: ${new Date().toLocaleString('pt-PT')}`],
    [],
    ['Nº Sinistro', 'Matrícula', 'Seguradora', 'Tipo', 'Data', 'Valor estimado', 'Estado'],
    ...filtrados.value.map((s) => [
      s.numero, s.matricula, s.seguradora, s.tipo, s.data, s.valor, s.estado,
    ]),
  ]

  const csv = linhas
    .map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `issm-sinistros-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)

  $q.notify({ type: 'positive', message: 'CSV exportado.', position: 'top' })
}
</script>

<style scoped lang="scss">
.sn-page { padding: 24px 20px 48px; max-width: 1180px; margin: 0 auto; }

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
  &__th-actions { width: 120px; text-align: right; }
  &__actions { text-align: right; white-space: nowrap; }
  &__empty {
    text-align: center; color: var(--sicam-muted);
    padding: 40px 16px !important; font-size: 14px;
  }
}

.table-time { color: var(--sicam-muted); font-size: 13px; white-space: nowrap; }
.cell-valor { font-weight: 700; color: var(--sicam-ink); white-space: nowrap; }

.placa {
  display: flex; align-items: center; gap: 6px;
  b { font-weight: 700; letter-spacing: 0.02em; }
  &__icon { color: var(--sicam-muted); }
}

// Tipo (com ícone)
.tipo {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 10px; border-radius: 8px;
  font-size: 12px; font-weight: 600;
  white-space: nowrap;

  &--colisao     { background: #fef3c7; color: #a16207; }
  &--furto       { background: #fde8e8; color: #b91c1c; }
  &--incendio    { background: #fff1e6; color: #c2410c; }
  &--inundacao   { background: #dbeafe; color: #1e40af; }
  &--vandalismo  { background: #f3e8ff; color: #7c3aed; }
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
  &--success:hover { background: var(--sicam-success-bg); color: var(--sicam-success-ink); }
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