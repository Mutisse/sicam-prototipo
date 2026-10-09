<template>
  <q-page class="vl-page">
    <!-- ============================================================ -->
    <!-- CABEÇALHO                                                     -->
    <!-- ============================================================ -->
    <header class="page-head">
      <div>
        <h1 class="page-head__title">Validação</h1>
        <p class="page-head__sub">
          Consulte a validade do seguro obrigatório por matrícula
        </p>
      </div>
    </header>

    <!-- ============================================================ -->
    <!-- CAIXA DE CONSULTA                                             -->
    <!-- ============================================================ -->
    <section class="search-box">
      <div class="search-box__inner">
        <q-icon name="verified_user" size="36px" class="search-box__icon" />

        <h2 class="search-box__title">Validar seguro</h2>
        <p class="search-box__sub">
          Introduza a matrícula para verificar o estado do seguro
        </p>

        <div class="search-box__form">
          <input
            v-model="matricula"
            class="search-box__input"
            placeholder="Ex.: AGL-482-MC"
            @keydown.enter="consultar"
          />
          <button class="search-box__btn" :disabled="aConsultar || !matricula" @click="consultar">
            <q-icon name="search" size="20px" />
            {{ aConsultar ? 'A validar…' : 'Validar' }}
          </button>
        </div>

        <div class="search-box__exemplos">
          <span>Exemplos:</span>
          <button
            v-for="ex in exemplos"
            :key="ex"
            class="search-box__ex"
            @click="matricula = ex; consultar()"
          >
            {{ ex }}
          </button>
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- RESULTADO DA VALIDAÇÃO                                        -->
    <!-- ============================================================ -->
    <section v-if="resultado" class="result">
      <!-- Bandeira de estado -->
      <div class="result__banner" :class="`result__banner--${resultado.estado}`">
        <q-icon :name="resultado.icone" size="32px" />
        <div>
          <h3 class="result__banner-title">{{ resultado.titulo }}</h3>
          <p class="result__banner-sub">{{ resultado.subtitulo }}</p>
        </div>
      </div>

      <!-- Detalhes -->
      <div class="result__grid">
        <div class="result__card">
          <div class="result__card-label">Matrícula</div>
          <div class="result__card-value">{{ resultado.matricula }}</div>
        </div>
        <div class="result__card">
          <div class="result__card-label">Nº Apólice</div>
          <div class="result__card-value">{{ resultado.apolice }}</div>
        </div>
        <div class="result__card">
          <div class="result__card-label">Seguradora</div>
          <div class="result__card-value">{{ resultado.seguradora }}</div>
        </div>
        <div class="result__card">
          <div class="result__card-label">Tipo</div>
          <div class="result__card-value">{{ resultado.tipo }}</div>
        </div>
        <div class="result__card">
          <div class="result__card-label">Data de início</div>
          <div class="result__card-value">{{ resultado.inicio }}</div>
        </div>
        <div class="result__card">
          <div class="result__card-label">Data de fim</div>
          <div class="result__card-value">{{ resultado.fim }}</div>
        </div>
      </div>

      <!-- Aviso -->
      <div v-if="resultado.aviso" class="result__aviso" :class="`result__aviso--${resultado.estado}`">
        <q-icon name="info" size="18px" />
        <span>{{ resultado.aviso }}</span>
      </div>

      <!-- Acções -->
      <div class="result__actions">
        <button class="page-btn page-btn--outline" @click="limpar">
          <q-icon name="refresh" size="18px" />
          Nova validação
        </button>
        <button class="page-btn page-btn--outline" @click="imprimirComprovativo">
          <q-icon name="print" size="18px" />
          Imprimir comprovativo
        </button>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- HISTÓRICO DE VALIDAÇÕES                                       -->
    <!-- ============================================================ -->
    <section v-if="!resultado" class="historico">
      <header class="historico__head">
        <h2 class="historico__title">Validações recentes</h2>
        <span class="historico__count">{{ historico.length }}</span>
      </header>

      <div class="historico__list">
        <div
          v-for="h in historico"
          :key="h.matricula + h.hora"
          class="historico__item"
          @click="matricula = h.matricula; consultar()"
        >
          <div class="historico__icon" :class="`historico__icon--${h.estado}`">
            <q-icon :name="h.icone" size="18px" />
          </div>

          <div class="historico__body">
            <b class="historico__placa">{{ h.matricula }}</b>
            <span class="historico__desc">{{ h.descricao }}</span>
          </div>

          <div class="historico__right">
            <span class="historico__estado" :class="`historico__estado--${h.estado}`">
              {{ h.estadoLabel }}
            </span>
            <span class="historico__hora">{{ h.hora }}</span>
          </div>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// ============================================================
// Tipos
// ============================================================
type EstadoValidacao = 'valida' | 'a-expirar' | 'expirada' | 'nao-encontrada'

interface ResultadoValidacao {
  estado: EstadoValidacao
  icone: string
  titulo: string
  subtitulo: string
  matricula: string
  apolice: string
  seguradora: string
  tipo: string
  inicio: string
  fim: string
  aviso?: string
}

// ============================================================
// Estado
// ============================================================
const matricula = ref('')
const aConsultar = ref(false)
const resultado = ref<ResultadoValidacao | null>(null)

const exemplos = ['AGL-482-MC', 'ABR-771-MP', 'AFC-205-MC']

// ------------------------------------------------------------
// Base de dados fictícia
// ------------------------------------------------------------
interface ApoliceInterna {
  matricula: string
  apolice: string
  seguradora: string
  tipo: string
  inicio: string
  fim: string
  estado: EstadoValidacao
}

const baseDados: ApoliceInterna[] = [
  { matricula: 'AGL-482-MC', apolice: 'AP-2026-000342', seguradora: 'Seguradora A', tipo: 'Terceiros',         inicio: '12/08/2026', fim: '12/08/2027', estado: 'valida' },
  { matricula: 'ABR-771-MP', apolice: 'AP-2026-000341', seguradora: 'Seguradora B', tipo: 'Todos os riscos',   inicio: '05/09/2025', fim: '05/09/2026', estado: 'a-expirar' },
  { matricula: 'AFC-205-MC', apolice: 'AP-2026-000340', seguradora: 'Seguradora A', tipo: 'Terceiros',         inicio: '18/03/2024', fim: '18/03/2025', estado: 'expirada' },
  { matricula: 'ACD-918-MP', apolice: 'AP-2026-000339', seguradora: 'Seguradora C', tipo: 'Terceiros + Roubo', inicio: '22/06/2026', fim: '22/06/2027', estado: 'valida' },
  { matricula: 'AHN-304-MC', apolice: 'AP-2026-000338', seguradora: 'Seguradora B', tipo: 'Todos os riscos',   inicio: '10/11/2026', fim: '10/11/2027', estado: 'valida' },
  { matricula: 'ABX-556-MP', apolice: 'AP-2026-000337', seguradora: 'Seguradora A', tipo: 'Terceiros',         inicio: '15/09/2025', fim: '15/09/2026', estado: 'a-expirar' },
  { matricula: 'AJK-120-MC', apolice: 'AP-2026-000336', seguradora: 'Seguradora C', tipo: 'Terceiros + Roubo', inicio: '20/08/2025', fim: '20/08/2026', estado: 'expirada' },
]

// ------------------------------------------------------------
// Histórico de validações
// ------------------------------------------------------------
interface HistoricoItem {
  matricula: string
  descricao: string
  estado: EstadoValidacao
  estadoLabel: string
  icone: string
  hora: string
}

const historico = ref<HistoricoItem[]>([
  { matricula: 'AGL-482-MC', descricao: 'Seguro válido até 12/08/2027',    estado: 'valida',     estadoLabel: 'Válida',      icone: 'verified_user',  hora: 'há 3 min' },
  { matricula: 'ABR-771-MP', descricao: 'Expira em 5 dias',                 estado: 'a-expirar',  estadoLabel: 'A expirar',   icone: 'hourglass_top',  hora: 'há 18 min' },
  { matricula: 'AFC-205-MC', descricao: 'Expirou em 18/03/2025',            estado: 'expirada',   estadoLabel: 'Expirada',    icone: 'cancel',         hora: 'há 2 h' },
  { matricula: 'ACD-918-MP', descricao: 'Seguro válido até 22/06/2027',     estado: 'valida',     estadoLabel: 'Válida',      icone: 'verified_user',  hora: 'há 4 h' },
  { matricula: 'AHN-304-MC', descricao: 'Seguro válido até 10/11/2027',     estado: 'valida',     estadoLabel: 'Válida',      icone: 'verified_user',  hora: 'há 6 h' },
])

// ============================================================
// Validação
// ============================================================
function consultar() {
  const m = matricula.value.toUpperCase().trim()
  if (!m) return

  aConsultar.value = true
  resultado.value = null

  setTimeout(() => {
    aConsultar.value = false

    const encontrado = baseDados.find((b) => b.matricula === m)

    if (!encontrado) {
      resultado.value = {
        estado: 'nao-encontrada',
        icone: 'help',
        titulo: 'Sem seguro registado',
        subtitulo: `Nenhuma apólice encontrada para ${m}`,
        matricula: m,
        apolice: '—',
        seguradora: '—',
        tipo: '—',
        inicio: '—',
        fim: '—',
        aviso: 'Esta matrícula não tem seguro registado no sistema. O proprietário deve contactar uma seguradora licenciada.',
      }
      return
    }

    let titulo = ''
    let subtitulo = ''
    let icone = ''
    let aviso = ''

    if (encontrado.estado === 'valida') {
      titulo = 'Seguro válido'
      subtitulo = `Válido até ${encontrado.fim}`
      icone = 'verified_user'
      aviso = 'O seguro obrigatório está em vigor.'
    } else if (encontrado.estado === 'a-expirar') {
      titulo = 'Seguro a expirar'
      subtitulo = `Expira em ${encontrado.fim}`
      icone = 'hourglass_top'
      aviso = 'A apólice expira nos próximos 30 dias. Renove para evitar coimas.'
    } else if (encontrado.estado === 'expirada') {
      titulo = 'Seguro expirado'
      subtitulo = `Expirou em ${encontrado.fim}`
      icone = 'cancel'
      aviso = 'ATENÇÃO: Seguro expirado. Circulação sem seguro constitui infracção grave.'
    }

    resultado.value = {
      estado: encontrado.estado,
      icone,
      titulo,
      subtitulo,
      matricula: encontrado.matricula,
      apolice: encontrado.apolice,
      seguradora: encontrado.seguradora,
      tipo: encontrado.tipo,
      inicio: encontrado.inicio,
      fim: encontrado.fim,
      aviso,
    }

    // Guardar no histórico
    const estadoLabel =
      encontrado.estado === 'valida' ? 'Válida' :
      encontrado.estado === 'a-expirar' ? 'A expirar' : 'Expirada'

    historico.value.unshift({
      matricula: encontrado.matricula,
      descricao: `${encontrado.seguradora} · ${encontrado.tipo}`,
      estado: encontrado.estado,
      estadoLabel,
      icone,
      hora: 'agora',
    })

    if (historico.value.length > 8) historico.value.pop()
  }, 700)
}

function limpar() {
  matricula.value = ''
  resultado.value = null
}

function imprimirComprovativo() {
  $q.notify({
    type: 'info',
    message: 'A gerar comprovativo de validação…',
    position: 'top',
  })
  window.print()
}
</script>

<style scoped lang="scss">
.vl-page { padding: 24px 20px 48px; max-width: 900px; margin: 0 auto; }

// ============================================================
// Cabeçalho
// ============================================================
.page-head {
  margin-bottom: 24px;

  &__title { font-size: 24px; font-weight: 700; color: var(--sicam-ink); margin: 0 0 6px; }
  &__sub { font-size: 14px; color: var(--sicam-muted); margin: 0; }
}

// ============================================================
// Caixa de consulta
// ============================================================
.search-box {
  background: linear-gradient(155deg, #065f46 0%, #0b4a38 100%);
  border-radius: 20px;
  padding: 40px 32px;
  color: #fff;
  text-align: center;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(6, 95, 70, 0.15);

  &__icon {
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 12px;
  }

  &__title {
    font-size: 22px;
    font-weight: 700;
    margin: 0 0 6px;
  }

  &__sub {
    font-size: 14px;
    opacity: 0.85;
    margin: 0 0 24px;
  }

  &__form {
    display: flex;
    gap: 10px;
    max-width: 520px;
    margin: 0 auto 16px;

    @media (max-width: 500px) { flex-direction: column; }
  }

  &__input {
    flex: 1;
    border: 0;
    border-radius: 12px;
    padding: 14px 18px;
    font-size: 16px;
    font-family: inherit;
    color: var(--sicam-ink);
    background: #fff;
    letter-spacing: 0.04em;
    font-weight: 600;
    text-transform: uppercase;

    &::placeholder {
      color: var(--sicam-muted);
      font-weight: 400;
      text-transform: none;
      letter-spacing: 0;
    }

    &:focus { outline: 2px solid rgba(255, 255, 255, 0.5); }
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--sicam-primary-light);
    color: #fff;
    border: 0;
    border-radius: 12px;
    padding: 14px 26px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    white-space: nowrap;
    transition: all 0.15s;

    &:hover:not(:disabled) { background: #047857; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }

    @media (max-width: 500px) {
      justify-content: center;
      width: 100%;
    }
  }

  &__exemplos {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 12px;
    opacity: 0.75;
  }

  &__ex {
    background: rgba(255, 255, 255, 0.15);
    border: 0;
    border-radius: 99px;
    color: #fff;
    padding: 4px 12px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    letter-spacing: 0.04em;

    &:hover { background: rgba(255, 255, 255, 0.25); }
  }
}

// ============================================================
// Resultado
// ============================================================
.result { margin-bottom: 24px; }

.result__banner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border-radius: 16px;
  color: #fff;
  margin-bottom: 16px;

  &--valida {
    background: linear-gradient(135deg, #16a34a, #15803d);
    box-shadow: 0 6px 20px rgba(22, 163, 74, 0.25);
  }

  &--a-expirar {
    background: linear-gradient(135deg, #d99a06, #b45309);
    box-shadow: 0 6px 20px rgba(217, 154, 6, 0.25);
  }

  &--expirada {
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    box-shadow: 0 6px 20px rgba(220, 38, 38, 0.25);
  }

  &--nao-encontrada {
    background: linear-gradient(135deg, #6b7280, #4b5563);
    box-shadow: 0 6px 20px rgba(107, 114, 128, 0.25);
  }
}

.result__banner-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 2px;
}

.result__banner-sub {
  font-size: 13px;
  opacity: 0.9;
  margin: 0;
}

.result__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 16px;

  @media (max-width: 700px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 450px) { grid-template-columns: 1fr; }
}

.result__card {
  background: #fff;
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--sicam-line-soft);
}

.result__card-label {
  font-size: 11px;
  color: var(--sicam-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  margin-bottom: 4px;
}

.result__card-value {
  font-size: 15px;
  font-weight: 700;
  color: var(--sicam-ink);
  letter-spacing: 0.02em;
}

.result__aviso {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 18px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 16px;

  &--valida {
    background: var(--sicam-success-bg);
    color: var(--sicam-success-ink);
  }

  &--a-expirar {
    background: var(--sicam-warning-bg);
    color: var(--sicam-warning-ink);
  }

  &--expirada {
    background: var(--sicam-critical-bg);
    color: var(--sicam-critical-ink);
  }

  &--nao-encontrada {
    background: var(--sicam-neutral-bg);
    color: var(--sicam-neutral-ink);
  }

  .q-icon { flex-shrink: 0; margin-top: 1px; }
}

.result__actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

// ============================================================
// Botões
// ============================================================
.page-btn {
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
  transition: all 0.15s;

  &--outline {
    background: #fff;
    color: var(--sicam-ink);
    border: 1px solid var(--sicam-line);

    &:hover { background: var(--sicam-surface-hover); }
  }
}

// ============================================================
// Histórico
// ============================================================
.historico {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  &__head {
    display: flex;
    align-items: baseline;
    gap: 10px;
    padding: 18px 20px 14px;
    border-bottom: 1px solid var(--sicam-line-soft);
  }

  &__title {
    font-size: 14px;
    font-weight: 700;
    color: var(--sicam-ink);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__count {
    background: var(--sicam-line-soft);
    color: var(--sicam-muted);
    font-size: 11px;
    font-weight: 700;
    padding: 2px 10px;
    border-radius: 99px;
  }

  &__list { display: flex; flex-direction: column; }
}

.historico__item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--sicam-line-soft);
  cursor: pointer;
  transition: background 0.15s;

  &:last-child { border-bottom: 0; }
  &:hover { background: var(--sicam-surface-alt); }

  @media (max-width: 500px) {
    flex-wrap: wrap;
  }
}

.historico__icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  flex-shrink: 0;

  &--valida    { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
  &--a-expirar { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
  &--expirada  { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
  &--nao-encontrada { background: var(--sicam-neutral-bg); color: var(--sicam-neutral-ink); }
}

.historico__body {
  flex: 1;
  min-width: 0;
}

.historico__placa {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: var(--sicam-ink);
  letter-spacing: 0.02em;
  margin-bottom: 2px;
}

.historico__desc {
  display: block;
  font-size: 12px;
  color: var(--sicam-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.historico__right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
  flex-shrink: 0;

  @media (max-width: 500px) {
    flex-direction: row;
    gap: 10px;
    align-items: center;
  }
}

.historico__estado {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.04em;

  &--valida    { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
  &--a-expirar { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
  &--expirada  { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
  &--nao-encontrada { background: var(--sicam-neutral-bg); color: var(--sicam-neutral-ink); }
}

.historico__hora {
  font-size: 11px;
  color: var(--sicam-muted);
}
</style>