<template>
  <div class="agente-camera">
    <h1 class="agente-h1">Fotografar matrícula</h1>
    <p class="agente-sub">Enquadre a matrícula. A leitura é automática.</p>

    <!-- Ecrã da câmara (mock) -->
    <div class="agente-cam">
      <div class="agente-cam__frame">
        <span class="agente-cam__ocr">{{ textoOcr }}</span>
      </div>
    </div>

    <button class="agente-btn" :disabled="a_ler" @click="capturar">
      {{ a_ler ? 'A ler…' : 'Capturar' }}
    </button>

    <router-link to="/agente/consulta" class="agente-btn agente-btn--outline">
      Escrever manualmente
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const textoOcr = ref('···')
const a_ler = ref(false)

function capturar() {
  a_ler.value = true
  textoOcr.value = 'A ler…'

  setTimeout(() => {
    textoOcr.value = 'AFC-205-MC'

    setTimeout(() => {
      sessionStorage.setItem('sicam.matricula-atual', 'AFC-205-MC')
      router.push('/agente/resultado')
    }, 600)
  }, 800)
}
</script>

<style scoped lang="scss">
.agente-camera { padding: 0; }

.agente-h1 {
  font-size: 20px;
  font-weight: 700;
  color: var(--sicam-ink);
  margin: 0;
}

.agente-sub {
  color: var(--sicam-muted);
  font-size: 13px;
  margin: 2px 0 14px;
}

.agente-cam {
  background: linear-gradient(#2a3a33, #101814);
  border-radius: 14px;
  height: 300px;
  display: grid;
  place-items: center;
  margin-bottom: 12px;
  overflow: hidden;

  &__frame {
    width: 78%;
    height: 90px;
    border: 3px solid #34d399;
    border-radius: 10px;
    display: grid;
    place-items: center;
    background: #ffffff14;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      height: 2px;
      background: #34d399;
      animation: scan 1.6s ease-in-out infinite alternate;
    }
  }

  &__ocr {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #34d399;
  }
}

@keyframes scan {
  from { top: 6px; }
  to   { top: 80px; }
}

@media (prefers-reduced-motion: reduce) {
  .agente-cam__frame::after { animation: none; }
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

  &:active:not(:disabled) { background: var(--sicam-primary); }
  &:disabled { opacity: 0.7; cursor: wait; }

  &--outline {
    background: #fff;
    color: var(--sicam-ink);
    border: 1px solid var(--sicam-line);
  }
}
</style>