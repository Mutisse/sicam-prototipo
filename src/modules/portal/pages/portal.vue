<template>
  <div class="portal-inicio">
    <!-- ============================================================ -->
    <!-- HERO + CONSULTA                                              -->
    <!-- ============================================================ -->
    <section class="portal-hero">
      <h1 class="portal-hero__title">
        Consulte o estado do seu veículo
      </h1>
      <p class="portal-hero__sub">
        Sem autenticação. Basta indicar o número da carta de condução.
      </p>

      <div class="portal-hero__form">
        <div class="portal-hero__input-wrap">
          <q-icon name="badge" size="22px" class="portal-hero__input-icon" />
          <input
            v-model="numeroCarta"
            class="portal-hero__input"
            type="text"
            inputmode="numeric"
            placeholder="Ex.: 1101002345678"
            @keydown.enter="consultar"
          />
        </div>

        <button class="portal-hero__btn" :disabled="!numeroCarta" @click="consultar">
          <q-icon name="search" size="20px" />
          Consultar
        </button>
      </div>

      <p class="portal-hero__nota">
        <q-icon name="lock" size="14px" />
        A sua informação é protegida. Consulta registada para auditoria.
      </p>
    </section>

    <!-- ============================================================ -->
    <!-- ATALHOS                                                      -->
    <!-- ============================================================ -->
    <section class="portal-atalhos">
      <router-link to="/cidadao/noticias" class="portal-atalho">
        <div class="portal-atalho__icon">
          <q-icon name="newspaper" size="24px" />
        </div>
        <div class="portal-atalho__body">
          <b>Notícias</b>
          <span>Campanhas e avisos do sector</span>
        </div>
        <q-icon name="chevron_right" size="20px" class="portal-atalho__chevron" />
      </router-link>

      <router-link to="/cidadao/faq" class="portal-atalho">
        <div class="portal-atalho__icon">
          <q-icon name="gavel" size="24px" />
        </div>
        <div class="portal-atalho__body">
          <b>Leis & Perguntas frequentes</b>
          <span>Código de estrada, multas, seguro</span>
        </div>
        <q-icon name="chevron_right" size="20px" class="portal-atalho__chevron" />
      </router-link>

      <router-link to="/cidadao/assistente" class="portal-atalho">
        <div class="portal-atalho__icon">
          <q-icon name="chat" size="24px" />
        </div>
        <div class="portal-atalho__body">
          <b>Assistente IA</b>
          <span>Tire dúvidas em linguagem natural</span>
        </div>
        <q-icon name="chevron_right" size="20px" class="portal-atalho__chevron" />
      </router-link>
    </section>

    <!-- ============================================================ -->
    <!-- ÚLTIMAS NOTÍCIAS                                             -->
    <!-- ============================================================ -->
    <section class="portal-news">
      <header class="portal-news__head">
        <h2 class="portal-news__title">Últimas notícias</h2>
        <router-link to="/cidadao/noticias" class="portal-news__link">
          Ver todas →
        </router-link>
      </header>

      <ul class="portal-news__list">
        <li
          v-for="n in noticias"
          :key="n.id"
          class="portal-news__item"
        >
          <div class="portal-news__date">{{ n.data }}</div>
          <div class="portal-news__content">
            <b>{{ n.titulo }}</b>
            <p>{{ n.resumo }}</p>
          </div>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const numeroCarta = ref('')

// Mock
const noticias = [
  {
    id: 1,
    data: '23 Set',
    titulo: 'Nova campanha de inspecção em Maputo',
    resumo: 'Postos móveis vão estar em 5 locais da cidade durante Outubro.',
  },
  {
    id: 2,
    data: '20 Set',
    titulo: 'Seguro obrigatório: prazos 2026',
    resumo: 'Novos valores e datas de renovação já disponíveis.',
  },
  {
    id: 3,
    data: '15 Set',
    titulo: 'Multas: como pagar online',
    resumo: 'Passo-a-passo para liquidar multas pela plataforma SICAM.',
  },
]

function consultar() {
  const n = numeroCarta.value.trim()
  if (!n) return

  sessionStorage.setItem('sicam.numero-carta', n)
  router.push('/cidadao/carta')
}
</script>

<style scoped lang="scss">
// ============================================================
// HERO
// ============================================================
.portal-hero {
  background: linear-gradient(155deg, #065f46 0%, #0b4a38 100%);
  color: #fff;
  border-radius: 20px;
  padding: 40px 24px;
  text-align: center;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(6, 95, 70, 0.15);

  &__title {
    font-size: 26px;
    font-weight: 700;
    margin: 0 0 8px;
    line-height: 1.2;

    @media (max-width: 600px) { font-size: 20px; }
  }

  &__sub {
    font-size: 14px;
    opacity: 0.85;
    margin: 0 0 24px;
  }

  &__form {
    display: flex;
    gap: 10px;
    max-width: 560px;
    margin: 0 auto 16px;

    @media (max-width: 600px) {
      flex-direction: column;
    }
  }

  &__input-wrap {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    background: #fff;
    border-radius: 12px;
    padding: 0 14px;
  }

  &__input-icon {
    color: var(--sicam-primary);
    flex-shrink: 0;
  }

  &__input {
    flex: 1;
    border: 0;
    background: transparent;
    padding: 14px 10px;
    font-size: 16px;
    font-family: inherit;
    color: var(--sicam-ink);
    letter-spacing: 0.02em;

    &::placeholder { color: var(--sicam-muted); }
    &:focus { outline: 0; }
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--sicam-primary-light);
    color: #fff;
    border: 0;
    border-radius: 12px;
    padding: 14px 24px;
    font-size: 15px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    white-space: nowrap;
    transition: background var(--sicam-transition-fast);

    &:hover:not(:disabled) { background: #047857; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }

    @media (max-width: 600px) {
      justify-content: center;
      width: 100%;
    }
  }

  &__nota {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    opacity: 0.75;
    margin: 0;
  }
}

// ============================================================
// ATALHOS
// ============================================================
.portal-atalhos {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 32px;

  @media (max-width: 800px) { grid-template-columns: 1fr; }
}

.portal-atalho {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  background: #fff;
  border-radius: 14px;
  text-decoration: none;
  color: var(--sicam-ink);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  transition: transform var(--sicam-transition-fast),
              box-shadow var(--sicam-transition-fast);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  }

  &__icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: var(--sicam-primary-bg);
    color: var(--sicam-primary);
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  &__body {
    flex: 1;
    min-width: 0;

    b {
      display: block;
      font-size: 15px;
      color: var(--sicam-ink);
      margin-bottom: 2px;
    }

    span {
      display: block;
      font-size: 12px;
      color: var(--sicam-muted);
    }
  }

  &__chevron {
    color: var(--sicam-line-strong);
    flex-shrink: 0;
  }
}

// ============================================================
// NOTÍCIAS
// ============================================================
.portal-news {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  &__head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  &__title {
    font-size: 18px;
    font-weight: 700;
    color: var(--sicam-ink);
    margin: 0;
  }

  &__link {
    font-size: 13px;
    color: var(--sicam-primary);
    font-weight: 600;
    text-decoration: none;
  }

  &__list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &__item {
    display: flex;
    gap: 16px;
    padding: 14px 0;
    border-top: 1px solid var(--sicam-line-soft);

    &:first-child { border-top: 0; padding-top: 0; }
    &:last-child { padding-bottom: 0; }
  }

  &__date {
    font-size: 12px;
    font-weight: 700;
    color: var(--sicam-primary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    flex-shrink: 0;
    width: 48px;
  }

  &__content {
    b {
      display: block;
      font-size: 14px;
      color: var(--sicam-ink);
      margin-bottom: 4px;
    }

    p {
      font-size: 13px;
      color: var(--sicam-muted);
      margin: 0;
      line-height: 1.4;
    }
  }
}
</style>