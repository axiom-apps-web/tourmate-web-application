<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const modules = [
  {title: 'home.tours_title', description: 'home.tours_description', icon: 'pi pi-map', to: '/tour-management/tours'},
  {title: 'home.monitoring_title', description: 'home.monitoring_description', icon: 'pi pi-compass', to: '/tour-monitoring/active-tours'},
  {title: 'home.incidents_title', description: 'home.incidents_description', icon: 'pi pi-shield', to: '/incidents'},
  {title: 'option.feedback_and_reviews', description: 'reviews.list_subtitle', icon: 'pi pi-star', to: '/feedback-and-tour-reviews/reviews'}
];
</script>

<template>
  <section class="home-page page-shell" aria-labelledby="home-title">
    <header class="home-hero">
      <div class="home-hero__copy">
        <p class="home-hero__eyebrow">{{ t('shell.brand_caption') }}</p>
        <h1 id="home-title">{{ t('home.title') }}</h1>
        <p>{{ t('home.content') }}</p>
      </div>
      <div class="home-hero__art" aria-hidden="true">
        <i class="pi pi-compass"></i>
        <span class="home-hero__orbit home-hero__orbit--one"></span>
        <span class="home-hero__orbit home-hero__orbit--two"></span>
      </div>
    </header>

    <div class="home-section-heading">
      <div>
        <h2>{{ t('home.workspace_title') }}</h2>
        <p>{{ t('home.workspace_hint') }}</p>
      </div>
    </div>

    <nav class="workspace-grid" :aria-label="t('home.workspace_title')">
      <router-link
          v-for="module in modules"
          :key="module.to"
          :to="module.to"
          class="workspace-card"
      >
        <span class="workspace-card__icon" aria-hidden="true"><i :class="module.icon"></i></span>
        <span class="workspace-card__content">
          <strong>{{ t(module.title) }}</strong>
          <span>{{ t(module.description) }}</span>
        </span>
        <span class="workspace-card__action">
          {{ t('home.open_module') }}
          <i class="pi pi-arrow-up-right" aria-hidden="true"></i>
        </span>
      </router-link>
    </nav>

    <div class="home-billing-note">
      <i class="pi pi-wallet" aria-hidden="true"></i>
      <span>
        <strong>{{ t('home.billing_title') }}</strong>
        <span>{{ t('home.billing_description') }}</span>
      </span>
    </div>
  </section>
</template>

<style scoped>
.home-page {
  padding-top: clamp(1.5rem, 5vw, 3.5rem);
}

.home-hero {
  position: relative;
  display: flex;
  min-height: clamp(15rem, 35vw, 22rem);
  align-items: center;
  overflow: hidden;
  padding: clamp(1.5rem, 6vw, 4rem);
  border-radius: 1.5rem;
  background: linear-gradient(120deg, #174b2a, #287542 68%, #4d8a55);
  color: #fff;
}

.home-hero__copy {
  position: relative;
  z-index: 1;
  max-width: 46rem;
}

.home-hero__eyebrow {
  margin: 0 0 0.9rem;
  color: #d7efd9;
  font-size: 0.75rem;
  font-weight: 750;
  letter-spacing: 0.13em;
}

.home-hero h1 {
  font-family: var(--tm-heading-font);
  max-width: 13ch;
  margin: 0;
  font-size: clamp(2.2rem, 5.6vw, 4.1rem);
  letter-spacing: -0.045em;
  line-height: 1.05;
}

.home-hero__copy > p:last-child {
  max-width: 40rem;
  margin: 1.15rem 0 0;
  color: #eff8ef;
  font-size: clamp(1rem, 1.5vw, 1.15rem);
  line-height: 1.65;
}

.home-hero__art {
  position: absolute;
  top: 50%;
  right: clamp(-3rem, 7vw, 6rem);
  display: grid;
  width: clamp(10rem, 27vw, 20rem);
  aspect-ratio: 1;
  place-items: center;
  transform: translateY(-50%);
  border: 1px solid rgb(255 255 255 / 22%);
  border-radius: 50%;
  color: rgb(255 255 255 / 88%);
  font-size: clamp(5rem, 13vw, 9rem);
}

.home-hero__orbit {
  position: absolute;
  inset: 10%;
  border: 1px solid rgb(255 255 255 / 25%);
  border-radius: 50%;
}

.home-hero__orbit--two {
  inset: -10%;
  border-style: dashed;
}

.home-section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin: clamp(2.5rem, 6vw, 4rem) 0 1.25rem;
}

.home-section-heading h2 {
  margin: 0;
  color: var(--tm-text);
  font-size: clamp(1.4rem, 3vw, 1.9rem);
}

.home-section-heading p {
  margin: 0.45rem 0 0;
  color: var(--tm-muted);
}

.workspace-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr));
  gap: 1rem;
}

.workspace-card {
  display: grid;
  min-height: 14rem;
  grid-template-rows: auto 1fr auto;
  gap: 1rem;
  padding: 1.4rem;
  border: 1px solid var(--tm-border);
  border-radius: 1rem;
  background: var(--tm-surface);
  color: var(--tm-text);
  box-shadow: 0 0.4rem 1.5rem rgb(19 53 31 / 5%);
  transition: border-color 140ms ease, transform 140ms ease, box-shadow 140ms ease;
}

.workspace-card:hover {
  transform: translateY(-2px);
  border-color: var(--tm-green-700);
  box-shadow: 0 0.75rem 1.8rem rgb(19 53 31 / 10%);
}

.workspace-card__icon {
  display: grid;
  width: 3rem;
  height: 3rem;
  place-items: center;
  border-radius: 0.9rem;
  background: var(--tm-green-100);
  color: var(--tm-green-900);
  font-size: 1.25rem;
}

.workspace-card__content,
.workspace-card__content > span,
.home-billing-note > span,
.home-billing-note > span > span {
  display: grid;
  gap: 0.45rem;
}

.workspace-card__content strong {
  font-size: 1.12rem;
}

.workspace-card__content > span,
.home-billing-note > span > span {
  color: var(--tm-muted);
  line-height: 1.55;
}

.workspace-card__action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  color: var(--tm-green-900);
  font-size: 0.9rem;
  font-weight: 700;
}

.home-billing-note {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-top: 1.25rem;
  padding: 1.2rem 1.4rem;
  border: 1px solid var(--tm-border);
  border-radius: 1rem;
  background: var(--tm-surface);
  color: var(--tm-text);
}

.home-billing-note > i {
  margin-top: 0.2rem;
  color: var(--tm-green-800);
}

@media (max-width: 600px) {
  .home-hero__art {
    right: -5rem;
    opacity: 0.28;
  }

  .home-section-heading p {
    max-width: 30ch;
  }
}
</style>
