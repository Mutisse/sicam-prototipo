<template>
  <q-page class="util-page">
    <!-- ============================================================ -->
    <!-- CABEÇALHO                                                     -->
    <!-- ============================================================ -->
    <header class="util-head">
      <div>
        <h1 class="util-head__title">Utilizadores</h1>
        <p class="util-head__sub">
          Contas, perfis e permissões de acesso ao sistema
        </p>
      </div>

      <button class="util-btn util-btn--primary">
        <q-icon name="person_add" size="18px" />
        Novo utilizador
      </button>
    </header>

    <!-- ============================================================ -->
    <!-- KPIs                                                          -->
    <!-- ============================================================ -->
    <section class="util-kpis">
      <div class="util-kpi">
        <div class="util-kpi__icon util-kpi__icon--primary">
          <q-icon name="people" size="22px" />
        </div>
        <div>
          <div class="util-kpi__value">{{ kpis.total }}</div>
          <div class="util-kpi__label">Total</div>
        </div>
      </div>

      <div class="util-kpi">
        <div class="util-kpi__icon util-kpi__icon--success">
          <q-icon name="check_circle" size="22px" />
        </div>
        <div>
          <div class="util-kpi__value">{{ kpis.activos }}</div>
          <div class="util-kpi__label">Activos</div>
        </div>
      </div>

      <div class="util-kpi">
        <div class="util-kpi__icon util-kpi__icon--critical">
          <q-icon name="block" size="22px" />
        </div>
        <div>
          <div class="util-kpi__value">{{ kpis.bloqueados }}</div>
          <div class="util-kpi__label">Bloqueados</div>
        </div>
      </div>

      <div class="util-kpi">
        <div class="util-kpi__icon util-kpi__icon--info">
          <q-icon name="wifi_tethering" size="22px" />
        </div>
        <div>
          <div class="util-kpi__value">{{ kpis.online }}</div>
          <div class="util-kpi__label">Online agora</div>
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- FILTROS                                                       -->
    <!-- ============================================================ -->
    <section class="util-filters">
      <div class="util-filter util-filter--search">
        <q-icon name="search" size="20px" class="util-filter__icon" />
        <input
          v-model="pesquisa"
          type="text"
          class="util-filter__input"
          placeholder="Pesquisar por nome ou e-mail…"
        />
      </div>

      <select v-model="filtroPerfil" class="util-filter util-filter__select">
        <option value="">Todos os perfis</option>
        <option v-for="p in perfis" :key="p.key" :value="p.key">
          {{ p.label }}
        </option>
      </select>

      <select v-model="filtroEstado" class="util-filter util-filter__select">
        <option value="">Todos os estados</option>
        <option value="Ativo">Activos</option>
        <option value="Bloqueado">Bloqueados</option>
      </select>
    </section>

    <!-- ============================================================ -->
    <!-- TABELA + PAGINAÇÃO                                            -->
    <!-- ============================================================ -->
    <section class="util-table-wrap">
      <table class="util-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Perfil</th>
            <th>Posto</th>
            <th>Estado</th>
            <th>Último acesso</th>
            <th class="util-table__th-actions" />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="u in paginaVisivel"
            :key="u.email"
            class="util-table__row"
          >
            <td>
              <div class="util-user">
                <div class="util-user__avatar" :class="`util-user__avatar--${u.perfil}`">
                  {{ iniciais(u.nome) }}
                </div>
                <b>{{ u.nome }}</b>
              </div>
            </td>
            <td class="util-table__email">{{ u.email }}</td>
            <td>
              <span class="util-badge" :class="`util-badge--${u.perfil}`">
                {{ labelPerfil(u.perfil) }}
              </span>
            </td>
            <td>{{ u.posto }}</td>
            <td>
              <span
                class="util-estado"
                :class="`util-estado--${u.estado === 'Ativo' ? 'regular' : 'critico'}`"
              >
                {{ u.estado }}
              </span>
            </td>
            <td class="util-table__time">{{ u.ultimoAcesso }}</td>
            <td class="util-table__actions">
              <button class="util-action" title="Ver">
                <q-icon name="visibility" size="18px" />
              </button>
              <button class="util-action" title="Editar">
                <q-icon name="edit" size="18px" />
              </button>
              <button
                class="util-action util-action--danger"
                :title="u.estado === 'Ativo' ? 'Bloquear' : 'Desbloquear'"
              >
                <q-icon :name="u.estado === 'Ativo' ? 'block' : 'check_circle'" size="18px" />
              </button>
            </td>
          </tr>

          <tr v-if="!paginaVisivel.length">
            <td colspan="7" class="util-table__empty">
              Nenhum utilizador encontrado com estes filtros.
            </td>
          </tr>
        </tbody>
      </table>

      <!-- PAGINAÇÃO -->
      <footer class="util-pagination">
        <div class="util-pagination__info">
          A mostrar
          <b>{{ inicioPagina + 1 }}–{{ fimPagina }}</b>
          de <b>{{ filtrados.length }}</b>
        </div>

        <div class="util-pagination__controls">
          <button
            class="util-pagination__btn"
            :disabled="paginaActual <= 1"
            @click="paginaActual--"
          >
            <q-icon name="chevron_left" size="18px" />
            Anterior
          </button>

          <span class="util-pagination__page">
            Página {{ paginaActual }} de {{ totalPaginas }}
          </span>

          <button
            class="util-pagination__btn"
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
import type { Perfil } from '../../css/design/palette'

// ============================================================
// Tipos
// ============================================================
interface Utilizador {
  nome: string
  email: string
  perfil: Perfil
  posto: string
  estado: 'Ativo' | 'Bloqueado'
  ultimoAcesso: string
}

// ============================================================
// Estado
// ============================================================
const pesquisa = ref('')
const filtroPerfil = ref('')
const filtroEstado = ref('')

// ============================================================
// Perfis para o filtro
// ============================================================
const perfis: { key: Perfil; label: string }[] = [
  { key: 'admin',   label: 'Administrador' },
  { key: 'chefe',   label: 'Chefe de Posto' },
  { key: 'agente',  label: 'Agente' },
  { key: 'inatro',  label: 'INATRO' },
  { key: 'gestmul', label: 'GESTMUL' },
  { key: 'issm',    label: 'ISSM' },
  { key: 'prm',     label: 'PRM' },
  { key: 'cidadao', label: 'Cidadão' },
]

// ============================================================
// Dados fictícios
// ============================================================
const utilizadores = ref<Utilizador[]>([
  { nome: 'Agente Chissano',  email: 'chissano@sicam.gov.mz',  perfil: 'agente',  posto: 'Posto Baixa',     estado: 'Ativo',     ultimoAcesso: '23/09 02:07' },
  { nome: 'Agente Nhaca',     email: 'nhaca@sicam.gov.mz',     perfil: 'agente',  posto: 'Posto Matola',    estado: 'Ativo',     ultimoAcesso: '22/09 22:07' },
  { nome: 'Agente Sitoe',     email: 'sitoe@sicam.gov.mz',     perfil: 'agente',  posto: 'Posto Namaacha',  estado: 'Ativo',     ultimoAcesso: '22/09 19:07' },
  { nome: 'Agente Cumbe',     email: 'cumbe@sicam.gov.mz',     perfil: 'agente',  posto: 'Posto KaMpfumo',  estado: 'Ativo',     ultimoAcesso: '21/09 00:07' },
  { nome: 'Chefe Mabunda',    email: 'mabunda@sicam.gov.mz',   perfil: 'chefe',   posto: 'Posto Baixa',     estado: 'Ativo',     ultimoAcesso: '23/09 01:07' },
  { nome: 'Chefe Zandamela',  email: 'zandamela@sicam.gov.mz', perfil: 'chefe',   posto: 'Posto Matola',    estado: 'Ativo',     ultimoAcesso: '23/09 02:07' },
  { nome: 'Administrador',    email: 'admin@sicam.gov.mz',     perfil: 'admin',   posto: '—',               estado: 'Ativo',     ultimoAcesso: '23/09 02:30' },
  { nome: 'INATRO Operações', email: 'inatro@sicam.gov.mz',    perfil: 'inatro',  posto: 'Sede',            estado: 'Ativo',     ultimoAcesso: '22/09 17:00' },
  { nome: 'GESTMUL Central',  email: 'gestmul@sicam.gov.mz',   perfil: 'gestmul', posto: 'Sede',            estado: 'Ativo',     ultimoAcesso: '22/09 15:30' },
  { nome: 'ISSM Supervisor',  email: 'issm@sicam.gov.mz',      perfil: 'issm',    posto: 'Sede',            estado: 'Ativo',     ultimoAcesso: '21/09 09:00' },
  { nome: 'PRM Central',      email: 'prm@sicam.gov.mz',       perfil: 'prm',     posto: 'Sede',            estado: 'Ativo',     ultimoAcesso: '23/09 00:15' },
  { nome: 'Agente Bila',      email: 'bila@sicam.gov.mz',      perfil: 'agente',  posto: 'Posto Machava',   estado: 'Bloqueado', ultimoAcesso: '10/09 08:07' },
  { nome: 'Agente Tembe',     email: 'tembe@sicam.gov.mz',     perfil: 'agente',  posto: 'Posto Namaacha',  estado: 'Ativo',     ultimoAcesso: '22/09 21:07' },
  { nome: 'Chefe Cuna',       email: 'cuna@sicam.gov.mz',      perfil: 'chefe',   posto: 'Posto Machava',   estado: 'Ativo',     ultimoAcesso: '22/09 20:15' },
  { nome: 'Agente Macuácua',  email: 'macuacua@sicam.gov.mz',  perfil: 'agente',  posto: 'Posto KaMpfumo',  estado: 'Ativo',     ultimoAcesso: '22/09 18:30' },
  { nome: 'Agente Muianga',   email: 'muianga@sicam.gov.mz',   perfil: 'agente',  posto: 'Posto Baixa',     estado: 'Bloqueado', ultimoAcesso: '05/09 10:00' },
])

// ============================================================
// KPIs
// ============================================================
const kpis = computed(() => ({
  total: utilizadores.value.length,
  activos: utilizadores.value.filter((u) => u.estado === 'Ativo').length,
  bloqueados: utilizadores.value.filter((u) => u.estado === 'Bloqueado').length,
  online: 3,
}))

// ============================================================
// Filtragem
// ============================================================
const filtrados = computed(() => {
  return utilizadores.value.filter((u) => {
    if (pesquisa.value) {
      const q = pesquisa.value.toLowerCase()
      if (
        !u.nome.toLowerCase().includes(q) &&
        !u.email.toLowerCase().includes(q)
      ) {
        return false
      }
    }
    if (filtroPerfil.value && u.perfil !== filtroPerfil.value) return false
    if (filtroEstado.value && u.estado !== filtroEstado.value) return false
    return true
  })
})

// ============================================================
// Paginação
// ============================================================
const POR_PAGINA = 10
const paginaActual = ref(1)

// Reinicia para a página 1 sempre que os filtros mudarem
watch([pesquisa, filtroPerfil, filtroEstado], () => {
  paginaActual.value = 1
})

const totalPaginas = computed(() =>
  Math.max(1, Math.ceil(filtrados.value.length / POR_PAGINA)),
)

const inicioPagina = computed(() =>
  (paginaActual.value - 1) * POR_PAGINA,
)

const fimPagina = computed(() =>
  Math.min(paginaActual.value * POR_PAGINA, filtrados.value.length),
)

const paginaVisivel = computed(() =>
  filtrados.value.slice(inicioPagina.value, fimPagina.value),
)

// ============================================================
// Helpers
// ============================================================
function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/)
  const p = partes[0]?.[0] ?? ''
  const u = partes.length > 1 ? partes[partes.length - 1]?.[0] ?? '' : ''
  return (p + u).toUpperCase()
}

function labelPerfil(perfil: Perfil): string {
  const encontrado = perfis.find((p) => p.key === perfil)
  return encontrado?.label ?? perfil
}
</script>

<style scoped lang="scss">
.util-page {
  padding: 24px 20px 48px;
  max-width: 1180px;
  margin: 0 auto;
}

// ============================================================
// Cabeçalho
// ============================================================
.util-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 700px) { flex-direction: column; }

  &__title {
    font-size: 24px;
    font-weight: 700;
    color: var(--sicam-ink);
    margin: 0 0 6px;
  }

  &__sub {
    font-size: 14px;
    color: var(--sicam-muted);
    margin: 0;
  }
}

.util-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--sicam-transition-fast);

  &--primary {
    background: var(--sicam-primary-light);
    color: #fff;

    &:hover { background: var(--sicam-primary); }
  }
}

// ============================================================
// KPIs
// ============================================================
.util-kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 20px;

  @media (max-width: 800px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 450px) { grid-template-columns: 1fr; }
}

.util-kpi {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border-radius: 14px;
  padding: 16px 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  &__icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    flex-shrink: 0;

    &--primary  { background: var(--sicam-primary-bg);  color: var(--sicam-primary); }
    &--success  { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
    &--critical { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
    &--info     { background: #dbeafe;                  color: #2563eb; }
  }

  &__value {
    font-size: 22px;
    font-weight: 700;
    color: var(--sicam-ink);
    line-height: 1;
  }

  &__label {
    font-size: 12px;
    color: var(--sicam-muted);
    margin-top: 2px;
  }
}

// ============================================================
// Filtros
// ============================================================
.util-filters {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.util-filter {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid var(--sicam-line);
  border-radius: 10px;
  padding: 0 14px;
  height: 44px;
  font-family: inherit;

  &--search {
    flex: 1;
    min-width: 240px;
  }

  &__icon {
    color: var(--sicam-muted);
    margin-right: 8px;
    flex-shrink: 0;
  }

  &__input {
    flex: 1;
    border: 0;
    background: transparent;
    font-size: 14px;
    color: var(--sicam-ink);
    height: 100%;

    &:focus { outline: 0; }
    &::placeholder { color: var(--sicam-muted); }
  }

  &__select {
    border: 0;
    background: transparent;
    font-size: 14px;
    color: var(--sicam-ink);
    height: 100%;
    cursor: pointer;
    min-width: 160px;

    &:focus { outline: 0; }
  }
}

// ============================================================
// Tabela
// ============================================================
.util-table-wrap {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.util-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;

  th {
    text-align: left;
    font-size: 11px;
    font-weight: 600;
    color: var(--sicam-muted);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 12px 16px;
    background: #fafbfa;
    border-bottom: 1px solid var(--sicam-line);
    white-space: nowrap;
  }

  td {
    padding: 14px 16px;
    font-size: 14px;
    color: var(--sicam-ink);
    border-bottom: 1px solid var(--sicam-line-soft);
    vertical-align: middle;
  }

  &__row {
    transition: background var(--sicam-transition-fast);

    &:hover { background: #fbfdfc; }
    &:last-child td { border-bottom: 0; }
  }

  &__email {
    color: var(--sicam-muted);
    font-size: 13px;
  }

  &__time {
    color: var(--sicam-muted);
    font-size: 13px;
    white-space: nowrap;
  }

  &__th-actions {
    width: 140px;
    text-align: right;
  }

  &__actions {
    text-align: right;
    white-space: nowrap;
  }

  &__empty {
    text-align: center;
    color: var(--sicam-muted);
    padding: 40px 16px !important;
    font-size: 14px;
  }
}

// ============================================================
// User cell
// ============================================================
.util-user {
  display: flex;
  align-items: center;
  gap: 10px;

  &__avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;

    &--admin   { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
    &--chefe   { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
    &--agente  { background: var(--sicam-neutral-bg);  color: var(--sicam-neutral-ink); }
    &--inatro  { background: #dbeafe;                  color: #2563eb; }
    &--gestmul { background: #f3e8ff;                  color: #7c3aed; }
    &--issm    { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
    &--prm     { background: var(--sicam-primary-bg);  color: var(--sicam-primary); }
    &--cidadao { background: var(--sicam-neutral-bg);  color: var(--sicam-neutral-ink); }
  }

  b {
    font-weight: 600;
    color: var(--sicam-ink);
  }
}

// ============================================================
// Badge de perfil
// ============================================================
.util-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;

  &--admin   { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
  &--chefe   { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
  &--agente  { background: var(--sicam-neutral-bg);  color: var(--sicam-neutral-ink); }
  &--inatro  { background: #dbeafe;                  color: #2563eb; }
  &--gestmul { background: #f3e8ff;                  color: #7c3aed; }
  &--issm    { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
  &--prm     { background: var(--sicam-primary-bg);  color: var(--sicam-primary); }
  &--cidadao { background: var(--sicam-neutral-bg);  color: var(--sicam-neutral-ink); }
}

// ============================================================
// Estado
// ============================================================
.util-estado {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  &--regular { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
  &--critico { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
}

// ============================================================
// Acções
// ============================================================
.util-action {
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--sicam-muted);
  cursor: pointer;
  transition: all var(--sicam-transition-fast);
  margin-left: 2px;

  &:hover {
    background: var(--sicam-surface-hover);
    color: var(--sicam-ink);
  }

  &--danger:hover {
    background: var(--sicam-critical-bg);
    color: var(--sicam-critical-ink);
  }
}

// ============================================================
// Paginação
// ============================================================
.util-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-top: 1px solid var(--sicam-line);
  background: #fff;
  flex-wrap: wrap;

  &__info {
    font-size: 13px;
    color: var(--sicam-muted);

    b { color: var(--sicam-ink); font-weight: 600; }
  }

  &__controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #fff;
    border: 1px solid var(--sicam-line);
    border-radius: 8px;
    padding: 8px 14px;
    font-size: 13px;
    font-weight: 600;
    color: var(--sicam-ink);
    cursor: pointer;
    font-family: inherit;
    transition: all var(--sicam-transition-fast);

    &:hover:not(:disabled) {
      background: var(--sicam-surface-hover);
      border-color: var(--sicam-line-strong);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  &__page {
    font-size: 12px;
    color: var(--sicam-muted);
    font-weight: 600;
    padding: 0 4px;
    white-space: nowrap;
  }
}
</style>