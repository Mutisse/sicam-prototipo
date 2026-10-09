<template>
  <q-page class="ab-page">
    <!-- ============================================================ -->
    <!-- CABEÇALHO                                                     -->
    <!-- ============================================================ -->
    <header class="page-head">
      <div>
        <h1 class="page-head__title">Abordagens</h1>
        <p class="page-head__sub">
          Histórico de abordagens policiais e registo de novas ocorrências
        </p>
      </div>

      <div class="page-head__actions">
        <button class="page-btn page-btn--outline" @click="exportarCSV">
          <q-icon name="file_download" size="18px" />
          Excel
        </button>
        <button class="page-btn page-btn--primary">
          <q-icon name="add" size="18px" />
          Nova abordagem
        </button>
      </div>
    </header>

    <!-- ============================================================ -->
    <!-- KPIs                                                          -->
    <!-- ============================================================ -->
    <section class="kpi-grid">
      <div class="kpi">
        <div class="kpi__icon kpi__icon--primary"><q-icon name="visibility" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ abordagens.length }}</div>
          <div class="kpi__label">Total (30d)</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--success"><q-icon name="check_circle" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ totalSemIncidentes }}</div>
          <div class="kpi__label">Sem incidentes</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--critical"><q-icon name="gavel" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ totalComDetencao }}</div>
          <div class="kpi__label">Com detenção</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--warning"><q-icon name="local_police" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ totalHotlist }}</div>
          <div class="kpi__label">Veículos em Hotlist</div>
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
          placeholder="Pesquisar por matrícula, agente, local…"
        />
      </div>

      <select v-model="filtroResultado" class="filter filter__select">
        <option value="">Todos os resultados</option>
        <option value="Sem incidentes">Sem incidentes</option>
        <option value="Detenção">Com detenção</option>
        <option value="Auto de Notícia">Auto de Notícia</option>
        <option value="Apreensão">Apreensão</option>
      </select>

      <select v-model="filtroPosto" class="filter filter__select">
        <option value="">Todos os postos</option>
        <option value="Posto Baixa">Posto Baixa</option>
        <option value="Posto KaMpfumo">Posto KaMpfumo</option>
        <option value="Posto Matola">Posto Matola</option>
        <option value="Posto Machava">Posto Machava</option>
        <option value="Posto Namaacha (EN4)">Posto Namaacha</option>
      </select>
    </section>

    <!-- ============================================================ -->
    <!-- TABELA                                                        -->
    <!-- ============================================================ -->
    <section class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Data e hora</th>
            <th>Matrícula</th>
            <th>Agente</th>
            <th>Posto</th>
            <th>Local</th>
            <th>Resultado</th>
            <th class="data-table__th-actions" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="(a, i) in filtrados" :key="i" class="data-table__row">
            <td class="table-time">{{ a.dataHora }}</td>

            <td>
              <div class="placa">
                <div class="placa__icon" :class="`placa__icon--${a.emHotlist ? 'critico' : 'neutral'}`">
                  <q-icon name="directions_car" size="16px" />
                </div>
                <b>{{ a.matricula }}</b>
                <span v-if="a.emHotlist" class="placa__hot">
                  <q-icon name="local_police" size="12px" />
                  Hotlist
                </span>
              </div>
            </td>

            <td>{{ a.agente }}</td>
            <td class="table-posto">{{ a.posto }}</td>
            <td class="table-local">{{ a.local }}</td>

            <td>
              <span class="badge" :class="`badge--${resultadoClasse(a.resultado)}`">
                {{ a.resultado }}
              </span>
            </td>

            <td class="data-table__actions">
              <button class="row-action" title="Ver detalhes">
                <q-icon name="visibility" size="18px" />
              </button>
              <button class="row-action" title="Imprimir">
                <q-icon name="print" size="18px" />
              </button>
            </td>
          </tr>

          <tr v-if="!filtrados.length">
            <td colspan="7" class="data-table__empty">
              Nenhuma abordagem encontrada com estes filtros.
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
interface Abordagem {
  dataHora: string
  matricula: string
  agente: string
  posto: string
  local: string
  resultado: 'Sem incidentes' | 'Detenção' | 'Auto de Notícia' | 'Apreensão'
  emHotlist: boolean
}

// ============================================================
// Estado
// ============================================================
const pesquisa = ref('')
const filtroResultado = ref('')
const filtroPosto = ref('')

// ============================================================
// Dados fictícios
// ============================================================
const abordagens = ref<Abordagem[]>([
  { dataHora: '23/09 14:22', matricula: 'AGL-482-MC', agente: 'Agente Chissano', posto: 'Posto Baixa',    local: 'Av. Julius Nyerere',  resultado: 'Detenção',          emHotlist: true },
  { dataHora: '23/09 12:15', matricula: 'AFC-205-MC', agente: 'Agente Nhaca',    posto: 'Posto Matola',   local: 'EN4 — KM 12',         resultado: 'Sem incidentes',    emHotlist: false },
  { dataHora: '23/09 10:45', matricula: 'AEK-017-MP', agente: 'Agente Sitoe',    posto: 'Posto Machava',  local: 'Rua da Beira',        resultado: 'Apreensão',         emHotlist: true },
  { dataHora: '23/09 09:30', matricula: 'ABR-771-MP', agente: 'Agente Cumbe',    posto: 'Posto KaMpfumo', local: 'Av. 25 de Setembro',  resultado: 'Auto de Notícia',   emHotlist: false },
  { dataHora: '22/09 22:18', matricula: 'ALM-507-MC', agente: 'Agente Tembe',    posto: 'Posto Baixa',    local: 'Rua da Sé',           resultado: 'Sem incidentes',    emHotlist: false },
  { dataHora: '22/09 20:05', matricula: 'AHT-662-MC', agente: 'Agente Chissano', posto: 'Posto Namaacha (EN4)', local: 'EN4 — Namaacha', resultado: 'Detenção',          emHotlist: true },
  { dataHora: '22/09 18:42', matricula: 'AHN-304-MC', agente: 'Agente Nhaca',    posto: 'Posto Matola',   local: 'Av. das Indústrias',  resultado: 'Auto de Notícia',   emHotlist: false },
  { dataHora: '22/09 16:20', matricula: 'ACD-918-MP', agente: 'Agente Sitoe',    posto: 'Posto Machava',  local: 'Rua 1º de Maio',      resultado: 'Sem incidentes',    emHotlist: false },
  { dataHora: '22/09 14:10', matricula: 'ABX-556-MP', agente: 'Agente Cumbe',    posto: 'Posto Namaacha (EN4)', local: 'EN4 — Goba',     resultado: 'Sem incidentes',    emHotlist: true },
  { dataHora: '22/09 11:32', matricula: 'AGH-231-MP', agente: 'Agente Tembe',    posto: 'Posto Baixa',    local: 'Av. Karl Marx',       resultado: 'Auto de Notícia',   emHotlist: false },
])

// ============================================================
// KPIs
// ============================================================
const totalSemIncidentes = computed(() => abordagens.value.filter((a) => a.resultado === 'Sem incidentes').length)
const totalComDetencao = computed(() => abordagens.value.filter((a) => a.resultado === 'Detenção').length)
const totalHotlist = computed(() => abordagens.value.filter((a) => a.emHotlist).length)

// ============================================================
// Filtragem
// ============================================================
const filtrados = computed(() => {
  return abordagens.value.filter((a) => {
    if (pesquisa.value) {
      const q = pesquisa.value.toLowerCase()
      if (
        !a.matricula.toLowerCase().includes(q) &&
        !a.agente.toLowerCase().includes(q) &&
        !a.local.toLowerCase().includes(q) &&
        !a.posto.toLowerCase().includes(q)
      ) return false
    }
    if (filtroResultado.value && a.resultado !== filtroResultado.value) return false
    if (filtroPosto.value && a.posto !== filtroPosto.value) return false
    return true
  })
})

// ============================================================
// Helpers
// ============================================================
function resultadoClasse(r: string): 'regular' | 'critico' | 'atencao' | 'info' {
  if (r === 'Sem incidentes') return 'regular'
  if (r === 'Detenção') return 'critico'
  if (r === 'Auto de Notícia') return 'atencao'
  return 'info'
}

function exportarCSV() {
  const linhas: string[][] = [
    ['SICAM — PRM — Abordagens'],
    [`Gerado em: ${new Date().toLocaleString('pt-PT')}`],
    [],
    ['Data e hora', 'Matrícula', 'Agente', 'Posto', 'Local', 'Resultado', 'Hotlist'],
    ...filtrados.value.map((a) => [
      a.dataHora, a.matricula, a.agente, a.posto, a.local, a.resultado,
      a.emHotlist ? 'Sim' : 'Não',
    ]),
  ]

  const csv = linhas
    .map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `prm-abordagens-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)

  $q.notify({ type: 'positive', message: 'CSV exportado.', position: 'top' })
}
</script>

<style scoped lang="scss">
.ab-page { padding: 24px 20px 48px; max-width: 1180px; margin: 0 auto; }

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
    &--critical { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
    &--warning  { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
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
.table-posto { color: var(--sicam-ink-soft); font-size: 13px; }
.table-local { color: var(--sicam-muted); font-size: 13px; }

// Placa
.placa {
  display: flex; align-items: center; gap: 8px;
  flex-wrap: wrap;

  b { font-weight: 700; letter-spacing: 0.02em; }

  &__icon {
    width: 28px; height: 28px; border-radius: 8px;
    display: grid; place-items: center; flex-shrink: 0;

    &--critico { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
    &--neutral { background: var(--sicam-neutral-bg);  color: var(--sicam-neutral-ink); }
  }

  &__hot {
    display: inline-flex; align-items: center; gap: 3px;
    background: var(--sicam-critical-bg);
    color: var(--sicam-critical-ink);
    font-size: 10px; font-weight: 700;
    padding: 2px 6px; border-radius: 99px;
    text-transform: uppercase; letter-spacing: 0.04em;
  }
}

// Badge
.badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 3px 10px; border-radius: 99px;
  font-size: 12px; font-weight: 600;
  white-space: nowrap;

  &::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

  &--regular { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
  &--critico { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
  &--atencao { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
  &--info    { background: #dbeafe;                  color: #2563eb; }
}

// Acções
.row-action {
  display: inline-grid; place-items: center; width: 34px; height: 34px;
  border: 0; border-radius: 8px; background: transparent; color: var(--sicam-muted);
  cursor: pointer; margin-left: 2px; transition: all 0.15s;

  &:hover { background: var(--sicam-surface-hover); color: var(--sicam-ink); }
}
</style>