<script setup>
import {onMounted, toRefs} from "vue";
import useTourManagementStore from "../../application/tour-management.store.js";
import {useI18n} from "vue-i18n";
import {useConfirm} from "primevue";
import TourItem from "../components/tour-item.vue";
import {useRouter} from "vue-router";

const store = useTourManagementStore();
const router = useRouter();
const confirm = useConfirm();
const {t} = useI18n();
const {tours, errors, toursLoaded} = toRefs(store);
const {fetchTours, deleteTour} = store;

onMounted(() => {
  if (!toursLoaded.value) fetchTours();
});

const navigateToNew = () => {
  router.push({name: 'tour-management-tours-new'});
};

const navigateToEdit = (tour) => {
  router.push({name: 'tour-management-tours-edit', params: {id: tour.id}});
};

const confirmDelete = (tour) => {
  confirm.require({
    message: t('tours.delete_confirm', {title: tour.title}),
    header: t('tours.delete'),
    icon: "pi pi-exclamation-triangle",
    acceptClass: 'p-button-danger',
    accept: () => {
      deleteTour(tour)
    }
  })
}

</script>

<template>
  <section class="tour-catalog page-shell" aria-labelledby="tour-catalog-title">
    <header class="catalog-header">
      <div>
        <p class="catalog-eyebrow">{{ t('shell.workspace') }}</p>
        <h1 id="tour-catalog-title" class="page-heading">{{ t('tours.list_title') }}</h1>
        <p class="page-description">{{ t('tours.page_description') }}</p>
      </div>
      <pv-button :label="t('tours.new')" icon="pi pi-plus" @click="navigateToNew" />
    </header>

    <div class="catalog-summary">
      <span class="catalog-summary__icon" aria-hidden="true"><i class="pi pi-map"></i></span>
      <p aria-live="polite"> <strong>{{ tours.length }}</strong> {{ t('tours.catalog_count') }}</p>
    </div>

    <p v-if="!toursLoaded && !errors.length" class="catalog-state" role="status" aria-live="polite">
      <i class="pi pi-spin pi-spinner" aria-hidden="true"></i>
      {{ t('common.loading') }}
    </p>

    <div v-else-if="errors.length" class="catalog-state catalog-state--error" role="alert">
      {{ errors.map(error => error.message).join(', ') }}
    </div>

    <div v-else-if="tours.length === 0" class="catalog-empty">
      <span class="catalog-empty__icon" aria-hidden="true"><i class="pi pi-map"></i></span>
      <h2>{{ t('tours.empty_title') }}</h2>
      <p>{{ t('tours.empty_description') }}</p>
      <pv-button :label="t('tours.new')" icon="pi pi-plus" @click="navigateToNew" />
    </div>

    <div v-else class="tour-grid">
      <TourItem
          v-for="tour in tours"
          :key="tour.id"
          :tour="tour"
          @edit="navigateToEdit"
          @delete="confirmDelete"
      />
    </div>
  </section>
</template>

<style scoped>
.tour-catalog {
  display: grid;
  gap: 1.4rem;
}

.catalog-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
}

.catalog-eyebrow {
  margin: 0 0 0.55rem;
  color: var(--tm-green-800);
  font-size: 0.75rem;
  font-weight: 750;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.catalog-summary {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: var(--tm-muted);
}

.catalog-summary p {
  margin: 0;
}

.catalog-summary strong {
  color: var(--tm-text);
}

.catalog-summary__icon,
.catalog-empty__icon {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 0.85rem;
  background: var(--tm-green-100);
  color: var(--tm-green-900);
}

.tour-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  gap: 1.1rem;
}

.catalog-state,
.catalog-empty {
  display: grid;
  justify-items: center;
  gap: 0.75rem;
  padding: clamp(2rem, 7vw, 4rem) 1rem;
  color: var(--tm-muted);
  text-align: center;
}

.catalog-state {
  display: flex;
  justify-content: center;
}

.catalog-state--error {
  color: var(--tm-danger);
}

.catalog-empty h2,
.catalog-empty p {
  margin: 0;
}

.catalog-empty h2 {
  color: var(--tm-text);
}

.catalog-empty p {
  max-width: 38rem;
  line-height: 1.6;
}

@media (max-width: 600px) {
  .catalog-header {
    align-items: stretch;
    flex-direction: column;
  }

  .catalog-header > :deep(.p-button) {
    align-self: flex-start;
  }
}
</style>