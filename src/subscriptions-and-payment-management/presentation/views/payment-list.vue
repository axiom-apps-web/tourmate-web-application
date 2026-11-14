
<script setup>
import { onMounted } from 'vue';
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
</script>

<template>
  <section class="p-4 payments-section">
    <div class="payments-heading">
      <h1>Pagos</h1>
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
      </article>
    </div>

    <p v-else>No hay pagos disponibles.</p>
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
</style>
