<template>
  <div class="sicam-login">
    <div class="sicam-login__wrapper">
      <div class="sicam-login__card">
        <!-- Logo -->
        <div class="sicam-login__logo">
          <svg viewBox="0 0 40 40" width="48" height="48">
            <circle cx="20" cy="20" r="19" fill="#ffffff22" />
            <path
              d="M4 20c6-9 12-12 16-12s10 3 16 12c-6 9-12 12-16 12S10 29 4 20z"
              fill="#facc15"
            />
            <circle cx="20" cy="20" r="7" fill="#065f46" />
            <circle cx="20" cy="20" r="3" fill="#fff" />
          </svg>
        </div>

        <h2 class="sicam-login__title">SICAM — Olho de Águia</h2>

        <form @submit.prevent="entrar">
          <!-- E-mail -->
          <input
            v-model="email"
            type="text"
            placeholder="E-mail"
            class="sicam-login__input"
            autocomplete="username"
          />

          <!-- Palavra-passe com olho -->
          <div class="sicam-login__password-wrapper">
            <input
              v-model="password"
              :type="mostrarPassword ? 'text' : 'password'"
              placeholder="Palavra-passe"
              class="sicam-login__input sicam-login__input--password"
              autocomplete="current-password"
            />
            <button
              type="button"
              class="sicam-login__eye"
              @click="mostrarPassword = !mostrarPassword"
            >
              <q-icon
                :name="mostrarPassword ? 'visibility_off' : 'visibility'"
                size="20px"
              />
            </button>
          </div>

          <label class="sicam-login__remember">
            <input v-model="lembrar" type="checkbox" />
            Lembrar-me
          </label>

          <!-- Botão normal — a barra vermelha aparece no topo da página -->
          <button
            type="submit"
            class="sicam-login__btn"
            :disabled="!podeEntrar"
          >
            ENTRAR
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { LoadingBar } from 'quasar'
import { useAuthStore } from '../../stores/auth'
import { PERFIL_LABEL, type Perfil } from '../../css/design/palette'

const router = useRouter()
const auth = useAuthStore()

const email = ref('admin@sicam.gov.mz')
const password = ref('••••••••')
const lembrar = ref(true)
const mostrarPassword = ref(false)

const podeEntrar = computed(
  () => email.value.length > 0 && password.value.length > 0,
)

async function entrar() {
  if (!podeEntrar.value) return

  // 👇 BARRA VERMELHA NO TOPO
  LoadingBar.start()

  try {
    // Simula o backend (3 segundos para veres a barra)
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const local = email.value.split('@')[0]?.toLowerCase() ?? ''
    const perfisValidos = Object.keys(PERFIL_LABEL) as Perfil[]
    const perfil: Perfil = perfisValidos.find((p) => p === local) ?? 'admin'
    const nome = perfil === 'admin' ? 'Administrador do Sistema' : PERFIL_LABEL[perfil]

    auth.login(perfil, nome, email.value)
    router.push(auth.rotaInicial)
  } finally {
    // 👇 Esconde a barra
    LoadingBar.stop()
  }
}
</script>

<style scoped lang="scss">
// ============================================================
// Tela de Login SICAM
// ============================================================
.sicam-login {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: var(--sicam-surface);
  padding: 24px;

  &__wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__card {
    width: 300px;
    background: var(--sicam-gradient-login);
    color: #fff;
    border-radius: 48px 0 48px 0;
    padding: 32px 26px;
    box-shadow: var(--sicam-shadow-xl);
    text-align: center;
  }

  &__logo {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background: #ffffff22;
    margin: 0 auto 8px;
    display: grid;
    place-items: center;
  }

  &__title {
    font-size: var(--sicam-font-size-lg);
    font-weight: var(--sicam-font-weight-semibold);
    color: #fff;
    margin: 0 0 22px;
  }

  &__input {
    width: 100%;
    background: none;
    border: 0;
    border-bottom: 1px solid #ffffff66;
    color: #fff;
    padding: 9px 4px;
    margin-bottom: 14px;
    font-size: var(--sicam-font-size-md);
    transition: border-color var(--sicam-transition-fast);

    &::placeholder { color: #ffffff88; }
    &:focus { outline: 0; border-color: #fff; }

    &--password {
      margin-bottom: 0;
      padding-right: 32px;
    }
  }

  &__password-wrapper {
    position: relative;
    margin-bottom: 14px;
  }

  &__eye {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: 0;
    color: #ffffffaa;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    border-radius: var(--sicam-radius-sm);
    transition: color var(--sicam-transition-fast);

    &:hover { color: #fff; }
  }

  &__remember {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: var(--sicam-font-size-sm);
    margin: 4px 0 18px;
    text-align: left;
    cursor: pointer;

    input[type='checkbox'] { accent-color: #fff; }
  }

  &__btn {
    width: 100%;
    background: #ffffff14;
    color: #fff;
    border: 0;
    border-radius: var(--sicam-radius-md);
    padding: 12px;
    font-size: var(--sicam-font-size-md);
    font-weight: var(--sicam-font-weight-semibold);
    letter-spacing: 0.14em;
    cursor: pointer;
    transition: background var(--sicam-transition-fast);

    &:hover:not(:disabled) { background: #ffffff2e; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }
}
</style>