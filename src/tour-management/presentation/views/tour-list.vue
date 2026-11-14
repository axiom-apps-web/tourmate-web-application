<script setup>
import {onMounted, ref, toRefs} from "vue";
import useTourManagementStore from "../../application/tour-management.store.js";
import {useI18n} from "vue-i18n";
import {useConfirm} from "primevue";
import TourItem from "../components/tour-item.vue";
import {useRouter} from "vue-router";
import {TourSchedule} from "../../domain/model/tour-schedule.entity.js";

const store = useTourManagementStore();
const router = useRouter();
const confirm = useConfirm();
const {t} = useI18n();
const {tours, tourSchedules, errors, toursLoaded, tourSchedulesLoaded} = toRefs(store);
const {fetchTours, fetchTourSchedules, deleteTour, addTourSchedule, updateTourSchedule, deleteTourSchedule} = store;
const scheduleDialogVisible = ref(false);
const scheduleSaving = ref(false);
const editingScheduleId = ref(null);
const scheduleForm = ref({tourId: null, departureDateTime: '', maxCapacity: 1, status: 'SCHEDULED'});

onMounted(() => {
  if (!toursLoaded.value) fetchTours();
  if (!tourSchedulesLoaded.value) fetchTourSchedules();
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

function localDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = number => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function openNewSchedule() {
  editingScheduleId.value = null;
  scheduleForm.value = {tourId: null, departureDateTime: '', maxCapacity: 1, status: 'SCHEDULED'};
  scheduleDialogVisible.value = true;
}

function openEditSchedule(schedule) {
  editingScheduleId.value = schedule.id;
  scheduleForm.value = {
    tourId: schedule.tourId,
    departureDateTime: localDateTime(schedule.departureDateTime),
    maxCapacity: schedule.maxCapacity,
    status: schedule.status
  };
  scheduleDialogVisible.value = true;
}

async function saveSchedule() {
  if (!scheduleForm.value.tourId || !scheduleForm.value.departureDateTime ||
      !Number.isFinite(Number(scheduleForm.value.maxCapacity)) ||
      Number(scheduleForm.value.maxCapacity) < 1 || !scheduleForm.value.status.trim()) return;
  scheduleSaving.value = true;
  const schedule = new TourSchedule({
    id: editingScheduleId.value,
    tourId: Number(scheduleForm.value.tourId),
    departureDateTime: new Date(scheduleForm.value.departureDateTime).toISOString(),
    maxCapacity: Number(scheduleForm.value.maxCapacity),
    status: scheduleForm.value.status.trim()
  });
  const saved = editingScheduleId.value
      ? await updateTourSchedule(schedule)
      : await addTourSchedule(schedule);
  scheduleSaving.value = false;
  if (saved) scheduleDialogVisible.value = false;
}

function confirmDeleteSchedule(schedule) {
  confirm.require({
    message: t('tour_schedules.delete_schedule_confirm', {tour: getTourTitle(schedule.tourId)}),
    header: t('tour_schedules.delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => deleteTourSchedule(schedule)
  });
}

function getTourTitle(tourId) {
  return tours.value.find(tour => String(tour.id) === String(tourId))?.title || `Tour #${tourId}`;
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
      <div class="catalog-header__actions">
        <pv-button :label="t('tour_schedules.manage')" icon="pi pi-calendar" severity="secondary" outlined :disabled="!toursLoaded || !tours.length" @click="openNewSchedule" />
        <pv-button :label="t('tours.new')" icon="pi pi-plus" @click="navigateToNew" />
      </div>
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

    <pv-dialog v-model:visible="scheduleDialogVisible" modal :header="editingScheduleId ? t('tour_schedules.edit_title') : t('tour_schedules.new_title')" :style="{width: 'min(34rem, 94vw)'}">
      <form class="schedule-form" @submit.prevent="saveSchedule">
        <label for="schedule-tour">{{ t('activeTour.tour') }}</label>
        <select id="schedule-tour" v-model="scheduleForm.tourId" required>
          <option :value="null" disabled>{{ t('tour_schedules.select_tour') }}</option>
          <option v-for="tour in tours" :key="tour.id" :value="tour.id">{{ tour.title }}</option>
        </select>
        <label for="schedule-departure">{{ t('tour_schedules.departure_date_time') }}</label>
        <input id="schedule-departure" v-model="scheduleForm.departureDateTime" type="datetime-local" required>
        <label for="schedule-capacity">{{ t('tour_schedules.max_capacity') }}</label>
        <input id="schedule-capacity" v-model.number="scheduleForm.maxCapacity" type="number" min="1" required>
        <label for="schedule-status">{{ t('tour_schedules.status') }}</label>
        <input id="schedule-status" v-model.trim="scheduleForm.status" required>
        <div class="schedule-form__actions">
          <pv-button type="submit" :label="editingScheduleId ? t('tour_schedules.save_changes') : t('tour_schedules.create_schedule')" icon="pi pi-save" :loading="scheduleSaving" />
          <pv-button type="button" :label="t('common.cancel')" severity="secondary" outlined @click="scheduleDialogVisible = false" />
        </div>
      </form>
    </pv-dialog>
  </section>
  <section class="schedule-panel surface-card" aria-labelledby="schedule-panel-title">
    <header class="schedule-panel__header">
      <h2 id="schedule-panel-title">{{ t('tour_schedules.manage_title') }}</h2>
      <pv-button :label="t('tour_schedules.add_schedule')" icon="pi pi-plus" size="small" :disabled="!toursLoaded || !tours.length" @click="openNewSchedule" />
    </header>
    <p v-if="!tourSchedulesLoaded && !errors.length" role="status">{{ t('tour_schedules.loading_schedules') }}</p>
    <p v-else-if="!tourSchedules.length && !errors.length">{{ t('tour_schedules.no_schedules_created') }}</p>
    <div v-else class="schedule-list">
      <article v-for="schedule in tourSchedules" :key="schedule.id" class="schedule-row">
        <div>
          <strong>{{ getTourTitle(schedule.tourId) }}</strong>
          <span>{{ t('tour_schedules.schedule_summary', {departure: schedule.departureDateTime, capacity: schedule.maxCapacity, status: schedule.status}) }}</span>
        </div>
        <div class="schedule-row__actions">
          <pv-button icon="pi pi-pencil" :label="t('common.edit')" text @click="openEditSchedule(schedule)" />
          <pv-button icon="pi pi-trash" :label="t('common.delete')" severity="danger" text @click="confirmDeleteSchedule(schedule)" />
        </div>
      </article>
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

.catalog-header__actions,
.schedule-panel__header,
.schedule-row,
.schedule-row__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.catalog-header__actions,
.schedule-panel__header,
.schedule-row {
  justify-content: space-between;
}

.schedule-panel {
  display: grid;
  gap: 0.85rem;
  padding: 1rem;
}

.schedule-panel h2 {
  margin: 0;
  color: var(--tm-text);
  font-size: 1.1rem;
}

.schedule-list {
  display: grid;
  gap: 0.6rem;
}

.schedule-row {
  padding: 0.75rem 0;
  border-top: 1px solid var(--tm-border);
}

.schedule-row > div:first-child {
  display: grid;
  gap: 0.25rem;
}

.schedule-row span {
  color: var(--tm-muted);
  font-size: 0.9rem;
}

.schedule-form {
  display: grid;
  gap: 0.55rem;
}

.schedule-form input,
.schedule-form select {
  min-height: 2.6rem;
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--tm-border);
  border-radius: 0.5rem;
  background: var(--tm-surface);
  color: var(--tm-text);
}

.schedule-form label {
  margin-top: 0.3rem;
  color: var(--tm-text);
  font-weight: 600;
}

.schedule-form__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.75rem;
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

  .catalog-header__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .catalog-header > :deep(.p-button) {
    align-self: flex-start;
  }

  .catalog-header__actions :deep(.p-button) {
    justify-content: center;
  }

  .schedule-row {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>