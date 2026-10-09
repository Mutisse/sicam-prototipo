<template>
  <div class="portal-faq">
    <header class="portal-faq__head">
      <h1 class="portal-faq__title">Leis & Perguntas frequentes</h1>
      <p class="portal-faq__sub">
        Respostas rápidas sobre código de estrada, multas e documentação
      </p>
    </header>

    <!-- Categorias -->
    <div class="portal-faq__cats">
      <button
        v-for="c in categorias"
        :key="c.key"
        class="portal-faq__cat"
        :class="{ 'is-active': categoriaActiva === c.key }"
        @click="categoriaActiva = c.key"
      >
        <q-icon :name="c.icon" size="16px" />
        {{ c.label }}
      </button>
    </div>

    <!-- Lista -->
    <div class="portal-faq__list">
      <details
        v-for="(item, i) in filtrados"
        :key="i"
        class="portal-faq-item"
      >
        <summary class="portal-faq-item__q">
          <span>{{ item.pergunta }}</span>
          <q-icon name="expand_more" size="20px" class="portal-faq-item__icon" />
        </summary>
        <div class="portal-faq-item__a">
          {{ item.resposta }}
        </div>
      </details>

      <p v-if="!filtrados.length" class="portal-faq__vazio">
        Sem perguntas nesta categoria.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// ------------------------------------------------------------
// Categorias
// ------------------------------------------------------------
const categorias = [
  { key: 'todas',    label: 'Todas',     icon: 'apps' },
  { key: 'carta',    label: 'Carta',     icon: 'badge' },
  { key: 'veiculo',  label: 'Veículo',   icon: 'directions_car' },
  { key: 'multas',   label: 'Multas',    icon: 'receipt_long' },
  { key: 'seguro',   label: 'Seguro',    icon: 'shield' },
  { key: 'inspecao', label: 'Inspecção', icon: 'build' },
]

const categoriaActiva = ref('todas')

// ------------------------------------------------------------
// Perguntas frequentes
// ------------------------------------------------------------
const faq = [
  {
    cat: 'carta',
    pergunta: 'Como renovar a carta de condução?',
    resposta:
      'Deve dirigir-se a um centro de renovação do INATRO com: carta actual, exame médico recente, 2 fotografias tipo passe e comprovativo de residência. O prazo de renovação é de 30 dias antes da data de validade.',
  },
  {
    cat: 'carta',
    pergunta: 'Qual é a validade da carta de condução?',
    resposta:
      'A carta é válida por 5 anos para condutores até aos 60 anos, e por 2 anos acima dessa idade. A validade está impressa no próprio documento.',
  },
  {
    cat: 'veiculo',
    pergunta: 'Como registar um veículo novo?',
    resposta:
      'O registo deve ser feito no INATRO em até 30 dias após a compra. Precisa de: factura, documento de identidade do proprietário, comprovativo de residência e comprovativo de pagamento do imposto.',
  },
  {
    cat: 'multas',
    pergunta: 'Como pagar uma multa?',
    resposta:
      'Pode pagar no portal do GESTMUL, em qualquer posto de atendimento, ou por transferência bancária. Após pagamento, guarde o comprovativo por pelo menos 1 ano.',
  },
  {
    cat: 'multas',
    pergunta: 'Posso contestar uma multa?',
    resposta:
      'Sim. Tem 15 dias úteis após receber a notificação para contestar. Dirija-se ao posto emissor da multa com o documento da infracção e a sua justificação por escrito.',
  },
  {
    cat: 'seguro',
    pergunta: 'Qual é o valor mínimo do seguro obrigatório?',
    resposta:
      'Os valores variam por tipo de veículo e região. Consulte a tabela actualizada no site do ISSM. A falta de seguro válido é considerada infracção grave.',
  },
  {
    cat: 'inspecao',
    pergunta: 'De quanto em quanto tempo devo fazer inspecção?',
    resposta:
      'Veículos com menos de 4 anos: a cada 2 anos. Entre 4 e 8 anos: anual. Mais de 8 anos: semestral. O resultado é registado no sistema INATRO.',
  },
  {
    cat: 'inspecao',
    pergunta: 'O que preciso para a inspecção?',
    resposta:
      'Documento único do veículo, comprovativo de seguro válido, e o veículo deve estar limpo e em condições de circulação. Alguns postos exigem marcação prévia.',
  },
]

const filtrados = computed(() => {
  if (categoriaActiva.value === 'todas') return faq
  return faq.filter((f) => f.cat === categoriaActiva.value)
})
</script>

<style scoped lang="scss">
.portal-faq {
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

  // ------------------------------------------------------------
  // Categorias
  // ------------------------------------------------------------
  &__cats {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    overflow-x: auto;
    padding-bottom: 4px;

    // esconder scrollbar mas manter funcionalidade
    &::-webkit-scrollbar { height: 4px; }
    &::-webkit-scrollbar-thumb {
      background: var(--sicam-line-strong);
      border-radius: 4px;
    }
  }

  &__cat {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #fff;
    border: 1px solid var(--sicam-line);
    border-radius: 99px;
    padding: 7px 14px;
    font-size: 13px;
    font-weight: 600;
    color: var(--sicam-ink);
    cursor: pointer;
    white-space: nowrap;
    font-family: inherit;
    transition: all var(--sicam-transition-fast);

    &:hover { background: var(--sicam-surface-hover); }

    &.is-active {
      background: var(--sicam-primary);
      color: #fff;
      border-color: var(--sicam-primary);
    }
  }

  // ------------------------------------------------------------
  // Lista
  // ------------------------------------------------------------
  &__list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__vazio {
    text-align: center;
    color: var(--sicam-muted);
    font-size: 14px;
    padding: 40px 0;
  }
}

// ------------------------------------------------------------
// Item FAQ (details/summary)
// ------------------------------------------------------------
.portal-faq-item {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transition: box-shadow var(--sicam-transition-fast);

  &[open] {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }

  &[open] .portal-faq-item__icon {
    transform: rotate(180deg);
  }

  &__q {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 16px 20px;
    font-size: 15px;
    font-weight: 600;
    color: var(--sicam-ink);
    cursor: pointer;
    list-style: none;
    font-family: inherit;

    &::-webkit-details-marker { display: none; }
    &::marker { display: none; }

    &:hover { background: var(--sicam-surface-hover); }
  }

  &__icon {
    color: var(--sicam-muted);
    transition: transform var(--sicam-transition-fast);
    flex-shrink: 0;
  }

  &__a {
    padding: 14px 20px 18px;
    font-size: 14px;
    line-height: 1.6;
    color: var(--sicam-ink-soft);
    border-top: 1px solid var(--sicam-line-soft);
    background: var(--sicam-surface-alt);
  }
}
</style>