<script setup>
import {computed, onMounted, toRefs} from "vue";
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import {useConfirm} from "primevue";
import useIncidentStore from "../../application/incident.store.js";

const router = useRouter();
const confirm = useConfirm();
const {t, locale} = useI18n();
const store = useIncidentStore();
const {incidents, errors, incidentsLoaded} = toRefs(store);
const {fetchIncidents, deleteIncident, resolveIncident} = store;

const caseMetrics = computed(() => [
  {label: 'incidents.total_cases', value: incidents.value.length, icon: 'pi pi-folder-open'},
  {label: 'incidents.open_cases', value: incidents.value.filter(item => item.status === 'OPEN').length, icon: 'pi pi-exclamation-circle'},
  {label: 'incidents.review_cases', value: incidents.value.filter(item => item.status === 'IN_REVIEW').length, icon: 'pi pi-eye'},
  {label: 'incidents.resolved_cases', value: incidents.value.filter(item => ['RESOLVED', 'CLOSED'].includes(item.status)).length, icon: 'pi pi-check-circle'}
]);

onMounted(() => {
  if (!incidentsLoaded.value) fetchIncidents();
});

function openNewIncident() {
  router.push({name: "incident-new"});
}

function openEditIncident(id) {
  router.push({name: "incident-edit", params: {id}});
}

function formatReportedAt(value, options) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || t("incidents.not_available");

  const language = locale.value === "es" ? "es-PE" : "en-US";
  return new Intl.DateTimeFormat(language, options).format(date);
}

function statusLabel(status) {
  const key = `incidents.status_${String(status || '').toLowerCase()}`;
  const translated = t(key);
  return translated === key ? (status || t('incidents.not_available')) : translated;
}

function confirmDelete(incident) {
  confirm.require({
    message: t('incidents.delete_confirm'),
    header: t('incidents.delete'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteIncident(incident)
  });
}
</script>

<template>
  <section class="incident-page page-shell" aria-labelledby="incident-page-title">
    <header class="incident-header">
      <div>
        <p class="incident-eyebrow">{{ t('shell.workspace') }}</p>
        <h1 id="incident-page-title" class="page-heading">{{ t('incidents.list_title') }}</h1>
        <p class="page-description">{{ t('incidents.list_description') }}</p>
      </div>
      <pv-button :label="t('incidents.new')" icon="pi pi-plus" @click="openNewIncident" />
    </header>

    <div v-if="incidentsLoaded" class="incident-metrics" role="group" :aria-label="t('incidents.total_cases')">
      <article v-for="metric in caseMetrics" :key="metric.label" class="incident-metric surface-card">
        <span class="incident-metric__icon" aria-hidden="true"><i :class="metric.icon"></i></span>
        <span class="incident-metric__copy">
          <span>{{ t(metric.label) }}</span>
          <strong>{{ metric.value }}</strong>
        </span>
      </article>
    </div>

    <p v-if="!incidentsLoaded && !errors.length" class="incident-state" role="status" aria-live="polite">
      <i class="pi pi-spin pi-spinner" aria-hidden="true"></i>
      {{ t('incidents.loading') }}
    </p>

    <div v-else-if="errors.length" class="incident-state incident-state--error" role="alert">
      {{ t('incidents.load_error') }}: {{ errors.map(error => error.message).join(', ') }}
    </div>

    <div v-else-if="incidents.length === 0" class="incident-empty">
      <span class="incident-empty__icon" aria-hidden="true"><i class="pi pi-shield"></i></span>
      <h2>{{ t('incidents.empty_title') }}</h2>
      <p>{{ t('incidents.empty_description') }}</p>
      <pv-button :label="t('incidents.new')" icon="pi pi-plus" @click="openNewIncident" />
    </div>

    <div v-else class="incident-list">
      <article v-for="incident in incidents" :key="incident.id" class="incident-card surface-card">
        <header class="incident-card__header">
          <div class="incident-card__case">
            <span class="incident-card__symbol" aria-hidden="true"><i class="pi pi-shield"></i></span>
            <div>
              <p>{{ t('incidents.id') }} #{{ incident.id }}</p>
              <time :datetime="incident.reportedAt">
                {{ formatReportedAt(incident.reportedAt, {dateStyle: 'medium', timeStyle: 'short'}) }}
              </time>
            </div>
          </div>
          <span class="incident-status" :class="`incident-status--${String(incident.status).toLowerCase()}`">
            {{ statusLabel(incident.status) }}
          </span>
        </header>

        <p class="incident-card__description">{{ incident.description }}</p>

        <dl class="incident-card__metadata">
          <div>
            <dt>{{ t('incidents.active_tour') }}</dt>
            <dd>#{{ incident.activeTourId }}</dd>
          </div>
          <div>
            <dt>{{ t('incidents.reported_by') }}</dt>
            <dd>#{{ incident.reportedByUserId }}</dd>
          </div>
          <div>
            <dt>{{ t('incidents.latitude') }} / {{ t('incidents.longitude') }}</dt>
            <dd>{{ incident.latitude }}, {{ incident.longitude }}</dd>
          </div>
        </dl>

        <div class="incident-card__actions" role="group" :aria-label="t('incidents.actions')">
          <pv-button
              icon="pi pi-check"
              :label="t('incidents.resolve')"
              severity="success"
              outlined
              :disabled="['RESOLVED', 'CLOSED'].includes(incident.status)"
              @click="resolveIncident(incident)"
          />
          <pv-button
              icon="pi pi-pencil"
              :label="t('incidents.edit')"
              text
              @click="openEditIncident(incident.id)"
          />
          <pv-button
              icon="pi pi-trash"
              :label="t('incidents.delete')"
              severity="danger"
              text
              @click="confirmDelete(incident)"
          />
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.incident-page {
  display: grid;
  gap: 1.5rem;
}

.incident-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.25rem;
}

.incident-eyebrow {
  margin: 0 0 0.5rem;
  color: var(--tm-green-800);
  font-size: 0.75rem;
  font-weight: 750;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.incident-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.85rem;
}

.incident-metric {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem;
}

.incident-metric__icon,
.incident-empty__icon {
  display: grid;
  width: 2.8rem;
  height: 2.8rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 0.85rem;
  background: var(--tm-green-100);
  color: var(--tm-green-900);
  font-size: 1.1rem;
}

.incident-metric__copy {
  display: grid;
  gap: 0.2rem;
  color: var(--tm-muted);
  font-size: 0.82rem;
}

.incident-metric__copy strong {
  color: var(--tm-text);
  font-size: 1.35rem;
  font-variant-numeric: tabular-nums;
}

.incident-list {
  display: grid;
  gap: 1rem;
}

.incident-card {
  min-width: 0;
  padding: clamp(1rem, 3vw, 1.5rem);
}

.incident-card__header,
.incident-card__case {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.incident-card__header {
  justify-content: space-between;
  gap: 1rem;
}

.incident-card__symbol {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 0.85rem;
  background: var(--tm-green-100);
  color: var(--tm-green-900);
}

.incident-card__case p,
.incident-card__case time {
  display: block;
  margin: 0;
}

.incident-card__case p {
  color: var(--tm-text);
  font-weight: 700;
}

.incident-card__case time {
  margin-top: 0.2rem;
  color: var(--tm-muted);
  font-size: 0.85rem;
}

.incident-status {
  display: inline-flex;
  min-height: 2rem;
  align-items: center;
  padding: 0.35rem 0.7rem;
  border: 1px solid var(--tm-border);
  border-radius: 999px;
  background: var(--tm-green-50);
  color: var(--tm-green-900);
  font-size: 0.8rem;
  font-weight: 700;
}

.incident-status--in_review {
  background: #fff4d6;
  border-color: #f3c45c;
  color: #5c4300;
}

.incident-status--resolved,
.incident-status--closed {
  background: var(--tm-green-100);
  color: var(--tm-green-900);
}

.incident-card__description {
  margin: 1.25rem 0;
  color: var(--tm-text);
  line-height: 1.65;
  overflow-wrap: anywhere;
}

.incident-card__metadata {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 10rem), 1fr));
  gap: 0.75rem 1rem;
  margin: 0;
  padding: 1rem 0;
  border-block: 1px solid var(--tm-border);
}

.incident-card__metadata dt {
  color: var(--tm-muted);
  font-size: 0.8rem;
}

.incident-card__metadata dd {
  margin: 0.25rem 0 0;
  color: var(--tm-text);
  font-size: 0.9rem;
  font-weight: 650;
  overflow-wrap: anywhere;
}

.incident-card__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.35rem;
  margin-top: 0.85rem;
}

.incident-state,
.incident-empty {
  display: grid;
  justify-items: center;
  gap: 0.75rem;
  padding: clamp(2rem, 7vw, 4rem) 1rem;
  color: var(--tm-muted);
  text-align: center;
}

.incident-state {
  display: flex;
  justify-content: center;
}

.incident-state--error {
  color: var(--tm-danger);
}

.incident-empty h2,
.incident-empty p {
  margin: 0;
}

.incident-empty h2 {
  color: var(--tm-text);
}

.incident-empty p {
  max-width: 36rem;
  line-height: 1.6;
}

@media (max-width: 850px) {
  .incident-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .incident-header {
    align-items: stretch;
    flex-direction: column;
  }

  .incident-header > :deep(.p-button) {
    align-self: flex-start;
  }

  .incident-card__header {
    align-items: flex-start;
  }

  .incident-card__actions {
    justify-content: flex-start;
  }
}

@media (max-width: 380px) {
  .incident-metrics {
    grid-template-columns: 1fr;
  }
}
</style>
