<template>
  <q-page class="sicam-dash">
    <!-- Cabeçalho -->
    <AppPageHeader :title="config.titulo" :subtitle="config.subtitulo">
      <template #actions>
        <q-btn flat round icon="refresh" @click="carregar" />
      </template>
    </AppPageHeader>

    <!-- Filtros -->
    <AppFilterBar>
      <template v-for="f in config.filtros" :key="f.key">
        <label v-if="f.tipo === 'date'" class="dash-field">
          <span class="dash-field__label">{{ f.label }}</span>
          <input
            v-model="filtros[f.key]"
            type="date"
            class="dash-field__input"
          />
        </label>

        <label v-else class="dash-field">
          <span class="dash-field__label">{{ f.label }}</span>
          <select
            v-model="filtros[f.key]"
            class="dash-field__input"
            @change="carregar"
          >
            <option v-for="op in f.opcoes" :key="op" :value="op">
              {{ op }}
            </option>
          </select>
        </label>
      </template>

      <q-btn
        outline
        no-caps
        label="Limpar"
        class="dash-limpar"
        @click="limpar"
      />
    </AppFilterBar>

    <!-- KPIs -->
    <div class="sicam-grid sicam-grid--g4">
      <AppKpi
        v-for="k in config.kpis"
        :key="k.key"
        :label="k.label"
        :value="config.valoresKpi[k.key]?.valor ?? 0"
        :subtitle="config.valoresKpi[k.key]?.percentagem ?? ''"
        :variant="k.variant === 'info' ? 'regular' : k.variant"
        :percentage="config.valoresKpi[k.key]?.barra ?? null"
        :selected="kpiSelecionado === k.key"
      />
    </div>

    <!-- Legenda (só para contexto de score) -->
    <p v-if="config.legendaTipo === 'score'" class="dash-legenda">
      <span><i style="background: var(--sicam-success)" />Regular 70–100</span>
      <span><i style="background: var(--sicam-warning)" />Atenção 50–69</span>
      <span><i style="background: var(--sicam-critical)" />Crítico &lt;50</span>
      <span class="dash-legenda__spacer" />
      {{ totalRegistos }} registos
    </p>

    <!-- Cards secundários -->
    <div class="sicam-grid sicam-grid--g2">
      <AppCard v-for="(card, i) in config.cards" :key="i">
        <template #header>
          <h3 class="dash-card-title">{{ card.titulo }}</h3>
        </template>

        <AppRow v-for="(linha, j) in card.linhas" :key="j">
          <span>{{ linha.label }}</span>
          <b
            :class="{
              'text-positive': linha.destaque === 'positive',
              'text-negative': linha.destaque === 'negative',
            }"
          >
            {{ linha.valor }}
          </b>
        </AppRow>
      </AppCard>
    </div>

    <!-- Tabela -->
    <AppCard :title="config.tabelaTitulo" no-padding>
      <table class="dash-table">
        <thead>
          <tr>
            <th v-for="c in config.tabelaColunas" :key="c">{{ c }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in config.linhasTabela" :key="i">
            <td v-for="(cell, j) in row" :key="j">
              <b v-if="j === 0">{{ cell }}</b>
              <template v-else>{{ cell }}</template>
            </td>
          </tr>
        </tbody>
      </table>
    </AppCard>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from "vue";
import AppPageHeader from "@/shared/common/AppPageHeader.vue";
import AppFilterBar from "@/shared/common/AppFilterBar.vue";
import AppKpi from "@/shared/common/AppKpi.vue";
import AppCard from "@/shared/common/AppCard.vue";
import AppRow from "@/shared/common/AppRow.vue";
import { getDashboard } from "@/modules/desktop/config/dashboards";

interface Props {
  perfil: string;
}

const props = defineProps<Props>();

const config = computed(() => getDashboard(props.perfil)!);

const kpiSelecionado = ref<string | null>(null);

const filtros = reactive<Record<string, string>>(
  Object.fromEntries(
    config.value.filtros.map((f) => [f.key, f.opcoes?.[0] ?? ""]),
  ),
);

const totalRegistos = computed(() =>
  Object.values(config.value.valoresKpi).reduce((a, k) => a + k.valor, 0),
);

function carregar() {
  // Mock — será substituído por chamada real
}

function limpar() {
  config.value.filtros.forEach((f) => {
    filtros[f.key] = f.opcoes?.[0] ?? "";
  });
  carregar();
}
</script>

<style scoped lang="scss">
.sicam-dash {
  padding: 24px 20px 48px;
  max-width: 1180px;
  margin: 0 auto;
}

.dash-field {
  flex: 1;
  min-width: 130px;

  &__label {
    display: block;
    font-size: 11px;
    color: var(--sicam-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 6px;
  }

  &__input {
    display: block;
    width: 100%;
    padding: 8px 10px;
    border: 0;
    border-bottom: 1px solid var(--sicam-line-strong);
    background: var(--sicam-surface-alt);
    border-radius: 6px 6px 0 0;
    color: var(--sicam-ink);
    font-size: 14px;

    &:focus {
      outline: 0;
      border-bottom-color: var(--sicam-primary-light);
    }
  }
}

.dash-limpar {
  flex: 0 0 200px;
}

.dash-legenda {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--sicam-muted);
  align-items: center;
  flex-wrap: wrap;
  margin: -4px 0 16px;

  i {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 5px;
  }

  &__spacer {
    flex: 1;
  }
}

.dash-card-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
}

.dash-table {
  width: 100%;
  border-collapse: collapse;

  th {
    text-align: left;
    font-size: 11px;
    color: var(--sicam-muted);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 10px 12px;
    background: #fafbfa;
    border-bottom: 1px solid var(--sicam-line);
  }

  td {
    padding: 12px;
    border-bottom: 1px solid var(--sicam-line-soft);
    font-size: 14px;
  }
}
</style>
