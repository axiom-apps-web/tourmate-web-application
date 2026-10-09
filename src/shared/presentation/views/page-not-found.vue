<script setup>
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

const route = useRoute();
const unavailableRoute = route.fullPath;
const { t } = useI18n();
</script>

<template>
  <section class="not-found page-shell" aria-labelledby="not-found-title">
    <div class="not-found-card surface-card">
      <span class="not-found-icon" aria-hidden="true"><i class="pi pi-map"></i></span>
      <p class="not-found-code">404</p>
      <h1 id="not-found-title" class="page-heading">{{ t('page-not-found.title') }}</h1>
      <p class="page-description">
        {{ t('page-not-found.content', { invalid_path: unavailableRoute }) }}
      </p>
      <router-link to="/home" class="home-link">
        <i class="pi pi-arrow-left" aria-hidden="true"></i>
        {{ t('page-not-found.go-home') }}
      </router-link>
    </div>
  </section>
</template>

<style scoped>
.not-found-card {
  display: grid;
  justify-items: center;
  gap: 0.6rem;
  padding: clamp(2rem, 7vw, 4rem) 1.25rem;
  text-align: center;
}

.not-found-icon {
  display: grid;
  width: 4rem;
  height: 4rem;
  place-items: center;
  margin-bottom: 0.5rem;
  border-radius: 1.25rem;
  background: var(--tm-green-100);
  color: var(--tm-green-900);
  font-size: 1.6rem;
}

.not-found-code {
  margin: 0;
  color: var(--tm-green-800);
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.2em;
}

.not-found-card .page-description {
  overflow-wrap: anywhere;
}

.home-link {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  gap: 0.55rem;
  margin-top: 0.8rem;
  padding: 0.65rem 1rem;
  border-radius: 0.6rem;
  background: var(--tm-action-bg);
  color: #fff;
  font-weight: 700;
}

.home-link:hover {
  background: var(--tm-action-hover);
}
</style>
