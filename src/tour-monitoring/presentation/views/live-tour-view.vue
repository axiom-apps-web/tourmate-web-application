<script setup>
import {computed, onMounted, ref} from "vue";
import {storeToRefs} from "pinia";
import {useI18n} from "vue-i18n";
import {useRoute} from "vue-router";
import useTourMonitoringStore from "../../application/tour-monitoring.store.js";
import useTourManagementStore from "../../../tour-management/application/tour-management.store.js";
import useIamStore from "../../../iam/application/iam.store.js";
import {Participant} from "../../domain/model/participant.entity.js";

const route = useRoute();
const {t, locale} = useI18n();
const monitoringStore = useTourMonitoringStore();
const tourManagementStore = useTourManagementStore();
const iamStore = useIamStore();

const {activeTours, activeToursLoaded, participants, participantsLoaded, errors: monitoringErrors} =
    storeToRefs(monitoringStore);
const {tours, toursLoaded, tourSchedules, tourSchedulesLoaded, errors: tourErrors} =
    storeToRefs(tourManagementStore);
const {tourGuides, tourGuidesLoaded, users, usersLoaded, errors: iamErrors} = storeToRefs(iamStore);

const participantSearch = ref('');
const participantDialogVisible = ref(false);
const participantSaving = ref(false);
const editingParticipantId = ref(null);
const participantForm = ref({userId: null, joinedAt: ''});
const errors = computed(() => [
  ...monitoringErrors.value,
  ...tourErrors.value,
  ...iamErrors.value
]);
const allDataLoaded = computed(() =>
  activeToursLoaded.value &&
      participantsLoaded.value &&
      toursLoaded.value &&
      tourSchedulesLoaded.value &&
      tourGuidesLoaded.value &&
      usersLoaded.value
);
const isLoading = computed(() => !allDataLoaded.value && errors.value.length === 0);

const activeTour = computed(() =>
    activeTours.value.find(expedition =>
        String(expedition.id) === String(route.params.activeTourId)
    )
);

const schedule = computed(() =>
    tourSchedules.value.find(item => String(item.id) === String(activeTour.value?.tourScheduleId))
);

const tour = computed(() =>
    tours.value.find(item => String(item.id) === String(schedule.value?.tourId))
);

const isExpeditionActive = computed(() =>
    Boolean(activeTour.value) &&
    !activeTour.value.finishedAt &&
    !['finished', 'completed', 'closed'].includes(String(activeTour.value.status).toLowerCase())
);

const expeditionParticipants = computed(() =>
    participants.value.filter(participant =>
        String(participant.tourScheduleId) === String(activeTour.value?.tourScheduleId)
    )
);

const guideName = computed(() => {
  const guide = tourGuides.value.find(item => String(item.id) === String(activeTour.value?.guideId));
  const user = guide?.user ?? users.value.find(item => String(item.id) === String(guide?.userId));
  return [user?.firstName, user?.lastName].filter(Boolean).join(' ') || t('liveMonitoring.guide_unassigned');
});

function participantName(participant) {
  const user = participant.user ??
      users.value.find(item => String(item.id) === String(participant.userId));
  return [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
      t('liveMonitoring.participant_id', {id: participant.id});
}

const filteredParticipants = computed(() => {
  const query = participantSearch.value.trim().toLocaleLowerCase(locale.value);
  if (!query) return expeditionParticipants.value;
  return expeditionParticipants.value.filter(participant =>
      participantName(participant).toLocaleLowerCase(locale.value).includes(query)
  );
});

function formatCoordinates(latitude, longitude) {
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    return t('liveMonitoring.location_unavailable');
  }
  const coordinates = [Number(latitude), Number(longitude)];
  if (!coordinates.every(Number.isFinite)) return t('liveMonitoring.location_unavailable');
  return coordinates.map(value => value.toFixed(5)).join(', ');
}

function formatJoinedAt(value) {
  if (!value) return t('liveMonitoring.joined_date_unavailable');
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return t('liveMonitoring.joined_date_unavailable');
  return new Intl.DateTimeFormat(locale.value, {dateStyle: 'medium'}).format(date);
}

function toLocalDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = number => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function openNewParticipant() {
  editingParticipantId.value = null;
  participantForm.value = {userId: null, joinedAt: toLocalDateTime(new Date().toISOString())};
  participantDialogVisible.value = true;
}

function openEditParticipant(participant) {
  editingParticipantId.value = participant.id;
  participantForm.value = {userId: participant.userId, joinedAt: toLocalDateTime(participant.joinedAt)};
  participantDialogVisible.value = true;
}

async function saveParticipant() {
  if (!participantForm.value.userId || !participantForm.value.joinedAt || !activeTour.value) return;
  participantSaving.value = true;
  const participant = new Participant({
    id: editingParticipantId.value,
    userId: Number(participantForm.value.userId),
    joinedAt: new Date(participantForm.value.joinedAt).toISOString(),
    tourScheduleId: activeTour.value.tourScheduleId
  });
  const saved = editingParticipantId.value
      ? await monitoringStore.updateParticipant(participant)
      : await monitoringStore.addParticipant(participant);
  participantSaving.value = false;
  if (saved) participantDialogVisible.value = false;
}

async function removeParticipant(participant) {
  if (window.confirm(t('liveMonitoring.remove_participant_confirmation', {name: participantName(participant)}))) {
    await monitoringStore.deleteParticipant(participant);
  }
}

onMounted(() => {
  if (!activeToursLoaded.value) monitoringStore.fetchActiveTours();
  if (!participantsLoaded.value) monitoringStore.fetchParticipants();
  if (!toursLoaded.value) tourManagementStore.fetchTours();
  if (!tourSchedulesLoaded.value) tourManagementStore.fetchTourSchedules();
  if (!tourGuidesLoaded.value) iamStore.fetchTourGuides();
  if (!usersLoaded.value) iamStore.fetchUsers();
});
</script>

<template>
  <section class="live-tour page-shell" aria-labelledby="live-tour-title">
    <header class="live-tour__header">
      <div>
        <router-link class="live-tour__back" :to="{name: 'tour-monitoring-active-tours'}">
          <i class="pi pi-arrow-left" aria-hidden="true"></i>
          {{ t('liveMonitoring.back_to_tours') }}
        </router-link>
        <p class="live-tour__eyebrow">{{ t('liveMonitoring.route_label') }}</p>
        <h1 id="live-tour-title" class="page-heading">
          {{ tour?.title || t('liveMonitoring.live_title') }}
        </h1>
      </div>
      <span v-if="activeTour" class="live-tour__status" :class="{'live-tour__status--finished': !isExpeditionActive}">
        <span aria-hidden="true"></span>
        {{ t(isExpeditionActive ? 'liveMonitoring.expedition_active' : 'liveMonitoring.expedition_finished') }}
      </span>
    </header>

    <p v-if="isLoading" class="live-tour__message" role="status" aria-live="polite">
      <i class="pi pi-spin pi-spinner" aria-hidden="true"></i>
      {{ t('liveMonitoring.loading_route') }}
    </p>

    <div v-else-if="errors.length && !allDataLoaded" class="live-tour__message live-tour__message--error" role="alert">
      {{ t('liveMonitoring.load_error') }}: {{ errors.map(error => error.message).join(', ') }}
    </div>

    <template v-else>
    <div v-if="errors.length" class="live-tour__message live-tour__message--error" role="alert">
      {{ t('liveMonitoring.load_error') }}: {{ errors.map(error => error.message).join(', ') }}
    </div>

    <div v-if="!activeTour || !tour" class="live-tour__empty">
      <i class="pi pi-map" aria-hidden="true"></i>
      <h2>{{ t('liveMonitoring.tour_unavailable') }}</h2>
      <p>{{ t('liveMonitoring.tour_unavailable_hint') }}</p>
    </div>

    <template v-else>
      <div class="live-tour__toolbar">
        <div class="live-tour__route-name">
          <span>{{ t('liveMonitoring.route_label') }}</span>
          <strong>{{ tour.title }}</strong>
        </div>
        <p class="live-tour__guide">
          <i class="pi pi-user" aria-hidden="true"></i>
          <span>{{ t('liveMonitoring.guide') }}: <strong>{{ guideName }}</strong></span>
        </p>
      </div>

      <div class="live-tour__layout">
        <section class="live-map surface-card" :aria-labelledby="'live-map-title'">
          <header class="live-map__header">
            <div>
              <h2 id="live-map-title">{{ t('liveMonitoring.map_title') }}</h2>
              <p>{{ t('liveMonitoring.latest_position') }}</p>
            </div>
            <span class="live-map__coordinates">
              <i class="pi pi-map-marker" aria-hidden="true"></i>
              {{ formatCoordinates(activeTour?.currentLatitude, activeTour?.currentLongitude) }}
            </span>
          </header>
          <div
              class="live-map__canvas"
              role="img"
              :aria-label="t('liveMonitoring.position_map_description', {
                tour: tour.title,
                coordinates: formatCoordinates(activeTour?.currentLatitude, activeTour?.currentLongitude)
              })"
          >
            <div class="live-map__surface-lines" aria-hidden="true"></div>
            <span
                v-if="activeTour?.currentLatitude != null && activeTour?.currentLongitude != null"
                class="live-map__marker"
                aria-hidden="true"
            >
              <i class="pi pi-map-marker"></i>
            </span>
            <div v-else class="live-map__no-position">
              <i class="pi pi-map-marker" aria-hidden="true"></i>
              <span>{{ t('liveMonitoring.location_unavailable') }}</span>
            </div>
            <span class="live-map__position-label">
              <i class="pi pi-circle-fill" aria-hidden="true"></i>
              {{ t('liveMonitoring.current_position') }}
            </span>
          </div>
          <footer class="live-map__legend">
            <span><i class="pi pi-circle-fill" aria-hidden="true"></i>{{ t('liveMonitoring.current_position') }}</span>
            <span>{{ t('liveMonitoring.map_data_notice') }}</span>
          </footer>
        </section>

        <aside class="live-participants surface-card" :aria-labelledby="'live-participants-title'">
          <header class="live-participants__header">
            <div>
              <h2 id="live-participants-title">{{ t('liveMonitoring.participants_heading') }}</h2>
              <p>{{ t('liveMonitoring.participant_count', {count: expeditionParticipants.length}) }}</p>
            </div>
            <span class="live-participants__expedition-id">
              {{ t('liveMonitoring.expedition_id', {id: activeTour.id}) }}
            </span>
            <pv-button :label="t('liveMonitoring.add_participant_action')" icon="pi pi-user-plus" size="small" @click="openNewParticipant" />
          </header>

          <label class="live-participants__search">
            <span class="sr-only">{{ t('liveMonitoring.search_participants') }}</span>
            <i class="pi pi-search" aria-hidden="true"></i>
            <input
                v-model="participantSearch"
                type="search"
                :placeholder="t('liveMonitoring.search_participants')"
                :aria-label="t('liveMonitoring.search_participants')"
                class="form-control"
            >
          </label>

          <p v-if="!expeditionParticipants.length" class="live-participants__empty">
            {{ t('liveMonitoring.no_participants') }}
          </p>
          <p v-else-if="!filteredParticipants.length" class="live-participants__empty" role="status">
            {{ t('liveMonitoring.no_search_results') }}
          </p>
          <ul v-else class="live-participants__list">
            <li v-for="participant in filteredParticipants" :key="participant.id" class="participant-card">
              <div class="participant-card__header">
                <h3>{{ participantName(participant) }}</h3>
                <span class="participant-card__status">
                  <i class="pi pi-circle-fill" aria-hidden="true"></i>
                  {{ t('liveMonitoring.participant_on_tour') }}
                </span>
              </div>
              <p class="participant-card__id">
                {{ t('liveMonitoring.participant_id', {id: participant.id}) }}
              </p>
              <div class="participant-card__telemetry">
                <i class="pi pi-heart" aria-hidden="true"></i>
                <span>{{ t('liveMonitoring.telemetry_unavailable_short') }}</span>
              </div>
              <p class="participant-card__joined">
                {{ t('liveMonitoring.joined_at', {date: formatJoinedAt(participant.joinedAt)}) }}
              </p>
              <div class="participant-card__actions">
                <pv-button :label="t('common.edit')" icon="pi pi-pencil" text size="small" @click="openEditParticipant(participant)" />
                <pv-button :label="t('common.delete')" :aria-label="t('liveMonitoring.remove_participant', {name: participantName(participant)})" icon="pi pi-trash" text severity="danger" size="small" @click="removeParticipant(participant)" />
              </div>
            </li>
          </ul>

          <footer class="live-participants__footer">
            <i class="pi pi-info-circle" aria-hidden="true"></i>
            {{ t('liveMonitoring.telemetry_unavailable') }}
          </footer>
        </aside>
      </div>

      <pv-dialog v-model:visible="participantDialogVisible" modal :header="t(editingParticipantId ? 'liveMonitoring.edit_participant' : 'liveMonitoring.new_participant')" :style="{width: 'min(32rem, 94vw)'}">
        <form class="participant-form" @submit.prevent="saveParticipant">
          <label for="participant-user">{{ t('liveMonitoring.traveler') }}</label>
          <select id="participant-user" v-model="participantForm.userId" required>
            <option :value="null" disabled>{{ t('liveMonitoring.select_traveler') }}</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || `User #${user.id}` }}
            </option>
          </select>
          <label for="participant-joined-at">{{ t('liveMonitoring.joined_at_field') }}</label>
          <input id="participant-joined-at" v-model="participantForm.joinedAt" type="datetime-local" required>
          <div class="participant-form__actions">
            <pv-button type="submit" :label="t(editingParticipantId ? 'liveMonitoring.save_changes' : 'liveMonitoring.add_participant_submit')" icon="pi pi-save" :loading="participantSaving" />
            <pv-button type="button" :label="t('common.cancel')" severity="secondary" outlined @click="participantDialogVisible = false" />
          </div>
        </form>
      </pv-dialog>
    </template>
    </template>
  </section>
</template>

<style scoped>
.live-tour {
  display: grid;
  gap: 1.25rem;
}

.live-tour__header,
.live-tour__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.live-tour__back {
  display: inline-flex;
  min-height: 2.5rem;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: var(--tm-green-900);
  font-weight: 650;
}

.live-tour__back:focus-visible {
  outline: 3px solid var(--tm-focus);
  outline-offset: 3px;
}

.live-tour__eyebrow {
  margin: 0 0 0.35rem;
  color: var(--tm-green-800);
  font-size: 0.75rem;
  font-weight: 750;
  letter-spacing: 0.12em;
}

.live-tour__status,
.participant-card__status {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border-radius: 999px;
  background: var(--tm-green-100);
  color: var(--tm-green-900);
  font-size: 0.8rem;
  font-weight: 700;
}

.live-tour__status {
  min-height: 2.25rem;
  padding: 0.55rem 0.8rem;
  white-space: nowrap;
}

.live-tour__status > span,
.participant-card__status i {
  color: #16845b;
  font-size: 0.55rem;
}

.live-tour__status > span {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: currentColor;
}

.live-tour__status--finished > span {
  color: var(--tm-muted);
}

.live-tour__toolbar {
  flex-wrap: wrap;
  padding: 0.85rem 1rem;
  border: 1px solid var(--tm-border);
  border-radius: 0.85rem;
  background: var(--tm-surface);
}

.live-tour__route-name {
  display: grid;
  gap: 0.2rem;
}

.live-tour__route-name > span {
  color: var(--tm-muted);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.live-tour__route-name > strong {
  color: var(--tm-text);
}

.live-tour__guide {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  color: var(--tm-muted);
}

.live-tour__guide i {
  color: var(--tm-green-900);
}

.live-tour__guide strong {
  color: var(--tm-text);
}

.live-tour__layout {
  display: grid;
  min-height: min(68vh, 48rem);
  grid-template-columns: minmax(0, 1fr) minmax(18rem, 22rem);
  gap: 1rem;
}

.live-map,
.live-participants {
  min-width: 0;
  overflow: hidden;
  border-radius: 1rem;
}

.live-map {
  display: flex;
  min-height: 28rem;
  flex-direction: column;
  padding: 1.2rem;
}

.live-map__header,
.live-participants__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.8rem;
}

.live-map__header h2,
.live-participants__header h2 {
  margin: 0;
  color: var(--tm-text);
  font-size: 1.05rem;
}

.live-map__header p,
.live-participants__header p {
  margin: 0.3rem 0 0;
  color: var(--tm-muted);
  font-size: 0.85rem;
}

.live-map__coordinates {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.6rem;
  border: 1px solid var(--tm-border);
  border-radius: 0.5rem;
  background: var(--tm-page);
  color: var(--tm-text);
  font-size: 0.78rem;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}

.live-map__coordinates i {
  color: var(--tm-green-900);
}

.live-map__canvas {
  position: relative;
  display: grid;
  min-height: 19rem;
  flex: 1;
  place-items: center;
  margin-top: 1rem;
  overflow: hidden;
  border: 1px solid var(--tm-border);
  border-radius: 0.8rem;
  background-color: var(--tm-green-50);
  background-image:
      linear-gradient(rgb(27 94 63 / 6%) 1px, transparent 1px),
      linear-gradient(90deg, rgb(27 94 63 / 6%) 1px, transparent 1px);
  background-size: 2.5rem 2.5rem;
}

.live-map__surface-lines {
  position: absolute;
  inset: -20%;
  opacity: 0.34;
  background:
      radial-gradient(ellipse at 30% 40%, transparent 0 25%, var(--tm-green-700) 25.2%, transparent 25.5% 34%, var(--tm-green-700) 34.2%, transparent 34.5%),
      radial-gradient(ellipse at 75% 65%, transparent 0 18%, var(--tm-green-700) 18.2%, transparent 18.5% 28%, var(--tm-green-700) 28.2%, transparent 28.5%);
  pointer-events: none;
}

.live-map__marker {
  position: relative;
  z-index: 1;
  display: grid;
  width: 3rem;
  height: 3rem;
  place-items: center;
  border: 0.4rem solid rgb(27 94 63 / 20%);
  border-radius: 50%;
  background: var(--tm-green-900);
  color: #fff;
  font-size: 1rem;
  box-shadow: 0 0 0 0.55rem rgb(27 94 63 / 12%);
}

.live-map__no-position {
  position: relative;
  z-index: 1;
  display: grid;
  justify-items: center;
  gap: 0.5rem;
  color: var(--tm-muted);
  text-align: center;
}

.live-map__no-position i {
  color: var(--tm-green-900);
  font-size: 1.7rem;
}

.live-map__position-label {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  max-width: calc(100% - 2rem);
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.65rem;
  border: 1px solid var(--tm-border);
  border-radius: 0.5rem;
  background: var(--tm-surface);
  color: var(--tm-text);
  font-size: 0.78rem;
  overflow-wrap: anywhere;
}

.live-map__position-label i,
.live-map__legend > span:first-child i {
  color: var(--tm-green-900);
  font-size: 0.55rem;
}

.live-map__legend {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 0.9rem;
  color: var(--tm-muted);
  font-size: 0.75rem;
}

.live-map__legend > span:first-child {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--tm-text);
}

.live-participants {
  display: flex;
  flex-direction: column;
  padding: 1.2rem;
}

.live-participants__header {
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--tm-border);
}

.live-participants__expedition-id {
  flex: 0 0 auto;
  padding: 0.35rem 0.5rem;
  border-radius: 0.4rem;
  background: var(--tm-green-50);
  color: var(--tm-muted);
  font-size: 0.72rem;
}

.live-participants__list {
  display: grid;
  align-content: start;
  gap: 0.75rem;
  margin: 1rem 0;
  padding: 0;
  list-style: none;
}

.live-participants__search {
  position: relative;
  display: block;
  margin-top: 1rem;
}

.live-participants__search > i {
  position: absolute;
  z-index: 1;
  top: 50%;
  left: 0.75rem;
  transform: translateY(-50%);
  color: var(--tm-muted);
}

.live-participants__search .form-control {
  padding-left: 2.25rem;
}

.participant-card {
  padding: 0.85rem;
  border: 1px solid var(--tm-border);
  border-radius: 0.75rem;
  background: var(--tm-surface);
}

.participant-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.participant-card__header h3 {
  margin: 0;
  color: var(--tm-text);
  font-size: 0.95rem;
  overflow-wrap: anywhere;
}

.participant-card__status {
  flex: 0 0 auto;
  max-width: 100%;
  padding: 0.3rem 0.45rem;
  font-size: 0.68rem;
  white-space: normal;
  overflow-wrap: anywhere;
}

.participant-card__id,
.participant-card__joined {
  margin: 0.45rem 0 0;
  color: var(--tm-muted);
  font-size: 0.76rem;
}

.participant-card__actions,
.participant-form__actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.participant-form {
  display: grid;
  gap: 0.55rem;
}

.participant-form input,
.participant-form select {
  min-height: 2.6rem;
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--tm-border);
  border-radius: 0.5rem;
  background: var(--tm-surface);
  color: var(--tm-text);
}

.participant-form label {
  margin-top: 0.3rem;
  color: var(--tm-text);
  font-weight: 600;
}

.participant-form__actions {
  margin-top: 0.75rem;
}

.participant-card__telemetry {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.7rem;
  padding: 0.55rem;
  border-radius: 0.45rem;
  background: var(--tm-page);
  color: var(--tm-muted);
  font-size: 0.78rem;
}

.participant-card__telemetry i {
  color: var(--tm-danger);
}

.live-participants__empty {
  margin: auto 0;
  padding: 2rem 0.5rem;
  color: var(--tm-muted);
  text-align: center;
}

.live-participants__footer {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 0.9rem;
  border-top: 1px solid var(--tm-border);
  color: var(--tm-muted);
  font-size: 0.76rem;
  line-height: 1.5;
}

.live-participants__footer i {
  flex: 0 0 auto;
  color: var(--tm-info);
}

.live-tour__message,
.live-tour__empty {
  display: grid;
  justify-items: center;
  gap: 0.75rem;
  padding: clamp(2rem, 8vw, 4rem) 1.25rem;
  color: var(--tm-muted);
  text-align: center;
}

.live-tour__message {
  display: flex;
  justify-content: center;
}

.live-tour__message--error {
  color: var(--tm-danger);
}

.live-tour__empty > i {
  color: var(--tm-green-900);
  font-size: 2rem;
}

.live-tour__empty h2,
.live-tour__empty p {
  margin: 0;
}

.live-tour__empty h2 {
  color: var(--tm-text);
}

.live-tour__empty p {
  max-width: 38rem;
  line-height: 1.6;
}

@media (prefers-color-scheme: dark) {
  .live-map__marker {
    border-color: rgb(189 227 202 / 24%);
    background: #1b5e3f;
    color: #fff;
  }

  .live-tour__status > span,
  .participant-card__status i {
    color: #69d3a3;
  }
}

.live-tour__status--finished {
  background: var(--tm-green-50);
  color: var(--tm-muted);
}

.live-tour__status--finished > span {
  background: currentColor;
}

@media (max-width: 800px) {
  .live-tour__layout {
    min-height: 0;
    grid-template-columns: minmax(0, 1fr);
  }

  .live-participants {
    min-height: 16rem;
  }
}

@media (max-width: 560px) {
  .live-tour__header,
  .live-tour__toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .live-tour__status {
    align-self: flex-start;
  }

  .live-map {
    min-height: 24rem;
    padding: 0.9rem;
  }

  .live-map__header {
    flex-direction: column;
  }

  .live-map__coordinates {
    max-width: 100%;
  }

  .live-map__canvas {
    min-height: 17rem;
  }

  .live-map__legend {
    flex-direction: column;
    gap: 0.4rem;
  }

  .live-participants {
    padding: 0.9rem;
  }

  .live-participants__header {
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .live-participants__header > :deep(.p-button) {
    width: 100%;
    justify-content: center;
  }
}
</style>
