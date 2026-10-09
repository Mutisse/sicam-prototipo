<template>
  <q-page class="exp-page">
    <!-- ============================================================ -->
    <!-- CABEÇALHO                                                     -->
    <!-- ============================================================ -->
    <header class="page-head">
      <div>
        <h1 class="page-head__title">Exportação de Dados</h1>
        <p class="page-head__sub">
          Gere ficheiros para análise externa, arquivo ou envio a parceiros
        </p>
      </div>
    </header>

    <!-- ============================================================ -->
    <!-- CARD PRINCIPAL — Configuração da exportação                   -->
    <!-- ============================================================ -->
    <section class="exp-form">
      <!-- Tipo de dados -->
      <div class="exp-form__group">
        <label class="exp-form__label">
          <q-icon name="category" size="18px" />
          O que exportar
        </label>
        <div class="exp-form__options">
          <button
            v-for="t in tipos"
            :key="t.key"
            class="exp-option"
            :class="{ 'exp-option--active': tipoSeleccionado === t.key }"
            @click="tipoSeleccionado = t.key"
          >
            <q-icon :name="t.icon" size="22px" />
            <span class="exp-option__label">{{ t.label }}</span>
            <span class="exp-option__desc">{{ t.descricao }}</span>
          </button>
        </div>
      </div>

      <!-- Período -->
      <div class="exp-form__group">
        <label class="exp-form__label">
          <q-icon name="event" size="18px" />
          Período
        </label>
        <div class="exp-form__row">
          <div class="exp-form__field">
            <span class="exp-form__sublabel">De</span>
            <input v-model="dataDe" type="date" class="exp-form__input" />
          </div>
          <div class="exp-form__field">
            <span class="exp-form__sublabel">Até</span>
            <input v-model="dataAte" type="date" class="exp-form__input" />
          </div>
        </div>

        <!-- Atalhos de período -->
        <div class="exp-form__shortcuts">
          <button class="exp-shortcut" @click="definirPeriodo('7d')">Últimos 7 dias</button>
          <button class="exp-shortcut" @click="definirPeriodo('30d')">Últimos 30 dias</button>
          <button class="exp-shortcut" @click="definirPeriodo('mes')">Este mês</button>
          <button class="exp-shortcut" @click="definirPeriodo('ano')">Este ano</button>
          <button class="exp-shortcut exp-shortcut--clear" @click="limparPeriodo">Limpar</button>
        </div>
      </div>

      <!-- Formato -->
      <div class="exp-form__group">
        <label class="exp-form__label">
          <q-icon name="file_present" size="18px" />
          Formato
        </label>
        <div class="exp-form__row exp-form__row--formats">
          <button
            v-for="f in formatos"
            :key="f.key"
            class="exp-format"
            :class="{ 'exp-format--active': formatoSeleccionado === f.key }"
            @click="formatoSeleccionado = f.key"
          >
            <q-icon :name="f.icon" size="28px" />
            <span class="exp-format__label">{{ f.label }}</span>
            <span class="exp-format__ext">.{{ f.extensao }}</span>
          </button>
        </div>
      </div>

      <!-- Opções adicionais -->
      <div class="exp-form__group">
        <label class="exp-form__label">
          <q-icon name="tune" size="18px" />
          Opções adicionais
        </label>
        <div class="exp-form__checkboxes">
          <label class="exp-checkbox">
            <input v-model="opcoes.incluirCabecalho" type="checkbox" />
            <span>Incluir cabeçalho e data de geração</span>
          </label>
          <label class="exp-checkbox">
            <input v-model="opcoes.incluirResumo" type="checkbox" />
            <span>Incluir resumo com totais no início</span>
          </label>
          <label class="exp-checkbox">
            <input v-model="opcoes.apenasAtivos" type="checkbox" />
            <span>Apenas registos activos (excluir cancelados)</span>
          </label>
        </div>
      </div>

      <!-- Botão exportar -->
      <div class="exp-form__footer">
        <div class="exp-form__info">
          <q-icon name="info" size="16px" />
          A exportação respeita os filtros de período e opções seleccionadas
        </div>
        <button
          class="exp-btn exp-btn--primary"
          :disabled="aProcessar"
          @click="exportar"
        >
          <q-icon :name="aProcessar ? 'hourglass_top' : 'download'" size="20px" />
          {{ aProcessar ? 'A gerar…' : 'Exportar agora' }}
        </button>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- EXPORTAÇÕES RECENTES                                          -->
    <!-- ============================================================ -->
    <section class="block">
      <header class="block__head">
        <h2 class="block__title">Exportações recentes</h2>
        <span class="block__count">{{ exportacoesRecentes.length }}</span>
      </header>

      <ul class="exp-list">
        <li
          v-for="(e, i) in exportacoesRecentes"
          :key="i"
          class="exp-item"
        >
          <div class="exp-item__icon" :class="`exp-item__icon--${e.formato}`">
            <q-icon :name="iconeFormato(e.formato)" size="22px" />
          </div>

          <div class="exp-item__body">
            <b>{{ e.titulo }}</b>
            <span>{{ e.detalhe }}</span>
          </div>

          <div class="exp-item__meta">
            <span class="exp-item__date">{{ e.data }}</span>
            <span class="exp-item__size">{{ e.tamanho }}</span>
          </div>

          <button class="exp-item__action" title="Descarregar">
            <q-icon name="download" size="18px" />
          </button>
        </li>
      </ul>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// ============================================================
// Tipos
// ============================================================
type TipoExportacao = 'veiculos' | 'inspecoes' | 'completo'
type FormatoExportacao = 'csv' | 'xlsx' | 'pdf' | 'json'

// ============================================================
// Opções
// ============================================================
const tipos = [
  { key: 'veiculos'  as const, label: 'Veículos',   descricao: 'Registo completo',   icon: 'directions_car' },
  { key: 'inspecoes' as const, label: 'Inspecções', descricao: 'Histórico técnico',  icon: 'build' },
  { key: 'completo'  as const, label: 'Completo',   descricao: 'Veículos + inspecções', icon: 'all_inbox' },
]

const formatos = [
  { key: 'csv'  as const, label: 'CSV',  extensao: 'csv',  icon: 'grid_on' },
  { key: 'xlsx' as const, label: 'Excel', extensao: 'xlsx', icon: 'table_view' },
  { key: 'pdf'  as const, label: 'PDF',  extensao: 'pdf',  icon: 'picture_as_pdf' },
  { key: 'json' as const, label: 'JSON', extensao: 'json', icon: 'data_object' },
]

// ============================================================
// Estado
// ============================================================
const tipoSeleccionado = ref<TipoExportacao>('veiculos')
const formatoSeleccionado = ref<FormatoExportacao>('csv')
const dataDe = ref('')
const dataAte = ref('')
const aProcessar = ref(false)

const opcoes = reactive({
  incluirCabecalho: true,
  incluirResumo: true,
  apenasAtivos: false,
})

// ============================================================
// Período
// ============================================================
function definirPeriodo(preset: '7d' | '30d' | 'mes' | 'ano') {
  const hoje = new Date()
  const de = new Date()

  if (preset === '7d') de.setDate(hoje.getDate() - 7)
  else if (preset === '30d') de.setDate(hoje.getDate() - 30)
  else if (preset === 'mes') de.setDate(1)
  else if (preset === 'ano') { de.setMonth(0); de.setDate(1) }

  dataDe.value = formatarData(de)
  dataAte.value = formatarData(hoje)
}

function limparPeriodo() {
  dataDe.value = ''
  dataAte.value = ''
}

function formatarData(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dia}`
}

// ============================================================
// Exportação
// ============================================================
async function exportar() {
  aProcessar.value = true

  try {
    // Simula processamento
    await new Promise((r) => setTimeout(r, 1200))

    // Só CSV é gerado de verdade (mock). Os outros mostram notificação.
    if (formatoSeleccionado.value === 'csv') {
      gerarCSV()
      $q.notify({
        type: 'positive',
        message: 'Ficheiro CSV exportado com sucesso.',
        position: 'top',
      })
    } else if (formatoSeleccionado.value === 'pdf') {
      window.print()
      $q.notify({
        type: 'info',
        message: 'Escolha "Guardar como PDF" no destino de impressão.',
        position: 'top',
      })
    } else {
      $q.notify({
        type: 'info',
        message: `Formato ${formatoSeleccionado.value.toUpperCase()} será suportado após ligação ao backend.`,
        position: 'top',
      })
    }
  } finally {
    aProcessar.value = false
  }
}

function gerarCSV() {
  const titulo = tipos.find((t) => t.key === tipoSeleccionado.value)?.label ?? 'Exportação'
  const linhas: string[][] = []

  if (opcoes.incluirCabecalho) {
    linhas.push([`SICAM — INATRO — ${titulo}`])
    linhas.push([`Gerado em: ${new Date().toLocaleString('pt-PT')}`])
    if (dataDe.value && dataAte.value) {
      linhas.push([`Período: ${dataDe.value} a ${dataAte.value}`])
    }
    linhas.push([])
  }

  if (opcoes.incluirResumo) {
    linhas.push(['RESUMO'])
    linhas.push(['Total de registos', '1284'])
    linhas.push(['Inspecções válidas', '872'])
    linhas.push(['Inspecções expiradas', '312'])
    linhas.push([])
  }

  linhas.push(['DADOS'])
  linhas.push(['Matrícula', 'Marca', 'Modelo', 'Ano', 'Tipo', 'Província', 'Última inspecção', 'Próxima inspecção', 'Estado'])
  linhas.push(['AGL-482-MC', 'Toyota', 'Hilux', '2018', 'Ligeiro', 'Maputo Cidade', '12/08/2026', '12/08/2027', 'Válida'])
  linhas.push(['ABR-771-MP', 'Isuzu', 'D-Max', '2016', 'Pesado', 'Maputo Província', '05/09/2025', '05/09/2026', 'A expirar'])
  linhas.push(['AFC-205-MC', 'Mazda', '3', '2020', 'Ligeiro', 'Maputo Cidade', '18/03/2024', '18/03/2025', 'Expirada'])

  const csv = linhas
    .map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))
    .join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `inatrо-${tipoSeleccionado.value}-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// ============================================================
// Helpers
// ============================================================
function iconeFormato(formato: string): string {
  if (formato === 'csv') return 'grid_on'
  if (formato === 'xlsx') return 'table_view'
  if (formato === 'pdf') return 'picture_as_pdf'
  if (formato === 'json') return 'data_object'
  return 'description'
}

// ============================================================
// Exportações recentes (mock)
// ============================================================
interface ExportacaoRecente {
  titulo: string
  detalhe: string
  formato: FormatoExportacao
  data: string
  tamanho: string
}

const exportacoesRecentes = ref<ExportacaoRecente[]>([
  {
    titulo: 'Veículos — Maputo Cidade',
    detalhe: '1 284 registos · período Setembro',
    formato: 'csv',
    data: '23/09 09:12',
    tamanho: '248 KB',
  },
  {
    titulo: 'Inspecções — Última semana',
    detalhe: '87 registos · 17–23 Setembro',
    formato: 'xlsx',
    data: '23/09 08:00',
    tamanho: '76 KB',
  },
  {
    titulo: 'Completo — Setembro 2026',
    detalhe: '1 371 registos (veíc. + insp.)',
    formato: 'pdf',
    data: '22/09 18:45',
    tamanho: '1,2 MB',
  },
])
</script>

<style scoped lang="scss">
.exp-page { padding: 24px 20px 48px; max-width: 1000px; margin: 0 auto; }

// ============================================================
// Cabeçalho
// ============================================================
.page-head {
  margin-bottom: 24px;
  &__title { font-size: 24px; font-weight: 700; color: var(--sicam-ink); margin: 0 0 6px; }
  &__sub { font-size: 14px; color: var(--sicam-muted); margin: 0; }
}

// ============================================================
// Form
// ============================================================
.exp-form {
  background: #fff; border-radius: 14px; padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04); margin-bottom: 20px;

  &__group { margin-bottom: 24px; &:last-of-type { margin-bottom: 0; } }

  &__label {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; font-weight: 700; color: var(--sicam-ink);
    text-transform: uppercase; letter-spacing: 0.04em;
    margin-bottom: 12px;
  }

  &__options {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    @media (max-width: 700px) { grid-template-columns: 1fr; }
  }

  &__row {
    display: flex; gap: 12px;
    @media (max-width: 600px) { flex-direction: column; }

    &--formats { gap: 14px; }
  }

  &__field { flex: 1; min-width: 0; }

  &__sublabel {
    display: block; font-size: 11px; color: var(--sicam-muted);
    text-transform: uppercase; letter-spacing: 0.05em;
    margin-bottom: 6px; font-weight: 600;
  }

  &__input {
    width: 100%; border: 1px solid var(--sicam-line); border-radius: 10px;
    padding: 11px 14px; font-size: 14px; font-family: inherit;
    color: var(--sicam-ink); background: var(--sicam-surface-alt);
    &:focus { outline: 0; border-color: var(--sicam-primary-light); }
  }

  &__shortcuts {
    display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;
  }

  &__checkboxes {
    display: flex; flex-direction: column; gap: 10px;
  }

  &__footer {
    display: flex; align-items: center; justify-content: space-between;
    gap: 16px; margin-top: 28px;
    padding-top: 20px; border-top: 1px solid var(--sicam-line-soft);
    flex-wrap: wrap;
  }

  &__info {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; color: var(--sicam-muted);
  }
}

// ------------------------------------------------------------
// Tipo de exportação
// ------------------------------------------------------------
.exp-option {
  display: flex; flex-direction: column; align-items: flex-start;
  gap: 4px; padding: 14px;
  background: var(--sicam-surface-alt);
  border: 2px solid transparent; border-radius: 12px;
  cursor: pointer; font-family: inherit;
  transition: all 0.15s;
  text-align: left;

  .q-icon { color: var(--sicam-muted); }

  &__label {
    font-size: 14px; font-weight: 700;
    color: var(--sicam-ink); margin-top: 4px;
  }

  &__desc {
    font-size: 11px; color: var(--sicam-muted);
  }

  &:hover { background: var(--sicam-surface-hover); }

  &--active {
    border-color: var(--sicam-primary-light);
    background: var(--sicam-primary-bg-alt);

    .q-icon { color: var(--sicam-primary); }
    .exp-option__label { color: var(--sicam-primary); }
  }
}

// ------------------------------------------------------------
// Atalhos de período
// ------------------------------------------------------------
.exp-shortcut {
  background: #fff;
  border: 1px solid var(--sicam-line);
  border-radius: 99px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  color: var(--sicam-ink);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;

  &:hover { background: var(--sicam-surface-hover); border-color: var(--sicam-line-strong); }

  &--clear {
    color: var(--sicam-critical);
    border-color: var(--sicam-critical-bg);
    &:hover { background: var(--sicam-critical-bg); }
  }
}

// ------------------------------------------------------------
// Formato
// ------------------------------------------------------------
.exp-format {
  display: flex; flex-direction: column; align-items: center;
  gap: 6px; padding: 16px 20px;
  background: var(--sicam-surface-alt);
  border: 2px solid transparent; border-radius: 12px;
  cursor: pointer; font-family: inherit;
  transition: all 0.15s;
  flex: 1;
  min-width: 100px;

  .q-icon { color: var(--sicam-muted); }

  &__label {
    font-size: 13px; font-weight: 700;
    color: var(--sicam-ink);
  }

  &__ext {
    font-size: 11px; color: var(--sicam-muted);
    text-transform: uppercase;
  }

  &:hover { background: var(--sicam-surface-hover); }

  &--active {
    border-color: var(--sicam-primary-light);
    background: var(--sicam-primary-bg-alt);

    .q-icon { color: var(--sicam-primary); }
    .exp-format__label { color: var(--sicam-primary); }
  }
}

// ------------------------------------------------------------
// Checkboxes
// ------------------------------------------------------------
.exp-checkbox {
  display: flex; align-items: center; gap: 10px;
  cursor: pointer; font-size: 14px;
  color: var(--sicam-ink);

  input[type='checkbox'] {
    width: 18px; height: 18px;
    accent-color: var(--sicam-primary);
    cursor: pointer;
  }
}

// ------------------------------------------------------------
// Botão principal
// ------------------------------------------------------------
.exp-btn {
  display: inline-flex; align-items: center; gap: 8px;
  border: 0; border-radius: 10px;
  padding: 12px 24px;
  font-size: 15px; font-weight: 700;
  cursor: pointer; font-family: inherit;
  transition: all 0.15s;

  &--primary {
    background: var(--sicam-primary-light);
    color: #fff;

    &:hover:not(:disabled) { background: var(--sicam-primary); }
    &:disabled { opacity: 0.6; cursor: wait; }
  }
}

// ============================================================
// Bloco — Exportações recentes
// ============================================================
.block {
  background: #fff; border-radius: 14px; overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  &__head {
    display: flex; align-items: baseline; justify-content: space-between;
    padding: 18px 20px 14px;
    border-bottom: 1px solid var(--sicam-line-soft);
  }

  &__title { font-size: 15px; font-weight: 700; color: var(--sicam-ink); margin: 0; }

  &__count {
    font-size: 12px; color: var(--sicam-muted);
    background: var(--sicam-line-soft);
    padding: 2px 10px; border-radius: 99px; font-weight: 600;
  }
}

// ============================================================
// Lista
// ============================================================
.exp-list { list-style: none; padding: 0; margin: 0; }

.exp-item {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 20px;
  border-top: 1px solid var(--sicam-line-soft);
  transition: background 0.15s;

  &:first-child { border-top: 0; }
  &:hover { background: #fbfdfc; }

  &__icon {
    width: 42px; height: 42px; border-radius: 12px;
    display: grid; place-items: center; flex-shrink: 0;

    &--csv  { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
    &--xlsx { background: var(--sicam-primary-bg);  color: var(--sicam-primary); }
    &--pdf  { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
    &--json { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
  }

  &__body {
    flex: 1; min-width: 0;

    b { display: block; font-size: 14px; color: var(--sicam-ink); margin-bottom: 2px; }
    span { display: block; font-size: 12px; color: var(--sicam-muted); }
  }

  &__meta {
    display: flex; flex-direction: column; align-items: flex-end; gap: 2px;
    flex-shrink: 0; margin-right: 8px;

    @media (max-width: 600px) { display: none; }
  }

  &__date { font-size: 12px; color: var(--sicam-muted); }
  &__size { font-size: 11px; color: var(--sicam-line-strong); }

  &__action {
    display: grid; place-items: center;
    width: 36px; height: 36px;
    border: 0; border-radius: 8px;
    background: transparent; color: var(--sicam-muted);
    cursor: pointer; transition: all 0.15s;
    flex-shrink: 0;

    &:hover { background: var(--sicam-primary-bg); color: var(--sicam-primary); }
  }
}

// ============================================================
// Impressão
// ============================================================
@media print {
  .exp-form__footer,
  .exp-form__shortcuts,
  .exp-form__checkboxes,
  .exp-item__action {
    display: none !important;
  }
}
</style>