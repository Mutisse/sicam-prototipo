<template>
  <div class="agente-historico">
    <h1 class="agente-h1">Histórico</h1>
    <p class="agente-sub">As suas consultas, da mais recente para a mais antiga.</p>

    <!-- Filtros -->
    <div class="agente-seg">
      <button
        v-for="f in filtros"
        :key="f"
        :class="{ 'is-active': filtroActivo === f }"
        @click="filtroActivo = f"
      >
        {{ f }}
      </button>
    </div>

    <!-- Lista -->
    <div class="agente-card">
      <div
        v-for="v in filtrados"
        :key="v.matricula"
        class="agente-row"
        @click="ver(v.matricula)"
      >
        <div>
          <b>{{ v.matricula }}</b>
          <small>{{ v.posto }} · {{ v.ultima }}</small>
        </div>
        <AppBadge
          :variant="badgeVariant(v.score)"
          :label="badgeLabel(v.score)"
        />
      </div>

      <p v-if="!filtrados.length" class="agente-vazio">
        Sem registos neste filtro.
      </p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { estadoDoScore, type VeiculoSimples } from '@/css/design/palette'
import AppBadge from '@/shared/common/AppBadge.vue'

const router = useRouter()

const filtros = ['Todas', 'Crítico', 'Atenção', 'Regular'] as const
const filtroActivo = ref<typeof filtros[number]>('Todas')

const historico: VeiculoSimples[] = [
  { matricula: 'AGL-482-MC', tipo: 'Ligeiro', posto: 'Posto Baixa', score: 22, ultima: '23/09 02:07' },
  { matricula: 'ABR-771-MP', tipo: 'Pesado',  posto: 'Matola',      score: 31, ultima: '22/09 18:07' },
  { matricula: 'AFC-205-MC', tipo: 'Ligeiro', posto: 'KaMpfumo',    score: 36, ultima: '22/09 20:07' },
  { matricula: 'ACD-918-MP', tipo: 'Ligeiro', posto: 'Machava',     score: 41, ultima: '22/09 22:07' },
  { matricula: 'AJK-120-MC', tipo: 'Ligeiro', posto: 'KaMpfumo',    score: 58, ultima: '23/09 00:07' },
  { matricula: 'ADT-873-MP', tipo: 'Pesado',  posto: 'Matola',      score: 63, ultima: '20/09 17:07' },
  { matricula: 'AEF-649-MC', tipo: 'Ligeiro', posto: 'Baixa',       score: 74, ultima: '23/09 02:07' },
  { matricula: 'ALM-507-MC', tipo: 'Ligeiro', posto: 'KaMpfumo',    score: 91, ultima: '22/09 19:07' },
  { matricula: 'AKP-412-MP', tipo: 'Pesado',  posto: 'Namaacha',    score: null, ultima: '19/09 08:07' },
]

const filtrados = computed(() => {
  if (filtroActivo.value === 'Todas') return historico
  return historico.filter((v) => estadoDoScore(v.score).label === filtroActivo.value)
})

function badgeVariant(score: number | null): 'regular' | 'atencao' | 'critico' | 'sem-dados' {
  const estado = estadoDoScore(score)
  if (estado.key === 'critico') return 'critico'
  if (estado.key === 'atencao') return 'atencao'
  if (estado.key === 'regular') return 'regular'
  return 'sem-dados'
}

function badgeLabel(score: number | null): string {
  const estado = estadoDoScore(score)
  if (score === null) return estado.label
  return `${estado.label} ${score}`
}

function ver(matricula: string) {
  sessionStorage.setItem('sicam.matricula-atual', matricula)
  router.push('/agente/resultado')
}
</script>

<style scoped lang="scss">
.agente-historico { padding: 0; }

.agente-h1 {
  font-size: 20px;
  font-weight: 700;
  color: var(--sicam-ink);
  margin: 0;
}

.agente-sub {
  color: var(--sicam-muted);
  font-size: 13px;
  margin: 2px 0 14px;
}

.agente-seg {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  overflow-x: auto;
  padding-bottom: 2px;

  button {
    border: 1px solid var(--sicam-line);
    background: #fff;
    border-radius: 99px;
    padding: 6px 14px;
    cursor: pointer;
    white-space: nowrap;
    font-size: 13px;
    color: var(--sicam-ink);
    font-family: inherit;

    &.is-active {
      background: var(--sicam-primary-bg);
      border-color: #6ee7b7;
      color: var(--sicam-primary);
      font-weight: 700;
    }
  }
}

.agente-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
  padding: 14px;
  margin-bottom: 12px;
}

.agente-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 11px 0;
  border-bottom: 1px solid var(--sicam-line-soft);
  cursor: pointer;

  &:last-child { border-bottom: 0; }

  small {
    display: block;
    color: var(--sicam-muted);
    font-size: 12px;
    font-weight: 400;
  }

  b { color: var(--sicam-ink); font-size: 14px; }
}

.agente-vazio {
  text-align: center;
  color: var(--sicam-muted);
  font-size: 13px;
  padding: 16px 0;
}
</style>