<template>
  <q-page class="vei-page">
    <header class="page-head">
      <div>
        <h1 class="page-head__title">Veículos</h1>
        <p class="page-head__sub">
          Registo nacional de veículos e histórico de inspecções
        </p>
      </div>
      <div class="page-head__actions">
        <button class="page-btn page-btn--outline" @click="exportarCSV">
          <q-icon name="file_download" size="18px" />
          Excel
        </button>
        <button class="page-btn page-btn--primary">
          <q-icon name="add" size="18px" />
          Registar veículo
        </button>
      </div>
    </header>

    <!-- KPIs -->
    <section class="kpi-grid">
      <div class="kpi">
        <div class="kpi__icon kpi__icon--primary"><q-icon name="directions_car" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ veiculos.length }}</div>
          <div class="kpi__label">Total</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--success"><q-icon name="verified" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ totalValidos }}</div>
          <div class="kpi__label">Inspecção válida</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--critical"><q-icon name="warning" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ totalExpirados }}</div>
          <div class="kpi__label">Expiradas</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--info"><q-icon name="autorenew" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ totalPendentes }}</div>
          <div class="kpi__label">A expirar (30d)</div>
        </div>
      </div>
    </section>

    <!-- Filtros -->
    <section class="filters">
      <div class="filter filter--search">
        <q-icon name="search" size="20px" class="filter__icon" />
        <input
          v-model="pesquisa"
          type="text"
          class="filter__input"
          placeholder="Pesquisar por matrícula, marca, modelo…"
        />
      </div>

      <select v-model="filtroProvincia" class="filter filter__select">
        <option value="">Todas as províncias</option>
        <option value="Maputo Cidade">Maputo Cidade</option>
        <option value="Maputo Província">Maputo Província</option>
      </select>

      <select v-model="filtroEstado" class="filter filter__select">
        <option value="">Todos os estados</option>
        <option value="Válida">Inspecção válida</option>
        <option value="A expirar">A expirar</option>
        <option value="Expirada">Expirada</option>
      </select>

      <select v-model="filtroTipo" class="filter filter__select">
        <option value="">Todos os tipos</option>
        <option value="Ligeiro">Ligeiro</option>
        <option value="Pesado">Pesado</option>
      </select>
    </section>

    <!-- Tabela -->
    <section class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Matrícula</th>
            <th>Veículo</th>
            <th>Tipo</th>
            <th>Província</th>
            <th>Última insp.</th>
            <th>Próxima insp.</th>
            <th>Estado</th>
            <th class="data-table__th-actions" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in paginaVisivel" :key="v.matricula" class="data-table__row">
            <td><b>{{ v.matricula }}</b></td>
            <td>
              <div class="veiculo-info">
                <b>{{ v.marca }} {{ v.modelo }}</b>
                <small>{{ v.cor }} · {{ v.ano }}</small>
              </div>
            </td>
            <td>{{ v.tipo }}</td>
            <td>{{ v.provincia }}</td>
            <td class="table-time">{{ v.ultimaInspecao }}</td>
            <td class="table-time">{{ v.proximaInspecao }}</td>
            <td>
              <span class="badge" :class="`badge--${estadoClasse(v.estado)}`">
                {{ v.estado }}
              </span>
            </td>
            <td class="data-table__actions">
              <button class="row-action" title="Ver"><q-icon name="visibility" size="18px" /></button>
              <button class="row-action" title="Editar"><q-icon name="edit" size="18px" /></button>
            </td>
          </tr>

          <tr v-if="!paginaVisivel.length">
            <td colspan="8" class="data-table__empty">
              Nenhum veículo encontrado com estes filtros.
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
          <span class="pagination__page">
            Página {{ paginaActual }} de {{ totalPaginas }}
          </span>
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
type Estado = 'Válida' | 'A expirar' | 'Expirada'

interface Veiculo {
  matricula: string
  marca: string
  modelo: string
  cor: string
  ano: number
  tipo: 'Ligeiro' | 'Pesado'
  provincia: string
  ultimaInspecao: string
  proximaInspecao: string
  estado: Estado
}

// ============================================================
// Estado
// ============================================================
const pesquisa = ref('')
const filtroProvincia = ref('')
const filtroEstado = ref('')
const filtroTipo = ref('')

// ============================================================
// Dados fictícios
// ============================================================
const veiculos = ref<Veiculo[]>([
  { matricula: 'AGL-482-MC', marca: 'Toyota',   modelo: 'Hilux',    cor: 'Branco',   ano: 2018, tipo: 'Ligeiro', provincia: 'Maputo Cidade',    ultimaInspecao: '12/08/2026', proximaInspecao: '12/08/2027', estado: 'Válida' },
  { matricula: 'ABR-771-MP', marca: 'Isuzu',    modelo: 'D-Max',    cor: 'Prata',    ano: 2016, tipo: 'Pesado',  provincia: 'Maputo Província', ultimaInspecao: '05/09/2025', proximaInspecao: '05/09/2026', estado: 'A expirar' },
  { matricula: 'AFC-205-MC', marca: 'Mazda',    modelo: '3',        cor: 'Azul',     ano: 2020, tipo: 'Ligeiro', provincia: 'Maputo Cidade',    ultimaInspecao: '18/03/2024', proximaInspecao: '18/03/2025', estado: 'Expirada' },
  { matricula: 'ACD-918-MP', marca: 'Nissan',   modelo: 'NP300',    cor: 'Cinza',    ano: 2019, tipo: 'Ligeiro', provincia: 'Maputo Província', ultimaInspecao: '22/06/2026', proximaInspecao: '22/06/2027', estado: 'Válida' },
  { matricula: 'AHN-304-MC', marca: 'Volvo',    modelo: 'FH16',     cor: 'Branco',   ano: 2015, tipo: 'Pesado',  provincia: 'Maputo Cidade',    ultimaInspecao: '10/11/2026', proximaInspecao: '10/11/2027', estado: 'Válida' },
  { matricula: 'ABX-556-MP', marca: 'Toyota',   modelo: 'Corolla',  cor: 'Prata',    ano: 2017, tipo: 'Ligeiro', provincia: 'Maputo Província', ultimaInspecao: '15/09/2025', proximaInspecao: '15/09/2026', estado: 'A expirar' },
  { matricula: 'AJK-120-MC', marca: 'Mazda',    modelo: 'CX-5',     cor: 'Vermelho', ano: 2021, tipo: 'Ligeiro', provincia: 'Maputo Cidade',    ultimaInspecao: '20/08/2025', proximaInspecao: '20/08/2026', estado: 'Expirada' },
  { matricula: 'ADT-873-MP', marca: 'Isuzu',    modelo: 'NPR',      cor: 'Branco',   ano: 2018, tipo: 'Pesado',  provincia: 'Maputo Província', ultimaInspecao: '12/07/2026', proximaInspecao: '12/07/2027', estado: 'Válida' },
  { matricula: 'AEF-649-MC', marca: 'Honda',    modelo: 'Fit',      cor: 'Cinza',    ano: 2019, tipo: 'Ligeiro', provincia: 'Maputo Cidade',    ultimaInspecao: '08/10/2025', proximaInspecao: '08/10/2026', estado: 'A expirar' },
  { matricula: 'AGH-231-MP', marca: 'Ford',     modelo: 'Ranger',   cor: 'Preto',    ano: 2020, tipo: 'Ligeiro', provincia: 'Maputo Província', ultimaInspecao: '14/05/2026', proximaInspecao: '14/05/2027', estado: 'Válida' },
  { matricula: 'ALM-507-MC', marca: 'Volkswagen', modelo: 'Golf',   cor: 'Azul',     ano: 2021, tipo: 'Ligeiro', provincia: 'Maputo Cidade',    ultimaInspecao: '30/06/2026', proximaInspecao: '30/06/2027', estado: 'Válida' },
  { matricula: 'AKP-412-MP', marca: 'Mercedes',  modelo: 'Actros',  cor: 'Branco',   ano: 2017, tipo: 'Pesado',  provincia: 'Maputo Província', ultimaInspecao: '25/02/2024', proximaInspecao: '25/02/2025', estado: 'Expirada' },
])

// ============================================================
// KPIs
// ============================================================
const totalValidos = computed(() => veiculos.value.filter((v) => v.estado === 'Válida').length)
const totalExpirados = computed(() => veiculos.value.filter((v) => v.estado === 'Expirada').length)
const totalPendentes = computed(() => veiculos.value.filter((v) => v.estado === 'A expirar').length)

// ============================================================
// Filtragem
// ============================================================
const filtrados = computed(() => {
  return veiculos.value.filter((v) => {
    if (pesquisa.value) {
      const q = pesquisa.value.toLowerCase()
      if (
        !v.matricula.toLowerCase().includes(q) &&
        !v.marca.toLowerCase().includes(q) &&
        !v.modelo.toLowerCase().includes(q)
      ) return false
    }
    if (filtroProvincia.value && v.provincia !== filtroProvincia.value) return false
    if (filtroEstado.value && v.estado !== filtroEstado.value) return false
    if (filtroTipo.value && v.tipo !== filtroTipo.value) return false
    return true
  })
})

// ============================================================
// Paginação
// ============================================================
const POR_PAGINA = 10
const paginaActual = ref(1)

watch([pesquisa, filtroProvincia, filtroEstado, filtroTipo], () => {
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
  if (estado === 'Válida') return 'regular'
  if (estado === 'A expirar') return 'atencao'
  return 'critico'
}

function exportarCSV() {
  const linhas: string[][] = [
    ['SICAM — INATRO — Veículos'],
    [`Gerado em: ${new Date().toLocaleString('pt-PT')}`],
    [],
    ['Matrícula', 'Marca', 'Modelo', 'Cor', 'Ano', 'Tipo', 'Província', 'Última inspecção', 'Próxima inspecção', 'Estado'],
    ...filtrados.value.map((v) => [
      v.matricula, v.marca, v.modelo, v.cor, String(v.ano), v.tipo,
      v.provincia, v.ultimaInspecao, v.proximaInspecao, v.estado,
    ]),
  ]

  const csv = linhas
    .map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `inatrо-veiculos-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)

  $q.notify({ type: 'positive', message: 'Ficheiro exportado.', position: 'top' })
}
</script>

<style scoped lang="scss">
.vei-page { padding: 24px 20px 48px; max-width: 1180px; margin: 0 auto; }

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
    &--critical { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
    &--info     { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
  }
  &__value { font-size: 22px; font-weight: 700; color: var(--sicam-ink); line-height: 1; }
  &__label { font-size: 12px; color: var(--sicam-muted); margin-top: 2px; }
}

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

.table-wrap {
  background: #fff; border-radius: 14px; overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

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
  &__empty {
    text-align: center; color: var(--sicam-muted);
    padding: 40px 16px !important; font-size: 14px;
  }
}

.veiculo-info {
  b { display: block; color: var(--sicam-ink); font-weight: 600; }
  small { display: block; color: var(--sicam-muted); font-size: 12px; margin-top: 2px; }
}

.table-time { color: var(--sicam-muted); font-size: 13px; white-space: nowrap; }

.badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 3px 10px; border-radius: 99px;
  font-size: 12px; font-weight: 600;
  &::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  &--regular { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
  &--atencao { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
  &--critico { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
}

.row-action {
  display: inline-grid; place-items: center; width: 34px; height: 34px;
  border: 0; border-radius: 8px; background: transparent; color: var(--sicam-muted);
  cursor: pointer; margin-left: 2px; transition: all 0.15s;
  &:hover { background: var(--sicam-surface-hover); color: var(--sicam-ink); }
}

// ============================================================
// Paginação
// ============================================================
.pagination {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 14px 16px;
  border-top: 1px solid var(--sicam-line);
  flex-wrap: wrap;

  &__info {
    font-size: 13px; color: var(--sicam-muted);
    b { color: var(--sicam-ink); font-weight: 600; }
  }
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