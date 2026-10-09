<template>
  <q-page class="hl-page">
    <!-- ============================================================ -->
    <!-- CABEÇALHO                                                     -->
    <!-- ============================================================ -->
    <header class="page-head">
      <div>
        <h1 class="page-head__title">Hotlist</h1>
        <p class="page-head__sub">
          Veículos procurados — sincronizado de forma cifrada para os dispositivos
        </p>
      </div>

      <div class="page-head__actions">
        <button class="page-btn page-btn--outline" @click="sincronizar">
          <q-icon name="sync" size="18px" :class="{ spinning: aSincronizar }" />
          {{ aSincronizar ? 'A sincronizar…' : 'Sincronizar agora' }}
        </button>
        <button class="page-btn page-btn--primary">
          <q-icon name="add" size="18px" />
          Adicionar à Hotlist
        </button>
      </div>
    </header>

    <!-- ============================================================ -->
    <!-- KPIs                                                          -->
    <!-- ============================================================ -->
    <section class="kpi-grid">
      <div class="kpi">
        <div class="kpi__icon kpi__icon--critical"><q-icon name="local_police" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ veiculos.length }}</div>
          <div class="kpi__label">Veículos procurados</div>
        </div>
      </div>

      <div class="kpi">
        <div class="kpi__icon kpi__icon--critical"><q-icon name="report" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ totalFurtados }}</div>
          <div class="kpi__label">Furtados</div>
        </div>
      </div>

      <div class="kpi">
        <div class="kpi__icon kpi__icon--warning"><q-icon name="content_copy" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ totalClonagem }}</div>
          <div class="kpi__label">Clonagem</div>
        </div>
      </div>

      <div class="kpi">
        <div class="kpi__icon kpi__icon--info"><q-icon name="gavel" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ totalMandados }}</div>
          <div class="kpi__label">Mandados de captura</div>
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
          placeholder="Pesquisar por matrícula, motivo…"
        />
      </div>

      <select v-model="filtroMotivo" class="filter filter__select">
        <option value="">Todos os motivos</option>
        <option value="Furtado">Furtado</option>
        <option value="Clonagem suspeita">Clonagem suspeita</option>
        <option value="Mandado de captura">Mandado de captura</option>
      </select>

      <select v-model="filtroNivel" class="filter filter__select">
        <option value="">Todos os níveis</option>
        <option value="Alto">Alto</option>
        <option value="Médio">Médio</option>
        <option value="Baixo">Baixo</option>
      </select>

      <select v-model="filtroEstado" class="filter filter__select">
        <option value="">Todos os estados</option>
        <option value="Ativo">Ativo</option>
        <option value="Resolvido">Resolvido</option>
      </select>
    </section>

    <!-- ============================================================ -->
    <!-- TABELA                                                        -->
    <!-- ============================================================ -->
    <section class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Matrícula</th>
            <th>Motivo</th>
            <th>Nível</th>
            <th>Origem</th>
            <th>Inserido em</th>
            <th>Abordagens</th>
            <th>Estado</th>
            <th class="data-table__th-actions" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in filtrados" :key="v.matricula" class="data-table__row">
            <td>
              <div class="placa">
                <div class="placa__icon" :class="`placa__icon--${nivelClasse(v.nivel)}`">
                  <q-icon name="directions_car" size="18px" />
                </div>
                <b>{{ v.matricula }}</b>
              </div>
            </td>

            <td>
              <span class="motivo">{{ v.motivo }}</span>
            </td>

            <td>
              <span class="nivel" :class="`nivel--${nivelClasse(v.nivel)}`">
                {{ v.nivel }}
              </span>
            </td>

            <td>{{ v.origem }}</td>

            <td class="table-time">{{ v.inseridoEm }}</td>

            <td>
              <div class="abordagens">
                <q-icon name="visibility" size="16px" />
                <b>{{ v.abordagens }}</b>
              </div>
            </td>

            <td>
              <span class="badge" :class="`badge--${v.estado === 'Ativo' ? 'critico' : 'regular'}`">
                {{ v.estado }}
              </span>
            </td>

            <td class="data-table__actions">
              <button class="row-action" title="Ver"><q-icon name="visibility" size="18px" /></button>
              <button class="row-action" title="Editar"><q-icon name="edit" size="18px" /></button>
              <button
                class="row-action row-action--danger"
                title="Remover"
                @click="remover(v.matricula)"
              >
                <q-icon name="delete" size="18px" />
              </button>
            </td>
          </tr>

          <tr v-if="!filtrados.length">
            <td colspan="8" class="data-table__empty">
              Nenhum veículo encontrado com estes filtros.
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
type Nivel = 'Alto' | 'Médio' | 'Baixo'
type Estado = 'Ativo' | 'Resolvido'

interface VeiculoHotlist {
  matricula: string
  motivo: string
  nivel: Nivel
  origem: string
  inseridoEm: string
  abordagens: number
  estado: Estado
}

// ============================================================
// Estado
// ============================================================
const pesquisa = ref('')
const filtroMotivo = ref('')
const filtroNivel = ref('')
const filtroEstado = ref('')
const aSincronizar = ref(false)

// ============================================================
// Dados fictícios
// ============================================================
const veiculos = ref<VeiculoHotlist[]>([
  { matricula: 'AGL-482-MC', motivo: 'Clonagem suspeita',   nivel: 'Alto',  origem: 'PRM',    inseridoEm: '20/09/2026', abordagens: 3, estado: 'Ativo' },
  { matricula: 'AEK-017-MP', motivo: 'Furtado',             nivel: 'Alto',  origem: 'PRM',    inseridoEm: '18/09/2026', abordagens: 1, estado: 'Ativo' },
  { matricula: 'AHT-662-MC', motivo: 'Mandado de captura',  nivel: 'Médio', origem: 'PRM',    inseridoEm: '12/09/2026', abordagens: 0, estado: 'Ativo' },
  { matricula: 'ABM-390-GZ', motivo: 'Furtado',             nivel: 'Alto',  origem: 'INATRO', inseridoEm: '03/09/2026', abordagens: 5, estado: 'Resolvido' },
  { matricula: 'AJK-120-MC', motivo: 'Clonagem suspeita',   nivel: 'Médio', origem: 'PRM',    inseridoEm: '28/08/2026', abordagens: 2, estado: 'Ativo' },
  { matricula: 'ADT-873-MP', motivo: 'Furtado',             nivel: 'Alto',  origem: 'INATRO', inseridoEm: '22/08/2026', abordagens: 4, estado: 'Ativo' },
  { matricula: 'AFC-205-MC', motivo: 'Mandado de captura',  nivel: 'Alto',  origem: 'PRM',    inseridoEm: '15/08/2026', abordagens: 1, estado: 'Ativo' },
  { matricula: 'AEF-649-MC', motivo: 'Furtado',             nivel: 'Baixo', origem: 'PRM',    inseridoEm: '10/08/2026', abordagens: 0, estado: 'Resolvido' },
  { matricula: 'ABX-556-MP', motivo: 'Clonagem suspeita',   nivel: 'Alto',  origem: 'INATRO', inseridoEm: '05/08/2026', abordagens: 2, estado: 'Ativo' },
  { matricula: 'ALM-507-MC', motivo: 'Furtado',             nivel: 'Médio', origem: 'PRM',    inseridoEm: '01/08/2026', abordagens: 1, estado: 'Ativo' },
])

// ============================================================
// KPIs
// ============================================================
const totalFurtados = computed(() => veiculos.value.filter((v) => v.motivo === 'Furtado').length)
const totalClonagem = computed(() => veiculos.value.filter((v) => v.motivo === 'Clonagem suspeita').length)
const totalMandados = computed(() => veiculos.value.filter((v) => v.motivo === 'Mandado de captura').length)

// ============================================================
// Filtragem
// ============================================================
const filtrados = computed(() => {
  return veiculos.value.filter((v) => {
    if (pesquisa.value) {
      const q = pesquisa.value.toLowerCase()
      if (
        !v.matricula.toLowerCase().includes(q) &&
        !v.motivo.toLowerCase().includes(q)
      ) return false
    }
    if (filtroMotivo.value && v.motivo !== filtroMotivo.value) return false
    if (filtroNivel.value && v.nivel !== filtroNivel.value) return false
    if (filtroEstado.value && v.estado !== filtroEstado.value) return false
    return true
  })
})

// ============================================================
// Helpers
// ============================================================
function nivelClasse(nivel: Nivel): 'alto' | 'medio' | 'baixo' {
  if (nivel === 'Alto') return 'alto'
  if (nivel === 'Médio') return 'medio'
  return 'baixo'
}

function sincronizar() {
  aSincronizar.value = true
  setTimeout(() => {
    aSincronizar.value = false
    $q.notify({
      type: 'positive',
      message: `Hotlist sincronizada: ${veiculos.value.length} veículos`,
      position: 'top',
    })
  }, 1200)
}

function remover(matricula: string) {
  $q.dialog({
    title: 'Remover da Hotlist',
    message: `Confirmar a remoção de ${matricula} da Hotlist?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    veiculos.value = veiculos.value.filter((v) => v.matricula !== matricula)
    $q.notify({
      type: 'positive',
      message: `${matricula} removido da Hotlist.`,
      position: 'top',
    })
  })
}
</script>

<style scoped lang="scss">
.hl-page { padding: 24px 20px 48px; max-width: 1180px; margin: 0 auto; }

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

  .spinning { animation: spin 1s linear infinite; }
}

@keyframes spin { to { transform: rotate(360deg); } }

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
    &--critical { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
    &--warning  { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
    &--info     { background: #dbeafe;                  color: #2563eb; }
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
  &__th-actions { width: 140px; text-align: right; }
  &__actions { text-align: right; white-space: nowrap; }
  &__empty {
    text-align: center; color: var(--sicam-muted);
    padding: 40px 16px !important; font-size: 14px;
  }
}

.table-time { color: var(--sicam-muted); font-size: 13px; white-space: nowrap; }

// Placa
.placa {
  display: flex; align-items: center; gap: 10px;

  b { font-weight: 700; letter-spacing: 0.02em; }

  &__icon {
    width: 32px; height: 32px; border-radius: 8px;
    display: grid; place-items: center; flex-shrink: 0;

    &--alto  { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
    &--medio { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
    &--baixo { background: var(--sicam-neutral-bg);  color: var(--sicam-neutral-ink); }
  }
}

// Motivo
.motivo {
  font-size: 13px; color: var(--sicam-ink-soft);
}

// Nível
.nivel {
  display: inline-block;
  padding: 3px 10px; border-radius: 99px;
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.04em;

  &--alto  { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
  &--medio { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
  &--baixo { background: var(--sicam-neutral-bg);  color: var(--sicam-neutral-ink); }
}

// Abordagens
.abordagens {
  display: inline-flex; align-items: center; gap: 6px;
  color: var(--sicam-muted);

  b { color: var(--sicam-ink); font-weight: 700; }
}

// Estado
.badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 3px 10px; border-radius: 99px;
  font-size: 12px; font-weight: 600;

  &::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

  &--regular { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
  &--critico { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
}

// Acções
.row-action {
  display: inline-grid; place-items: center; width: 34px; height: 34px;
  border: 0; border-radius: 8px; background: transparent; color: var(--sicam-muted);
  cursor: pointer; margin-left: 2px; transition: all 0.15s;

  &:hover { background: var(--sicam-surface-hover); color: var(--sicam-ink); }
  &--danger:hover { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
}
</style>