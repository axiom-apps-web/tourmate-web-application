<script setup>
import {useI18n} from "vue-i18n";
import {useRoute, useRouter} from "vue-router";
import useTourMonitoringStore from "../../application/tour-monitoring.store.js";
import {computed, onMounted, ref} from "vue";
import {ActiveTour} from "../../domain/model/active-tour.entity.js";

const {t} = useI18n();
const route = useRoute();
const router = useRouter();
const store = useTourMonitoringStore();
const {errors, guides, addActiveTour, updateActiveTour, fetchGuides} = store;

const form = ref({status: '', startedAt: '', guideId: null});
const isEdit = computed(() => !!route.params.id);

onMounted(() => {
  if (!guides.length) fetchGuides();
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
  <div class="p-4">
    <h1>{{ isEdit ? t('activeTour.edit-title') : t('activeTour.new-title') }}</h1>
    <form @submit.prevent="saveActiveTour">
      <div class="field mb-3">
        <label for="status">{{ t('activeTour.status') }}</label>
        <pv-input-text id="status" v-model="form.status" required class="w-full" />
      </div>
      <div class="field mb-3">
        <label for="startedAt">{{ t('activeTour.startedAt') }}</label>
        <pv-textarea id="startedAt" v-model="form.startedAt" rows="4" class="w-full" />
      </div>
      <div class="field mb-3">
        <label for="guide">{{ t('activeTour.guide') }}</label>
        <pv-select
            id="guide"
            v-model="form.guideId"
            :options="guides"
            optionLabel="phoneNumber"
            optionValue="id"
            placeholder="Select a guide"
            class="w-full"
        />
      </div>
      <pv-button type="submit" :label="t('activeTours.save')" icon="pi pi-save" />
      <pv-button type="button" :label="t('activeTours.cancel')" severity="secondary" class="ml-2" @click="navigateBack" />
    </form>
    <div v-if="errors.length" class="text-red-500 mt-3">
      {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
    </div>
  </div>
</template>

<style scoped>

</style>