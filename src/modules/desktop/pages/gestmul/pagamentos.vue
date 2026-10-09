<template>
  <q-page class="pg-page">
    <!-- ============================================================ -->
    <!-- CABEÇALHO                                                     -->
    <!-- ============================================================ -->
    <header class="page-head">
      <div>
        <h1 class="page-head__title">Pagamentos</h1>
        <p class="page-head__sub">
          Recepção e cobrança de multas de trânsito
        </p>
      </div>

      <div class="page-head__actions">
        <button class="page-btn page-btn--outline" @click="exportarCSV">
          <q-icon name="file_download" size="18px" />
          Excel
        </button>
        <button class="page-btn page-btn--primary">
          <q-icon name="add" size="18px" />
          Registar pagamento
        </button>
      </div>
    </header>

    <!-- ============================================================ -->
    <!-- KPIs                                                          -->
    <!-- ============================================================ -->
    <section class="kpi-grid">
      <div class="kpi">
        <div class="kpi__icon kpi__icon--primary"><q-icon name="payments" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ pagamentos.length }}</div>
          <div class="kpi__label">Total este mês</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--success"><q-icon name="attach_money" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ totalCobrado }}</div>
          <div class="kpi__label">Cobrado (MT)</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--warning"><q-icon name="hourglass_top" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ totalPendente }}</div>
          <div class="kpi__label">Pendente (MT)</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--info"><q-icon name="receipt" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ ticketMedio }}</div>
          <div class="kpi__label">Ticket médio (MT)</div>
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
          placeholder="Pesquisar por matrícula ou recibo…"
        />
      </div>

      <select v-model="filtroMetodo" class="filter filter__select">
        <option value="">Todos os métodos</option>
        <option value="Dinheiro">Dinheiro</option>
        <option value="Transferência">Transferência</option>
        <option value="Multibanco">Multibanco</option>
        <option value="M-Pesa">M-Pesa</option>
      </select>

      <select v-model="filtroEstado" class="filter filter__select">
        <option value="">Todos os estados</option>
        <option value="Confirmado">Confirmado</option>
        <option value="Pendente">Pendente</option>
      </select>
    </section>

    <!-- ============================================================ -->
    <!-- TABELA                                                        -->
    <!-- ============================================================ -->
    <section class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Recibo</th>
            <th>Matrícula</th>
            <th>Multa</th>
            <th>Método</th>
            <th>Data</th>
            <th>Valor</th>
            <th>Estado</th>
            <th class="data-table__th-actions" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in paginaVisivel" :key="p.recibo" class="data-table__row">
            <td><b>{{ p.recibo }}</b></td>
            <td>
              <div class="placa">
                <q-icon name="directions_car" size="14px" class="placa__icon" />
                <b>{{ p.matricula }}</b>
              </div>
            </td>
            <td class="table-multa">{{ p.multaCodigo }}</td>
            <td>
              <span class="metodo" :class="`metodo--${metodoClasse(p.metodo)}`">
                <q-icon :name="metodoIcone(p.metodo)" size="14px" />
                {{ p.metodo }}
              </span>
            </td>
            <td class="table-time">{{ p.data }}</td>
            <td class="cell-valor">{{ p.valor }}</td>
            <td>
              <span class="badge" :class="`badge--${p.estado === 'Confirmado' ? 'regular' : 'atencao'}`">
                {{ p.estado }}
              </span>
            </td>
            <td class="data-table__actions">
              <button class="row-action" title="Ver">
                <q-icon name="visibility" size="18px" />
              </button>
              <button class="row-action" title="Imprimir recibo">
                <q-icon name="print" size="18px" />
              </button>
              <button
                v-if="p.estado === 'Pendente'"
                class="row-action row-action--success"
                title="Confirmar pagamento"
                @click="confirmar(p.recibo)"
              >
                <q-icon name="check_circle" size="18px" />
              </button>
            </td>
          </tr>

          <tr v-if="!paginaVisivel.length">
            <td colspan="8" class="data-table__empty">
              Nenhum pagamento encontrado com estes filtros.
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
type Metodo = 'Dinheiro' | 'Transferência' | 'Multibanco' | 'M-Pesa'
type Estado = 'Confirmado' | 'Pendente'

interface Pagamento {
  recibo: string
  matricula: string
  multaCodigo: string
  metodo: Metodo
  data: string
  valor: string
  estado: Estado
}

// ============================================================
// Estado
// ============================================================
const pesquisa = ref('')
const filtroMetodo = ref('')
const filtroEstado = ref('')

// ============================================================
// Dados fictícios
// ============================================================
const pagamentos = ref<Pagamento[]>([
  { recibo: 'RC-26-000312', matricula: 'ABR-771-MP', multaCodigo: 'MT-26-000122', metodo: 'Multibanco',     data: '23/09 09:10', valor: '2 800 MT', estado: 'Confirmado' },
  { recibo: 'RC-26-000311', matricula: 'AFC-205-MC', multaCodigo: 'MT-26-000121', metodo: 'M-Pesa',         data: '22/09 17:05', valor: '2 200 MT', estado: 'Confirmado' },
  { recibo: 'RC-26-000310', matricula: 'ABX-556-MP', multaCodigo: 'MT-26-000118', metodo: 'Transferência',  data: '22/09 10:45', valor: '2 800 MT', estado: 'Confirmado' },
  { recibo: 'RC-26-000309', matricula: 'ADT-873-MP', multaCodigo: 'MT-26-000116', metodo: 'Dinheiro',       data: '21/09 16:20', valor: '2 200 MT', estado: 'Confirmado' },
  { recibo: 'RC-26-000308', matricula: 'AGH-231-MP', multaCodigo: 'MT-26-000114', metodo: 'Multibanco',     data: '20/09 18:15', valor: '2 800 MT', estado: 'Confirmado' },
  { recibo: 'RC-26-000307', matricula: 'AKP-412-MP', multaCodigo: 'MT-26-000112', metodo: 'M-Pesa',         data: '20/09 12:30', valor: '2 200 MT', estado: 'Confirmado' },
  { recibo: 'RC-26-000306', matricula: 'AGL-482-MC', multaCodigo: 'MT-26-000123', metodo: 'Transferência',  data: '23/09 09:45', valor: '3 500 MT', estado: 'Pendente' },
  { recibo: 'RC-26-000305', matricula: 'AHN-304-MC', multaCodigo: 'MT-26-000119', metodo: 'Dinheiro',       data: '22/09 15:00', valor: '4 200 MT', estado: 'Pendente' },
  { recibo: 'RC-26-000304', matricula: 'AJK-120-MC', multaCodigo: 'MT-26-000117', metodo: 'Multibanco',     data: '22/09 11:20', valor: '3 500 MT', estado: 'Pendente' },
  { recibo: 'RC-26-000303', matricula: 'ALM-507-MC', multaCodigo: 'MT-26-000113', metodo: 'M-Pesa',         data: '20/09 15:40', valor: '3 500 MT', estado: 'Pendente' },
])

// ============================================================
// KPIs
// ============================================================
const totalCobrado = computed(() => {
  const soma = pagamentos.value
    .filter((p) => p.estado === 'Confirmado')
    .reduce((s, p) => s + parseValor(p.valor), 0)
  return formatarMT(soma)
})

const totalPendente = computed(() => {
  const soma = pagamentos.value
    .filter((p) => p.estado === 'Pendente')
    .reduce((s, p) => s + parseValor(p.valor), 0)
  return formatarMT(soma)
})

const ticketMedio = computed(() => {
  const lista = pagamentos.value
  if (!lista.length) return '0'
  const soma = lista.reduce((s, p) => s + parseValor(p.valor), 0)
  return formatarMT(Math.round(soma / lista.length))
})

// ============================================================
// Helpers
// ============================================================
function parseValor(v: string): number {
  // "2 800 MT" → 2800
  return parseInt(v.replace(/[^\d]/g, ''), 10) || 0
}

function formatarMT(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')
}

// ============================================================
// Filtragem
// ============================================================
const filtrados = computed(() => {
  return pagamentos.value.filter((p) => {
    if (pesquisa.value) {
      const q = pesquisa.value.toLowerCase()
      if (
        !p.matricula.toLowerCase().includes(q) &&
        !p.recibo.toLowerCase().includes(q) &&
        !p.multaCodigo.toLowerCase().includes(q)
      ) return false
    }
    if (filtroMetodo.value && p.metodo !== filtroMetodo.value) return false
    if (filtroEstado.value && p.estado !== filtroEstado.value) return false
    return true
  })
})

// ============================================================
// Paginação
// ============================================================
const POR_PAGINA = 10
const paginaActual = ref(1)

watch([pesquisa, filtroMetodo, filtroEstado], () => {
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
// Método — ícones e classes
// ============================================================
function metodoIcone(m: Metodo): string {
  if (m === 'Dinheiro') return 'payments'
  if (m === 'Transferência') return 'account_balance'
  if (m === 'Multibanco') return 'credit_card'
  return 'smartphone'
}

function metodoClasse(m: Metodo): 'cash' | 'transfer' | 'card' | 'mobile' {
  if (m === 'Dinheiro') return 'cash'
  if (m === 'Transferência') return 'transfer'
  if (m === 'Multibanco') return 'card'
  return 'mobile'
}

// ============================================================
// Acções
// ============================================================
function confirmar(recibo: string) {
  const p = pagamentos.value.find((x) => x.recibo === recibo)
  if (p) {
    p.estado = 'Confirmado'
    $q.notify({
      type: 'positive',
      message: `Pagamento ${recibo} confirmado.`,
      position: 'top',
    })
  }
}

function exportarCSV() {
  const linhas: string[][] = [
    ['SICAM — GESTMUL — Pagamentos'],
    [`Gerado em: ${new Date().toLocaleString('pt-PT')}`],
    [],
    ['Recibo', 'Matrícula', 'Multa', 'Método', 'Data', 'Valor', 'Estado'],
    ...filtrados.value.map((p) => [
      p.recibo, p.matricula, p.multaCodigo, p.metodo, p.data, p.valor, p.estado,
    ]),
  ]

  const csv = linhas
    .map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `gestmul-pagamentos-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)

  $q.notify({ type: 'positive', message: 'CSV exportado.', position: 'top' })
}
</script>

<style scoped lang="scss">
.pg-page { padding: 24px 20px 48px; max-width: 1180px; margin: 0 auto; }

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
    &--info     { background: #dbeafe;                  color: #2563eb; }
  }
  &__value { font-size: 22px; font-weight: 700; color: var(--sicam-ink); line-height: 1.15; }
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
.table-multa { color: var(--sicam-ink-soft); font-size: 13px; }
.cell-valor { font-weight: 700; color: var(--sicam-ink); white-space: nowrap; }

// Placa
.placa {
  display: flex; align-items: center; gap: 6px;
  b { font-weight: 700; letter-spacing: 0.02em; }
  &__icon { color: var(--sicam-muted); }
}

// Método
.metodo {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 10px; border-radius: 8px;
  font-size: 12px; font-weight: 600;
  white-space: nowrap;

  &--cash     { background: #fef3c7; color: #a16207; }
  &--transfer { background: #dbeafe; color: #1e40af; }
  &--card     { background: #f3e8ff; color: #7c3aed; }
  &--mobile   { background: #dcfce7; color: #15803d; }
}

// Badge
.badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 3px 10px; border-radius: 99px;
  font-size: 12px; font-weight: 600;

  &::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

  &--regular { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
  &--atencao { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
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