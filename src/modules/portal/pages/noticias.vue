<template>
  <div class="portal-noticias">
    <header class="portal-noticias__head">
      <h1 class="portal-noticias__title">Notícias</h1>
      <p class="portal-noticias__sub">
        Campanhas, avisos e actualizações do sector de trânsito
      </p>
    </header>

    <ul class="portal-noticias__list">
      <li
        v-for="n in noticias"
        :key="n.id"
        class="portal-noticia"
      >
        <div class="portal-noticia__meta">
          <span class="portal-noticia__tag" :class="`portal-noticia__tag--${n.categoria}`">
            {{ n.categoriaLabel }}
          </span>
          <span class="portal-noticia__date">{{ n.data }}</span>
        </div>
        <h2 class="portal-noticia__title">{{ n.titulo }}</h2>
        <p class="portal-noticia__resumo">{{ n.resumo }}</p>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const noticias = [
  {
    id: 1,
    data: '23 Set 2026',
    categoria: 'inspeccao',
    categoriaLabel: 'Inspecção',
    titulo: 'Nova campanha de inspecção em Maputo',
    resumo: 'Postos móveis vão estar em 5 locais da cidade durante Outubro. Consulte o calendário e evite filas.',
  },
  {
    id: 2,
    data: '20 Set 2026',
    categoria: 'seguro',
    categoriaLabel: 'Seguro',
    titulo: 'Seguro obrigatório: prazos 2026',
    resumo: 'Novos valores e datas de renovação já disponíveis. Confirme se o seu seguro está válido.',
  },
  {
    id: 3,
    data: '15 Set 2026',
    categoria: 'multas',
    categoriaLabel: 'Multas',
    titulo: 'Multas: como pagar online',
    resumo: 'Passo-a-passo para liquidar multas pela plataforma SICAM sem sair de casa.',
  },
  {
    id: 4,
    data: '10 Set 2026',
    categoria: 'avisos',
    categoriaLabel: 'Avisos',
    titulo: 'Alterações no código de estrada',
    resumo: 'Novas regras para transporte de crianças entraram em vigor este mês.',
  },
]
</script>

<style scoped lang="scss">
.portal-noticias {
  max-width: 800px;
  margin: 0 auto;

  &__head {
    margin-bottom: 24px;
  }

  &__title {
    font-size: 24px;
    font-weight: 700;
    color: var(--sicam-ink);
    margin: 0 0 6px;
  }

  &__sub {
    font-size: 14px;
    color: var(--sicam-muted);
    margin: 0;
  }

  &__list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}

.portal-noticia {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  transition: transform var(--sicam-transition-fast),
              box-shadow var(--sicam-transition-fast);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }

  &__tag {
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 99px;
    text-transform: uppercase;
    letter-spacing: 0.04em;

    &--inspeccao { background: #dbeafe; color: #1e40af; }
    &--seguro    { background: #dcfce7; color: #15803d; }
    &--multas    { background: #fef3c7; color: #a16207; }
    &--avisos    { background: #f3e8ff; color: #7c3aed; }
  }

  &__date {
    font-size: 12px;
    color: var(--sicam-muted);
  }

  &__title {
    font-size: 17px;
    font-weight: 700;
    color: var(--sicam-ink);
    margin: 0 0 8px;
    line-height: 1.3;
  }

  &__resumo {
    font-size: 14px;
    color: var(--sicam-ink-soft);
    line-height: 1.5;
    margin: 0;
  }
}
</style>