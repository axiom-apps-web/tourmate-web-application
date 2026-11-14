
<script setup>
import { onMounted, ref, reactive } from 'vue';
import { useSubscriptionStore } from '../../application/subscription.store.js';
import { SubscriptionApi } from '../../infrastructure/subscription-api.js';

const store = useSubscriptionStore();
const api = new SubscriptionApi();

const showForm = ref(false);
const editingId = ref(null);
const saving = ref(false);
const formError = ref('');

const form = reactive({
  agencyId: 1,
  planId: 1,
  status: 'PENDING',
  activatedAt: ''
});

onMounted(() => {
  store.loadSubscriptions();
});

// Nombres de los estados
function statusLabel(status) {
  const labels = {
    ACTIVE: 'Activa',
    PENDING: 'Pendiente',
    SUSPENDED: 'Suspendida',
    CANCELLED: 'Cancelada',
    CANCELED: 'Cancelada',
    EXPIRED: 'Expirada'
  };

  return labels[String(status ?? '').toUpperCase()] || status;
}

// Colores de los estados
function statusClass(status) {
  const classes = {
    ACTIVE: 'active',
    PENDING: 'pending',
    SUSPENDED: 'suspended',
    CANCELLED: 'cancelled',
    CANCELED: 'cancelled',
    EXPIRED: 'cancelled'
  };

  return classes[String(status ?? '').toUpperCase()] || 'default';
}

// Formato de fechas
function formatDate(value) {
  if (!value) return 'Sin fecha';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

// Convertir la fecha para el formulario
function toDateTimeLocal(value) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
  );

  return localDate.toISOString().slice(0, 16);
}

// Abrir formulario para crear
function openNew() {
  editingId.value = null;
  formError.value = '';

  Object.assign(form, {
    agencyId: 1,
    planId: 1,
    status: 'PENDING',
    activatedAt: ''
  });

  showForm.value = true;
}

// Abrir formulario para editar
function openEdit(subscription) {
  editingId.value = subscription.id;
  formError.value = '';

  Object.assign(form, {
    agencyId: subscription.agencyId,
    planId: subscription.planId,
    status: subscription.status,
    activatedAt: toDateTimeLocal(subscription.activatedAt)
  });

  showForm.value = true;
}

// Cancelar formulario
function cancelForm() {
  showForm.value = false;
  editingId.value = null;
  formError.value = '';
}

// Guardar en el backend y MySQL
async function saveSubscription() {
  formError.value = '';

  if (
      !Number.isInteger(Number(form.agencyId)) ||
      Number(form.agencyId) < 1 ||
      !Number.isInteger(Number(form.planId)) ||
      Number(form.planId) < 1
  ) {
    formError.value = 'Ingresa una agencia y un plan válidos.';
    return;
  }

  saving.value = true;

  const payload = {
    agencyId: Number(form.agencyId),
    planId: Number(form.planId),
    status: form.status,
    activatedAt: form.activatedAt
        ? new Date(form.activatedAt).toISOString()
        : null
  };

  try {
    if (editingId.value === null) {
      await api.createSubscription(payload);
    } else {
      await api.updateSubscription(editingId.value, payload);
    }

    await store.loadSubscriptions();

    showForm.value = false;
    editingId.value = null;

  } catch (error) {
    formError.value =
        error.response?.data?.message ||
        'No se pudo guardar la suscripción. Verifica los datos.';
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <section class="p-4 subscriptions-section">

    <!-- Encabezado -->
    <div class="subscriptions-heading">
      <h1>Suscripciones</h1>

      <div class="heading-actions">
        <button
            type="button"
            class="subscription-action"
            @click="openNew"
        >
          + Nueva suscripción
        </button>

        <span
            v-if="!store.loading && !store.errors.length"
            class="count"
        >
          {{ store.subscriptions.length }} registros
        </span>
      </div>
    </div>

    <!-- Formulario para crear y editar -->
    <div v-if="showForm" class="subscription-form-panel">

      <h2>
        {{ editingId === null
          ? 'Nueva suscripción'
          : 'Editar suscripción'
        }}
      </h2>

      <form class="subscription-form" @submit.prevent="saveSubscription">

        <label>
          ID de agencia
          <input
              v-model.number="form.agencyId"
              type="number"
              min="1"
              step="1"
              required
          />
        </label>

        <label>
          ID del plan
          <input
              v-model.number="form.planId"
              type="number"
              min="1"
              step="1"
              required
          />
        </label>

        <label>
          Estado
          <select v-model="form.status" required>
            <option value="PENDING">Pendiente</option>
            <option value="ACTIVE">Activa</option>
            <option value="SUSPENDED">Suspendida</option>
            <option value="CANCELLED">Cancelada</option>
          </select>
        </label>

        <label>
          Fecha de activación
          <input
              v-model="form.activatedAt"
              type="datetime-local"
          />
        </label>

        <p v-if="formError" class="form-error" role="alert">
          {{ formError }}
        </p>

        <div class="form-actions">
          <button
              type="submit"
              class="subscription-action"
              :disabled="saving"
          >
            {{ saving ? 'Guardando...' : 'Guardar suscripción' }}
          </button>

          <button
              type="button"
              class="subscription-cancel"
              :disabled="saving"
              @click="cancelForm"
          >
            Cancelar
          </button>
        </div>

      </form>
    </div>

    <!-- Cargando -->
    <p v-if="store.loading">
      Cargando suscripciones...
    </p>

    <!-- Error -->
    <p v-else-if="store.errors.length" role="alert">
      No se pudieron cargar las suscripciones.
    </p>

    <!-- Tarjetas de suscripciones -->
    <div
        v-else-if="store.subscriptions.length"
        class="subscriptions-grid"
    >
      <article
          v-for="(subscription, index) in store.subscriptions"
          :key="subscription.id"
          class="subscription-card"
      >

        <div class="card-header">
          <strong>Suscripción #{{ index + 1 }}</strong>

          <span
              class="status"
              :class="statusClass(subscription.status)"
          >
            {{ statusLabel(subscription.status) }}
          </span>
        </div>

        <div class="plan-info">
          <span class="field-label">Plan contratado</span>
          <h2>Plan #{{ subscription.planId }}</h2>
        </div>

        <div class="subscription-details">
          <p>
            <strong>ID real:</strong>
            {{ subscription.id }}
          </p>

          <p>
            <strong>Agencia:</strong>
            {{ subscription.agencyId }}
          </p>

          <p>
            <strong>Fecha de activación:</strong>
            {{ formatDate(subscription.activatedAt) }}
          </p>
        </div>

        <!-- Botón editar -->
        <button
            type="button"
            class="subscription-edit"
            @click="openEdit(subscription)"
        >
          ✎ Editar suscripción
        </button>

      </article>
    </div>

    <p v-else>No hay suscripciones disponibles.</p>

  </section>
</template>

<style scoped>
.subscriptions-section {
  max-width: 1200px;
  margin: 0 auto;
}

.subscriptions-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}

.subscriptions-heading h1 {
  margin: 0;
  font-size: 2.2rem;
}

.heading-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.count {
  background: #e2efe7;
  color: #276347;
  padding: 7px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.subscriptions-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(min(100%, 260px), 1fr)
  );
  gap: 16px;
}

.subscription-card {
  background: white;
  border: 1px solid #dce6df;
  border-radius: 12px;
  padding: 20px;
  min-width: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.card-header strong {
  font-size: 15px;
  color: #173d30;
}

.status {
  padding: 6px 11px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.active {
  background: #dff4e7;
  color: #237647;
}

.pending {
  background: #fff2cc;
  color: #946200;
}

.suspended {
  background: #e2edff;
  color: #2358a8;
}

.cancelled {
  background: #fde5e5;
  color: #a92d2d;
}

.default {
  background: #eeeeee;
  color: #555555;
}

.plan-info {
  margin: 24px 0;
}

.field-label {
  font-size: 13px;
  color: #698578;
}

.plan-info h2 {
  font-size: 22px;
  color: #173d30;
  margin: 8px 0;
}

.subscription-details {
  border-top: 1px solid #edf0ed;
  padding-top: 12px;
}

.subscription-details p {
  margin: 10px 0;
  font-size: 14px;
  line-height: 1.5;
  color: #46574e;
}

/* Botones */
.subscription-action,
.subscription-edit {
  background: #176448;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 11px 16px;
  cursor: pointer;
  font-weight: 600;
}

.subscription-action:hover {
  background: #115139;
}

.subscription-edit {
  margin-top: 15px;
  background: #e2efe7;
  color: #176448;
}

.subscription-edit:hover {
  background: #cee5d6;
}

.subscription-action:disabled,
.subscription-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Formulario */
.subscription-form-panel {
  background: white;
  border: 1px solid #dce6df;
  border-radius: 12px;
  padding: 22px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.subscription-form-panel h2 {
  margin: 0 0 20px;
  font-size: 22px;
  color: #173d30;
}

.subscription-form {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(min(100%, 200px), 1fr)
  );
  gap: 16px;
}

.subscription-form label {
  display: flex;
  flex-direction: column;
  gap: 7px;
  font-size: 14px;
  font-weight: 600;
  color: #173d30;
}

.subscription-form input,
.subscription-form select {
  padding: 10px;
  border: 1px solid #ccd8d0;
  border-radius: 7px;
  font: inherit;
  width: 100%;
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.subscription-cancel {
  background: #eeeeee;
  color: #333333;
  border: none;
  border-radius: 8px;
  padding: 11px 16px;
  cursor: pointer;
  font-weight: 600;
}

.form-error {
  color: #b42318;
  grid-column: 1 / -1;
}
</style>
