<template>
  <q-page class="ap-page">
    <!-- ============================================================ -->
    <!-- CABEÇALHO                                                     -->
    <!-- ============================================================ -->
    <header class="page-head">
      <div>
        <h1 class="page-head__title">Aprovações</h1>
        <p class="page-head__sub">
          Autos de Notícia e pedidos à espera da sua validação
        </p>
      </div>
    </header>

    <!-- ============================================================ -->
    <!-- KPIs                                                          -->
    <!-- ============================================================ -->
    <section class="kpi-grid">
      <div class="kpi">
        <div class="kpi__icon kpi__icon--warning"><q-icon name="pending_actions" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ totalPendentes }}</div>
          <div class="kpi__label">Aguarda aprovação</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--success"><q-icon name="check_circle" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ totalAprovadosHoje }}</div>
          <div class="kpi__label">Aprovados hoje</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--critical"><q-icon name="cancel" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ totalRejeitadosHoje }}</div>
          <div class="kpi__label">Rejeitados hoje</div>
        </div>
      </div>
      <div class="kpi">
        <div class="kpi__icon kpi__icon--info"><q-icon name="schedule" size="22px" /></div>
        <div>
          <div class="kpi__value">{{ tempoMedio }}<span class="kpi__unid"> min</span></div>
          <div class="kpi__label">Tempo médio</div>
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- TABS                                                          -->
    <!-- ============================================================ -->
    <section class="tabs">
      <button
        v-for="t in tabs"
        :key="t.key"
        class="tabs__btn"
        :class="{ 'tabs__btn--active': tabActivo === t.key }"
        @click="tabActivo = t.key"
      >
        <q-icon :name="t.icon" size="16px" />
        {{ t.label }}
        <span v-if="t.count" class="tabs__count">{{ t.count }}</span>
      </button>
    </section>

    <!-- ============================================================ -->
    <!-- LISTA DE APROVAÇÕES                                           -->
    <!-- ============================================================ -->
    <section class="lista">
      <article
        v-for="a in filtrados"
        :key="a.id"
        class="aprovacao"
        :class="`aprovacao--${a.estado}`"
      >
        <!-- Cabeçalho -->
        <header class="aprovacao__head">
          <div class="aprovacao__icon" :class="`aprovacao__icon--${a.tipo}`">
            <q-icon :name="iconeTipo(a.tipo)" size="20px" />
          </div>

          <div class="aprovacao__info">
            <div class="aprovacao__row">
              <span class="aprovacao__tipo-tag" :class="`aprovacao__tipo-tag--${a.tipo}`">
                {{ labelTipo(a.tipo) }}
              </span>
              <span class="aprovacao__estado" :class="`aprovacao__estado--${a.estado}`">
                {{ labelEstado(a.estado) }}
              </span>
            </div>
            <h3 class="aprovacao__titulo">{{ a.titulo }}</h3>
          </div>

          <span class="aprovacao__hora">{{ a.hora }}</span>
        </header>

        <!-- Detalhes -->
        <div class="aprovacao__detalhes">
          <div v-for="d in a.detalhes" :key="d.label" class="aprovacao__det">
            <span class="aprovacao__det-label">{{ d.label }}</span>
            <span class="aprovacao__det-valor">{{ d.valor }}</span>
          </div>
        </div>

        <!-- Motivo (se rejeitado) -->
        <div v-if="a.motivoRejeicao" class="aprovacao__rejeicao">
          <q-icon name="info" size="14px" />
          <span><b>Motivo da rejeição:</b> {{ a.motivoRejeicao }}</span>
        </div>

        <!-- Rodapé com acções -->
        <footer v-if="a.estado === 'pendente'" class="aprovacao__foot">
          <button class="aprovacao__btn aprovacao__btn--rejeitar" @click="abrirRejeicao(a)">
            <q-icon name="close" size="16px" />
            Rejeitar
          </button>

          <button class="aprovacao__btn aprovacao__btn--detalhes">
            <q-icon name="visibility" size="16px" />
            Ver completo
          </button>

          <button class="aprovacao__btn aprovacao__btn--aprovar" @click="aprovar(a.id)">
            <q-icon name="check" size="16px" />
            Aprovar
          </button>
        </footer>
      </article>

      <div v-if="!filtrados.length" class="lista-vazia">
        <q-icon name="check_circle" size="48px" />
        <p>Nada por aprovar neste separador.</p>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- DIALOG DE REJEIÇÃO                                            -->
    <!-- ============================================================ -->
    <q-dialog v-model="dialogRejeicao" persistent>
      <q-card style="min-width: 420px; max-width: 90vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Rejeitar aprovação</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <p class="text-caption text-grey-7 q-mb-md">
            Indique o motivo da rejeição. O agente responsável será notificado.
          </p>

          <q-input
            v-model="motivoRejeicao"
            type="textarea"
            outlined
            autofocus
            rows="4"
            placeholder="Ex.: Documentação incompleta, valor da infração incorreto…"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            color="negative"
            label="Confirmar rejeição"
            :disable="!motivoRejeicao.trim()"
            @click="confirmarRejeicao"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// ============================================================
// Tipos
// ============================================================
type Estado = 'pendente' | 'aprovado' | 'rejeitado'
type Tipo = 'auto' | 'dados-sensiveis' | 'apreensao'
type Tab = 'pendentes' | 'aprovados' | 'rejeitados'

interface Detalhe { label: string; valor: string }

interface Aprovacao {
  id: number
  tipo: Tipo
  titulo: string
  hora: string
  detalhes: Detalhe[]
  estado: Estado
  motivoRejeicao?: string
}

// ============================================================
// Estado
// ============================================================
const tabActivo = ref<Tab>('pendentes')
const dialogRejeicao = ref(false)
const motivoRejeicao = ref('')
const aprovacaoSelecionada = ref<Aprovacao | null>(null)

// ============================================================
// Tabs
// ============================================================
const tabs = computed(() => [
  { key: 'pendentes' as const,  label: 'Pendentes',  icon: 'pending_actions', count: totalPendentes.value },
  { key: 'aprovados' as const,  label: 'Aprovados',  icon: 'check_circle',    count: 0 },
  { key: 'rejeitados' as const, label: 'Rejeitados', icon: 'cancel',          count: 0 },
])

// ============================================================
// Dados fictícios
// ============================================================
const aprovacoes = ref<Aprovacao[]>([
  {
    id: 1,
    tipo: 'auto',
    titulo: 'Auto de Notícia — AGL-482-MC',
    hora: 'há 3 min',
    estado: 'pendente',
    detalhes: [
      { label: 'Agente', valor: 'Agente Chissano' },
      { label: 'Infracção', valor: 'Seguro expirado' },
      { label: 'Valor', valor: '2 800 MT' },
      { label: 'Local', valor: 'Posto Baixa' },
    ],
  },
  {
    id: 2,
    tipo: 'dados-sensiveis',
    titulo: 'Pedido de dados — AGL-482-MC',
    hora: 'há 12 min',
    estado: 'pendente',
    detalhes: [
      { label: 'Agente', valor: 'Agente Chissano' },
      { label: 'Dados', valor: 'Proprietário + Histórico' },
      { label: 'Motivo', valor: 'Verificação de clonagem' },
      { label: 'Local', valor: 'Posto Baixa' },
    ],
  },
  {
    id: 3,
    tipo: 'apreensao',
    titulo: 'Apreensão de veículo — AEK-017-MP',
    hora: 'há 45 min',
    estado: 'pendente',
    detalhes: [
      { label: 'Agente', valor: 'Agente Sitoe' },
      { label: 'Motivo', valor: 'Veículo em Hotlist' },
      { label: 'Local', valor: 'Posto Machava' },
      { label: 'Prioridade', valor: 'ALTA' },
    ],
  },
  {
    id: 4,
    tipo: 'auto',
    titulo: 'Auto de Notícia — AFC-205-MC',
    hora: 'há 1 h',
    estado: 'aprovado',
    detalhes: [
      { label: 'Agente', valor: 'Agente Nhaca' },
      { label: 'Infracção', valor: 'Inspecção em atraso' },
      { label: 'Valor', valor: '2 200 MT' },
      { label: 'Local', valor: 'Posto Matola' },
    ],
  },
  {
    id: 5,
    tipo: 'dados-sensiveis',
    titulo: 'Pedido de dados — ABX-556-MP',
    hora: 'há 3 h',
    estado: 'rejeitado',
    motivoRejeicao: 'Justificação insuficiente para acesso a dados sensíveis.',
    detalhes: [
      { label: 'Agente', valor: 'Agente Cumbe' },
      { label: 'Dados', valor: 'Proprietário' },
      { label: 'Motivo', valor: '—' },
      { label: 'Local', valor: 'Posto Namaacha' },
    ],
  },
])

// ============================================================
// KPIs
// ============================================================
const totalPendentes = computed(() => aprovacoes.value.filter((a) => a.estado === 'pendente').length)
const totalAprovadosHoje = computed(() => aprovacoes.value.filter((a) => a.estado === 'aprovado').length)
const totalRejeitadosHoje = computed(() => aprovacoes.value.filter((a) => a.estado === 'rejeitado').length)
const tempoMedio = 12

// ============================================================
// Filtrados por tab
// ============================================================
const filtrados = computed(() => {
  if (tabActivo.value === 'pendentes') return aprovacoes.value.filter((a) => a.estado === 'pendente')
  if (tabActivo.value === 'aprovados') return aprovacoes.value.filter((a) => a.estado === 'aprovado')
  return aprovacoes.value.filter((a) => a.estado === 'rejeitado')
})

// ============================================================
// Helpers
// ============================================================
function iconeTipo(t: Tipo): string {
  if (t === 'auto') return 'receipt_long'
  if (t === 'dados-sensiveis') return 'lock'
  return 'gavel'
}

function labelTipo(t: Tipo): string {
  if (t === 'auto') return 'Auto de Notícia'
  if (t === 'dados-sensiveis') return 'Dados sensíveis'
  return 'Apreensão'
}

function labelEstado(e: Estado): string {
  if (e === 'pendente') return 'Aguarda'
  if (e === 'aprovado') return 'Aprovado'
  return 'Rejeitado'
}

// ============================================================
// Acções
// ============================================================
function aprovar(id: number) {
  const a = aprovacoes.value.find((x) => x.id === id)
  if (a) {
    a.estado = 'aprovado'
    $q.notify({
      type: 'positive',
      message: 'Aprovação registada com sucesso.',
      position: 'top',
    })
  }
}

function abrirRejeicao(a: Aprovacao) {
  aprovacaoSelecionada.value = a
  motivoRejeicao.value = ''
  dialogRejeicao.value = true
}

function confirmarRejeicao() {
  if (!aprovacaoSelecionada.value || !motivoRejeicao.value.trim()) return

  aprovacaoSelecionada.value.estado = 'rejeitado'
  aprovacaoSelecionada.value.motivoRejeicao = motivoRejeicao.value

  dialogRejeicao.value = false
  motivoRejeicao.value = ''

  $q.notify({
    type: 'info',
    message: 'Rejeição registada. Agente notificado.',
    position: 'top',
  })
}
</script>

<style scoped lang="scss">
.ap-page { padding: 24px 20px 48px; max-width: 1180px; margin: 0 auto; }

// ============================================================
// Cabeçalho
// ============================================================
.page-head {
  margin-bottom: 24px;

  &__title { font-size: 24px; font-weight: 700; color: var(--sicam-ink); margin: 0 0 6px; }
  &__sub { font-size: 14px; color: var(--sicam-muted); margin: 0; }
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
    &--warning  { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
    &--success  { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
    &--critical { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
    &--info     { background: #dbeafe;                  color: #2563eb; }
  }
  &__value { font-size: 22px; font-weight: 700; color: var(--sicam-ink); line-height: 1; }
  &__unid { font-size: 14px; font-weight: 500; color: var(--sicam-muted); }
  &__label { font-size: 12px; color: var(--sicam-muted); margin-top: 2px; }
}

// ============================================================
// Tabs
// ============================================================
.tabs {
  display: flex; gap: 8px;
  margin-bottom: 20px;
  padding: 4px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  overflow-x: auto;
}

.tabs__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: 0;
  background: transparent;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--sicam-muted);
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: all 0.15s;

  &:hover { background: var(--sicam-surface-hover); }

  &--active {
    background: var(--sicam-primary-bg);
    color: var(--sicam-primary);
    font-weight: 700;
  }
}

.tabs__count {
  background: var(--sicam-primary);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  border-radius: 99px;
  padding: 2px 7px;
  min-width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

// ============================================================
// Lista
// ============================================================
.lista { display: flex; flex-direction: column; gap: 14px; }

.aprovacao {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--sicam-line-soft);
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
  }

  &--aprovado {
    opacity: 0.85;
    background: #fafdfa;
  }

  &--rejeitado {
    opacity: 0.85;
    background: #fdfafa;
  }

  // Cabeçalho
  &__head {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 16px;
  }

  &__icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    flex-shrink: 0;

    &--auto              { background: #dbeafe;                  color: #2563eb; }
    &--dados-sensiveis   { background: #fef3c7;                  color: #a16207; }
    &--apreensao         { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
  }

  &__info { flex: 1; min-width: 0; }

  &__row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  &__tipo-tag {
    font-size: 10px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 99px;
    text-transform: uppercase;
    letter-spacing: 0.04em;

    &--auto              { background: #dbeafe;                  color: #2563eb; }
    &--dados-sensiveis   { background: #fef3c7;                  color: #a16207; }
    &--apreensao         { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
  }

  &__estado {
    font-size: 10px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 99px;
    text-transform: uppercase;
    letter-spacing: 0.04em;

    &--pendente  { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
    &--aprovado  { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
    &--rejeitado { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
  }

  &__titulo {
    font-size: 16px;
    font-weight: 700;
    color: var(--sicam-ink);
    margin: 0;
    line-height: 1.3;
  }

  &__hora {
    font-size: 12px;
    color: var(--sicam-muted);
    flex-shrink: 0;
    white-space: nowrap;
  }

  // Detalhes
  &__detalhes {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    padding: 14px 16px;
    background: var(--sicam-surface-alt);
    border-radius: 12px;
    margin-bottom: 16px;

    @media (max-width: 700px) { grid-template-columns: repeat(2, 1fr); }
    @media (max-width: 400px) { grid-template-columns: 1fr; }
  }

  &__det {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  &__det-label {
    font-size: 10px;
    color: var(--sicam-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
  }

  &__det-valor {
    font-size: 13px;
    color: var(--sicam-ink);
    font-weight: 600;
  }

  // Rejeição
  &__rejeicao {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 12px 14px;
    background: var(--sicam-critical-bg);
    color: var(--sicam-critical-ink);
    border-radius: 10px;
    font-size: 13px;
    line-height: 1.5;
    margin-bottom: 16px;

    .q-icon { flex-shrink: 0; margin-top: 1px; }
  }

  // Rodapé
  &__foot {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding-top: 16px;
    border-top: 1px solid var(--sicam-line-soft);

    @media (max-width: 500px) {
      flex-direction: column-reverse;
    }
  }

  // Botões
  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 0;
    border-radius: 10px;
    padding: 10px 18px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;

    @media (max-width: 500px) {
      justify-content: center;
      width: 100%;
    }

    &--rejeitar {
      background: #fff;
      color: var(--sicam-critical);
      border: 1px solid var(--sicam-critical-bg);

      &:hover { background: var(--sicam-critical-bg); }
    }

    &--detalhes {
      background: #fff;
      color: var(--sicam-ink);
      border: 1px solid var(--sicam-line);

      &:hover { background: var(--sicam-surface-hover); }
    }

    &--aprovar {
      background: var(--sicam-success);
      color: #fff;

      &:hover { background: #15803d; }
    }
  }
}

// Empty state
.lista-vazia {
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  .q-icon { color: var(--sicam-success); margin-bottom: 12px; }
  p { margin: 0; color: var(--sicam-muted); font-size: 14px; }
}
</style>