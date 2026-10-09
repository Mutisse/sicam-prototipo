import { defineStore } from "pinia";
import type { Veiculo } from "../../css/design/palette";
import { VEICULOS_FICTICIOS, delay } from "../services/mockData";

// ============================================================
// Store de Consulta de Veículos (mock)
// ============================================================

interface VeiculoState {
  matriculaAtual: string | null;
  veiculo: Veiculo | null;
  carregando: boolean;
  erro: string | null;
  historico: string[];
}

const HISTORICO_KEY = "sicam.historico";

export const useVeiculoStore = defineStore("veiculo", {
  state: (): VeiculoState => ({
    matriculaAtual: null,
    veiculo: null,
    carregando: false,
    erro: null,
    historico: [],
  }),

  getters: {
    temResultado: (s) => s.veiculo !== null,
    temErro: (s) => s.erro !== null,
    listaVeiculos: () => VEICULOS_FICTICIOS,
  },

  actions: {
    async consultar(matricula: string) {
      const m = matricula.trim().toUpperCase();
      if (!m) return;

      this.carregando = true;
      this.erro = null;
      this.matriculaAtual = m;
      this.veiculo = null;

      // Simula latência
      await delay(null, 800);

      const encontrado = VEICULOS_FICTICIOS.find((v) => v.matricula === m);

      if (encontrado) {
        this.veiculo = encontrado;
        this.adicionarAoHistorico(m);
      } else {
        this.erro = "Matrícula não encontrada no sistema.";
      }

      this.carregando = false;
    },

    limpar() {
      this.matriculaAtual = null;
      this.veiculo = null;
      this.erro = null;
    },

    adicionarAoHistorico(matricula: string) {
      this.historico = [
        matricula,
        ...this.historico.filter((m) => m !== matricula),
      ].slice(0, 10);
      localStorage.setItem(HISTORICO_KEY, JSON.stringify(this.historico));
    },

    carregarHistorico() {
      const raw = localStorage.getItem(HISTORICO_KEY);
      if (!raw) return;
      try {
        this.historico = JSON.parse(raw) as string[];
      } catch {
        this.historico = [];
      }
    },
  },
});
