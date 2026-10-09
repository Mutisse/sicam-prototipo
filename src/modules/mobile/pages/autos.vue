<template>
  <div class="agente-autos">
    <h1 class="agente-h1">Auto de Notícia</h1>
    <p class="agente-sub">Preencha e o texto é gerado automaticamente.</p>

    <!-- Formulário -->
    <div class="agente-card">
      <label class="agente-label">
        Matrícula
        <input
          v-model="matricula"
          class="agente-input agente-input--placa"
          placeholder="AGL-482-MC"
        />
      </label>

      <label class="agente-label">
        Infracção
        <select v-model="infracao" class="agente-input">
          <option>Seguro obrigatório expirado</option>
          <option>Inspeção técnica em atraso</option>
          <option>Documentos em falta</option>
          <option>Excesso de velocidade</option>
        </select>
      </label>

      <label class="agente-label">
        Observações
        <textarea
          v-model="observacoes"
          rows="3"
          class="agente-input"
          placeholder="Opcional"
        />
      </label>

      <button class="agente-btn" @click="gerar">Gerar auto</button>
    </div>

    <!-- Pré-visualização -->
    <div v-if="preview" class="agente-card">
      <h3>Pré-visualização</h3>
      <p class="agente-preview">
        Aos 23 de setembro de 2026, o agente Chissano verificou o veículo de
        matrícula <b>{{ matricula.toUpperCase() || '—' }}</b>, constatando a
        infração: <b>{{ infracao }}</b>.
        <span v-if="observacoes"> {{ observacoes }}</span>
      </p>
      <button class="agente-btn" @click="imprimir">
        <q-icon name="print" size="18px" class="q-mr-xs" />
        Imprimir (Bluetooth)
      </button>
    </div>

    <!-- Autos de hoje -->
    <div class="agente-card">
      <h3>Autos de hoje</h3>

      <div
        v-for="auto in autosHoje"
        :key="auto.codigo"
        class="agente-row"
      >
        <div>
          <b>{{ auto.codigo }}</b>
          <small>{{ auto.matricula }} · {{ auto.hora }}</small>
        </div>
        <AppBadge
          :variant="auto.estado === 'Emitido' ? 'atencao' : 'regular'"
          :label="auto.estado"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import AppBadge from '@/shared/common/AppBadge.vue'

const $q = useQuasar()

const matricula = ref(sessionStorage.getItem('sicam.matricula-atual') ?? '')
const infracao = ref('Seguro obrigatório expirado')
const observacoes = ref('')
const preview = ref(false)

const autosHoje = [
  { codigo: 'AN-26-00046', matricula: 'AGL-482-MC', hora: '08:12', estado: 'Emitido' },
  { codigo: 'AN-26-00045', matricula: 'ABR-771-MP', hora: '07:40', estado: 'Impresso' },
]

function gerar() {
  if (!matricula.value.trim()) {
    $q.notify({
      type: 'warning',
      message: 'Preencha a matrícula.',
      position: 'top',
    })
    return
  }
  preview.value = true
}

function imprimir() {
  $q.notify({
    type: 'positive',
    message: 'A imprimir via Bluetooth…',
    position: 'top',
  })
}
</script>

<style scoped lang="scss">
.agente-autos { padding: 0; }

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

.agente-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
  padding: 14px;
  margin-bottom: 12px;

  h3 {
    font-size: 14px;
    font-weight: 600;
    color: var(--sicam-ink);
    margin: 0 0 8px;
  }
}

.agente-label {
  display: block;
  font-size: 11px;
  color: var(--sicam-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 12px;
}

.agente-input {
  display: block;
  width: 100%;
  margin-top: 6px;
  padding: 11px 10px;
  border: 0;
  border-bottom: 1px solid var(--sicam-line-strong);
  background: var(--sicam-surface-alt);
  border-radius: 6px 6px 0 0;
  color: var(--sicam-ink);
  font-size: 15px;
  font-family: inherit;
  resize: vertical;

  &:focus {
    outline: 0;
    border-bottom-color: var(--sicam-primary-light);
  }

  &--placa {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
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

.agente-preview {
  font-size: 13px;
  line-height: 1.5;
  color: var(--sicam-ink);
  margin-bottom: 12px;
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
</style>