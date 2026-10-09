<template>
  <q-page class="int-page">
    <header class="page-head">
      <div>
        <h1 class="page-head__title">Integrações</h1>
        <p class="page-head__sub">Estado dos conectores das entidades parceiras</p>
      </div>
      <button class="page-btn">
        <q-icon name="refresh" size="18px" :class="{ spinning: carregando }" @click="carregar" />
        Actualizar
      </button>
    </header>

    <!-- Cards de integrações -->
    <section class="int-grid">
      <article
        v-for="i in integracoes"
        :key="i.nome"
        class="int-card"
        :class="`int-card--${i.estado}`"
      >
        <header class="int-card__head">
          <h3 class="int-card__name">{{ i.nome }}</h3>
          <span class="int-card__status" :class="`int-card__status--${i.estado}`">
            {{ labelEstado(i.estado) }}
          </span>
        </header>

        <p class="int-card__desc">{{ i.descricao }}</p>

        <div class="int-card__lat">
          <span class="int-card__lat-value">{{ i.latencia }} ms</span>
          <span class="int-card__lat-label">latência</span>
        </div>

        <footer class="int-card__foot">
          <span>{{ i.ultimaResposta }}</span>
        </footer>
      </article>
    </section>

    <!-- Desempenho -->
    <section class="perf-card">
      <h2 class="perf-card__title">Desempenho das consultas</h2>

      <div class="perf-grid">
        <div class="perf">
          <div class="perf__label">Tempo médio</div>
          <div class="perf__value">212 ms</div>
          <div class="perf__sub">meta: &lt; 300 ms</div>
        </div>
        <div class="perf">
          <div class="perf__label">Via cache</div>
          <div class="perf__value">71%</div>
          <div class="perf__sub">consultas servidas</div>
        </div>
        <div class="perf">
          <div class="perf__label">Offline</div>
          <div class="perf__value">3,2%</div>
          <div class="perf__sub">consultas parciais</div>
        </div>
        <div class="perf">
          <div class="perf__label">Uptime</div>
          <div class="perf__value">99,8%</div>
          <div class="perf__sub">últimos 30 dias</div>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type Estado = 'regular' | 'atencao' | 'critico'

interface Integracao {
  nome: string
  descricao: string
  estado: Estado
  latencia: number
  ultimaResposta: string
}

const carregando = ref(false)

const integracoes = ref<Integracao[]>([
  { nome: 'INATRO',             descricao: 'Registo, matrícula e inspecção', estado: 'regular', latencia: 118, ultimaResposta: 'Última resposta há 2 min' },
  { nome: 'PRM',                descricao: 'Fiscalização e Hotlist',         estado: 'regular', latencia: 64,  ultimaResposta: 'Última resposta há 1 min' },
  { nome: 'Gestão de Multas',   descricao: 'Infrações e cobranças',          estado: 'atencao', latencia: 412, ultimaResposta: 'Última resposta há 9 min' },
  { nome: 'ISSM / Seguradoras', descricao: 'Seguro obrigatório',             estado: 'regular', latencia: 187, ultimaResposta: 'Última resposta há 4 min' },
])

function labelEstado(e: Estado): string {
  if (e === 'regular') return 'Operacional'
  if (e === 'atencao') return 'Degradado'
  return 'Crítico'
}

function carregar() {
  carregando.value = true
  setTimeout(() => (carregando.value = false), 800)
}
</script>

<style scoped lang="scss">
.int-page { padding: 24px 20px 48px; max-width: 1180px; margin: 0 auto; }

.page-head {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 16px; margin-bottom: 24px;
  @media (max-width: 700px) { flex-direction: column; }
  &__title { font-size: 24px; font-weight: 700; color: var(--sicam-ink); margin: 0 0 6px; }
  &__sub { font-size: 14px; color: var(--sicam-muted); margin: 0; }
}

.page-btn {
  display: inline-flex; align-items: center; gap: 8px;
  background: #fff; border: 1px solid var(--sicam-line); border-radius: 10px;
  padding: 10px 18px; font-size: 14px; font-weight: 600; color: var(--sicam-ink);
  cursor: pointer; font-family: inherit;
  &:hover { background: var(--sicam-surface-hover); }
  .spinning { animation: spin 1s linear infinite; }
}

@keyframes spin { to { transform: rotate(360deg); } }

// ============================================================
// Cards de integrações
// ============================================================
.int-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 14px; margin-bottom: 24px;
  @media (max-width: 1000px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 500px)  { grid-template-columns: 1fr; }
}

.int-card {
  background: #fff; border-radius: 14px; padding: 18px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  border-top: 4px solid transparent;
  display: flex; flex-direction: column;

  &--regular { border-top-color: var(--sicam-success); }
  &--atencao { border-top-color: var(--sicam-warning); }
  &--critico { border-top-color: var(--sicam-critical); }

  &__head {
    display: flex; align-items: center; justify-content: space-between;
    gap: 8px; margin-bottom: 8px;
  }

  &__name { font-size: 15px; font-weight: 700; color: var(--sicam-ink); margin: 0; }

  &__status {
    font-size: 11px; font-weight: 700; padding: 3px 8px;
    border-radius: 99px; text-transform: uppercase; letter-spacing: 0.04em;

    &--regular { background: var(--sicam-success-bg); color: var(--sicam-success-ink); }
    &--atencao { background: var(--sicam-warning-bg); color: var(--sicam-warning-ink); }
    &--critico { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
  }

  &__desc { font-size: 12px; color: var(--sicam-muted); margin: 0 0 14px; line-height: 1.4; }

  &__lat { margin-bottom: 14px; }

  &__lat-value {
    display: block; font-size: 26px; font-weight: 700; color: var(--sicam-ink); line-height: 1;
  }

  &__lat-label {
    display: block; font-size: 11px; color: var(--sicam-muted); margin-top: 2px;
    text-transform: uppercase; letter-spacing: 0.05em;
  }

  &__foot {
    font-size: 11px; color: var(--sicam-muted);
    border-top: 1px solid var(--sicam-line-soft);
    padding-top: 10px; margin-top: auto;
  }
}

// ============================================================
// Desempenho
// ============================================================
.perf-card {
  background: #fff; border-radius: 14px; padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  &__title { font-size: 15px; font-weight: 700; color: var(--sicam-ink); margin: 0 0 16px; }
}

.perf-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  @media (max-width: 800px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 450px) { grid-template-columns: 1fr; }
}

.perf {
  padding: 14px; border-radius: 10px; background: var(--sicam-surface-alt);

  &__label { font-size: 11px; color: var(--sicam-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
  &__value { font-size: 20px; font-weight: 700; color: var(--sicam-ink); line-height: 1; }
  &__sub { font-size: 11px; color: var(--sicam-muted); margin-top: 4px; }
}
</style>