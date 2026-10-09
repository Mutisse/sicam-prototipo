<template>
  <div class="agente-perfil">
    <!-- Cartão do agente -->
    <div class="agente-card agente-card--center">
      <div class="agente-avatar">C</div>
      <h3 class="agente-nome">Agente Chissano</h3>
      <small class="agente-sub">Agente de Trânsito · Posto Baixa</small>
    </div>

    <!-- Hotlist -->
    <div class="agente-card">
      <div class="agente-row">
        <div>
          <b>Hotlist</b>
          <small>Última sincronização 06:00 · cifrada</small>
        </div>
        <AppBadge variant="regular" label="Atualizada" />
      </div>
      <button class="agente-btn agente-btn--outline q-mt-sm" @click="sincronizar">
        <q-icon name="refresh" size="18px" class="q-mr-xs" />
        Sincronizar agora
      </button>
    </div>

    <!-- Dispositivos -->
    <div class="agente-card">
      <div class="agente-row">
        <div>
          <b>Impressora Bluetooth</b>
          <small>PRM-PRN-014</small>
        </div>
        <AppBadge variant="regular" label="Ligada" />
      </div>
      <div class="agente-row">
        <div>
          <b>Biometria</b>
          <small>Impressão digital</small>
        </div>
        <AppBadge variant="regular" label="Ativa" />
      </div>
    </div>

    <!-- Logout -->
    <button class="agente-btn agente-btn--outline" @click="sair">
      <q-icon name="logout" size="18px" class="q-mr-xs" />
      Terminar sessão
    </button>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth'
import AppBadge from '@/shared/common/AppBadge.vue'

const router = useRouter()
const $q = useQuasar()
const auth = useAuthStore()

function sincronizar() {
  $q.notify({
    type: 'positive',
    message: 'Hotlist sincronizada: 128 veículos',
    position: 'top',
  })
}

function sair() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped lang="scss">
.agente-perfil { padding: 0; }

.agente-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
  padding: 14px;
  margin-bottom: 12px;

  &--center { text-align: center; }
}

.agente-avatar {
  width: 74px;
  height: 74px;
  border-radius: 50%;
  background: var(--sicam-primary-bg);
  color: var(--sicam-primary);
  font-size: 34px;
  font-weight: 700;
  display: grid;
  place-items: center;
  margin: 6px auto 8px;
}

.agente-nome {
  font-size: 16px;
  font-weight: 600;
  color: var(--sicam-ink);
  margin: 0 0 2px;
}

.agente-sub {
  color: var(--sicam-muted);
  font-size: 12px;
  display: block;
}

.agente-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 11px 0;
  border-bottom: 1px solid var(--sicam-line-soft);

  &:last-child { border-bottom: 0; }

  small {
    display: block;
    color: var(--sicam-muted);
    font-size: 12px;
    font-weight: 400;
  }

  b { color: var(--sicam-ink); font-size: 14px; }
}

.agente-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  background: var(--sicam-primary-light);
  color: #fff;
  border: 0;
  border-radius: 10px;
  padding: 13px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 10px;
  text-decoration: none;
  text-align: center;

  &:active { background: var(--sicam-primary); }

  &--outline {
    background: #fff;
    color: var(--sicam-ink);
    border: 1px solid var(--sicam-line);
  }
}
</style>