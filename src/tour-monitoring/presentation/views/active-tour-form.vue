<script setup>
import {computed, onMounted, ref, watch} from "vue";
import {storeToRefs} from "pinia";
import {useI18n} from "vue-i18n";
import {useRoute, useRouter} from "vue-router";
import useTourMonitoringStore from "../../application/tour-monitoring.store.js";
import useTourManagementStore from "../../../tour-management/application/tour-management.store.js";
import useIamStore from "../../../iam/application/iam.store.js";
import {ActiveTour} from "../../domain/model/active-tour.entity.js";

const {t} = useI18n();
const route = useRoute();
const router = useRouter();

const monitoringStore = useTourMonitoringStore();
const tourManagementStore = useTourManagementStore();
const iamStore = useIamStore();

const {errors: monitoringErrors, guides, guidesLoaded, activeTours, activeToursLoaded} =
    storeToRefs(monitoringStore);
const {addActiveTour, updateActiveTour, fetchGuides, fetchActiveTours} = monitoringStore;
const {tours, toursLoaded, tourSchedules, tourSchedulesLoaded, checkpoints, checkpointsLoaded} =
    storeToRefs(tourManagementStore);
const {fetchTours, fetchTourSchedules, fetchCheckpoints} = tourManagementStore;
const {users, usersLoaded} = storeToRefs(iamStore);
const {fetchUsers} = iamStore;

const isEdit = computed(() => Boolean(route.params.id));
const submitted = ref(false);
const editInitialized = ref(false);
const form = ref({
  tourId: null,
  tourScheduleId: null,
  guideId: null,
  status: "IN_PROGRESS",
  startedAt: "",
  currentLatitude: "",
  currentLongitude: "",
  finishedAt: "",
});

const availableSchedules = computed(() => {
  if (form.value.tourId === null || form.value.tourId === "") return [];
  return tourSchedules.value
      .filter(schedule => String(schedule.tourId) === String(form.value.tourId))
      .map(schedule => {
        return {
          ...schedule,
          label: t("activeTour.schedule_option", {
            id: schedule.id,
            capacity: schedule.maxCapacity,
            status: schedule.status || "—",
          }),
        };
      });
});

const guideOptions = computed(() => guides.value.map(guide => {
  const user = guide.user ?? users.value.find(item => String(item.id) === String(guide.userId));
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  return {
    ...guide,
    displayName: name || t("activeTour.guide_fallback", {id: guide.id}),
  };
}));

const hasTours = computed(() => toursLoaded.value && tours.value.length > 0);
const hasSchedulesForTour = computed(() => availableSchedules.value.length > 0);
const scheduleSelectionInvalid = computed(() =>
    !form.value.tourScheduleId ||
    !availableSchedules.value.some(schedule => String(schedule.id) === String(form.value.tourScheduleId))
);
const coordinatesMissing = computed(() =>
    form.value.currentLatitude === "" || form.value.currentLongitude === ""
);
const coordinatesInvalid = computed(() => {
  const latitude = Number(form.value.currentLatitude);
  const longitude = Number(form.value.currentLongitude);
  return !Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
      !Number.isFinite(longitude) || longitude < -180 || longitude > 180;
});
const formErrors = computed(() => [
  ...monitoringErrors.value,
  ...tourManagementStore.errors,
  ...iamStore.errors,
]);

function toLocalDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = number => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function onTourChange() {
  form.value.tourScheduleId = null;
  const firstCheckpoint = checkpoints.value
      .filter(checkpoint =>
          String(checkpoint.tourId) === String(form.value.tourId) &&
          checkpoint.latitude !== null && checkpoint.latitude !== "" &&
          checkpoint.longitude !== null && checkpoint.longitude !== "" &&
          Number.isFinite(Number(checkpoint.latitude)) &&
          Number.isFinite(Number(checkpoint.longitude))
      )
      .sort((first, second) => Number(first.orderIndex) - Number(second.orderIndex))[0];

  form.value.currentLatitude = firstCheckpoint?.latitude ?? "";
  form.value.currentLongitude = firstCheckpoint?.longitude ?? "";
}

function initializeEditForm() {
  if (!isEdit.value || editInitialized.value || !activeToursLoaded.value || !tourSchedulesLoaded.value) return;
  const activeTour = monitoringStore.getActiveTourById(route.params.id);
  if (!activeTour) {
    router.replace({name: "tour-monitoring-active-tours"});
    return;
  }
  const schedule = tourSchedules.value.find(item =>
      String(item.id) === String(activeTour.tourScheduleId)
  );
  if (!schedule) {
    router.replace({name: "tour-monitoring-active-tours"});
    return;
  }

  form.value = {
    tourId: schedule.tourId,
    tourScheduleId: activeTour.tourScheduleId,
    guideId: activeTour.guideId,
    status: activeTour.status || "IN_PROGRESS",
    startedAt: toLocalDateTime(activeTour.startedAt),
    currentLatitude: activeTour.currentLatitude ?? "",
    currentLongitude: activeTour.currentLongitude ?? "",
    finishedAt: toLocalDateTime(activeTour.finishedAt),
  };
  editInitialized.value = true;
}

watch([activeToursLoaded, tourSchedulesLoaded], initializeEditForm, {immediate: true});

onMounted(() => {
  if (!guidesLoaded.value) fetchGuides();
  if (!usersLoaded.value) fetchUsers();
  if (!toursLoaded.value) fetchTours();
  if (!tourSchedulesLoaded.value) fetchTourSchedules();
  if (!checkpointsLoaded.value) fetchCheckpoints();
  if (isEdit.value && !activeToursLoaded.value) fetchActiveTours();
});

function navigateBack() {
  router.push({name: "tour-monitoring-active-tours"});
}

function saveActiveTour() {
  submitted.value = true;
  const latitude = Number(form.value.currentLatitude);
  const longitude = Number(form.value.currentLongitude);
  const scheduleBelongsToTour = availableSchedules.value.some(schedule =>
      String(schedule.id) === String(form.value.tourScheduleId)
  );
  if (!form.value.tourId || !form.value.tourScheduleId || !scheduleBelongsToTour || !form.value.guideId ||
      !form.value.status.trim() || !form.value.startedAt ||
      form.value.currentLatitude === "" || form.value.currentLongitude === "" ||
      !Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
      !Number.isFinite(longitude) || longitude < -180 || longitude > 180) return;

  const activeTour = new ActiveTour({
    id: isEdit.value ? Number(route.params.id) : null,
    tourScheduleId: Number(form.value.tourScheduleId),
    guideId: Number(form.value.guideId),
    status: form.value.status.trim(),
    startedAt: form.value.startedAt,
    currentLatitude: latitude,
    currentLongitude: longitude,
    finishedAt: form.value.finishedAt || null,
  });
  if (isEdit.value) updateActiveTour(activeTour);
  else addActiveTour(activeTour);
  navigateBack();
}
</script>

<template>
  <section class="active-tour-form-page page-shell" aria-labelledby="active-tour-form-title">
    <div class="active-tour-form-card surface-card">
      <header class="active-tour-form-header">
        <span class="active-tour-form-icon" aria-hidden="true"><i class="pi pi-compass"></i></span>
        <div>
          <p class="active-tour-form-eyebrow">{{ t("activeTours.list-title") }}</p>
          <h1 id="active-tour-form-title" class="page-heading">
            {{ isEdit ? t("activeTours.edit") : t("activeTours.new") }}
          </h1>
          <p class="page-description">{{ t("activeTour.form-description") }}</p>
        </div>
      </header>

      <form class="active-tour-form" novalidate @submit.prevent="saveActiveTour">
        <div class="active-tour-field active-tour-field--wide">
          <label for="active-tour-tour">{{ t("activeTour.tour") }} <span aria-hidden="true">*</span></label>
          <pv-select
              id="active-tour-tour"
              v-model="form.tourId"
              :options="tours"
              option-label="title"
              option-value="id"
              :loading="!toursLoaded || !checkpointsLoaded"
              :disabled="!toursLoaded || !tours.length"
              :placeholder="toursLoaded && !tours.length ? t('activeTour.no-tours') : t('activeTour.select-tour')"
              required
              class="w-full"
              @update:model-value="onTourChange"
              :aria-invalid="submitted && !form.tourId"
              aria-describedby="active-tour-tour-hint"
          />
          <small id="active-tour-tour-hint">{{ t("activeTour.tour-hint") }}</small>
          <small v-if="submitted && !form.tourId" class="active-tour-field-error" role="alert">
            {{ t("activeTour.error.tour-required") }}
          </small>
        </div>

        <div class="active-tour-field active-tour-field--wide">
          <label for="active-tour-schedule">{{ t("activeTour.schedule") }} <span aria-hidden="true">*</span></label>
          <pv-select
              id="active-tour-schedule"
              v-model="form.tourScheduleId"
              :options="availableSchedules"
              option-label="label"
              option-value="id"
              :loading="!tourSchedulesLoaded"
              :disabled="!tourSchedulesLoaded || !form.tourId || !availableSchedules.length"
              :placeholder="!form.tourId ? t('activeTour.select-tour-first') : t('activeTour.no-schedules-for-tour')"
              required
              class="w-full"
              :aria-invalid="submitted && !form.tourScheduleId"
              aria-describedby="active-tour-schedule-hint"
          />
          <small id="active-tour-schedule-hint">{{ t("activeTour.schedule-hint") }}</small>
          <small v-if="submitted && scheduleSelectionInvalid" class="active-tour-field-error" role="alert">
            {{ t(hasSchedulesForTour ? "activeTour.error.schedule-required" : "activeTour.no-schedules-for-tour") }}
          </small>
        </div>

        <div class="active-tour-field active-tour-field--wide">
          <label for="active-tour-guide">{{ t("activeTour.guide") }} <span aria-hidden="true">*</span></label>
          <pv-select
              id="active-tour-guide"
              v-model="form.guideId"
              :options="guideOptions"
              option-label="displayName"
              option-value="id"
              :loading="!guidesLoaded || !usersLoaded"
              :disabled="!guidesLoaded || !usersLoaded || !guideOptions.length"
              :placeholder="guideOptions.length ? t('activeTour.select-guide') : t('activeTour.no-guides')"
              required
              class="w-full"
              :aria-invalid="submitted && !form.guideId"
              aria-describedby="active-tour-guide-hint"
          />
          <small id="active-tour-guide-hint">{{ t("activeTour.guide-hint") }}</small>
          <small v-if="submitted && !form.guideId" class="active-tour-field-error" role="alert">
            {{ t("activeTour.error.guide-required") }}
          </small>
        </div>

        <div class="active-tour-field">
          <label for="active-tour-status">{{ t("activeTour.status") }} <span aria-hidden="true">*</span></label>
          <pv-input-text
              id="active-tour-status"
              v-model="form.status"
              required
              autocomplete="off"
              class="w-full"
              :aria-invalid="submitted && !form.status.trim()"
          />
          <small v-if="submitted && !form.status.trim()" class="active-tour-field-error" role="alert">
            {{ t("activeTour.error.status-required") }}
          </small>
        </div>

        <div class="active-tour-field">
          <label for="active-tour-started-at">{{ t("activeTour.startedAt") }} <span aria-hidden="true">*</span></label>
          <input
              id="active-tour-started-at"
              v-model="form.startedAt"
              type="datetime-local"
              class="form-control"
              required
              :aria-invalid="submitted && !form.startedAt"
          >
          <small v-if="submitted && !form.startedAt" class="active-tour-field-error" role="alert">
            {{ t("activeTour.error.startedAt-required") }}
          </small>
        </div>

        <fieldset class="active-tour-location active-tour-field--wide">
          <legend>{{ t("activeTour.current-location") }} <span aria-hidden="true">*</span></legend>
          <p class="active-tour-location__hint">
            {{ checkpointsLoaded ? t("activeTour.location-hint") : t("activeTour.loading-checkpoints") }}
          </p>
          <div class="active-tour-location__fields">
            <div class="active-tour-field">
              <label for="active-tour-latitude">{{ t("activeTour.currentLatitude") }}</label>
              <input
                  id="active-tour-latitude"
                  v-model="form.currentLatitude"
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  class="form-control"
                  required
                  :aria-invalid="submitted && (form.currentLatitude === '' || Number(form.currentLatitude) < -90 || Number(form.currentLatitude) > 90)"
              >
            </div>
            <div class="active-tour-field">
              <label for="active-tour-longitude">{{ t("activeTour.currentLongitude") }}</label>
              <input
                  id="active-tour-longitude"
                  v-model="form.currentLongitude"
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  class="form-control"
                  required
                  :aria-invalid="submitted && (form.currentLongitude === '' || Number(form.currentLongitude) < -180 || Number(form.currentLongitude) > 180)"
              >
            </div>
          </div>
          <small
              v-if="submitted && (coordinatesMissing || coordinatesInvalid)"
              class="active-tour-field-error"
              role="alert"
          >
            {{ t(coordinatesMissing ? "activeTour.error.coordinates-required" : "activeTour.error.coordinates-range") }}
          </small>
        </fieldset>

        <div class="active-tour-field active-tour-field--wide">
          <label for="active-tour-finished-at">{{ t("activeTour.finishedAt") }}</label>
          <input
              id="active-tour-finished-at"
              v-model="form.finishedAt"
              type="datetime-local"
              class="form-control"
              aria-describedby="active-tour-finished-hint"
          >
          <small id="active-tour-finished-hint">{{ t("activeTour.finishedAt-hint") }}</small>
        </div>

        <div class="active-tour-form-actions">
          <pv-button
              type="submit"
              :label="isEdit ? t('activeTour.update') : t('activeTour.create')"
              icon="pi pi-save"
              :disabled="!hasTours || !guidesLoaded || !usersLoaded || !tourSchedulesLoaded"
          />
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

      <div v-if="formErrors.length" class="active-tour-form-error" role="alert">
        {{ t("activeTour.form-error") }}: {{ formErrors.map(error => error.message).join(", ") }}
      </div>
    </div>
  </section>
</template>

<style scoped>
.active-tour-form-page {
  max-width: 64rem;
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

.active-tour-field label,
.active-tour-location legend {
  color: var(--tm-text);
  font-size: 0.9rem;
  font-weight: 650;
}

.active-tour-field label span,
.active-tour-location legend span {
  color: var(--tm-danger);
}

.active-tour-field small,
.active-tour-location__hint {
  color: var(--tm-muted);
  line-height: 1.45;
}

.active-tour-field--wide,
.active-tour-form-actions {
  grid-column: 1 / -1;
}

.active-tour-location {
  display: grid;
  min-width: 0;
  gap: 0.75rem;
  margin: 0;
  padding: 1rem;
  border: 1px solid var(--tm-border);
  border-radius: 0.8rem;
}

.active-tour-location legend {
  padding-inline: 0.35rem;
}

.active-tour-location__hint {
  margin: 0;
  font-size: 0.85rem;
}

.active-tour-location__fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.active-tour-form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  padding-top: 0.5rem;
}

.active-tour-form-error,
.active-tour-field-error {
  color: var(--tm-danger) !important;
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
.active-tour-form :deep(.p-select:focus-within),
.active-tour-form .form-control:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--tm-focus) 35%, transparent);
  outline-offset: 1px;
}

[aria-invalid="true"] {
  border-color: var(--tm-danger) !important;
}

@media (max-width: 600px) {
  .active-tour-form {
    grid-template-columns: 1fr;
  }

  .active-tour-field--wide,
  .active-tour-form-actions {
    grid-column: auto;
  }

  .active-tour-location__fields {
    grid-template-columns: 1fr;
  }

  .active-tour-form-actions :deep(.p-button) {
    flex: 1 1 100%;
    justify-content: center;
  }
}
</style>
