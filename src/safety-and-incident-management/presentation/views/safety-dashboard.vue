<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import useSafetyMonitoringStore from "../../application/safety-monitoring.store.js";
import useIncidentStore from "../../application/incident.store.js";

const router = useRouter();
const { t, te, locale } = useI18n();
const store = useSafetyMonitoringStore();
const incidentStore = useIncidentStore();

const selectedIncidentId = ref(null);
const editingIncidentLocation = ref(false);

const locationForm = ref({
  id: null,
  latitude: 0,
  longitude: 0,
  expectedLatitude: null,
  expectedLongitude: null
});

const wearableForm = ref({
  id: null,
  deviceId: '',
  batteryLevel: 100,
  connectivity: 'CONNECTED',
  lastSyncAt: null
});

const telemetryForm = ref({
  id: null,
  wearableId: '',
  heartRate: 70,
  bloodOxygen: 98,
  batteryLevel: 100,
  connectivity: 'CONNECTED'
});

onMounted(async () => {
  if (!incidentStore.incidentsLoaded) await incidentStore.fetchIncidents();
  if (incidentStore.incidents.length > 0) {
    selectedIncidentId.value = incidentStore.incidents[0].id;
  }
  store.refresh();
});

const selectedIncident = computed(() => {
  const incidents = incidentStore.incidents;
  return incidents.find(inc => String(inc.id) === String(selectedIncidentId.value)) || incidents[0] || null;
});

const incidentLocations = computed(() => {
  const incident = selectedIncident.value;
  if (!incident) return [];
  const linked = store.locations.filter(loc => belongsToIncident(loc, incident));
  return [
    {
      id: `incident-location-${incident.id}`,
      incidentId: incident.id,
      expeditionId: incident.activeTourId,
      touristId: incident.reportedByUserId,
      latitude: incident.latitude,
      longitude: incident.longitude,
      recordedAt: incident.reportedAt,
      isIncidentLocation: true
    },
    ...linked.map(loc => ({ ...loc, isIncidentLocation: false }))
  ];
});

const incidentTelemetry = computed(() => {
  const incident = selectedIncident.value;
  return incident ? store.telemetry.filter(rec => belongsToIncident(rec, incident)) : [];
});

const incidentWearables = computed(() => {
  const incident = selectedIncident.value;
  return incident ? store.wearables.filter(rec => belongsToIncident(rec, incident)) : [];
});

const incidentAlerts = computed(() => {
  const incident = selectedIncident.value;
  return incident ? store.allAlerts.filter(alert => String(alert.sourceRecordId) === String(incident.id) || belongsToIncident(alert, incident)) : [];
});

const activeIncidentAlertCount = computed(() =>
    incidentAlerts.value.filter(alert => alert.status === 'ACTIVE').length
);

function selectIncident(id) {
  selectedIncidentId.value = id;
  resetForms();
}

function submitLocation() {
  const incident = selectedIncident.value;
  if (!incident) return;
  if (editingIncidentLocation.value) {
    incidentStore.updateIncident(new Incident({
      ...incident,
      latitude: Number(locationForm.value.latitude),
      longitude: Number(locationForm.value.longitude)
    }));
    editingIncidentLocation.value = false;
    return;
  }

  const report = {
    incidentId: incident.id,
    expeditionId: incident.activeTourId,
    touristId: incident.reportedByUserId,
    latitude: Number(locationForm.value.latitude),
    longitude: Number(locationForm.value.longitude),
    recordedAt: new Date().toISOString()
  };
  if (locationForm.value.expectedLatitude !== null && locationForm.value.expectedLongitude !== null) {
    report.expectedLatitude = Number(locationForm.value.expectedLatitude);
    report.expectedLongitude = Number(locationForm.value.expectedLongitude);
  }

  if (locationForm.value.id !== null) {
    store.updateLocation({ ...report, id: locationForm.value.id });
  } else {
    store.reportLocation(report);
  }
  locationForm.value.id = null;
  editingIncidentLocation.value = false;
}

function editLocation(loc) {
  locationForm.value = {
    id: loc.isIncidentLocation ? null : loc.id,
    latitude: loc.latitude,
    longitude: loc.longitude,
    expectedLatitude: loc.expectedLatitude ?? null,
    expectedLongitude: loc.expectedLongitude ?? null
  };
  editingIncidentLocation.value = Boolean(loc.isIncidentLocation);
}

function submitWearable() {
  const incident = selectedIncident.value;
  if (!incident) return;
  store.linkWearable({
    deviceId: wearableForm.value.deviceId,
    incidentId: incident.id,
    touristId: incident.reportedByUserId,
    activeExpeditionId: incident.activeTourId,
    batteryLevel: Number(wearableForm.value.batteryLevel),
    connectivity: wearableForm.value.connectivity,
    ...(wearableForm.value.lastSyncAt ? { lastSyncAt: wearableForm.value.lastSyncAt } : {}),
    ...(wearableForm.value.id !== null ? { id: wearableForm.value.id } : {})
  });
  wearableForm.value.id = null;
  wearableForm.value.deviceId = '';
}

function submitTelemetry() {
  const incident = selectedIncident.value;
  if (!incident) return;
  const record = {
    incidentId: incident.id,
    expeditionId: incident.activeTourId,
    touristId: incident.reportedByUserId,
    wearableId: telemetryForm.value.wearableId,
    heartRate: Number(telemetryForm.value.heartRate),
    bloodOxygen: Number(telemetryForm.value.bloodOxygen),
    batteryLevel: Number(telemetryForm.value.batteryLevel),
    connectivity: telemetryForm.value.connectivity,
    recordedAt: new Date().toISOString()
  };
  if (telemetryForm.value.id !== null) {
    store.updateTelemetry({ ...record, id: telemetryForm.value.id });
  } else {
    store.ingestTelemetry(record);
  }
  telemetryForm.value.id = null;
}

function editTelemetry(rec) {
  telemetryForm.value = {
    id: rec.id,
    wearableId: rec.wearableId,
    heartRate: rec.heartRate,
    bloodOxygen: rec.bloodOxygen,
    batteryLevel: rec.batteryLevel,
    connectivity: rec.connectivity
  };
}

function editWearable(rec) {
  wearableForm.value = {
    id: rec.id,
    deviceId: rec.deviceId,
    batteryLevel: rec.batteryLevel,
    connectivity: rec.connectivity,
    lastSyncAt: rec.lastSyncAt
  };
}

function acknowledge(alert) {
  store.acknowledgeAlert(alert);
}

function unlink(wearable) {
  store.unlinkWearable(wearable);
}

function exportReport() {
  const expeditionId = selectedIncident.value?.activeTourId;
  if (!Number.isInteger(expeditionId) || expeditionId <= 0) return;

  const blob = new Blob([`\uFEFF${store.exportExpeditionReport(expeditionId)}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `expedition-${expeditionId}-safety-report.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function belongsToIncident(record, incident) {
  if (record.incidentId !== undefined) {
    return Number(record.incidentId) === incident.id;
  }
  const expeditionId = record.expeditionId ?? record.activeExpeditionId;
  return (expeditionId == null || Number(expeditionId) === incident.activeTourId) && Number(record.touristId) === incident.reportedByUserId;
}

function resetForms() {
  const incident = selectedIncident.value;
  editingIncidentLocation.value = false;
  locationForm.value = {
    id: null,
    latitude: incident?.latitude ?? 0,
    longitude: incident?.longitude ?? 0,
    expectedLatitude: null,
    expectedLongitude: null
  };
  wearableForm.value = { id: null, deviceId: '', batteryLevel: 100, connectivity: 'CONNECTED', lastSyncAt: null };
  telemetryForm.value = { id: null, wearableId: '', heartRate: 70, bloodOxygen: 98, batteryLevel: 100, connectivity: 'CONNECTED' };
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const language = locale.value === "es" ? "es-PE" : "en-US";
  return new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function navigateToIncidents() {
  router.push({ name: 'incidents' });
}

function alertMessage(message) {
  return te(message) ? t(message) : message;
}
</script>

<template>
  <section class="page-shell dashboard-page" aria-labelledby="dashboard-title">
    <header class="dashboard-header">
      <div>
        <span class="eyebrow">{{ t('option.safety_and_incident') }}</span>
        <h1 id="dashboard-title" class="page-heading">{{ t('incidents.safety.dashboard_title') }}</h1>
        <p>{{ t('incidents.safety.dashboard_description') }}</p>
      </div>
      <div class="actions">
        <pv-button :label="t('incidents.safety.refresh')" icon="pi pi-refresh" severity="secondary" outlined @click="store.refresh()" />
        <pv-button :label="t('incidents.safety.export_report')" icon="pi pi-download" @click="exportReport" />
        <pv-button :label="t('incidents.safety.manage_incidents')" icon="pi pi-list" severity="secondary" outlined @click="navigateToIncidents" />
      </div>
    </header>

    <div v-if="store.loading" class="feedback" role="status">{{ t('common.loading') }}</div>
    <div v-if="store.errors.length" class="feedback error" role="alert">
      {{ store.errors.map(e => e.message).join(', ') }}
    </div>

    <section class="data-card incident-context">
      <div class="incident-selector-wrapper">
        <label for="incident-select">{{ t('incidents.safety.select_incident') }}</label>
        <select
            id="incident-select"
            class="form-control"
            :value="selectedIncidentId"
            @change="selectIncident($event.target.value)"
            :disabled="!incidentStore.incidents.length"
        >
          <option v-for="inc in incidentStore.incidents" :key="inc.id" :value="inc.id">
            #{{ inc.id }} - {{ inc.description }} (Exp #{{ inc.activeTourId }})
          </option>
        </select>
      </div>

      <div v-if="selectedIncident" class="context-summary">
        <span class="option-id" aria-hidden="true">#{{ selectedIncident.id }}</span>
        <div class="context-details">
          <strong>{{ selectedIncident.description }}</strong>
          <span>{{ t('incidents.safety.expedition') }} #{{ selectedIncident.activeTourId }} · {{ t('incidents.safety.participant') }} #{{ selectedIncident.reportedByUserId }}</span>
        </div>
        <div class="context-badges">
          <span class="status-badge">{{ t('incidents.status_values.' + selectedIncident.status) }}</span>
          <span class="severity-badge" :class="`severity-${String(selectedIncident.severity).toLowerCase()}`">
            {{ t('incidents.severity_values.' + selectedIncident.severity) }}
          </span>
        </div>
      </div>
      <div v-else class="empty-context">
        <p>{{ t('incidents.safety.no_incidents_for_monitoring') }}</p>
      </div>
    </section>

    <section class="summary-grid">
      <article class="summary-card surface-card">
        <span>{{ t('incidents.safety.locations') }}</span>
        <strong>{{ incidentLocations.length }}</strong>
      </article>
      <article class="summary-card surface-card">
        <span>{{ t('incidents.safety.active_alerts') }}</span>
        <strong>{{ activeIncidentAlertCount }}</strong>
      </article>
      <article class="summary-card surface-card">
        <span>{{ t('incidents.safety.participants_monitored') }}</span>
        <strong>{{ incidentTelemetry.length }}</strong>
      </article>
      <article class="summary-card surface-card">
        <span>{{ t('incidents.safety.registered_wearables') }}</span>
        <strong>{{ incidentWearables.length }}</strong>
      </article>
    </section>

    <div class="monitoring-grid">
      <!-- Ubicaciones -->
      <section class="data-card surface-card">
        <header>
          <h2>{{ t('incidents.safety.locations') }}</h2>
          <p>{{ t('incidents.safety.location_hint') }}</p>
        </header>
        <form class="record-form" @submit.prevent="submitLocation">
          <div class="form-group">
            <label>{{ t('incidents.latitude') }}</label>
            <input v-model.number="locationForm.latitude" class="form-control" type="number" min="-90" max="90" step="any" required />
          </div>
          <div class="form-group">
            <label>{{ t('incidents.longitude') }}</label>
            <input v-model.number="locationForm.longitude" class="form-control" type="number" min="-180" max="180" step="any" required />
          </div>
          <template v-if="!editingIncidentLocation">
            <div class="form-group">
              <label>{{ t('incidents.safety.route_latitude') }}</label>
              <input v-model.number="locationForm.expectedLatitude" class="form-control" type="number" min="-90" max="90" step="any" />
            </div>
            <div class="form-group">
              <label>{{ t('incidents.safety.route_longitude') }}</label>
              <input v-model.number="locationForm.expectedLongitude" class="form-control" type="number" min="-180" max="180" step="any" />
            </div>
          </template>
          <div class="form-actions-full">
            <pv-button type="submit" :label="editingIncidentLocation ? t('incidents.safety.update_incident_location') : (locationForm.id === null ? t('incidents.safety.record_location') : t('incidents.safety.update_location'))" :disabled="!selectedIncident" />
          </div>
        </form>

        <div class="table-scroll">
          <table>
            <thead>
            <tr>
              <th>{{ t('incidents.safety.expedition_id') }}</th>
              <th>{{ t('incidents.safety.tourist_id') }}</th>
              <th>{{ t('incidents.latitude') }}</th>
              <th>{{ t('incidents.longitude') }}</th>
              <th>{{ t('incidents.reported_at') }}</th>
              <th>{{ t('incidents.actions') }}</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="loc in incidentLocations" :key="loc.id">
              <td>{{ loc.expeditionId }}</td>
              <td>{{ loc.touristId }}</td>
              <td>{{ loc.latitude }}</td>
              <td>{{ loc.longitude }}</td>
              <td>{{ formatDate(loc.recordedAt) }}</td>
              <td>
                <pv-button icon="pi pi-pencil" text @click="editLocation(loc)" />
              </td>
            </tr>
            <tr v-if="!incidentLocations.length">
              <td colspan="6" class="empty-table">{{ t('incidents.safety.no_locations') }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Alertas -->
      <section class="data-card surface-card">
        <header>
          <h2>{{ t('incidents.safety.alerts') }}</h2>
          <p>{{ t('incidents.safety.alerts_hint') }}</p>
        </header>
        <div class="record-list">
          <article v-for="alert in incidentAlerts" :key="alert.id" class="record-item">
            <div>
              <div class="alert-title-row">
                <strong>{{ t('incidents.safety.alert_types.' + alert.type) }}</strong>
                <span class="severity-badge" :class="`severity-${String(alert.severity).toLowerCase()}`">
                  {{ t('incidents.severity_values.' + alert.severity) }}
                </span>
              </div>
              <p>{{ alertMessage(alert.message) }}</p>
              <small>{{ t('incidents.safety.expedition_id') }} #{{ alert.expeditionId }} · {{ t('incidents.safety.tourist_id') }} #{{ alert.touristId }} · <span class="status-badge">{{ t('incidents.safety.alert_status.' + alert.status) }}</span></small>
            </div>
            <pv-button v-if="alert.status === 'ACTIVE'" :label="t('incidents.safety.acknowledge')" size="small" severity="secondary" outlined @click="acknowledge(alert)" />
          </article>
          <p v-if="!incidentAlerts.length" class="empty">{{ t('incidents.safety.no_alerts') }}</p>
        </div>
      </section>

      <!-- Salud y Telemetría -->
      <section class="data-card surface-card">
        <header>
          <h2>{{ t('incidents.safety.health_status') }}</h2>
          <p>{{ t('incidents.safety.health_hint') }}</p>
        </header>
        <form class="record-form" @submit.prevent="submitTelemetry">
          <div class="form-group">
            <label>{{ t('incidents.safety.device_id') }}</label>
            <select v-model="telemetryForm.wearableId" class="form-control" required>
              <option value="" disabled>{{ t('incidents.safety.choose_device') }}</option>
              <option v-for="w in incidentWearables" :key="w.id" :value="w.deviceId">{{ w.deviceId }} ({{ w.batteryLevel }}%)</option>
            </select>
          </div>
          <div class="form-group">
            <label>{{ t('incidents.safety.heart_rate') }} (bpm)</label>
            <input v-model.number="telemetryForm.heartRate" class="form-control" type="number" min="25" max="240" required />
          </div>
          <div class="form-group">
            <label>{{ t('incidents.safety.blood_oxygen') }} (%)</label>
            <input v-model.number="telemetryForm.bloodOxygen" class="form-control" type="number" min="50" max="100" required />
          </div>
          <div class="form-group">
            <label>{{ t('incidents.safety.battery') }} (%)</label>
            <input v-model.number="telemetryForm.batteryLevel" class="form-control" type="number" min="0" max="100" required />
          </div>
          <div class="form-group">
            <label>{{ t('incidents.safety.connectivity') }}</label>
            <select v-model="telemetryForm.connectivity" class="form-control">
              <option value="CONNECTED">{{ t('incidents.safety.connected') }}</option>
              <option value="DISCONNECTED">{{ t('incidents.safety.disconnected') }}</option>
            </select>
          </div>
          <div class="form-actions-full">
            <pv-button type="submit" :label="telemetryForm.id === null ? t('incidents.safety.ingest_telemetry') : t('incidents.safety.update_telemetry')" :disabled="!selectedIncident || !telemetryForm.wearableId" />
          </div>
        </form>

        <div class="record-list">
          <article v-for="record in incidentTelemetry" :key="record.id" class="record-item">
            <div>
              <strong>{{ t('incidents.safety.tourist_id') }} #{{ record.touristId }}</strong>
              <span>{{ t('incidents.safety.heart_rate') }}: {{ record.heartRate }} bpm · {{ t('incidents.safety.blood_oxygen') }}: {{ record.bloodOxygen }}%</span>
              <small>{{ formatDate(record.recordedAt) }} · {{ record.connectivity.toLowerCase() }}</small>
            </div>
            <pv-button icon="pi pi-pencil" text @click="editTelemetry(record)" />
          </article>
          <p v-if="!incidentTelemetry.length" class="empty">{{ t('incidents.safety.no_telemetry') }}</p>
        </div>
      </section>

      <!-- Wearables -->
      <section class="data-card surface-card">
        <header>
          <h2>{{ t('incidents.safety.wearables') }}</h2>
          <p>{{ t('incidents.safety.wearables_hint') }}</p>
        </header>
        <form class="record-form" @submit.prevent="submitWearable">
          <div class="form-group">
            <label>{{ t('incidents.safety.device_id') }}</label>
            <input v-model="wearableForm.deviceId" class="form-control" required />
          </div>
          <div class="form-group">
            <label>{{ t('incidents.safety.battery') }} (%)</label>
            <input v-model.number="wearableForm.batteryLevel" class="form-control" type="number" min="0" max="100" />
          </div>
          <div class="form-group">
            <label>{{ t('incidents.safety.connectivity') }}</label>
            <select v-model="wearableForm.connectivity" class="form-control">
              <option value="CONNECTED">{{ t('incidents.safety.connected') }}</option>
              <option value="DISCONNECTED">{{ t('incidents.safety.disconnected') }}</option>
            </select>
          </div>
          <div class="form-actions-full">
            <pv-button type="submit" :label="wearableForm.id === null ? t('incidents.safety.link_wearable') : t('incidents.safety.update_device')" :disabled="!selectedIncident" />
          </div>
        </form>

        <div class="record-list">
          <article v-for="w in incidentWearables" :key="w.id" class="record-item">
            <div>
              <strong>{{ w.deviceId }}</strong>
              <span>{{ t('incidents.safety.tourist_id') }} #{{ w.touristId }} · {{ w.batteryLevel }}% · {{ t('incidents.safety.connectivity_values.' + w.connectivity) }}</span>
              <small>{{ t('incidents.safety.last_sync') }}: {{ formatDate(w.lastSyncAt) }}</small>
            </div>
            <div class="record-actions">
              <pv-button icon="pi pi-pencil" text @click="editWearable(w)" />
              <pv-button icon="pi pi-trash" severity="danger" text @click="unlink(w)" />
            </div>
          </article>
          <p v-if="!incidentWearables.length" class="empty">{{ t('incidents.safety.no_wearables') }}</p>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.dashboard-page {
  display: grid;
  gap: 1.5rem;
}

.dashboard-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.25rem;
}

.eyebrow {
  margin: 0 0 0.5rem;
  color: var(--tm-green-800);
  font-size: 0.75rem;
  font-weight: 750;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.85rem;
}

.summary-card {
  padding: 1.1rem;
  display: grid;
  gap: 0.4rem;
  color: var(--tm-muted);
  font-size: 0.85rem;
}

.summary-card strong {
  color: var(--tm-text);
  font-size: 1.5rem;
}

.incident-context {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) minmax(0, 1.5fr);
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem;
  border-left: 4px solid var(--tm-green-700);
}

.incident-selector-wrapper {
  display: grid;
  gap: 0.4rem;
}

.incident-selector-wrapper label {
  font-weight: 650;
  font-size: 0.85rem;
}

.context-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.option-id {
  padding: 0.4rem 0.8rem;
  background: var(--tm-green-100);
  color: var(--tm-green-900);
  font-weight: 800;
  border-radius: 0.5rem;
}

.context-details {
  display: grid;
  gap: 0.2rem;
  min-width: 0;
}

.context-details strong {
  color: var(--tm-text);
  font-size: 0.95rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.context-details span {
  color: var(--tm-muted);
  font-size: 0.8rem;
}

.context-badges {
  margin-left: auto;
  display: flex;
  gap: 0.5rem;
}

.status-badge, .severity-badge {
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.status-badge {
  background: var(--tm-green-100);
  color: var(--tm-green-900);
}

.severity-critical { color: #9c3e36; background: #fbefed; }
.severity-high { color: #a45b25; background: #fff2e5; }
.severity-medium { color: #8a7023; background: #fbf7e7; }
.severity-low { color: #426d50; background: #edf5ed; }

.monitoring-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
}

.data-card {
  padding: 1.25rem;
  display: grid;
  gap: 1rem;
}

.data-card header h2 {
  margin: 0 0 0.25rem;
  font-size: 1.15rem;
}

.data-card header p {
  margin: 0;
  color: var(--tm-muted);
  font-size: 0.85rem;
}

.record-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
  padding: 1rem;
  background: var(--tm-green-50);
  border-radius: 0.75rem;
}

.form-group {
  display: grid;
  gap: 0.35rem;
}

.form-group label {
  font-size: 0.8rem;
  font-weight: 650;
}

.form-actions-full {
  grid-column: 1 / -1;
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  text-align: left;
}

th, td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--tm-border);
}

th {
  color: var(--tm-muted);
  font-size: 0.75rem;
  text-transform: uppercase;
}

.record-list {
  display: grid;
  gap: 0.75rem;
}

.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem;
  border: 1px solid var(--tm-border);
  border-radius: 0.65rem;
  background: var(--tm-surface);
}

.record-item > div {
  display: grid;
  gap: 0.25rem;
  min-width: 0;
}

.record-item strong {
  font-size: 0.9rem;
}

.record-item small {
  color: var(--tm-muted);
  font-size: 0.75rem;
}

.alert-title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.empty {
  margin: 0;
  text-align: center;
  color: var(--tm-muted);
  padding: 1rem;
}

@media (max-width: 1000px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .monitoring-grid {
    grid-template-columns: 1fr;
  }
  .incident-context {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .page-heading {
    flex-direction: column;
    align-items: stretch;
  }
  .record-form {
    grid-template-columns: 1fr;
  }
}
</style>