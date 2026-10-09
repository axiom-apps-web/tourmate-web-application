<script setup>
import {computed, onMounted, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import useIncidentStore from "../../application/incident.store.js";
import {Incident} from "../../domain/model/incident.entity.js";
import {IncidentStatus} from "../../domain/value-objects/incident-status.js";

const route = useRoute();
const router = useRouter();
const {t} = useI18n();
const store = useIncidentStore();
const errors = store.errors;
const isEdit = computed(() => Boolean(route.params.id));

const form = ref({
  description: "",
  activeTourId: 1,
  reportedByUserId: 1,
  latitude: 0,
  longitude: 0,
  reportedAt: new Date().toISOString(),
  status: IncidentStatus.OPEN
});

onMounted(() => {
  if (!isEdit.value) return;

  const incident = store.getIncidentById(route.params.id);
  if (incident) {
    form.value = {
      description: incident.description,
      activeTourId: incident.activeTourId,
      reportedByUserId: incident.reportedByUserId,
      latitude: incident.latitude,
      longitude: incident.longitude,
      reportedAt: incident.reportedAt,
      status: incident.status
    };
  } else {
    router.push({name: "incidents"});
  }
});

function saveIncident() {
  const incident = new Incident({
    id: isEdit.value ? Number(route.params.id) : null,
    ...form.value
  });

  if (isEdit.value) store.updateIncident(incident);
  else store.addIncident(incident);
  router.push({name: "incidents"});
}

function cancel() {
  router.push({name: "incidents"});
}
</script>

<template>
  <section class="incident-form-page page-shell" aria-labelledby="incident-form-title">
    <div class="incident-form-card surface-card">
      <header class="incident-form-header">
        <span class="incident-form-icon" aria-hidden="true"><i class="pi pi-shield"></i></span>
        <div>
          <p class="incident-eyebrow">{{ t('incidents.priority_notice') }}</p>
          <h1 id="incident-form-title" class="page-heading">
            {{ isEdit ? t('incidents.edit_title') : t('incidents.form_title') }}
          </h1>
          <p class="page-description">{{ t('incidents.form_description') }}</p>
        </div>
      </header>

      <aside class="incident-protocol">
        <i class="pi pi-info-circle" aria-hidden="true"></i>
        <p>{{ t('incidents.protocol_note') }}</p>
      </aside>

      <form class="incident-form" @submit.prevent="saveIncident">
        <div class="incident-form__field">
          <label for="active-tour">{{ t('incidents.active_tour') }} <span aria-hidden="true">*</span></label>
          <input id="active-tour" v-model.number="form.activeTourId" class="form-control" type="number" min="1" required>
          <small>{{ t('incidents.active_tour_required') }}</small>
        </div>

        <div class="incident-form__field">
          <label for="reported-by">{{ t('incidents.reported_by') }} <span aria-hidden="true">*</span></label>
          <input id="reported-by" v-model.number="form.reportedByUserId" class="form-control" type="number" min="1" required>
          <small>{{ t('incidents.reported_by_required') }}</small>
        </div>

        <div class="incident-form__field incident-form__field--wide">
          <label for="incident-description">{{ t('incidents.description') }} <span aria-hidden="true">*</span></label>
          <textarea
              id="incident-description"
              v-model="form.description"
              class="form-control"
              rows="5"
              :placeholder="t('incidents.description_hint')"
              required
          ></textarea>
          <small>{{ t('incidents.description_required') }}</small>
        </div>

        <div class="incident-form__field">
          <label for="incident-status">{{ t('incidents.status') }}</label>
          <select id="incident-status" v-model="form.status" class="form-control" required>
            <option :value="IncidentStatus.OPEN">{{ t('incidents.status_open') }}</option>
            <option :value="IncidentStatus.IN_REVIEW">{{ t('incidents.status_in_review') }}</option>
            <option :value="IncidentStatus.RESOLVED">{{ t('incidents.status_resolved') }}</option>
            <option :value="IncidentStatus.CLOSED">{{ t('incidents.status_closed') }}</option>
          </select>
        </div>

        <fieldset class="incident-form__location">
          <legend>{{ t('incidents.latitude') }} / {{ t('incidents.longitude') }}</legend>
          <div class="incident-form__location-fields">
            <div class="incident-form__field">
              <label for="incident-latitude">{{ t('incidents.latitude') }}</label>
              <input id="incident-latitude" v-model.number="form.latitude" class="form-control" type="number" step="any" min="-90" max="90">
            </div>
            <div class="incident-form__field">
              <label for="incident-longitude">{{ t('incidents.longitude') }}</label>
              <input id="incident-longitude" v-model.number="form.longitude" class="form-control" type="number" step="any" min="-180" max="180">
            </div>
          </div>
        </fieldset>

        <div class="incident-form__actions">
          <pv-button type="submit" :label="isEdit ? t('incidents.update') : t('incidents.publish')" icon="pi pi-send" />
          <pv-button type="button" :label="t('common.cancel')" icon="pi pi-times" severity="secondary" outlined @click="cancel" />
        </div>
      </form>

      <p v-if="errors.length" class="incident-form-error" role="alert">
        {{ t('incidents.save_error') }}: {{ errors.map(error => error.message).join(', ') }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.incident-form-page {
  max-width: 62rem;
}

.incident-form-card {
  display: grid;
  gap: 1.5rem;
  padding: clamp(1.25rem, 4vw, 2.5rem);
}

.incident-form-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.incident-form-icon {
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

.incident-form-header .page-description {
  margin-top: 0.55rem;
}

.incident-protocol {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  padding: 0.9rem 1rem;
  border: 1px solid var(--tm-border);
  border-left: 4px solid var(--tm-info);
  border-radius: 0.5rem;
  background: var(--tm-green-50);
  color: var(--tm-text);
}

.incident-protocol i {
  margin-top: 0.15rem;
  color: var(--tm-info);
}

.incident-protocol p {
  margin: 0;
  line-height: 1.55;
}

.incident-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.1rem;
}

.incident-form__field {
  display: grid;
  align-content: start;
  gap: 0.45rem;
  min-width: 0;
}

.incident-form__field label,
.incident-form__location legend {
  color: var(--tm-text);
  font-size: 0.9rem;
  font-weight: 650;
}

.incident-form__field label span {
  color: var(--tm-danger);
}

.incident-form__field small {
  color: var(--tm-muted);
  line-height: 1.45;
}

.incident-form__field textarea {
  min-height: 8rem;
  resize: vertical;
}

.incident-form__field--wide,
.incident-form__location,
.incident-form__actions {
  grid-column: 1 / -1;
}

.incident-form__location {
  min-width: 0;
  margin: 0;
  padding: 1rem;
  border: 1px solid var(--tm-border);
  border-radius: 0.75rem;
}

.incident-form__location legend {
  padding-inline: 0.4rem;
}

.incident-form__location-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.incident-form__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  padding-top: 0.4rem;
}

.incident-form-error {
  margin: 0;
  color: var(--tm-danger);
  overflow-wrap: anywhere;
}

.incident-form :deep(.p-button:focus-visible) {
  outline: 3px solid var(--tm-green-700);
  outline-offset: 3px;
}

@media (max-width: 600px) {
  .incident-form,
  .incident-form__location-fields {
    grid-template-columns: 1fr;
  }

  .incident-form__field--wide,
  .incident-form__location,
  .incident-form__actions {
    grid-column: auto;
  }

  .incident-form__actions :deep(.p-button) {
    flex: 1 1 100%;
    justify-content: center;
  }
}
</style>
