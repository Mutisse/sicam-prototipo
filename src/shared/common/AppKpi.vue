<template>
  <div class="app-kpi" :class="[`app-kpi--${variant}`, { 'app-kpi--selected': selected }]">
    <small class="app-kpi__label">
      {{ label }}
      <span v-if="variant !== 'sem-dados'" class="app-kpi__dot" />
    </small>
    <div class="app-kpi__value">{{ value }}</div>
    <AppScoreBar v-if="percentage != null" :value="percentage" :variant="variant" />
    <div v-if="subtitle" class="app-kpi__subtitle">{{ subtitle }}</div>
  </div>
</template>

<script setup lang="ts">
import AppScoreBar from './AppScoreBar.vue'
import type { ScoreVariant } from './AppScoreBar.vue'

interface Props {
  label: string
  value: string | number
  subtitle?: string
  variant?: ScoreVariant          // ← sem o '| ""'
  percentage?: number | null
  selected?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'sem-dados',            // ← default continua
  subtitle: '',
  percentage: null,
  selected: false,
})
</script>

<style scoped lang="scss">
@use '../../css/design/mixins' as *;

.app-kpi {
  @include card;
  padding: 16px 18px;
  border: 1px solid transparent;
  transition: border-color var(--sicam-transition-fast);

  &--selected {
    border-color: #5eb59a;
  }

  &__label {
    font-size: var(--sicam-font-size-xs);
    color: var(--sicam-muted);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: currentColor;
  }

  &__value {
    font-size: var(--sicam-font-size-2xl);
    font-weight: var(--sicam-font-weight-bold);
    margin: 4px 0 2px;
    color: var(--sicam-ink);
  }

  &__subtitle {
    font-size: var(--sicam-font-size-sm);
    color: var(--sicam-muted);
    margin-top: 4px;
  }

  // Variantes (cor do valor + dot)
  &--regular   { .app-kpi__value, .app-kpi__dot { color: var(--sicam-success); } }
  &--atencao   { .app-kpi__value, .app-kpi__dot { color: var(--sicam-warning); } }
  &--critico   { .app-kpi__value, .app-kpi__dot { color: var(--sicam-critical); } }
  &--sem-dados { .app-kpi__value, .app-kpi__dot { color: var(--sicam-neutral); } }
}
</style>