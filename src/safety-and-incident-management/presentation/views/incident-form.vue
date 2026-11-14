<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import useIncidentStore from "../../application/incident.store.js";
import { Incident } from "../../domain/model/incident.entity.js";
import { IncidentStatus } from "../../domain/value-objects/incident-status.js";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const store = useIncidentStore();
const errors = store.errors;
const isEdit = computed(() => Boolean(route.params.id));

const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const currentSeverity = ref('HIGH');
const activeProtocols = ref([]);

const form = ref({
  description: "",
  activeTourId: 1,
  reportedByUserId: 1,
  latitude: 0,
  longitude: 0,
  reportedAt: toLocalDateTime(new Date().toISOString()),
  status: IncidentStatus.OPEN,
  severity: 'HIGH',
  reporterRole: 'TOURIST'
});

function toLocalDateTime(value) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function updateProtocols(severity) {
  const tempIncident = new Incident({ severity });
  activeProtocols.value = tempIncident.getGuidedProtocols();
}

watch(currentSeverity, (newVal) => {
  form.value.severity = newVal;
  updateProtocols(newVal);
});

onMounted(async () => {
  if (route.params.id) {
    if (!store.incidentsLoaded) await store.fetchIncidents();
    const incident = store.getIncidentById(route.params.id).value;
    if (incident) {
      form.value = {
        description: incident.description,
        activeTourId: incident.activeTourId,
        reportedByUserId: incident.reportedByUserId,
        latitude: incident.latitude,
        longitude: incident.longitude,
        reportedAt: toLocalDateTime(incident.reportedAt),
        status: incident.status,
        severity: incident.severity || 'HIGH',
        reporterRole: incident.reporterRole || 'TOURIST'
      };
      currentSeverity.value = incident.severity || 'HIGH';
    } else {
      router.push({ name: "incidents" });
    }
  } else {
    updateProtocols(currentSeverity.value);
  }
});

async function saveIncident() {
  const latitude = Number(form.value.latitude);
  const longitude = Number(form.value.longitude);

  if (!form.value.description.trim() ||
      !form.value.activeTourId || !Number.isInteger(Number(form.value.activeTourId)) || Number(form.value.activeTourId) < 1 ||
      !Number.isInteger(Number(form.value.reportedByUserId)) || !form.value.reportedByUserId || Number(form.value.reportedByUserId) < 1 ||
      latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return;
  }

  const reportedAtISO = form.value.reportedAt ? new Date(form.value.reportedAt).toISOString() : new Date().toISOString();

  const incident = new Incident({
    id: isEdit.value ? Number(route.params.id) : 0,
    ...form.value,
    activeTourId: Number(form.value.activeTourId),
    reportedByUserId: Number(form.value.reportedByUserId),
    latitude,
    longitude,
    reportedAt: reportedAtISO,
    isSynced: false
  });

  const saved = isEdit.value
      ? await store.updateIncident(incident)
      : await store.addIncident(incident);

  if (saved !== false) {
    router.push({ name: "incidents" });
  }
}

function cancel() {
  router.push({ name: "incidents" });
}
</script>

<template>
  <section class="incident-form-page page-shell" aria-labelledby="incident-form-title">
    <div class="incident-form-card surface-card">
      <header class="incident-form-header">
        <div class="incident-header-left">
          <span class="eyebrow">{{ t('option.safety_and_incident') }}</span>
          <h1 id="incident-form-title" class="page-heading">
            {{ isEdit ? t('incidents.edit_title') : t('incidents.form_title') }}
          </h1>
          <p class="page-description">{{ t('incidents.form_description') }}</p>
        </div>
        <span class="priority-chip">
          <i class="pi pi-exclamation-triangle" aria-hidden="true"></i>{{ t('incidents.priority_notice') }}
        </span>
      </header>

      <form class="incident-form" @submit.prevent="saveIncident">
        <div class="form-grid">
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

          <div class="incident-form__field">
            <label for="reporter-role">{{ t('incidents.reporter_role') }}</label>
            <select id="reporter-role" v-model="form.reporterRole" class="form-control">
              <option value="TOURIST">{{ t('incidents.reporter_roles.TOURIST') }}</option>
              <option value="GUIDE">{{ t('incidents.reporter_roles.GUIDE') }}</option>
            </select>
          </div>

          <div class="incident-form__field">
            <label for="incident-status">{{ t('incidents.status') }}</label>
            <select id="incident-status" v-model="form.status" class="form-control" required>
              <option :value="IncidentStatus.OPEN">{{ t('incidents.status_values.OPEN') }}</option>
              <option :value="IncidentStatus.IN_REVIEW">{{ t('incidents.status_values.IN_REVIEW') }}</option>
              <option :value="IncidentStatus.RESOLVED">{{ t('incidents.status_values.RESOLVED') }}</option>
              <option :value="IncidentStatus.CLOSED">{{ t('incidents.status_values.CLOSED') }}</option>
            </select>
          </div>

          <div class="incident-form__field">
            <label for="incident-severity">{{ t('incidents.severity') }}</label>
            <select id="incident-severity" v-model="currentSeverity" class="form-control" required>
              <option v-for="sev in severities" :key="sev" :value="sev">
                {{ t('incidents.severity_values.' + sev) }}
              </option>
            </select>
          </div>

          <div class="incident-form__field">
            <label for="reported-at">{{ t('incidents.reported_at') }}</label>
            <input id="reported-at" v-model="form.reportedAt" class="form-control" type="datetime-local" required>
          </div>

          <div class="incident-form__field">
            <label for="incident-latitude">{{ t('incidents.latitude') }}</label>
            <input id="incident-latitude" v-model.number="form.latitude" class="form-control" type="number" step="any" min="-90" max="90" required>
          </div>

          <div class="incident-form__field">
            <label for="incident-longitude">{{ t('incidents.longitude') }}</label>
            <input id="incident-longitude" v-model.number="form.longitude" class="form-control" type="number" step="any" min="-180" max="180" required>
          </div>

          <div class="incident-form__field incident-form__field--wide">
            <label for="incident-description">{{ t('incidents.description') }} <span aria-hidden="true">*</span></label>
            <textarea
                id="incident-description"
                v-model="form.description"
                class="form-control"
                rows="4"
                :placeholder="t('incidents.description_hint')"
                required
            ></textarea>
            <small>{{ t('incidents.description_required') }}</small>
          </div>
        </div>

        <div class="protocol-panel" :class="{'critical-protocol': currentSeverity === 'CRITICAL'}">
          <div class="protocol-header">
            <i class="pi pi-shield" aria-hidden="true"></i>
            <strong>{{ t('incidents.protocols.title', { severity: t('incidents.severity_values.' + currentSeverity) }) }}</strong>
          </div>
          <ul class="protocol-list">
            <li v-for="protocol in activeProtocols" :key="protocol">{{ t(protocol) }}</li>
          </ul>
        </div>

        <div class="incident-form__actions">
          <pv-button type="button" :label="t('common.cancel')" icon="pi pi-times" severity="secondary" outlined @click="cancel" />
          <pv-button type="submit" :label="isEdit ? t('incidents.update') : t('incidents.publish')" icon="pi pi-send" />
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
  margin: 0 auto;
}

.incident-form-card {
  display: grid;
  gap: 1.5rem;
  padding: clamp(1.25rem, 4vw, 2.5rem);
}

.incident-form-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
}

.eyebrow {
  color: var(--tm-muted, #64816f);
  font-size: 0.68rem;
  font-weight: 650;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.page-heading {
  margin: 5px 0 3px;
  font-size: clamp(1.65rem, 3vw, 2.15rem);
  letter-spacing: -0.045em;
}

.priority-chip {
  display: inline-flex;
  min-height: 32px;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  border: 1px solid #efd6c6;
  border-radius: 999px;
  color: #92583f;
  background: #fbf0e9;
  font-size: 0.73rem;
  font-weight: 650;
  white-space: nowrap;
}

.priority-chip i {
  font-size: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem 1.1rem;
}

.incident-form__field {
  display: grid;
  align-content: start;
  gap: 0.45rem;
  min-width: 0;
}

.incident-form__field label {
  color: var(--tm-text, #31483e);
  font-size: 0.9rem;
  font-weight: 650;
}

.incident-form__field label span {
  color: var(--tm-danger, #8e422f);
}

.incident-form__field small {
  color: var(--tm-muted);
  line-height: 1.45;
}

.incident-form__field textarea {
  min-height: 7rem;
  resize: vertical;
}

.incident-form__field--wide {
  grid-column: 1 / -1;
}

.protocol-panel {
  margin: 1.2rem 0;
  padding: 1rem;
  border: 1px solid #d6e1d4;
  border-radius: 10px;
  color: #405b4b;
  background: #edf3eb;
  font-size: 0.86rem;
  line-height: 1.55;
}

.protocol-panel.critical-protocol {
  border-color: #f5c6cb;
  background: #f8d7da;
  color: #721c24;
}

.protocol-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.protocol-list {
  margin: 0;
  padding-left: 20px;
}

.protocol-list li {
  margin-bottom: 4px;
}

.incident-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
  padding-top: 1rem;
  border-top: 1px solid var(--tm-border, #edf0e9);
}

.incident-form-error {
  margin: 0;
  color: var(--tm-danger, #8e422f);
  overflow-wrap: anywhere;
}

@media (max-width: 650px) {
  .incident-form-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .incident-form__field--wide {
    grid-column: auto;
  }
  .incident-form__actions {
    flex-direction: column-reverse;
  }
  .incident-form__actions :deep(.p-button) {
    width: 100%;
    justify-content: center;
  }
}
</style>