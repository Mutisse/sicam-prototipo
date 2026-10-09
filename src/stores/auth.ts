import { defineStore } from "pinia";
import type { Perfil } from "../css/design/palette";
import { ROTA_INICIAL } from "../modules/desktop/config/menus";

// ============================================================
// Store de Autenticação (mock — sem backend por agora)
// ============================================================

interface Utilizador {
  nome: string;
  email: string;
  posto?: string;
}

interface AuthState {
  utilizador: Utilizador | null;
  perfil: Perfil | null;
  autenticado: boolean;
}

const STORAGE_KEY = "sicam.user";

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    utilizador: null,
    perfil: null,
    autenticado: false,
  }),

  getters: {
    // ------------------------------------------------------------
    // Verificações de perfil
    // ------------------------------------------------------------
    isAgente: (s) => s.perfil === "agente",
    isChefe: (s) => s.perfil === "chefe",
    isAdmin: (s) => s.perfil === "admin",
    isInatro: (s) => s.perfil === "inatro",
    isGestmul: (s) => s.perfil === "gestmul",
    isIssm: (s) => s.perfil === "issm",
    isPrm: (s) => s.perfil === "prm",
    isCidadao: (s) => s.perfil === "cidadao",

    // ------------------------------------------------------------
    // Iniciais para o avatar
    // ------------------------------------------------------------
    iniciais: (s) => {
      if (!s.utilizador?.nome) return "?";
      const partes = s.utilizador.nome.trim().split(/\s+/);
      const p = partes[0]?.[0] ?? "";
      const u = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? "") : "";
      return (p + u).toUpperCase();
    },

    // ------------------------------------------------------------
    // Rota inicial por perfil (vem de config/menus.ts)
    // ------------------------------------------------------------
    rotaInicial: (s): string => {
      if (!s.perfil) return "/login";
      return ROTA_INICIAL[s.perfil] ?? "/login";
    },
  },

  actions: {
    // ------------------------------------------------------------
    // Login (mock)
    // ------------------------------------------------------------
    login(perfil: Perfil, nome: string, email?: string) {
      this.perfil = perfil;
      this.utilizador = {
        nome,
        email: email ?? `${perfil}@sicam.gov.mz`,
      };
      this.autenticado = true;
      this.persistir();
    },

    // ------------------------------------------------------------
    // Logout
    // ------------------------------------------------------------
    logout() {
      this.utilizador = null;
      this.perfil = null;
      this.autenticado = false;
      localStorage.removeItem(STORAGE_KEY);
    },

    // ------------------------------------------------------------
    // Restaurar sessão do localStorage
    // ------------------------------------------------------------
    restaurar() {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      try {
        const data = JSON.parse(raw) as AuthState;
        this.utilizador = data.utilizador;
        this.perfil = data.perfil;
        this.autenticado = data.autenticado;
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    },

    // ------------------------------------------------------------
    // Persistir sessão
    // ------------------------------------------------------------
    persistir() {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          utilizador: this.utilizador,
          perfil: this.perfil,
          autenticado: this.autenticado,
        }),
      );
    },
  },
});
