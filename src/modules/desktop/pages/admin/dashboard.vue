<template>
  <q-page class="admin-dash">
    <!-- Cabeçalho -->
    <AppPageHeader
      title="Bom dia, Administrador"
      subtitle="Eis o que precisa de atenção neste momento."
    >
      <template #actions>
        <q-btn flat round icon="refresh" @click="carregar" />
      </template>
    </AppPageHeader>

    <!-- Chips informativos -->
    <div class="admin-dash__chips">
      <AppChip>17 dispositivos sem sincronizar</AppChip>
      <AppChip warn>4 agentes offline</AppChip>
    </div>

    <!-- KPIs (5 colunas) -->
    <div class="sicam-grid sicam-grid--g5">
      <AppKpi label="Veículos"   :value="60" subtitle="monitorizados" />
      <AppKpi label="Crítico"    :value="9"  variant="critico" />
      <AppKpi label="Atenção"    :value="8"  variant="atencao" />
      <AppKpi label="Regular"    :value="33" variant="regular" />
      <AppKpi label="Sem dados"  :value="17" variant="sem-dados" />
    </div>

    <!-- Layout 2 colunas -->
    <div class="sicam-two-cols">
      <!-- Coluna principal -->
      <div>
        <!-- Requer intervenção -->
        <AppCard
          title="Requer intervenção"
          subtitle="Veículos com score crítico, do pior para o melhor."
        >
          <template #actions>
            <q-btn outline no-caps label="Ver todos" to="/admin/relatorios" />
          </template>

          <AppRow v-for="v in requerIntervencao" :key="v.matricula">
            <div>
              <b>{{ v.matricula }}</b>
              <small class="admin-dash__row-sub">{{ v.posto }} · {{ v.provincia }}</small>
            </div>
            <div class="admin-dash__row-score">
              <AppScoreBar :value="v.score" variant="critico" />
              <AppBadge variant="critico" :label="'Crítico ' + v.score" />
            </div>
          </AppRow>
        </AppCard>
      </div>

      <!-- Coluna lateral -->
      <div>
        <!-- Ações rápidas -->
        <AppCard title="Ações rápidas">
          <a class="admin-dash__qa" @click="ir('/admin/relatorios')">
            <q-icon name="search" size="18px" />
            Consultar matrícula
          </a>
          <a class="admin-dash__qa" @click="ir('/admin/postos')">
            <q-icon name="flag" size="18px" />
            Planear patrulha
          </a>
          <a class="admin-dash__qa" @click="ir('/admin/relatorios')">
            <q-icon name="description" size="18px" />
            Novo Auto de Notícia
          </a>
          <a class="admin-dash__qa" @click="ir('/admin/relatorios')">
            <q-icon name="place" size="18px" />
            Abrir mapa de calor
          </a>
        </AppCard>

        <!-- Agentes em patrulha -->
        <AppCard
          title="Agentes em patrulha"
          subtitle="Última posição conhecida de cada viatura."
        >
          <AppRow>
            <div class="admin-dash__agente">
              <span class="admin-dash__ic"><q-icon name="directions_car" size="16px" /></span>
              <div>
                <b>MAP-2290</b>
                <small class="admin-dash__row-sub">Agente Chissano · Baixa</small>
              </div>
            </div>
            <AppBadge variant="regular" label="Online" />
          </AppRow>

          <AppRow>
            <div class="admin-dash__agente">
              <span class="admin-dash__ic"><q-icon name="directions_car" size="16px" /></span>
              <div>
                <b>MAP-4413</b>
                <small class="admin-dash__row-sub">Agente Nhaca · EN4 — Namaacha</small>
              </div>
            </div>
            <AppBadge variant="sem-dados" label="Offline" />
          </AppRow>
        </AppCard>

        <!-- Taxa de conformidade -->
        <AppCard title="Taxa de conformidade">
          <div class="admin-dash__big">78,6%</div>
        </AppCard>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppPageHeader from '@/shared/common/AppPageHeader.vue'
import AppCard from '@/shared/common/AppCard.vue'
import AppRow from '@/shared/common/AppRow.vue'
import AppKpi from '@/shared/common/AppKpi.vue'
import AppBadge from '@/shared/common/AppBadge.vue'
import AppChip from '@/shared/common/AppChip.vue'
import AppScoreBar from '@/shared/common/AppScoreBar.vue'

const router = useRouter()

const requerIntervencao = [
  { matricula: 'AGL-482-MC', score: 22, posto: 'Posto Baixa',     provincia: 'Maputo Cidade' },
  { matricula: 'ABR-771-MP', score: 31, posto: 'Posto Matola',    provincia: 'Maputo Província' },
  { matricula: 'AFC-205-MC', score: 36, posto: 'Posto KaMpfumo',  provincia: 'Maputo Cidade' },
  { matricula: 'ACD-918-MP', score: 41, posto: 'Posto Machava',   provincia: 'Maputo Província' },
  { matricula: 'AHN-304-MC', score: 44, posto: 'Posto Baixa',     provincia: 'Maputo Cidade' },
  { matricula: 'ABX-556-MP', score: 48, posto: 'Posto Namaacha',  provincia: 'Maputo Província' },
]

function carregar() {
  // Mock
}

function ir(rota: string) {
  router.push(rota)
}
</script>

<style scoped lang="scss">
.admin-dash {
  padding: 24px 20px 48px;
  max-width: 1180px;
  margin: 0 auto;

  &__chips {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin: -6px 0 16px;
  }

  &__row-sub {
    display: block;
    color: var(--sicam-muted);
    font-size: 12px;
    font-weight: 400;
  }

  &__row-score {
    display: flex;
    align-items: center;
    gap: 10px;

    :deep(.app-score-bar) { width: 80px; }
  }

  &__qa {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    text-align: left;
    border: 1px solid var(--sicam-line);
    background: #fff;
    border-radius: 8px;
    padding: 9px 12px;
    margin-bottom: 8px;
    cursor: pointer;
    color: var(--sicam-ink);
    font-size: 14px;
    transition: background var(--sicam-transition-fast),
                border-color var(--sicam-transition-fast);

    &:hover {
      background: var(--sicam-primary-bg-alt);
      border-color: #a7f3d0;
    }
  }

  &__agente {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  &__ic {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    background: var(--sicam-line);
    display: grid;
    place-items: center;
    color: var(--sicam-muted);
    flex-shrink: 0;
  }

  &__big {
    font-size: 34px;
    font-weight: 700;
    color: var(--sicam-primary-light);
    margin: 4px 0 10px;
  }
}
</style>