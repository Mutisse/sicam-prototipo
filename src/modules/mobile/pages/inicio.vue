<template>
  <div class="agente-inicio">
    <!-- Título -->
    <h1 class="agente-h1">Bom dia, Chissano</h1>
    <p class="agente-sub">Patrulha Baixa manhã · MAP-2290</p>

    <!-- Chips -->
    <div class="agente-chips">
      <AppChip>Hotlist sincronizada às 06:00</AppChip>
      <AppChip v-if="!online" warn>Modo offline</AppChip>
    </div>

    <!-- KPIs (3 colunas) -->
    <div class="agente-grid3">
      <div class="agente-kpi">
        <small>Consultas</small>
        <div class="agente-kpi__value">18</div>
      </div>
      <div class="agente-kpi agente-kpi--critico">
        <small>Críticos</small>
        <div class="agente-kpi__value">3</div>
      </div>
      <div class="agente-kpi agente-kpi--regular">
        <small>Autos</small>
        <div class="agente-kpi__value">2</div>
      </div>
    </div>

    <!-- Botão principal -->
    <router-link to="/agente/consulta" class="agente-btn">
      Consultar matrícula
    </router-link>

    <!-- Requer atenção -->
    <div class="agente-card">
      <h3>Requer atenção</h3>
      <div
        v-for="v in requerAtencao"
        :key="v.matricula"
        class="agente-row"
        @click="ver(v.matricula)"
      >
        <div>
          <b>{{ v.matricula }}</b>
          <small>{{ v.posto }} · {{ v.ultima }}</small>
        </div>
        <AppBadge
          :variant="
            estadoDoScore(v.score).key === 'critico'
              ? 'critico'
              : estadoDoScore(v.score).key === 'atencao'
                ? 'atencao'
                : 'regular'
          "
          :label="estadoDoScore(v.score).label + ' ' + v.score"
        />
      </div>
    </div>

    <!-- Patrulha em curso -->
    <div class="agente-card">
      <h3>Patrulha em curso</h3>
      <div class="agente-row agente-row--sem-border">
        <span>Veículos abordados</span>
        <b>9/10</b>
      </div>
      <AppScoreBar :value="90" variant="regular" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { estadoDoScore } from "@/css/design/palette";
import AppChip from "@/shared/common/AppChip.vue";
import AppBadge from "@/shared/common/AppBadge.vue";
import AppScoreBar from "@/shared/common/AppScoreBar.vue";

const router = useRouter();

// Estado online/offline (por agora fixo — virá da store)
const online = computed(() => false);

// Dados fictícios (virão da store mais tarde)
interface Veiculo {
  matricula: string;
  posto: string;
  ultima: string;
  score: number;
}

const veiculos: Veiculo[] = [
  { matricula: "AGL-482-MC", posto: "Posto Baixa", score: 22, ultima: "23/09 02:07" },
  { matricula: "ABR-771-MP", posto: "Matola",      score: 31, ultima: "22/09 18:07" },
  { matricula: "AFC-205-MC", posto: "KaMpfumo",    score: 36, ultima: "22/09 20:07" },
  { matricula: "ACD-918-MP", posto: "Machava",     score: 41, ultima: "22/09 22:07" },
];

const requerAtencao = computed(() => veiculos.filter((v) => v.score < 50));

function ver(matricula: string) {
  router.push("/agente/resultado");
}
</script>

<style scoped lang="scss">
// ============================================================
// Agente — Início
// ============================================================
.agente-inicio { padding: 0; }

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

.agente-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

// ------------------------------------------------------------
// Grelha KPIs
// ------------------------------------------------------------
.agente-grid3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}

.agente-kpi {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
  padding: 12px;

  small {
    display: block;
    font-size: 10px;
    color: var(--sicam-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  &__value {
    font-size: 24px;
    font-weight: 700;
    color: var(--sicam-ink);
    margin-top: 2px;
  }

  &--critico .agente-kpi__value { color: var(--sicam-critical); }
  &--regular .agente-kpi__value { color: var(--sicam-success); }
  &--atencao .agente-kpi__value { color: var(--sicam-warning); }
}

// ------------------------------------------------------------
// Botões grandes
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// Cards
// ------------------------------------------------------------
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
  }
}

// ------------------------------------------------------------
// Linhas
// ------------------------------------------------------------
.agente-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 11px 0;
  border-bottom: 1px solid var(--sicam-line-soft);
  cursor: pointer;

  &:last-child { border-bottom: 0; }
  &--sem-border { cursor: default; }

  small {
    display: block;
    color: var(--sicam-muted);
    font-size: 12px;
    font-weight: 400;
  }

  b {
    color: var(--sicam-ink);
    font-size: 14px;
  }
}
</style>