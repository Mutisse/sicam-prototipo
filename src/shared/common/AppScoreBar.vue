<template>
  <span class="app-score-bar">
    <i :class="`app-score-bar__fill--${variant}`" :style="{ width: `${value}%` }" />
  </span>
</template>

<script setup lang="ts">
export type ScoreVariant = 'regular' | 'atencao' | 'critico' | 'sem-dados'

interface Props {
  value: number
  variant?: ScoreVariant
}

withDefaults(defineProps<Props>(), {
  variant: 'regular',
})
</script>

<style scoped lang="scss">
@use '../../css/design/mixins' as *;

.app-score-bar {
  @include bar;

  &__fill {
    &--regular   { background: var(--sicam-success); }
    &--atencao   { background: var(--sicam-warning); }
    &--critico   { background: var(--sicam-critical); }
    &--sem-dados { background: var(--sicam-neutral); }
  }
}
</style>