<script setup>
import {useI18n} from "vue-i18n";

const { t } = useI18n();
</script>

<template>
  <section class="about-page page-shell" aria-labelledby="about-title">
    <div class="about-card surface-card">
      <div class="about-card__brand" aria-hidden="true"><i class="pi pi-compass"></i></div>
      <div>
        <p class="about-eyebrow">{{ t('shell.platform') }}</p>
        <h1 id="about-title" class="page-heading">{{ t('about.title') }}</h1>
        <p class="page-description">{{ t('about.content') }}</p>
      </div>
      <img src="../../../assets/Logo_Tourmate.jpeg" alt="TourMate" class="about-logo"/>
    </div>
  </section>
</template>

<style scoped>
.about-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: clamp(1.25rem, 4vw, 3rem);
  padding: clamp(1.5rem, 5vw, 3.5rem);
}

.about-card__brand {
  display: grid;
  width: clamp(4rem, 9vw, 6rem);
  aspect-ratio: 1;
  place-items: center;
  border-radius: 1.5rem;
  background: var(--tm-green-100);
  color: var(--tm-green-900);
  font-size: clamp(2rem, 5vw, 3rem);
}

.about-eyebrow {
  margin: 0 0 0.55rem;
  color: var(--tm-green-800);
  font-size: 0.75rem;
  font-weight: 750;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.about-card .page-description {
  margin-top: 0.7rem;
}

.about-logo {
  width: clamp(5rem, 13vw, 9rem);
  height: auto;
  border-radius: 1rem;
  background: var(--tm-surface);
}

@media (max-width: 650px) {
  .about-card {
    grid-template-columns: auto 1fr;
  }

  .about-logo {
    grid-column: 2;
    width: 6rem;
  }
}

@media (max-width: 380px) {
  .about-card {
    grid-template-columns: 1fr;
  }

  .about-logo {
    grid-column: auto;
  }
}
</style>
