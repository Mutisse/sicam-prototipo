<template>
  <div class="portal-carta">
    <!-- Voltar -->
    <button class="portal-back" @click="voltar">
      <q-icon name="arrow_back" size="18px" />
      Nova consulta
    </button>

    <!-- Dados do condutor -->
    <section class="portal-condutor">
      <div class="portal-condutor__avatar">
        {{ iniciais }}
      </div>
      <div class="portal-condutor__body">
        <h1 class="portal-condutor__nome">{{ condutor.nome }}</h1>
        <p class="portal-condutor__carta">Carta nº {{ condutor.numero }}</p>
        <div class="portal-condutor__tags">
          <span class="portal-tag">Categoria {{ condutor.categoria }}</span>
          <span class="portal-tag portal-tag--success">
            Válida até {{ condutor.validade }}
          </span>
        </div>
      </div>
    </section>

    <!-- Veículos -->
    <section class="portal-veiculos">
      <header class="portal-veiculos__head">
        <h2 class="portal-veiculos__title">Veículos associados</h2>
        <span class="portal-veiculos__count">{{ veiculos.length }}</span>
      </header>

      <ul class="portal-veiculos__list">
        <li
          v-for="v in veiculos"
          :key="v.matricula"
          class="portal-veiculo"
          @click="verVeiculo(v.matricula)"
        >
          <div class="portal-veiculo__icon" :class="`portal-veiculo__icon--${estadoClasse(v.score)}`">
            <q-icon name="directions_car" size="22px" />
          </div>

          <div class="portal-veiculo__body">
            <div class="portal-veiculo__top">
              <b class="portal-veiculo__placa">{{ v.matricula }}</b>
              <span class="portal-veiculo__nivel" :class="`portal-veiculo__nivel--${estadoClasse(v.score)}`">
                {{ estadoLabel(v.score) }}
              </span>
            </div>
            <p class="portal-veiculo__desc">{{ v.marca }} {{ v.modelo }} · {{ v.cor }}</p>
          </div>

          <q-icon name="chevron_right" size="20px" class="portal-veiculo__chevron" />
        </li>
      </ul>
    </section>

    <!-- Nota de privacidade -->
    <p class="portal-nota">
      <q-icon name="lock" size="14px" />
      Consulta registada para auditoria. Dados do proprietário visíveis apenas a entidades autorizadas.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { estadoDoScore } from '@/css/design/palette'

const router = useRouter()

interface VeiculoCidadao {
  matricula: string
  marca: string
  modelo: string
  cor: string
  score: number | null
}

// Mock (viria da API)
const condutor = ref({
  nome: 'João Manuel Chissano',
  numero: '1101002345678',
  categoria: 'B',
  validade: '14/08/2028',
})

const veiculos = ref<VeiculoCidadao[]>([
  { matricula: 'AGL-482-MC', marca: 'Toyota', modelo: 'Hilux', cor: 'Branco', score: 22 },
  { matricula: 'AFC-205-MC', marca: 'Mazda', modelo: '3',     cor: 'Azul',   score: 58 },
  { matricula: 'ALM-507-MC', marca: 'Honda', modelo: 'Fit',   cor: 'Cinza',  score: 91 },
])

onMounted(() => {
  const numero = sessionStorage.getItem('sicam.numero-carta')
  if (!numero) {
    router.push('/cidadao/portal')
    return
  }
  condutor.value.numero = numero
})

const iniciais = computed(() => {
  const partes = condutor.value.nome.trim().split(/\s+/)
  const p = partes[0]?.[0] ?? ''
  const u = partes.length > 1 ? partes[partes.length - 1]?.[0] ?? '' : ''
  return (p + u).toUpperCase()
})

function estadoClasse(score: number | null): 'regular' | 'atencao' | 'critico' | 'sem-dados' {
  const e = estadoDoScore(score)
  if (e.key === 'critico' || e.key === 'atencao' || e.key === 'regular') return e.key
  return 'sem-dados'
}

function estadoLabel(score: number | null): string {
  return estadoDoScore(score).label
}

function verVeiculo(matricula: string) {
  sessionStorage.setItem('sicam.matricula-atual', matricula)
  router.push('/cidadao/portal')
}

function voltar() {
  router.push('/cidadao/portal')
}
</script>

<style scoped lang="scss">
.portal-carta {
  max-width: 800px;
  margin: 0 auto;
}

// ------------------------------------------------------------
// Botão voltar
// ------------------------------------------------------------
.portal-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 0;
  color: var(--sicam-muted);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 18px;
  padding: 0;

  &:hover { color: var(--sicam-primary); }
}

// ------------------------------------------------------------
// Cartão do condutor
// ------------------------------------------------------------
.portal-condutor {
  display: flex;
  gap: 18px;
  align-items: center;
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  @media (max-width: 600px) {
    flex-direction: column;
    text-align: center;
  }

  &__avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: var(--sicam-primary-bg);
    color: var(--sicam-primary);
    font-size: 30px;
    font-weight: 700;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  &__body { flex: 1; min-width: 0; }

  &__nome {
    font-size: 20px;
    font-weight: 700;
    color: var(--sicam-ink);
    margin: 0 0 4px;
  }

  &__carta {
    font-size: 13px;
    color: var(--sicam-muted);
    margin: 0 0 10px;
  }

  &__tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;

    @media (max-width: 600px) { justify-content: center; }
  }
}

.portal-tag {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 99px;
  background: var(--sicam-line-soft);
  color: var(--sicam-ink);
  font-size: 12px;
  font-weight: 600;

  &--success {
    background: var(--sicam-success-bg);
    color: var(--sicam-success-ink);
  }
}

// ------------------------------------------------------------
// Veículos
// ------------------------------------------------------------
.portal-veiculos {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  &__head {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 14px;
  }

  &__title {
    font-size: 16px;
    font-weight: 700;
    color: var(--sicam-ink);
    margin: 0;
  }

  &__count {
    background: var(--sicam-primary-bg);
    color: var(--sicam-primary);
    font-size: 12px;
    font-weight: 700;
    padding: 2px 10px;
    border-radius: 99px;
  }

  &__list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
}

.portal-veiculo {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  border-top: 1px solid var(--sicam-line-soft);
  cursor: pointer;

  &:first-child { border-top: 0; padding-top: 0; }
  &:last-child { padding-bottom: 0; }
  &:hover { opacity: 0.85; }

  &__icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    flex-shrink: 0;

    &--critico   { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
    &--atencao   { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
    &--regular   { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
    &--sem-dados { background: var(--sicam-neutral-bg);  color: var(--sicam-neutral-ink); }
  }

  &__body { flex: 1; min-width: 0; }

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  &__placa {
    font-size: 15px;
    font-weight: 700;
    color: var(--sicam-ink);
    letter-spacing: 0.02em;
  }

  &__nivel {
    font-size: 11px;
    font-weight: 700;
    padding: 3px 9px;
    border-radius: 99px;
    text-transform: uppercase;
    letter-spacing: 0.04em;

    &--critico   { background: var(--sicam-critical-bg); color: var(--sicam-critical-ink); }
    &--atencao   { background: var(--sicam-warning-bg);  color: var(--sicam-warning-ink); }
    &--regular   { background: var(--sicam-success-bg);  color: var(--sicam-success-ink); }
    &--sem-dados { background: var(--sicam-neutral-bg);  color: var(--sicam-neutral-ink); }
  }

  &__desc {
    font-size: 12px;
    color: var(--sicam-muted);
    margin: 2px 0 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__chevron {
    color: var(--sicam-line-strong);
    flex-shrink: 0;
  }
}

// ------------------------------------------------------------
// Nota
// ------------------------------------------------------------
.portal-nota {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--sicam-muted);
  margin: 0;
  padding: 0 4px;
  line-height: 1.4;
}
</style>