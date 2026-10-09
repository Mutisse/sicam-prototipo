<template>
  <q-layout view="hHh Lpr lFf" class="sicam-layout">
    <!-- ============================================================ -->
    <!-- HEADER                                                        -->
    <!-- ============================================================ -->
    <q-header class="sicam-header">
      <q-toolbar>
        <!-- Botão hamburguer (mobile) -->
        <q-btn
          flat
          dense
          round
          icon="menu"
          class="sicam-header__icon-btn"
          @click="drawer = !drawer"
        />

        <!-- Logo -->
        <div class="sicam-header__logo">
          <svg viewBox="0 0 40 40" width="36" height="36">
            <circle cx="20" cy="20" r="19" fill="#ffffff22" />
            <path
              d="M4 20c6-9 12-12 16-12s10 3 16 12c-6 9-12 12-16 12S10 29 4 20z"
              fill="#facc15"
            />
            <circle cx="20" cy="20" r="7" fill="#065f46" />
            <circle cx="20" cy="20" r="3" fill="#fff" />
          </svg>
        </div>

        <!-- Título -->
        <div class="sicam-header__title">
          <b>SICAM</b>
          <small>Fiscalização · Score de regularidade · Auditoria</small>
        </div>

        <q-space />

        <!-- Online/Offline -->
        <button
          class="sicam-header__pill"
          :class="{ 'sicam-header__pill--on': online }"
          @click="online = !online"
        >
          {{ online ? 'Online' : 'Offline' }}
        </button>

        <!-- Idioma -->
        <span class="sicam-header__lang">PT ▾</span>

        <!-- Notificações -->
        <q-btn flat dense round icon="notifications" class="sicam-header__icon-btn" />

        <!-- Avatar + Nome -->
        <div class="sicam-header__avatar">{{ auth.iniciais }}</div>
        <span class="sicam-header__user">{{ auth.utilizador?.nome }}</span>

        <!-- Logout -->
        <q-btn
          flat
          dense
          round
          icon="logout"
          class="sicam-header__icon-btn"
          @click="sair"
        >
          <q-tooltip>Terminar sessão</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- ============================================================ -->
    <!-- DRAWER (menu lateral)                                         -->
    <!-- ============================================================ -->
    <q-drawer
      v-model="drawer"
      show-if-above
      bordered
      :width="260"
      class="sicam-drawer"
    >
      <div class="sicam-drawer__inner">
        <!-- Cabeçalho do drawer -->
        <div class="sicam-drawer__header">
          <p class="sicam-drawer__perfil">{{ perfilLabel }}</p>
        </div>

        <!-- Grupos de menu -->
        <nav class="sicam-drawer__nav">
          <template v-for="(grupo, i) in menuGrupos" :key="i">
            <p class="sicam-drawer__group-title">{{ grupo.titulo }}</p>

            <router-link
              v-for="item in grupo.items"
              :key="item.to"
              :to="item.to"
              class="sicam-drawer__link"
              active-class="sicam-drawer__link--active"
            >
              <q-icon :name="item.icon" size="20px" class="sicam-drawer__icon" />
              <span>{{ item.label }}</span>
            </router-link>
          </template>
        </nav>

        <!-- Logout no fundo -->
        <div class="sicam-drawer__footer">
          
        </div>
      </div>
    </q-drawer>

    <!-- ============================================================ -->
    <!-- CONTEÚDO                                                      -->
    <!-- ============================================================ -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../../stores/auth'
import { menuDoPerfil } from '../config/menus'
import { PERFIL_LABEL } from '../../../css/design/palette'

const drawer = ref(true)
const online = ref(false)
const router = useRouter()
const auth = useAuthStore()

const perfilLabel = computed(() => {
  if (!auth.perfil) return 'SICAM'
  return PERFIL_LABEL[auth.perfil] ?? 'SICAM'
})

const menuGrupos = computed(() => menuDoPerfil(auth.perfil))

function sair() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped lang="scss">
// ============================================================
// Layout SICAM
// ============================================================
.sicam-layout {
  background: var(--sicam-bg);
}

// ------------------------------------------------------------
// Header
// ------------------------------------------------------------
.sicam-header {
  background: var(--sicam-gradient-header);
  color: #fff;
  height: 56px;

  .q-toolbar {
    min-height: 56px;
    gap: 12px;
    padding: 0 20px;
  }

  &__icon-btn {
    color: #fff;

    &:hover { background: #ffffff22; }
  }

  &__logo {
    display: flex;
    align-items: center;
  }

  &__title {
    display: flex;
    flex-direction: column;
    line-height: 1.2;

    b { font-size: 14px; }
    small {
      font-size: 11px;
      opacity: 0.75;

      @media (max-width: 900px) { display: none; }
    }
  }

  &__pill {
    border: 1px solid #ffffff55;
    background: #ffffff1a;
    color: #fff;
    border-radius: 99px;
    padding: 3px 10px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;

    &--on {
      background: #10b981;
      border-color: #10b981;
    }
  }

  &__lang {
    font-size: 13px;
    opacity: 0.85;
  }

  &__avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #ffffff33;
    display: grid;
    place-items: center;
    font-size: 11px;
    font-weight: 700;
  }

  &__user {
    font-size: 13px;

    @media (max-width: 900px) { display: none; }
  }
}

// ------------------------------------------------------------
// Drawer
// ------------------------------------------------------------
.sicam-drawer {
  background: var(--sicam-surface);

  &__inner {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px;
  }

  &__header {
    padding: 8px 12px 16px;
  }

  &__perfil {
    font-size: 11px;
    color: var(--sicam-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0;
  }

  &__nav {
    flex: 1;
    overflow-y: auto;
  }

  &__group-title {
    font-size: 11px;
    color: var(--sicam-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 16px 12px 6px;
    font-weight: 600;
  }

  &__link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    color: var(--sicam-ink);
    text-decoration: none;
    font-weight: 500;
    font-size: 14px;
    margin-bottom: 2px;
    transition: background var(--sicam-transition-fast),
                color var(--sicam-transition-fast);

    &:hover {
      background: var(--sicam-primary-bg-alt);
    }

    &--active {
      background: var(--sicam-primary-bg);
      color: var(--sicam-primary);
      font-weight: 700;
    }
  }

  &__icon {
    color: inherit;
  }

  &__footer {
    border-top: 1px solid var(--sicam-line);
    padding-top: 12px;
  }

  &__logout {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    width: 100%;
    background: none;
    border: 0;
    border-radius: 8px;
    color: var(--sicam-muted);
    font-size: 14px;
    cursor: pointer;
    text-align: left;

    &:hover {
      background: var(--sicam-critical-bg);
      color: var(--sicam-critical-ink);
    }
  }
}

// ------------------------------------------------------------
// Páginas
// ------------------------------------------------------------
:deep(.q-page-container) {
  background: var(--sicam-bg);
}
</style>