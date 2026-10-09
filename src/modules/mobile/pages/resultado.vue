<template>
  <div class="agente-resultado">
    <!-- Sem dados -->
    <template v-if="veiculo.score === null">
      <div class="agente-card">
        <h3>
          {{ veiculo.matricula }}
          <AppBadge variant="sem-dados" label="Sem dados" />
        </h3>
        <p class="agente-sub">
          Sem leituras há mais de 24 h. Consulta parcial: volte a verificar quando houver rede.
        </p>
      </div>
      <router-link to="/agente/consulta" class="agente-btn agente-btn--outline">
        Nova consulta
      </router-link>
    </template>

    <!-- Com dados -->
    <template v-else>
      <!-- Score -->
      <div class="agente-card agente-card--center">
        <div class="agente-placa">{{ veiculo.matricula }}</div>
        <small class="agente-sub">
          {{ veiculo.tipo }} · {{ online ? 'consulta completa' : 'consulta parcial (offline)' }}
        </small>

        <div class="agente-big" :style="{ color: corScore }">
          {{ veiculo.score }}
        </div>

        <AppScoreBar :value="veiculo.score!" :variant="variante" />

        <p class="agente-resultado__estado">
          <AppBadge :variant="variante" :label="estado.label" />
          <b class="q-ml-sm">{{ intervencao }}</b>
        </p>
      </div>

      <!-- Entidades -->
      <div class="agente-card">
        <div
          v-for="ent in entidades"
          :key="ent.nome"
          class="agente-row"
        >
          <div>
            <b>{{ ent.nome }}</b>
            <small>{{ ent.descricao }}</small>
          </div>
          <AppBadge
            :variant="ent.ok ? 'regular' : 'critico'"
            :label="ent.ok ? ent.okTexto : ent.erroTexto"
          />
        </div>
      </div>

      <p class="agente-sub">
        Dados do proprietário: apenas Chefe de Posto. Consulta registada em auditoria.
      </p>

      <router-link to="/agente/autos" class="agente-btn">
        Gerar Auto de Notícia
      </router-link>
      <router-link to="/agente/consulta" class="agente-btn agente-btn--outline">
        Nova consulta
      </router-link>
    </template>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { estadoDoScore, nivelDoScore, palette, type VeiculoSimples } from '@/css/design/palette'
import AppBadge from '@/shared/common/AppBadge.vue'
import AppScoreBar from '@/shared/common/AppScoreBar.vue'

const online = ref(false)

const veiculo = ref<VeiculoSimples>({
  matricula: 'AGL-482-MC',
  tipo: 'Ligeiro',
  posto: 'Posto Baixa',
  score: 22,
  ultima: '23/09 02:07',
})

onMounted(() => {
  const matricula = sessionStorage.getItem('sicam.matricula-atual')
  if (matricula) {
    veiculo.value.matricula = matricula
  }
})

const estado = computed(() => estadoDoScore(veiculo.value.score))
const intervencao = computed(() => nivelDoScore(veiculo.value.score))

const variante = computed<'regular' | 'atencao' | 'critico' | 'sem-dados'>(() => {
  const key = estado.value.key
  if (key === 'critico' || key === 'atencao' || key === 'regular') return key
  return 'sem-dados'
})

const corScore = computed(() => {
  const key = estado.value.key
  if (key === 'critico') return palette.critical
  if (key === 'atencao') return palette.warning
  if (key === 'regular') return palette.success
  return palette.neutral
})

const entidades = computed(() => {
  const s = veiculo.value.score ?? 0
  return [
    { nome: 'INATRO',            descricao: 'Inspeção técnica',    ok: s >= 40, okTexto: 'Válida',     erroTexto: 'Expirada' },
    { nome: 'Gestão de Multas',  descricao: 'Multas',              ok: s >= 60, okTexto: 'Sem pendentes', erroTexto: 'Por pagar' },
    { nome: 'ISSM / Seguradora', descricao: 'Seguro obrigatório',  ok: s >= 50, okTexto: 'Válido',     erroTexto: 'Expirado' },
    { nome: 'PRM',               descricao: 'Hotlist',             ok: s >= 25, okTexto: 'Não consta', erroTexto: 'Consta' },
  ]
})
</script>

<style scoped lang="scss">
.agente-resultado { padding: 0; }

.agente-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
  padding: 14px;
  margin-bottom: 12px;

  h3 {
    font-size: 14px;
    font-weight: 600;
    color: var(--sicam-ink);
    margin: 0 0 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &--center { text-align: center; }
}

.agente-placa {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--sicam-ink);
}

.agente-sub {
  color: var(--sicam-muted);
  font-size: 13px;
  margin: 4px 0 0;
  display: block;
}

.agente-big {
  font-size: 44px;
  font-weight: 700;
  line-height: 1;
  margin: 14px 0 6px;
}

.agente-resultado__estado {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.agente-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 11px 0;
  border-bottom: 1px solid var(--sicam-line-soft);

  &:last-child { border-bottom: 0; }

  small {
    display: block;
    color: var(--sicam-muted);
    font-size: 12px;
    font-weight: 400;
  }

  b { color: var(--sicam-ink); font-size: 14px; }
}

.agente-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  background: var(--sicam-primary-light);
  color: #fff;
  border: 0;
  border-radius: 10px;
  padding: 13px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 10px;
  text-decoration: none;
  text-align: center;

  &:active { background: var(--sicam-primary); }

  &--outline {
    background: #fff;
    color: var(--sicam-ink);
    border: 1px solid var(--sicam-line);
  }
}
</style>