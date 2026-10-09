<script setup>
import {useI18n} from "vue-i18n";
import {useRoute, useRouter} from "vue-router";
import useTourMonitoringStore from "../../application/tour-monitoring.store.js";
import {storeToRefs} from "pinia";
import {computed, onMounted, ref} from "vue";
import {ActiveTour} from "../../domain/model/active-tour.entity.js";

const {t} = useI18n();
const route = useRoute();
const router = useRouter();
const store = useTourMonitoringStore();
const {errors, guides, guidesLoaded} = storeToRefs(store);
const {addActiveTour, updateActiveTour, fetchGuides} = store;

const form = ref({status: '', startedAt: '', guideId: null});
const isEdit = computed(() => !!route.params.id);

onMounted(() => {
  if (!guidesLoaded.value) fetchGuides();
  if (isEdit.value) {
    const activeTour = getActiveTourById(route.params.id);
    if (activeTour) {
      form.value.status = activeTour.status;
      form.value.startedAt = activeTour.startedAt;
      form.value.guideId = activeTour.guideId;
    } else router.push({name: 'tour-monitoring-active-tours'});
  }
});

/**
 * Retrieves a activeTour by its ID.
 * @param {string} id - The ID of the activeTour.
 * @returns {Object|null} - The activeTour object if found, null otherwise.
 */
function getActiveTourById(id) {
  return store.getActiveTourById(id);
}

const saveActiveTour = () => {
  /**
   * Saves the activeTour.
   * If editing an existing activeTour, updates it; otherwise, adds a new activeTour.
   */
  const activeTour = new ActiveTour({
    id: isEdit.value ? route.params.id : null,
    status: form.value.status,
    startedAt: form.value.startedAt,
    guideId: form.value.guideId,
  });
  if (isEdit.value) updateActiveTour(activeTour); else addActiveTour(activeTour);
  navigateBack();
};

/**
 * Navigates back to the activeTours list.
 */
const navigateBack = () => {
  router.push({name: 'tour-monitoring-active-tours'});
};
</script>

<template>
  <section class="active-tour-form-page page-shell" aria-labelledby="active-tour-form-title">
    <div class="active-tour-form-card surface-card">
      <header class="active-tour-form-header">
        <span class="active-tour-form-icon" aria-hidden="true"><i class="pi pi-compass"></i></span>
        <div>
          <p class="active-tour-form-eyebrow">{{ t('activeTours.list-title') }}</p>
          <h1 id="active-tour-form-title" class="page-heading">
            {{ isEdit ? t('activeTours.edit') : t('activeTours.new') }}
          </h1>
          <p class="page-description">{{ t('activeTour.form-description') }}</p>
        </div>
      </header>

      <form class="active-tour-form" @submit.prevent="saveActiveTour">
        <div class="active-tour-field">
          <label for="active-tour-status">{{ t('activeTour.status') }} <span aria-hidden="true">*</span></label>
          <pv-input-text id="active-tour-status" v-model="form.status" required class="w-full" />
        </div>

        <div class="active-tour-field">
          <label for="active-tour-started-at">{{ t('activeTour.startedAt') }}</label>
          <pv-input-text id="active-tour-started-at" v-model="form.startedAt" class="w-full" />
        </div>

        <div class="active-tour-field active-tour-field--wide">
          <label for="active-tour-guide">{{ t('activeTour.guide') }}</label>
          <pv-select
              id="active-tour-guide"
              v-model="form.guideId"
              :options="guides"
              option-label="phoneNumber"
              option-value="id"
              :loading="!guidesLoaded"
              :placeholder="t('activeTour.no-guides')"
              class="w-full"
              aria-describedby="active-tour-guide-hint"
          />
          <small id="active-tour-guide-hint">{{ t('activeTour.guideId') }}</small>
        </div>

        <div class="active-tour-form-actions">
          <pv-button type="submit" :label="t('activeTours.save')" icon="pi pi-save" />
          <pv-button
              type="button"
              :label="t('activeTours.cancel')"
              icon="pi pi-times"
              severity="secondary"
              outlined
              @click="navigateBack"
          />
        </div>
      </form>

      <div v-if="errors.length" class="active-tour-form-error" role="alert">
        {{ t('errors.occurred') }}: {{ errors.map(error => error.message).join(', ') }}
      </div>
    </div>
  </section>
</template>

<style scoped>
.active-tour-form-page {
  max-width: 58rem;
}

.active-tour-form-card {
  display: grid;
  gap: 1.75rem;
  padding: clamp(1.25rem, 4vw, 2.5rem);
}

.active-tour-form-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.active-tour-form-icon {
  display: grid;
  width: 3.25rem;
  height: 3.25rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 1rem;
  background: var(--tm-green-100);
  color: var(--tm-green-900);
  font-size: 1.35rem;
}

.active-tour-form-eyebrow {
  margin: 0 0 0.5rem;
  color: var(--tm-green-800);
  font-size: 0.75rem;
  font-weight: 750;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.active-tour-form-header .page-description {
  margin-top: 0.55rem;
}

.active-tour-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.2rem;
}

.active-tour-field {
  display: grid;
  align-content: start;
  gap: 0.5rem;
  min-width: 0;
}

.active-tour-field label {
  color: var(--tm-text);
  font-size: 0.9rem;
  font-weight: 650;
}

.active-tour-field label span {
  color: var(--tm-danger);
}

.active-tour-field small {
  color: var(--tm-muted);
  line-height: 1.4;
}

.active-tour-field--wide,
.active-tour-form-actions {
  grid-column: 1 / -1;
}

.active-tour-form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  padding-top: 0.5rem;
}

.active-tour-form-error {
  color: var(--tm-danger);
  overflow-wrap: anywhere;
}

.active-tour-form :deep(.p-inputtext),
.active-tour-form :deep(.p-select) {
  min-height: 2.75rem;
  border-color: var(--tm-border);
  background: var(--tm-surface);
  color: var(--tm-text);
}

.active-tour-form :deep(.p-inputtext:focus),
.active-tour-form :deep(.p-select:focus-within) {
  outline: 3px solid color-mix(in srgb, var(--tm-green-700) 35%, transparent);
  outline-offset: 1px;
}

@media (max-width: 600px) {
  .active-tour-form {
    grid-template-columns: 1fr;
  }

  .active-tour-field--wide,
  .active-tour-form-actions {
    grid-column: auto;
  }

  .active-tour-form-actions :deep(.p-button) {
    flex: 1 1 100%;
    justify-content: center;
  }
}

</style>