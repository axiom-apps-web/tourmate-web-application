<script setup>
import { computed, onMounted, ref } from "vue";
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
    router.push({ name: "incidents" });
  }
});

function saveIncident() {
  const incident = new Incident({
    id: isEdit.value ? Number(route.params.id) : null,
    ...form.value
  });

  if (isEdit.value) {
    store.updateIncident(incident);
  } else {
    store.addIncident(incident);
  }
  router.push({ name: "incidents" });
}

function cancel() {
  router.push({ name: "incidents" });
}
</script>

<template>
  <main style="max-width: 760px; margin: 32px auto; padding: 24px; color: #172b4d;">
    <h1>{{ isEdit ? t('incidents.edit_title') : t('incidents.form_title') }}</h1>
    <p>{{ t('incidents.form_description') }}</p>

    <form @submit.prevent="saveIncident" style="display: grid; gap: 16px;">
      <label style="display: grid; gap: 6px;">
        {{ t('incidents.active_tour') }}
        <input v-model.number="form.activeTourId" type="number" min="1" required>
      </label>

      <label style="display: grid; gap: 6px;">
        {{ t('incidents.reported_by') }}
        <input v-model.number="form.reportedByUserId" type="number" min="1" required>
      </label>

      <label style="display: grid; gap: 6px;">
        {{ t('incidents.description') }}
        <textarea v-model="form.description" rows="5" required></textarea>
      </label>

      <label style="display: grid; gap: 6px;">
        {{ t('incidents.status') }}
        <select v-model="form.status" required>
          <option :value="IncidentStatus.OPEN">{{ t('incidents.status_open') }}</option>
          <option :value="IncidentStatus.IN_REVIEW">{{ t('incidents.status_in_review') }}</option>
          <option :value="IncidentStatus.RESOLVED">{{ t('incidents.status_resolved') }}</option>
          <option :value="IncidentStatus.CLOSED">{{ t('incidents.status_closed') }}</option>
        </select>
      </label>

      <label style="display: grid; gap: 6px;">
        {{ t('incidents.latitude') }}
        <input v-model.number="form.latitude" type="number" step="any" min="-90" max="90">
      </label>

      <label style="display: grid; gap: 6px;">
        {{ t('incidents.longitude') }}
        <input v-model.number="form.longitude" type="number" step="any" min="-180" max="180">
      </label>

      <div style="display: flex; gap: 8px;">
        <button type="submit">{{ isEdit ? t('incidents.update') : t('incidents.publish') }}</button>
        <button type="button" @click="cancel">{{ t('common.cancel') }}</button>
      </div>
    </form>

    <p v-if="errors.length" role="alert" style="color: #b42318;">
      {{ t('incidents.save_error') }}: {{ errors.map(error => error.message).join(", ") }}
    </p>
  </main>
</template>
