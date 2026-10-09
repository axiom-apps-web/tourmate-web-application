<script setup>
import {computed, onMounted} from "vue";
import {storeToRefs} from "pinia";
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import {useConfirm} from "primevue";
import useTourMonitoringStore from "../../application/tour-monitoring.store.js";
import useTourManagementStore from "../../../tour-management/application/tour-management.store.js";
import useIamStore from "../../../iam/application/iam.store.js";

const {t} = useI18n();
const router = useRouter();
const confirm = useConfirm();

const monitoringStore = useTourMonitoringStore();
const tourManagementStore = useTourManagementStore();
const iamStore = useIamStore();

const {activeTours, activeToursLoaded, errors: monitoringErrors} = storeToRefs(monitoringStore);
const {tours, toursLoaded, tourSchedules, tourSchedulesLoaded, errors: tourErrors} =
    storeToRefs(tourManagementStore);
const {tourGuides, tourGuidesLoaded, users, usersLoaded, errors: iamErrors} = storeToRefs(iamStore);

const errors = computed(() => [
  ...monitoringErrors.value,
  ...tourErrors.value,
  ...iamErrors.value
]);

const isLoading = computed(() => {
  const allDataLoaded =
      activeToursLoaded.value &&
      toursLoaded.value &&
      tourSchedulesLoaded.value &&
      tourGuidesLoaded.value &&
      usersLoaded.value;

  return !allDataLoaded && errors.value.length === 0;
});

onMounted(() => {
  if (!activeToursLoaded.value) monitoringStore.fetchActiveTours();
  if (!toursLoaded.value) tourManagementStore.fetchTours();
  if (!tourSchedulesLoaded.value) tourManagementStore.fetchTourSchedules();
  if (!tourGuidesLoaded.value) iamStore.fetchTourGuides();
  if (!usersLoaded.value) iamStore.fetchUsers();
});

function findById(items, id) {
  if (id === null || id === undefined) return undefined;
  return items.find(item => String(item.id) === String(id));
}

function getTourTitle(activeTour) {
  const schedule = findById(tourSchedules.value, activeTour.tourScheduleId);
  const tour = findById(tours.value, schedule?.tourId);
  return tour?.details?.title || `${t('activeTours.tourTitle')} #${schedule?.tourId ?? activeTour.tourScheduleId ?? '—'}`;
}

function getGuideName(guideId) {
  const guide = findById(tourGuides.value, guideId);
  const user = guide?.user ?? findById(users.value, guide?.userId);
  const name = [user?.firstName, user?.lastName]
      .filter(Boolean)
      .join(' ');
  return name || '—';
}

function getMaximumCapacity(tourScheduleId) {
  return findById(tourSchedules.value, tourScheduleId)?.maxCapacity ?? '—';
}

function navigateToNew() {
  router.push({name: 'tour-monitoring-active-tour-new'});
}

function navigateToEdit(id) {
  router.push({name: 'tour-monitoring-active-tour-edit', params: {id}});
}

function confirmDelete(activeTour) {
  confirm.require({
    message: t('activeTours.delete_confirm'),
    header: t('activeTours.delete'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => monitoringStore.deleteActiveTour(activeTour),
  });
}
</script>

<template>
  <section class="active-tours" aria-labelledby="active-tours-title">
    <header class="active-tours__header">
      <div>
        <p class="active-tours__eyebrow">{{ t('activeTours.list-title') }}</p>
        <h1 id="active-tours-title">{{ t('activeTours.list-title') }}</h1>
        <p class="active-tours__description">{{ t('activeTours.list-description') }}</p>
      </div>
      <pv-button
          :label="t('activeTours.new')"
          icon="pi pi-plus"
          class="active-tours__new-button"
          @click="navigateToNew"
      />
    </header>

    <p class="active-tours__count" aria-live="polite">
      {{ t('activeTours.card_count', {count: activeTours.length}) }}
    </p>

    <p v-if="isLoading" class="active-tours__status" role="status" aria-live="polite">
      <i class="pi pi-spin pi-spinner" aria-hidden="true"></i>
      {{ t('loading') }}
    </p>

    <div
        v-else-if="activeTours.length"
        class="active-tours__grid"
        :aria-label="t('activeTours.list-title')"
    >
      <article
          v-for="activeTour in activeTours"
          :key="activeTour.id"
          class="tour-card"
          :aria-labelledby="`active-tour-title-${activeTour.id}`"
      >
        <div class="tour-card__top">
          <span class="tour-card__status">
            <span class="tour-card__status-dot" aria-hidden="true"></span>
            {{ activeTour.status || '—' }}
          </span>
          <span class="tour-card__id">#{{ activeTour.id }}</span>
        </div>

        <h2 :id="`active-tour-title-${activeTour.id}`" class="tour-card__title">
          {{ getTourTitle(activeTour) }}
        </h2>

        <dl class="tour-card__details">
          <div class="tour-card__detail">
            <dt>
              <i class="pi pi-user" aria-hidden="true"></i>
              {{ t('activeTours.assigned-guide') }}
            </dt>
            <dd>{{ getGuideName(activeTour.guideId) }}</dd>
          </div>
          <div class="tour-card__detail">
            <dt>
              <i class="pi pi-users" aria-hidden="true"></i>
              {{ t('activeTours.max_capacity') }}
            </dt>
            <dd>{{ getMaximumCapacity(activeTour.tourScheduleId) }}</dd>
          </div>
        </dl>

        <div class="tour-card__actions">
          <pv-button
              icon="pi pi-pencil"
              text
              rounded
              :aria-label="`${t('activeTours.edit')} ${activeTour.id}`"
              @click="navigateToEdit(activeTour.id)"
          />
          <pv-button
              icon="pi pi-trash"
              text
              rounded
              severity="danger"
              :aria-label="`${t('activeTours.delete')} ${activeTour.id}`"
              @click="confirmDelete(activeTour)"
          />
        </div>
      </article>
    </div>

    <div v-else class="active-tours__empty">
      <span class="active-tours__empty-icon" aria-hidden="true">
        <i class="pi pi-map"></i>
      </span>
      <h2>{{ t('activeTours.empty-title') }}</h2>
      <p>{{ t('activeTours.empty-description') }}</p>
      <pv-button :label="t('activeTours.new')" icon="pi pi-plus" @click="navigateToNew" />
    </div>

    <div v-if="errors.length" class="active-tours__errors" role="alert">
      {{ t('errors.occurred') }}: {{ errors.map(error => error.message).join(', ') }}
    </div>

    <pv-confirm-dialog />
  </section>
</template>

<style scoped>
.active-tours {
  --active-page: #f4f8f3;
  --active-surface: #ffffff;
  --active-text: #17251c;
  --active-muted: #45574a;
  --active-accent: #25633b;
  --active-accent-soft: #e6f1e7;
  --active-border: #c4d4c6;
  --active-error: #b42318;
  color-scheme: light;
  color: var(--active-text);
  background: var(--active-page);
  border-radius: 1.25rem;
  max-width: 1440px;
  margin: 0 auto;
  padding: clamp(1rem, 4vw, 2.5rem);
}

.active-tours,
.active-tours * {
  box-sizing: border-box;
}

.active-tours__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 1.25rem;
}

.active-tours__eyebrow {
  margin: 0 0 0.35rem;
  color: var(--active-accent);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.active-tours__header h1 {
  margin: 0;
  color: var(--active-text);
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  letter-spacing: -0.035em;
}

.active-tours__description {
  max-width: 42rem;
  margin: 0.55rem 0 0;
  color: var(--active-muted);
  line-height: 1.6;
}

.active-tours__new-button {
  flex: 0 0 auto;
}

.active-tours__count {
  margin: 1.75rem 0 1rem;
  color: var(--active-muted);
  font-size: 0.9rem;
}

.active-tours__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  gap: 1.15rem;
}

.tour-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  padding: 1.35rem;
  overflow-wrap: anywhere;
  border: 1px solid var(--active-border);
  border-radius: 1.15rem;
  background: var(--active-surface);
  box-shadow: 0 8px 24px rgb(15 23 42 / 7%);
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
}

.tour-card:hover {
  transform: translateY(-3px);
  border-color: var(--active-accent);
  box-shadow: 0 14px 32px rgb(15 23 42 / 14%);
}

.tour-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.tour-card__status {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  background: var(--active-accent-soft);
  color: var(--active-accent);
  font-size: 0.76rem;
  font-weight: 650;
  text-transform: capitalize;
}

.tour-card__status-dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: currentColor;
}

.tour-card__id {
  color: var(--active-muted);
  font-size: 0.85rem;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.tour-card__title {
  margin: 1.1rem 0 1.25rem;
  color: var(--active-text);
  font-size: 1.25rem;
  line-height: 1.35;
}

.tour-card__details {
  display: grid;
  gap: 1rem;
  margin: 0;
}

.tour-card__detail {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.tour-card__detail dt {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: var(--active-muted);
  font-size: 0.85rem;
}

.tour-card__detail dt i {
  color: var(--active-accent);
}

.tour-card__detail dd {
  margin: 0;
  color: var(--active-text);
  font-size: 0.9rem;
  font-weight: 600;
  text-align: right;
}

.tour-card__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.35rem;
  margin-top: 1.25rem;
  padding-top: 0.85rem;
  border-top: 1px solid var(--active-border);
}

.tour-card__actions :deep(.p-button:focus-visible),
.active-tours__new-button:focus-visible {
  outline: 3px solid var(--active-accent);
  outline-offset: 3px;
}

.tour-card__actions :deep(.p-button:not(.p-button-danger)) {
  color: var(--active-muted);
}

.tour-card__actions :deep(.p-button-danger) {
  color: var(--active-error);
}

.tour-card__actions :deep(.p-button:hover) {
  background: var(--active-accent-soft);
}

.active-tours__status,
.active-tours__empty {
  display: grid;
  justify-items: center;
  gap: 0.8rem;
  padding: clamp(2rem, 8vw, 4rem) 1.25rem;
  color: var(--active-muted);
  text-align: center;
}

.active-tours__status {
  display: flex;
  justify-content: center;
}

.active-tours__empty h2 {
  margin: 0;
  color: var(--active-text);
}

.active-tours__empty p {
  max-width: 32rem;
  margin: 0 0 0.5rem;
  line-height: 1.6;
}

.active-tours__empty-icon {
  display: grid;
  width: 3.5rem;
  height: 3.5rem;
  place-items: center;
  border-radius: 1.1rem;
  background: var(--active-accent-soft);
  color: var(--active-accent);
  font-size: 1.4rem;
}

.active-tours__errors {
  margin-top: 1.25rem;
  color: var(--active-error);
}

@media (prefers-color-scheme: dark) {
  .active-tours {
    --active-page: #101a13;
    --active-surface: #1b2a1f;
    --active-text: #f1f7f1;
    --active-muted: #c5d4c7;
    --active-accent: #9bd3a4;
    --active-accent-soft: #293f2e;
    --active-border: #4c6651;
    --active-error: #fca5a5;
    color-scheme: dark;
  }

  .tour-card {
    box-shadow: 0 8px 24px rgb(0 0 0 / 24%);
  }

  .tour-card:hover {
    box-shadow: 0 14px 32px rgb(0 0 0 / 38%);
  }

  .tour-card__actions :deep(.p-button-danger:hover) {
    background: #512b36;
  }
}

@media (max-width: 600px) {
  .active-tours__header {
    align-items: stretch;
    flex-direction: column;
  }

  .active-tours__new-button {
    align-self: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tour-card {
    transition: none;
  }

  .tour-card:hover {
    transform: none;
  }
}
</style>
