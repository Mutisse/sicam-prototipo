<template>
  <div class="agente-consulta">
    <!-- ============================================================ -->
    <!-- MÉTRICAS RÁPIDAS                                              -->
    <!-- ============================================================ -->
    <div class="agente-stats">
      <div class="agente-stat">
        <q-icon
          name="local_police"
          size="18px"
          class="agente-stat__icon agente-stat__icon--critical"
        />
        <div>
          <div class="agente-stat__value">{{ hotlist.length }}</div>
          <div class="agente-stat__label">Hotlist</div>
        </div>
      </div>

      <div class="agente-stat__divider" />

      <div class="agente-stat">
        <q-icon name="search" size="18px" class="agente-stat__icon" />
        <div>
          <div class="agente-stat__value">{{ consultasHoje }}</div>
          <div class="agente-stat__label">Hoje</div>
        </div>
      </div>

      <div class="agente-stat__divider" />

      <div class="agente-stat">
        <q-icon
          name="receipt_long"
          size="18px"
          class="agente-stat__icon agente-stat__icon--regular"
        />
        <div>
          <div class="agente-stat__value">{{ autosHoje }}</div>
          <div class="agente-stat__label">Autos</div>
        </div>
      </div>
    </div>

    <!-- ============================================================ -->
    <!-- BOTÃO — LER MATRÍCULA                                         -->
    <!-- ============================================================ -->
    <router-link to="/agente/camera" class="agente-btn-ler">
      <q-icon name="photo_camera" size="20px" class="q-mr-xs" />
      Ler matrícula
    </router-link>

    <!-- ============================================================ -->
    <!-- CONSULTAS RECENTES                                            -->
    <!-- ============================================================ -->
    <section class="agente-section">
      <header class="agente-section__head">
        <h2 class="agente-section__title">Consultas recentes</h2>
        <button class="agente-section__link" @click="irHistorico">Ver todas</button>
      </header>

      <ul class="agente-list">
        <li
          v-for="v in recentes"
          :key="v.matricula"
          class="agente-list__item"
          @click="ver(v.matricula)"
        >
          <div
            class="agente-list__avatar"
            :class="`agente-list__avatar--${badgeVariant(v.score)}`"
          >
            {{ v.matricula.slice(0, 2) }}
          </div>
          <div class="agente-list__body">
            <div class="agente-list__top">
              <b>{{ v.matricula }}</b>
              <span
                class="agente-list__score"
                :class="`agente-list__score--${badgeVariant(v.score)}`"
              >
                {{ v.score }}
              </span>
            </div>
            <div class="agente-list__meta">{{ v.posto }} · {{ v.ultima }}</div>
          </div>
          <q-icon name="chevron_right" size="20px" class="agente-list__chevron" />
        </li>
      </ul>
    </section>

    <!-- ============================================================ -->
    <!-- HOTLIST — card branco, texto preto, nível colorido            -->
    <!-- ============================================================ -->
    <section class="agente-hotlist">
      <header class="agente-hotlist__head">
        <q-icon name="local_police" size="20px" />
        <h2 class="agente-hotlist__title">Hotlist activa</h2>
        <span class="agente-hotlist__badge">{{ hotlist.length }}</span>
      </header>

      <p class="agente-hotlist__sub">Veículos procurados — toque para consultar</p>

      <ul class="agente-hotlist__list">
        <li
          v-for="h in hotlist"
          :key="h.matricula"
          class="agente-hotlist__item"
          @click="ver(h.matricula)"
        >
          <div class="agente-hotlist__body">
            <b>{{ h.matricula }}</b>
            <span>{{ h.motivo }} · {{ h.origem }}</span>
          </div>
          <span
            class="agente-hotlist__nivel"
            :class="`agente-hotlist__nivel--${nivelClasse(h.nivel)}`"
          >
            {{ h.nivel }}
          </span>
        </li>
      </ul>
    </section>

    <!-- ============================================================ -->
    <!-- BARRA DE CHAT — assistente (FINAL DA PÁGINA)                  -->
    <!-- ============================================================ -->
    <button class="agente-chat-bar" @click="abrirChat">
      <q-icon name="chat_bubble_outline" size="20px" class="agente-chat-bar__icon" />
      <span class="agente-chat-bar__text">Perguntar ao assistente…</span>
      <span class="agente-chat-bar__badge">3</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { estadoDoScore, type VeiculoSimples } from '@/css/design/palette'

const router = useRouter()

// ------------------------------------------------------------
// Métricas (mock)
// ------------------------------------------------------------
const consultasHoje = ref(18)
const autosHoje = ref(2)

// ------------------------------------------------------------
// Consultas recentes (mock)
// ------------------------------------------------------------
const recentes: VeiculoSimples[] = [
  { matricula: 'AGL-482-MC', tipo: 'Ligeiro', posto: 'Posto Baixa', score: 22, ultima: '23/09 02:07' },
  { matricula: 'ABR-771-MP', tipo: 'Pesado',  posto: 'Matola',      score: 31, ultima: '22/09 18:07' },
  { matricula: 'AFC-205-MC', tipo: 'Ligeiro', posto: 'KaMpfumo',    score: 36, ultima: '22/09 20:07' },
  { matricula: 'ACD-918-MP', tipo: 'Ligeiro', posto: 'Machava',     score: 41, ultima: '22/09 22:07' },
]

// ------------------------------------------------------------
// Hotlist activa (mock)
// ------------------------------------------------------------
interface HotlistItem {
  matricula: string
  motivo: string
  origem: string
  nivel: string
}

const hotlist: HotlistItem[] = [
  { matricula: 'AGL-482-MC', motivo: 'Clonagem suspeita',  origem: 'PRM', nivel: 'Alto' },
  { matricula: 'AEK-017-MP', motivo: 'Furtado',            origem: 'PRM', nivel: 'Alto' },
  { matricula: 'AHT-662-MC', motivo: 'Mandado de captura', origem: 'PRM', nivel: 'Médio' },
  { matricula: 'ABM-390-GZ', motivo: 'Verificação',         origem: 'PRM', nivel: 'Baixo' },
]

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
function badgeVariant(score: number | null): 'regular' | 'atencao' | 'critico' | 'sem-dados' {
  const estado = estadoDoScore(score)
  if (estado.key === 'critico') return 'critico'
  if (estado.key === 'atencao') return 'atencao'
  if (estado.key === 'regular') return 'regular'
  return 'sem-dados'
}

function nivelClasse(nivel: string): 'alto' | 'medio' | 'baixo' {
  const n = nivel.toLowerCase()
  if (n === 'alto') return 'alto'
  if (n === 'médio' || n === 'medio') return 'medio'
  return 'baixo'
}

function ver(mat: string) {
  sessionStorage.setItem('sicam.matricula-atual', mat)
  router.push('/agente/resultado')
}

function irHistorico() {
  router.push('/agente/historico')
}

function abrirChat() {
  router.push('/agente/chat')
}
</script>

<style scoped lang="scss">
.agente-consulta { padding: 0; }

// ============================================================
// MÉTRICAS
// ============================================================
.agente-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 14px;
  padding: 14px 18px;
  margin-bottom: 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--sicam-line-soft);
}

.agente-stat {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;

  &__icon {
    color: var(--sicam-primary-light);

    &--critical { color: var(--sicam-critical); }
    &--regular  { color: var(--sicam-success); }
  }

  &__value {
    font-size: 20px;
    font-weight: 700;
    color: var(--sicam-ink);
    line-height: 1;
  }

  &__label {
    font-size: 11px;
    color: var(--sicam-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 2px;
  }

  &__divider {
    width: 1px;
    height: 32px;
    background: var(--sicam-line-soft);
    margin: 0 8px;
  }
}

// ============================================================
// BOTÃO — LER MATRÍCULA (abaixo das métricas)
// ============================================================
.agente-btn-ler {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  background: var(--sicam-primary-light);
  color: #fff;
  border: 0;
  border-radius: 12px;
  padding: 14px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  margin-bottom: 18px;
  text-decoration: none;
  text-align: center;
  transition: background var(--sicam-transition-fast);

  &:active { background: var(--sicam-primary); }
}

// ============================================================
// SECÇÕES (título + link)
// ============================================================
.agente-section {
  margin-bottom: 18px;

  &__head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 10px;
    padding: 0 4px;
  }

  &__title {
    font-size: 13px;
    font-weight: 700;
    color: var(--sicam-ink);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0;
  }

  &__link {
    background: none;
    border: 0;
    color: var(--sicam-primary);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    padding: 0;

    &:active { opacity: 0.7; }
  }
}

// ============================================================
// LISTA — consultas recentes
// ============================================================
.agente-list {
  list-style: none;
  padding: 0;
  margin: 0;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  &__item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    cursor: pointer;
    border-bottom: 1px solid var(--sicam-line-soft);
    transition: background var(--sicam-transition-fast);

    &:last-child { border-bottom: 0; }
    &:active { background: var(--sicam-surface-hover); }
  }

  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.05em;
    flex-shrink: 0;

    &--critico   { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
    &--atencao   { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
    &--regular   { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
    &--sem-dados { background: var(--sicam-neutral-bg);  color: var(--sicam-neutral-ink); }
  }

  &__body { flex: 1; min-width: 0; }

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;

    b {
      font-size: 14px;
      font-weight: 700;
      color: var(--sicam-ink);
      letter-spacing: 0.02em;
    }
  }

  &__score {
    font-size: 12px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 99px;

    &--critico   { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
    &--atencao   { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
    &--regular   { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
    &--sem-dados { background: var(--sicam-neutral-bg);  color: var(--sicam-neutral-ink); }
  }

  &__meta {
    font-size: 12px;
    color: var(--sicam-muted);
    margin-top: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__chevron {
    color: var(--sicam-line-strong);
    flex-shrink: 0;
  }
}

// ============================================================
// HOTLIST — card branco, texto preto, nível colorido
// ============================================================
.agente-hotlist {
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  overflow: hidden;

  &__head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;

    .q-icon {
      color: var(--sicam-critical);
    }
  }

  &__title {
    flex: 1;
    font-size: 14px;
    font-weight: 700;
    color: var(--sicam-critical);
    margin: 0;
    letter-spacing: 0.02em;
  }

  &__badge {
    background: var(--sicam-critical);
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    border-radius: 99px;
    min-width: 22px;
    height: 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 8px;
  }

  &__sub {
    font-size: 12px;
    color: var(--sicam-muted);
    margin: 0 0 10px;
    padding-left: 28px;
  }

  &__list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 11px 0;
    border-top: 1px solid var(--sicam-line-soft);
    cursor: pointer;

    &:active { opacity: 0.7; }
  }

  &__body {
    min-width: 0;

    b {
      display: block;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.02em;
      color: var(--sicam-ink);
    }

    span {
      display: block;
      font-size: 11px;
      color: var(--sicam-muted);
      margin-top: 1px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__nivel {
    font-size: 11px;
    font-weight: 700;
    padding: 3px 9px;
    border-radius: 99px;
    flex-shrink: 0;
    text-transform: uppercase;
    letter-spacing: 0.04em;

    &--alto {
      background: var(--sicam-critical-bg);
      color: var(--sicam-critical-ink);
    }

    &--medio {
      background: var(--sicam-warning-bg);
      color: var(--sicam-warning-ink);
    }

    &--baixo {
      background: var(--sicam-neutral-bg);
      color: var(--sicam-neutral-ink);
    }
  }
}

// ============================================================
// BARRA DE CHAT — assistente (FINAL DA PÁGINA)
// ============================================================
.agente-chat-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;

  background: #fff;
  border: 1px solid var(--sicam-line);
  border-radius: 99px;
  padding: 12px 16px;
  margin-top: 18px;

  cursor: pointer;
  text-align: left;
  font-family: inherit;
  font-size: 14px;
  color: var(--sicam-muted);

  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  transition:
    border-color var(--sicam-transition-fast),
    background var(--sicam-transition-fast);

  &:active {
    background: var(--sicam-surface-hover);
    border-color: var(--sicam-primary-light);
  }

  &__icon {
    color: var(--sicam-primary-light);
    flex-shrink: 0;
  }

  &__text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__badge {
    flex-shrink: 0;
    min-width: 22px;
    height: 22px;
    border-radius: 99px;
    background: var(--sicam-primary-light);
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 7px;
  }
}
</style>