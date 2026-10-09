<template>
  <div class="sicam-404">
    <div class="sicam-404__card">
      <!-- Logo olho de águia -->
      <div class="sicam-404__logo">
        <svg viewBox="0 0 40 40" width="64" height="64">
          <circle cx="20" cy="20" r="19" fill="#ffffff22" />
          <path
            d="M4 20c6-9 12-12 16-12s10 3 16 12c-6 9-12 12-16 12S10 29 4 20z"
            fill="#facc15"
          />
          <circle cx="20" cy="20" r="7" fill="#065f46" />
          <circle cx="20" cy="20" r="3" fill="#fff" />
        </svg>
      </div>

      <h1 class="sicam-404__code">404</h1>
      <h2 class="sicam-404__title">Página não encontrada</h2>
      <p class="sicam-404__text">
        A página que procuras não existe ou foi movida.<br />
        Verifica o endereço ou volta ao início.
      </p>

      <div class="sicam-404__actions">
        <button class="sicam-404__btn sicam-404__btn--primary" @click="irParaLogin">
          <q-icon name="login" size="18px" />
          Voltar ao login
        </button>

        <button class="sicam-404__btn sicam-404__btn--ghost" @click="voltarAtras">
          <q-icon name="arrow_back" size="18px" />
          Voltar atrás
        </button>
      </div>
    </div>

    <p class="sicam-404__footer">
      SICAM — Sistema Integrado de Inteligência Tático-Policial Veicular
    </p>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function irParaLogin() {
  router.push('/login')
}

function voltarAtras() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/login')
  }
}
</script>

<style scoped lang="scss">
// ============================================================
// Página 404 SICAM
// ============================================================
.sicam-404 {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--sicam-bg);
  padding: 24px;

  &__card {
    width: 420px;
    max-width: 100%;
    background: var(--sicam-surface);
    border-radius: var(--sicam-radius-lg);
    box-shadow: var(--sicam-shadow-lg);
    padding: 40px 32px;
    text-align: center;
    border-top: 4px solid var(--sicam-primary);
  }

  &__logo {
    width: 88px;
    height: 88px;
    margin: 0 auto 20px;
    background: var(--sicam-gradient-login);
    border-radius: 50%;
    display: grid;
    place-items: center;
    box-shadow: var(--sicam-shadow-md);
  }

  &__code {
    font-size: 64px;
    font-weight: var(--sicam-font-weight-bold);
    color: var(--sicam-primary);
    margin: 0;
    line-height: 1;
    letter-spacing: -2px;
  }

  &__title {
    font-size: var(--sicam-font-size-xl);
    font-weight: var(--sicam-font-weight-semibold);
    color: var(--sicam-ink);
    margin: 8px 0 12px;
  }

  &__text {
    font-size: var(--sicam-font-size-md);
    color: var(--sicam-muted);
    line-height: var(--sicam-line-height-relaxed);
    margin: 0 0 28px;
  }

  &__actions {
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    border-radius: var(--sicam-radius-md);
    font-size: var(--sicam-font-size-md);
    font-weight: var(--sicam-font-weight-semibold);
    border: 0;
    cursor: pointer;
    transition: background var(--sicam-transition-fast),
                color var(--sicam-transition-fast);

    &--primary {
      background: var(--sicam-primary-light);
      color: #fff;

      &:hover { background: var(--sicam-primary); }
    }

    &--ghost {
      background: #fff;
      color: var(--sicam-ink);
      border: 1px solid var(--sicam-line);

      &:hover { background: var(--sicam-surface-hover); }
    }
  }

  &__footer {
    margin-top: 32px;
    font-size: var(--sicam-font-size-sm);
    color: var(--sicam-muted);
    text-align: center;
  }
}
</style>