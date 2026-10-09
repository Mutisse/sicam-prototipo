<template>
  <div class="portal-assistente">
    <header class="portal-assistente__head">
      <h1 class="portal-assistente__title">Assistente IA</h1>
      <p class="portal-assistente__sub">
        Faça perguntas sobre carta, veículo, multas, seguro ou inspecção
      </p>
    </header>

    <!-- Chat -->
    <div class="portal-chat">
      <div class="portal-chat__messages" ref="messagesEl">
        <div
          v-for="(msg, i) in mensagens"
          :key="i"
          class="portal-chat__row"
          :class="`portal-chat__row--${msg.tipo}`"
        >
          <div
            class="portal-chat__bubble"
            :class="`portal-chat__bubble--${msg.tipo}`"
          >
            {{ msg.texto }}
          </div>
        </div>

        <div v-if="carregando" class="portal-chat__row portal-chat__row--bot">
          <div class="portal-chat__bubble portal-chat__bubble--bot portal-chat__bubble--typing">
            <span /><span /><span />
          </div>
        </div>
      </div>

      <!-- Sugestões -->
      <div v-if="mensagens.length <= 1" class="portal-chat__sug">
        <button
          v-for="s in sugestoes"
          :key="s"
          class="portal-chat__sug-item"
          @click="enviar(s)"
        >
          {{ s }}
        </button>
      </div>

      <!-- Input -->
      <form class="portal-chat__input" @submit.prevent="enviar()">
        <input
          v-model="pergunta"
          type="text"
          placeholder="Escreva a sua pergunta…"
          class="portal-chat__input-field"
        />
        <button
          type="submit"
          class="portal-chat__send"
          :disabled="!pergunta || carregando"
        >
          <q-icon name="send" size="20px" />
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

interface Mensagem {
  tipo: 'bot' | 'user'
  texto: string
}

const pergunta = ref('')
const carregando = ref(false)
const messagesEl = ref<HTMLElement | null>(null)

const mensagens = ref<Mensagem[]>([
  {
    tipo: 'bot',
    texto: 'Olá! Sou o assistente do SICAM. Em que posso ajudar? Pode perguntar sobre carta de condução, veículos, multas, seguro ou inspecção.',
  },
])

const sugestoes = [
  'Como renovar a carta?',
  'Como pagar uma multa?',
  'Qual a validade do seguro?',
  'Quando é a próxima inspecção?',
]

async function enviar(texto?: string) {
  const t = (texto ?? pergunta.value).trim()
  if (!t || carregando.value) return

  mensagens.value.push({ tipo: 'user', texto: t })
  pergunta.value = ''
  carregando.value = true
  scrollFim()

  await new Promise((r) => setTimeout(r, 800))

  mensagens.value.push({
    tipo: 'bot',
    texto: respostaMock(t),
  })
  carregando.value = false
  scrollFim()
}

function respostaMock(t: string): string {
  const q = t.toLowerCase()

  if (q.includes('carta')) {
    return 'Para renovar a carta de condução deve dirigir-se a um centro do INATRO com: carta actual, exame médico, 2 fotografias e comprovativo de residência. O prazo é 30 dias antes da validade.'
  }

  if (q.includes('multa')) {
    return 'Pode pagar multas no portal do GESTMUL, em postos de atendimento ou por transferência bancária. Tem 15 dias para contestar. Guarde sempre o comprovativo.'
  }

  if (q.includes('seguro')) {
    return 'O seguro obrigatório deve estar sempre válido. Sem seguro é considerada infracção grave. Verifique a data de validade na sua apólice.'
  }

  if (q.includes('inspec') || q.includes('inspeç')) {
    return 'A inspecção é: a cada 2 anos (até 4 anos), anual (4 a 8 anos) e semestral (mais de 8 anos). Leve documento do veículo, seguro válido e o veículo limpo.'
  }

  return 'Não tenho ainda informação específica sobre isso. Experimente perguntar sobre carta, multas, seguro ou inspecção. Para questões mais detalhadas, contacte o posto mais próximo.'
}

function scrollFim() {
  nextTick(() => {
    messagesEl.value?.scrollTo({
      top: messagesEl.value.scrollHeight,
      behavior: 'smooth',
    })
  })
}
</script>

<style scoped lang="scss">
.portal-assistente {
  max-width: 700px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 200px);
  min-height: 500px;

  &__head {
    margin-bottom: 16px;
    flex-shrink: 0;
  }

  &__title {
    font-size: 22px;
    font-weight: 700;
    color: var(--sicam-ink);
    margin: 0 0 4px;
  }

  &__sub {
    font-size: 13px;
    color: var(--sicam-muted);
    margin: 0;
  }
}

.portal-chat {
  flex: 1;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__row {
    display: flex;

    &--bot  { justify-content: flex-start; }
    &--user { justify-content: flex-end; }
  }

  &__bubble {
    max-width: 80%;
    padding: 12px 16px;
    border-radius: 16px;
    font-size: 14px;
    line-height: 1.5;
    white-space: pre-line;

    &--bot {
      background: var(--sicam-line-soft);
      color: var(--sicam-ink);
      border-bottom-left-radius: 4px;
    }

    &--user {
      background: var(--sicam-primary);
      color: #fff;
      border-bottom-right-radius: 4px;
    }

    &--typing {
      display: flex;
      gap: 4px;
      align-items: center;
      padding: 14px 16px;

      span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--sicam-muted);
        animation: bounce 1.2s infinite;

        &:nth-child(2) { animation-delay: 0.15s; }
        &:nth-child(3) { animation-delay: 0.3s; }
      }
    }
  }

  // Sugestões
  &__sug {
    padding: 0 20px 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    border-top: 1px solid var(--sicam-line-soft);
    padding-top: 12px;
  }

  &__sug-item {
    background: var(--sicam-primary-bg-alt);
    border: 1px solid var(--sicam-line);
    border-radius: 99px;
    padding: 6px 12px;
    font-size: 12px;
    color: var(--sicam-primary);
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: background var(--sicam-transition-fast);

    &:hover { background: var(--sicam-primary-bg); }
  }

  // Input
  &__input {
    display: flex;
    gap: 8px;
    padding: 14px 16px;
    border-top: 1px solid var(--sicam-line);
    background: #fff;
  }

  &__input-field {
    flex: 1;
    border: 1px solid var(--sicam-line);
    border-radius: 99px;
    padding: 10px 18px;
    font-size: 14px;
    font-family: inherit;
    color: var(--sicam-ink);

    &:focus {
      outline: 0;
      border-color: var(--sicam-primary-light);
    }
  }

  &__send {
    background: var(--sicam-primary);
    color: #fff;
    border: 0;
    border-radius: 50%;
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: background var(--sicam-transition-fast);

    &:hover:not(:disabled) { background: var(--sicam-primary-dark); }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
  }
}

@keyframes bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30%           { transform: translateY(-4px); }
}
</style>