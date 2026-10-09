<template>
  <q-page class="mt-page">
    <!-- ============================================================ -->
    <!-- CABEÇALHO                                                     -->
    <!-- ============================================================ -->
    <header class="page-head">
      <div>
        <h1 class="page-head__title">Multas</h1>
        <p class="page-head__sub">
          Registo de infrações, valores e estados de pagamento
        </p>
      </div>

      <div class="page-head__actions">
        <button class="page-btn page-btn--outline" @click="exportarCSV">
          <q-icon name="file_download" size="18px" />
          Excel
        </button>
        <button class="page-btn page-btn--primary">
          <q-icon name="add" size="18px" />
          Registar multa
        </button>
      </div>
    </header>

    <!-- ============================================================ -->
    <!-- KPIs                                                          -->
    <!-- ============================================================ -->
    <section class="kpi-grid">
      <div class="kpi">
        <div class="kpi__icon kpi__icon--primary"><q-icon name="receipt_long" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ multas.length }}</div>
          <div class="kpi__label">Total este mês</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--success"><q-icon name="payments" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ totalPagas }}</div>
          <div class="kpi__label">Pagas</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--warning"><q-icon name="hourglass_top" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ totalPendentes }}</div>
          <div class="kpi__label">Pendentes</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--critical"><q-icon name="gavel" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ totalContestadas }}</div>
          <div class="kpi__label">Contestadas</div>
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
          placeholder="Pesquisar por matrícula, código…"
        />
      </div>

      <select v-model="filtroEstado" class="filter filter__select">
        <option value="">Todos os estados</option>
        <option value="Paga">Paga</option>
        <option value="Pendente">Pendente</option>
        <option value="Contestada">Contestada</option>
      </select>

      <select v-model="filtroInfracao" class="filter filter__select">
        <option value="">Todas as infrações</option>
        <option value="Excesso de velocidade">Excesso de velocidade</option>
        <option value="Seguro expirado">Seguro expirado</option>
        <option value="Inspecção em atraso">Inspecção em atraso</option>
        <option value="Documentos em falta">Documentos em falta</option>
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
            <th>Matrícula</th>
            <th>Infração</th>
            <th>Agente</th>
            <th>Data</th>
            <th>Valor</th>
            <th>Estado</th>
            <th class="data-table__th-actions" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in paginaVisivel" :key="m.codigo" class="data-table__row">
            <td><b>{{ m.codigo }}</b></td>
            <td>
              <div class="placa">
                <q-icon name="directions_car" size="14px" class="placa__icon" />
                <b>{{ m.matricula }}</b>
              </div>
            </td>
            <td class="cell-infracao">{{ m.infracao }}</td>
            <td>{{ m.agente }}</td>
            <td class="table-time">{{ m.data }}</td>
            <td class="cell-valor">{{ m.valor }}</td>
            <td>
              <span class="badge" :class="`badge--${estadoClasse(m.estado)}`">
                {{ m.estado }}
              </span>
            </td>
            <td class="data-table__actions">
              <button class="row-action" title="Ver"><q-icon name="visibility" size="18px" /></button>
              <button class="row-action" title="Imprimir"><q-icon name="print" size="18px" /></button>
              <button
                v-if="m.estado === 'Pendente'"
                class="row-action row-action--success"
                title="Marcar como paga"
                @click="marcarPaga(m.codigo)"
              >
                <q-icon name="check_circle" size="18px" />
              </button>
            </td>
          </tr>

          <tr v-if="!paginaVisivel.length">
            <td colspan="8" class="data-table__empty">
              Nenhuma multa encontrada com estes filtros.
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
type Estado = 'Paga' | 'Pendente' | 'Contestada'

interface Multa {
  codigo: string
  matricula: string
  infracao: string
  agente: string
  data: string
  valor: string
  estado: Estado
}

// ============================================================
// Estado
// ============================================================
const pesquisa = ref('')
const filtroEstado = ref('')
const filtroInfracao = ref('')

// ============================================================
// Dados fictícios
// ============================================================
const multas = ref<Multa[]>([
  { codigo: 'MT-26-000123', matricula: 'AGL-482-MC', infracao: 'Excesso de velocidade', agente: 'Agente Chissano', data: '23/09 08:15', valor: '3 500 MT', estado: 'Pendente' },
  { codigo: 'MT-26-000122', matricula: 'ABR-771-MP', infracao: 'Seguro expirado',        agente: 'Agente Nhaca',    data: '23/09 07:40', valor: '2 800 MT', estado: 'Paga' },
  { codigo: 'MT-26-000121', matricula: 'AFC-205-MC', infracao: 'Inspecção em atraso',    agente: 'Agente Sitoe',    data: '22/09 16:20', valor: '2 200 MT', estado: 'Paga' },
  { codigo: 'MT-26-000120', matricula: 'ACD-918-MP', infracao: 'Documentos em falta',    agente: 'Agente Cumbe',    data: '22/09 14:30', valor: '1 800 MT', estado: 'Contestada' },
  { codigo: 'MT-26-000119', matricula: 'AHN-304-MC', infracao: 'Excesso de velocidade',  agente: 'Agente Chissano', data: '22/09 11:00', valor: '4 200 MT', estado: 'Pendente' },
  { codigo: 'MT-26-000118', matricula: 'ABX-556-MP', infracao: 'Seguro expirado',        agente: 'Agente Nhaca',    data: '22/09 09:30', valor: '2 800 MT', estado: 'Paga' },
  { codigo: 'MT-26-000117', matricula: 'AJK-120-MC', infracao: 'Excesso de velocidade',  agente: 'Agente Sitoe',    data: '21/09 18:15', valor: '3 500 MT', estado: 'Pendente' },
  { codigo: 'MT-26-000116', matricula: 'ADT-873-MP', infracao: 'Inspecção em atraso',    agente: 'Agente Cumbe',    data: '21/09 15:00', valor: '2 200 MT', estado: 'Paga' },
  { codigo: 'MT-26-000115', matricula: 'AEF-649-MC', infracao: 'Documentos em falta',    agente: 'Agente Chissano', data: '21/09 11:20', valor: '1 800 MT', estado: 'Contestada' },
  { codigo: 'MT-26-000114', matricula: 'AGH-231-MP', infracao: 'Seguro expirado',        agente: 'Agente Nhaca',    data: '20/09 16:45', valor: '2 800 MT', estado: 'Paga' },
  { codigo: 'MT-26-000113', matricula: 'ALM-507-MC', infracao: 'Excesso de velocidade',  agente: 'Agente Sitoe',    data: '20/09 14:10', valor: '3 500 MT', estado: 'Pendente' },
  { codigo: 'MT-26-000112', matricula: 'AKP-412-MP', infracao: 'Inspecção em atraso',    agente: 'Agente Cumbe',    data: '20/09 10:30', valor: '2 200 MT', estado: 'Paga' },
])

// ============================================================
// KPIs
// ============================================================
const totalPagas = computed(() => multas.value.filter((m) => m.estado === 'Paga').length)
const totalPendentes = computed(() => multas.value.filter((m) => m.estado === 'Pendente').length)
const totalContestadas = computed(() => multas.value.filter((m) => m.estado === 'Contestada').length)

// ============================================================
// Filtragem
// ============================================================
const filtrados = computed(() => {
  return multas.value.filter((m) => {
    if (pesquisa.value) {
      const q = pesquisa.value.toLowerCase()
      if (
        !m.matricula.toLowerCase().includes(q) &&
        !m.codigo.toLowerCase().includes(q)
      ) return false
    }
    if (filtroEstado.value && m.estado !== filtroEstado.value) return false
    if (filtroInfracao.value && m.infracao !== filtroInfracao.value) return false
    return true
  })
})

// ============================================================
// Paginação
// ============================================================
const POR_PAGINA = 10
const paginaActual = ref(1)

watch([pesquisa, filtroEstado, filtroInfracao], () => {
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
  if (estado === 'Paga') return 'regular'
  if (estado === 'Pendente') return 'atencao'
  return 'critico'
}

function marcarPaga(codigo: string) {
  const m = multas.value.find((x) => x.codigo === codigo)
  if (m) {
    m.estado = 'Paga'
    $q.notify({
      type: 'positive',
      message: `Multa ${codigo} marcada como paga.`,
      position: 'top',
    })
  }
}

function exportarCSV() {
  const linhas: string[][] = [
    ['SICAM — GESTMUL — Multas'],
    [`Gerado em: ${new Date().toLocaleString('pt-PT')}`],
    [],
    ['Código', 'Matrícula', 'Infração', 'Agente', 'Data', 'Valor', 'Estado'],
    ...filtrados.value.map((m) => [
      m.codigo, m.matricula, m.infracao, m.agente, m.data, m.valor, m.estado,
    ]),
  ]

  const csv = linhas
    .map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `gestmul-multas-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)

  $q.notify({ type: 'positive', message: 'CSV exportado.', position: 'top' })
}
</script>

<style scoped lang="scss">
.mt-page { padding: 24px 20px 48px; max-width: 1180px; margin: 0 auto; }

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
  min-width: 1000px;

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
  &__th-actions { width: 130px; text-align: right; }
  &__actions { text-align: right; white-space: nowrap; }
  &__empty {
    text-align: center; color: var(--sicam-muted);
    padding: 40px 16px !important; font-size: 14px;
  }
}

.table-time { color: var(--sicam-muted); font-size: 13px; white-space: nowrap; }
.cell-infracao { color: var(--sicam-ink-soft); font-size: 13px; }
.cell-valor { font-weight: 700; color: var(--sicam-ink); white-space: nowrap; }

// Placa
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