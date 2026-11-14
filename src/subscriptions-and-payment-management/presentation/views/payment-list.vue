
<script setup>
import { onMounted, ref, reactive } from 'vue';
import { useSubscriptionStore } from '../../application/subscription.store.js';

const store = useSubscriptionStore();

onMounted(() => {
  store.loadPayments();
});

const formatAmount = (amount, currency) => {
  const value = Number(amount);

  if (!Number.isFinite(value)) return `${currency} ${amount ?? '-'}`;

  return `${currency} ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const formatDate = (value) => {
  if (!value) return 'Sin fecha';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
};

const statusLabel = (status) => {
  const labels = {
    PENDING: 'Pendiente',
    PROCESSING: 'En proceso',
    COMPLETED: 'Completado',
    PAID: 'Pagado',
    FAILED: 'Fallido'
  };

  return labels[status] || status;
};

const statusClass = (status) => {
  return {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    PAID: 'completed',
    FAILED: 'failed'
  }[status] || 'default';
};

const showForm = ref(false);
const editingId = ref(null);
const saving = ref(false);
const formError = ref('');

const form = reactive({
  agencyId: 1,
  planId: 1,
  amount: 59.90,
  currency: 'PEN',
  status: 'PENDING',
  requestedAt: ''
});

function openNew() {
  editingId.value = null;
  formError.value = '';

  Object.assign(form, {
    agencyId: 1,
    planId: 1,
    amount: 59.90,
    currency: 'PEN',
    status: 'PENDING',
    requestedAt: ''
  });

  showForm.value = true;
}

function openEdit(payment) {
  editingId.value = payment.id;
  formError.value = '';

  Object.assign(form, {
    agencyId: payment.agencyId,
    planId: payment.planId,
    amount: Number(payment.amount),
    currency: payment.currency,
    status: payment.status,
    requestedAt: String(payment.requestedAt ?? '').slice(0, 16)
  });

  showForm.value = true;
}

async function savePayment() {
  formError.value = '';

  if (editingId.value !== null && !form.requestedAt) {
    formError.value = 'La fecha es obligatoria al editar un pago.';
    return;
  }

  saving.value = true;

  const payload = {
    agencyId: Number(form.agencyId),
    planId: Number(form.planId),
    amount: Number(form.amount),
    currency: form.currency,
    status: form.status,
    requestedAt: form.requestedAt
        ? `${form.requestedAt}:00`
        : null
  };

  try {
    if (editingId.value === null) {
      await store.createPayment(payload);
    } else {
      await store.updatePayment(editingId.value, payload);
    }

    showForm.value = false;
  } catch (error) {
    formError.value =
        error.response?.data?.message ||
        'No se pudo guardar el pago. Revisa los datos.';
  } finally {
    saving.value = false;
  }
}

</script>

<template>
  <section class="p-4 payments-section">
    <div class="payments-heading">
      <h1>Pagos</h1>
      <button type="button" class="payment-action" @click="openNew">
        + Nuevo pago
      </button>
      <span v-if="!store.loading && !store.errors.length" class="count">
        {{ store.payments.length }} registros
      </span>
    </div>

    <p v-if="store.loading">Cargando pagos...</p>

    <p v-else-if="store.errors.length" role="alert">
      No se pudieron cargar los pagos.
    </p>

    <div v-else-if="store.payments.length" class="payments-grid">
      <article
          v-for="payment in store.payments"
          :key="payment.id"
          class="payment-card"
      >
        <div class="card-header">
          <strong>Pago #{{ payment.id }}</strong>
          <span class="status" :class="statusClass(payment.status)">
            {{ statusLabel(payment.status) }}
          </span>
        </div>

        <p class="amount">
          {{ formatAmount(payment.amount, payment.currency) }}
        </p>

        <div class="payment-details">
          <p><strong>Agencia:</strong> {{ payment.agencyId }}</p>
          <p><strong>Plan:</strong> {{ payment.planId }}</p>
          <p><strong>Fecha:</strong> {{ formatDate(payment.requestedAt) }}</p>
        </div>
        <button
            type="button"
            class="payment-edit"
            @click="openEdit(payment)"
        >
          ✎ Editar pago
        </button>
      </article>
    </div>


    <p v-else>No hay pagos disponibles.</p>

    <div v-if="showForm" class="payment-form-panel">
      <h2>
        {{ editingId === null ? 'Nuevo pago' : 'Editar pago' }}
      </h2>

      <form @submit.prevent="savePayment" class="payment-form">
        <label>
          Agencia
          <input v-model.number="form.agencyId" type="number" min="1" required />
        </label>

        <label>
          ID del plan
          <input v-model.number="form.planId" type="number" min="1" required />
        </label>

        <label>
          Monto
          <input
              v-model.number="form.amount"
              type="number"
              min="0.01"
              step="0.01"
              required
          />
        </label>

        <label>
          Moneda
          <select v-model="form.currency">
            <option value="PEN">PEN</option>
            <option value="USD">USD</option>
          </select>
        </label>

        <label>
          Estado
          <select v-model="form.status">
            <option value="PENDING">Pendiente</option>
            <option value="PROCESSING">En proceso</option>
            <option value="COMPLETED">Completado</option>
            <option value="FAILED">Fallido</option>
          </select>
        </label>

        <label>
          Fecha de solicitud
          <input
              v-model="form.requestedAt"
              type="datetime-local"
              :required="editingId !== null"
          />
        </label>

        <p v-if="formError" class="form-error" role="alert">
          {{ formError }}
        </p>

        <div class="form-actions">
          <button type="submit" class="payment-action" :disabled="saving">
            {{ saving ? 'Guardando...' : 'Guardar pago' }}
          </button>
          <button
              type="button"
              class="payment-cancel"
              :disabled="saving"
              @click="showForm = false"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>

  </section>
</template>


<style scoped>
.payments-section {
  max-width: 1200px;
  margin: 0 auto;
}

.payments-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}

.payments-heading h1 {
  margin: 0;
}

.count {
  background: #e2efe7;
  color: #276347;
  padding: 7px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.payments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.payment-card {
  background: #ffffff;
  border: 1px solid #dce6df;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.status {
  padding: 6px 11px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.pending {
  background: #fff2cc;
  color: #946200;
}

.processing {
  background: #e2edff;
  color: #2358a8;
}

.completed {
  background: #dff4e7;
  color: #237647;
}

.failed {
  background: #fde5e5;
  color: #a92d2d;
}

.default {
  background: #eeeeee;
  color: #555555;
}

.amount {
  font-size: 26px;
  font-weight: 700;
  color: #173d30;
  margin: 24px 0;
}

.payment-details {
  border-top: 1px solid #edf0ed;
  padding-top: 12px;
}

.payment-details p {
  margin: 9px 0;
  font-size: 14px;
  color: #46574e;
}

.payment-action,
.payment-edit {
  background: #176448;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 15px;
  cursor: pointer;
  font-weight: 600;
}

.payment-edit {
  margin-top: 15px;
  background: #e2efe7;
  color: #176448;
}

.payment-form-panel {
  background: white;
  border: 1px solid #dce6df;
  border-radius: 12px;
  padding: 22px;
  margin-top: 24px;
}

.payment-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.payment-form label {
  display: flex;
  flex-direction: column;
  gap: 7px;
  font-weight: 600;
  color: #173d30;
}

.payment-form input,
.payment-form select {
  padding: 10px;
  border: 1px solid #ccd8d0;
  border-radius: 7px;
  font: inherit;
}

.form-actions {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.payment-cancel {
  background: #eeeeee;
  border: none;
  border-radius: 8px;
  padding: 10px 15px;
  cursor: pointer;
}

.form-error {
  color: #b42318;
  grid-column: 1 / -1;
}

</style>
