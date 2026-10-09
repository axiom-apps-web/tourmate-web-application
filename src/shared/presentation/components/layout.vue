<script setup>

import LanguageSwitcher from "./language-switcher.vue";
import {ref} from "vue";
import {useRoute} from "vue-router";
import {useI18n} from "vue-i18n";
import FooterContent from "./footer-content.vue";

const { t } = useI18n();
const route = useRoute();

const drawer = ref(false);
const toggleDrawer = () => {
  /**
   * Toggles the state of the drawer between open and closed.
   */
  drawer.value = !drawer.value;
}
const items = [
  {label: 'option.home', to: '/home'},
  {label: 'option.about', to: '/about'},
  {label: 'option.activeTours', to: '/tour-monitoring/active-tours'},
  {label: 'option.management', to: '/tour-management/tours'},
  {label: 'option.feedback_and_reviews', to: '/feedback-and-tour-reviews/reviews'},

  {label: 'option.safety_and_incident', to: '/incidents'},


];

function closeDrawer() {
  drawer.value = false;
}
</script>

<template>
  <div class="app-shell">
    <a class="skip-link" href="#main-content">{{ t('shell.skip_to_content') }}</a>
    <pv-toast/>
    <pv-confirm-dialog/>
    <header class="app-header">
      <pv-toolbar class="app-toolbar">
      <template #start>
        <pv-button
            class="mobile-menu-button"
            icon="pi pi-bars"
            text
            rounded
            :aria-label="t('shell.open_navigation')"
            :aria-expanded="drawer"
            aria-controls="mobile-navigation"
            @click="toggleDrawer"
        />
        <router-link class="brand" to="/home" :aria-label="`TourMate — ${t('shell.platform')}`">
          <span class="brand-mark" aria-hidden="true"><i class="pi pi-compass"></i></span>
          <span class="brand-copy">
            <strong>TourMate</strong>
            <small>{{ t('shell.brand_caption') }}</small>
          </span>
        </router-link>
      </template>
      <template #end>
        <nav class="desktop-navigation" :aria-label="t('shell.main_navigation')">
          <router-link
              v-for="item in items"
              :key="item.label"
              :to="item.to"
              :aria-current="route.path === item.to ? 'page' : undefined"
              class="navigation-link"
          >
            {{ t(item.label) }}
          </router-link>
        </nav>
        <language-switcher/>
      </template>
      </pv-toolbar>
      <pv-drawer
          id="mobile-navigation"
          v-model:visible="drawer"
          :header="t('shell.main_navigation')"
          position="left"
          class="mobile-navigation-drawer"
      >
        <nav class="mobile-navigation" :aria-label="t('shell.main_navigation')">
          <router-link
              v-for="item in items"
              :key="item.label"
              :to="item.to"
              :aria-current="route.path === item.to ? 'page' : undefined"
              class="navigation-link"
              @click="closeDrawer"
          >
            {{ t(item.label) }}
          </router-link>
        </nav>
      </pv-drawer>
    </header>
    <main id="main-content" class="app-main" tabindex="-1">
      <router-view/>
    </main>
    <FooterContent/>
  </div>
</template>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
  background: var(--tm-page);
  color: var(--tm-text);
}

.skip-link {
  position: fixed;
  z-index: 1000;
  top: 0.75rem;
  left: 0.75rem;
  transform: translateY(-160%);
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  background: var(--tm-green-900);
  color: #fff;
  font-weight: 700;
}

.skip-link:focus {
  transform: translateY(0);
}

.app-header {
  position: sticky;
  z-index: 10;
  top: 0;
  border-bottom: 1px solid var(--tm-border);
  background: var(--tm-surface);
}

.app-toolbar {
  min-height: 4.5rem;
  padding: 0.5rem clamp(0.75rem, 3vw, 2.5rem);
  border: 0;
  border-radius: 0;
  background: var(--tm-surface);
  color: var(--tm-text);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  color: var(--tm-text);
}

.brand-mark {
  display: grid;
  width: 2.65rem;
  height: 2.65rem;
  place-items: center;
  border-radius: 0.85rem;
  background: var(--tm-green-900);
  color: #fff;
  font-size: 1.2rem;
}

.brand-copy {
  display: grid;
  line-height: 1.2;
}

.brand-copy strong {
  font-size: 1.08rem;
}

.brand-copy small {
  margin-top: 0.25rem;
  color: var(--tm-muted);
  font-size: 0.63rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.desktop-navigation {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: clamp(0.1rem, 1vw, 0.65rem);
  margin-right: clamp(0.5rem, 2vw, 1.5rem);
}

.navigation-link {
  display: inline-flex;
  min-height: 2.6rem;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 0.75rem;
  border-radius: 0.6rem;
  color: var(--tm-muted);
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
  transition: background-color 140ms ease, color 140ms ease;
}

.navigation-link:hover,
.navigation-link[aria-current="page"] {
  background: var(--tm-green-100);
  color: var(--tm-green-900);
}

.mobile-menu-button {
  display: none;
  margin-right: 0.35rem;
  color: var(--tm-green-900);
}

.mobile-navigation {
  display: grid;
  gap: 0.35rem;
}

.mobile-navigation .navigation-link {
  justify-content: flex-start;
  min-height: 3rem;
  font-size: 1rem;
}

.app-main {
  width: 100%;
  flex: 1 0 auto;
}

@media (max-width: 1050px) {
  .desktop-navigation {
    gap: 0;
    margin-right: 0.5rem;
  }

  .navigation-link {
    padding-inline: 0.5rem;
    font-size: 0.82rem;
  }
}

@media (max-width: 800px) {
  .mobile-menu-button {
    display: inline-flex;
  }

  .desktop-navigation {
    display: none;
  }
}

@media (max-width: 420px) {
  .brand-copy small {
    display: none;
  }

  .app-toolbar {
    padding-inline: 0.4rem;
  }
}
</style>