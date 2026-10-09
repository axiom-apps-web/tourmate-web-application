<script setup>
import { onMounted, toRefs } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import useIncidentStore from "../../application/incident.store.js";

const router = useRouter();
const { t, locale } = useI18n();
const store = useIncidentStore();
const { incidents, errors, incidentsLoaded } = toRefs(store);
const { fetchIncidents, deleteIncident, resolveIncident } = store;

onMounted(() => {
  if (!incidentsLoaded.value) {
    fetchIncidents();
  }
});

function openNewIncident() {
  router.push({ name: "incident-new" });
}

function openEditIncident(id) {
  router.push({ name: "incident-edit", params: { id } });
}

function formatReportedAt(value, options) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || t("incidents.not_available");

  const language = locale.value === "es" ? "es-PE" : "en-US";
  return new Intl.DateTimeFormat(language, options).format(date);
}
</script>

<template>
  <main style="max-width: 1100px; margin: 32px auto; padding: 24px; color: #172b4d;">
    <header style="display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;">
      <div>
        <h1 style="margin: 0 0 8px;">{{ t('incidents.list_title') }}</h1>
        <p style="margin: 0 0 20px;">{{ t('incidents.list_description') }}</p>
      </div>
      <button type="button" @click="openNewIncident">+ {{ t('incidents.new') }}</button>
    </header>

    <p v-if="!incidentsLoaded">{{ t('incidents.loading') }}</p>
    <p v-else-if="errors.length" role="alert" style="color: #b42318;">
      {{ t('incidents.load_error') }}: {{ errors.map(error => error.message).join(", ") }}
    </p>
    <p v-else-if="incidents.length === 0">{{ t('incidents.empty_title') }}</p>

    <div v-if="incidents.length" style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr>
            <th style="padding: 12px; border-bottom: 1px solid #ddd;">{{ t('incidents.id') }}</th>
            <th style="padding: 12px; border-bottom: 1px solid #ddd;">{{ t('incidents.description') }}</th>
            <th style="padding: 12px; border-bottom: 1px solid #ddd;">{{ t('incidents.active_tour') }}</th>
            <th style="padding: 12px; border-bottom: 1px solid #ddd;">{{ t('incidents.status') }}</th>
            <th style="padding: 12px; border-bottom: 1px solid #ddd;">{{ t('incidents.reported_at') }}</th>
            <th style="padding: 12px; border-bottom: 1px solid #ddd;">{{ t('incidents.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="incident in incidents" :key="incident.id">
            <td style="padding: 12px; border-bottom: 1px solid #eee;">#{{ incident.id }}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">{{ incident.description }}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">{{ incident.activeTourId }}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">{{ t(`incidents.status_${incident.status.toLowerCase()}`) }}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee;">
              <time :datetime="incident.reportedAt" style="display: inline-grid; gap: 3px;">
                <strong>{{ formatReportedAt(incident.reportedAt, { dateStyle: "medium" }) }}</strong>
                <span style="color: #64748b; font-size: 0.875rem;">
                  <span aria-hidden="true">◷ </span>{{ formatReportedAt(incident.reportedAt, { timeStyle: "short" }) }}
                </span>
              </time>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; white-space: nowrap;">
              <button type="button" @click="resolveIncident(incident)" :disabled="['RESOLVED', 'CLOSED'].includes(incident.status)">{{ t('incidents.resolve') }}</button>
              <button type="button" @click="openEditIncident(incident.id)">{{ t('incidents.edit') }}</button>
              <button type="button" @click="deleteIncident(incident)">{{ t('incidents.delete') }}</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>
