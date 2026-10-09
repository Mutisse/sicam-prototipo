import { defineStore } from 'pinia'

// ============================================================
// Store do Chatbot SICAM (mock — respostas simuladas)
// ============================================================

export type TipoMensagem = 'bot' | 'user' | 'erro'

export interface Mensagem {
  tipo: TipoMensagem
  texto: string
  comando?: string
  sugestoes?: string[]
  timestamp: Date
}

interface ChatbotState {
  mensagens: Mensagem[]
  carregando: boolean
}

const MENSAGEM_INICIAL: Mensagem = {
  tipo: 'bot',
  texto:
    '🤖 Olá! Sou o assistente SICAM.\n\n' +
    'Comandos disponíveis:\n' +
    '• CONSULTAR ABC-123-MP\n' +
    '• AUTO XYZ-999-MP\n' +
    '• SCORE REG-001-MP\n' +
    '• HOTLIST\n' +
    '• AJUDA',
  timestamp: new Date(),
}

export const useChatbotStore = defineStore('chatbot', {
  state: (): ChatbotState => ({
    mensagens: [{ ...MENSAGEM_INICIAL }],
    carregando: false,
  }),

  getters: {
    ultimaMensagem: (s) => s.mensagens[s.mensagens.length - 1],
    totalMensagens: (s) => s.mensagens.length,
  },

  actions: {
    async enviar(pergunta: string) {
      const texto = pergunta.trim()
      if (!texto) return

      // Adiciona mensagem do utilizador
      this.mensagens.push({
        tipo: 'user',
        texto,
        timestamp: new Date(),
      })

      this.carregando = true

      // Simula latência
      await new Promise((r) => setTimeout(r, 600))

      // Resposta mock
      const resposta = this.gerarRespostaMock(texto)

      this.mensagens.push({
        tipo: 'bot',
        texto: resposta,
        timestamp: new Date(),
      })

      this.carregando = false
    },

    gerarRespostaMock(pergunta: string): string {
      const p = pergunta.toUpperCase()

      if (p.includes('AJUDA')) {
        return (
          '📖 Comandos disponíveis:\n' +
          '• CONSULTAR <matrícula>\n' +
          '• AUTO <matrícula>\n' +
          '• SCORE <matrícula>\n' +
          '• HOTLIST\n' +
          '• AJUDA'
        )
      }

      if (p.includes('HOTLIST')) {
        return '📋 Hotlist actual: 128 veículos procurados.\nÚltima sincronização: hoje às 06:00.'
      }

      if (p.startsWith('CONSULTAR')) {
        const matricula = p.replace('CONSULTAR', '').trim()
        return `🔍 Consultando ${matricula || '—'}…\n\n(Resposta simulada — backend ainda não ligado)`
      }

      if (p.startsWith('AUTO')) {
        return `📄 Gerando Auto de Notícia para ${p.replace('AUTO', '').trim() || '—'}…\n\n(Resposta simulada)`
      }

      if (p.startsWith('SCORE')) {
        return `📊 Score de ${p.replace('SCORE', '').trim() || '—'}: 74/100 (Regular).\n\n(Resposta simulada)`
      }

      return `🤖 Não entendi "${pergunta}".\n\nEscreve AJUDA para ver os comandos disponíveis.`
    },

    limpar() {
      this.mensagens = [{ ...MENSAGEM_INICIAL, timestamp: new Date() }]
    },
  },
})