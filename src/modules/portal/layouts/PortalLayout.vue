<template>
  <div class="portal-shell">
    <!-- ============================================================ -->
    <!-- HEADER                                                        -->
    <!-- ============================================================ -->
    <header class="portal-header">
      <div class="portal-header__inner">
        <!-- Logo + nome -->
        <router-link to="/cidadao/portal" class="portal-header__brand">
          <div class="portal-header__logo">
            <svg viewBox="0 0 40 40" width="32" height="32">
              <circle cx="20" cy="20" r="19" fill="#ffffff33" />
              <path
                d="M4 20c6-9 12-12 16-12s10 3 16 12c-6 9-12 12-16 12S10 29 4 20z"
                fill="#facc15"
              />
              <circle cx="20" cy="20" r="7" fill="#065f46" />
              <circle cx="20" cy="20" r="3" fill="#fff" />
            </svg>
          </div>
          <div class="portal-header__text">
            <b>SICAM</b>
            <small>Portal do Cidadão</small>
          </div>
        </router-link>

        <!-- Menu (desktop) -->
        <nav class="portal-header__nav portal-header__nav--desktop">
          <router-link
            v-for="t in tabs"
            :key="t.to"
            :to="t.to"
            class="portal-header__link"
            active-class="portal-header__link--active"
          >
            {{ t.label }}
          </router-link>
        </nav>

        <!-- Botão menu (mobile) -->
        <button class="portal-header__menu-btn" @click="menuAberto = !menuAberto">
          <q-icon :name="menuAberto ? 'close' : 'menu'" size="24px" />
        </button>
      </div>

      <!-- Menu (mobile — dropdown) -->
      <transition name="fade">
        <nav v-if="menuAberto" class="portal-header__nav portal-header__nav--mobile">
          <router-link
            v-for="t in tabs"
            :key="t.to"
            :to="t.to"
            class="portal-header__link"
            active-class="portal-header__link--active"
            @click="menuAberto = false"
          >
            <q-icon :name="t.icon" size="18px" class="q-mr-sm" />
            {{ t.label }}
          </router-link>
        </nav>
      </transition>
    </header>

    <!-- ============================================================ -->
    <!-- CONTEÚDO                                                      -->
    <!-- ============================================================ -->
    <main class="portal-main">
      <router-view />
    </main>

    <!-- ============================================================ -->
    <!-- FOOTER                                                        -->
    <!-- ============================================================ -->
    <footer class="portal-footer">
      <div class="portal-footer__inner">
        <p>© 2026 SICAM — Sistema Integrado de Inteligência Tático-Policial Veicular</p>
        <p class="portal-footer__sub">
          Portal público de consulta · Sem autenticação necessária
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TABS_PORTAL } from '../config/tabsPortal'

const tabs = TABS_PORTAL
const menuAberto = ref(false)
</script>

<style scoped lang="scss">
// ============================================================
// Shell
// ============================================================
.portal-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--sicam-bg);
  font-family: var(--sicam-font-family);
}

// ============================================================
// Header
// ============================================================
.portal-header {
  background: linear-gradient(90deg, #064e3b, #065f46);
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 20;

  &__inner {
    max-width: 1180px;
    margin: 0 auto;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    gap: 20px;
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: inherit;
  }

  &__logo {
    display: flex;
    align-items: center;
  }

  &__text {
    display: flex;
    flex-direction: column;
    line-height: 1.1;

    b { font-size: 15px; }
    small { font-size: 11px; opacity: 0.75; }
  }

  // ------------------------------------------------------------
  // Navegação
  // ------------------------------------------------------------
  &__nav {
    display: flex;
    gap: 4px;
    margin-left: auto;
  }

  &__link {
    padding: 8px 14px;
    border-radius: 8px;
    color: #ffffffdd;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: background var(--sicam-transition-fast);

    &:hover { background: #ffffff22; }

    &--active {
      background: #10b981;
      color: #fff;
      font-weight: 700;
    }
  }

  // Mobile
  &__menu-btn {
    display: none;
    margin-left: auto;
    background: none;
    border: 0;
    color: inherit;
    cursor: pointer;
    padding: 6px;
    border-radius: 8px;

    &:hover { background: #ffffff22; }
  }

  &__nav--mobile {
    display: none;
    flex-direction: column;
    padding: 0 20px 12px;
    gap: 2px;

    .portal-header__link {
      display: flex;
      align-items: center;
    }
  }

  @media (max-width: 700px) {
    &__nav--desktop { display: none; }
    &__menu-btn     { display: flex; }
    &__nav--mobile  { display: flex; }
  }
}

// ============================================================
// Main
// ============================================================
.portal-main {
  flex: 1;
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 24px 20px 48px;
}

// ============================================================
// Footer
// ============================================================
.portal-footer {
  background: #1f2937;
  color: #9ca3af;
  padding: 24px 20px;

  &__inner {
    max-width: 1180px;
    margin: 0 auto;
    text-align: center;

    p { margin: 0; font-size: 13px; }
  }

  &__sub {
    margin-top: 4px !important;
    font-size: 11px !important;
    opacity: 0.7;
  }
}

// ============================================================
// Transições
// ============================================================
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>