
<script setup>
import { onMounted } from 'vue';
import { useSubscriptionStore } from '../../application/subscription.store.js';

const store = useSubscriptionStore();

onMounted(() => {
  store.loadSubscriptions();
});

const statusLabel = (status) => {
  const labels = {
    ACTIVE: 'Activa',
    PENDING: 'Pendiente',
    SUSPENDED: 'Suspendida',
    CANCELLED: 'Cancelada',
    CANCELED: 'Cancelada',
    EXPIRED: 'Expirada'
  };

  return labels[String(status ?? '').toUpperCase()] || status;
};

const statusClass = (status) => {
  const classes = {
    ACTIVE: 'active',
    PENDING: 'pending',
    SUSPENDED: 'suspended',
    CANCELLED: 'cancelled',
    CANCELED: 'cancelled',
    EXPIRED: 'cancelled'
  };

  return classes[String(status ?? '').toUpperCase()] || 'default';
};

const formatDate = (value) => {
  if (!value) return 'Sin fecha';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
};
</script>

<template>
  <section class="p-4 subscriptions-section">

    <div class="subscriptions-heading">
      <h1>Suscripciones</h1>

      <span
          v-if="!store.loading && !store.errors.length"
          class="count"
      >
        {{ store.subscriptions.length }} registros
      </span>
    </div>

    <p v-if="store.loading">
      Cargando suscripciones...
    </p>

    <p v-else-if="store.errors.length" role="alert">
      No se pudieron cargar las suscripciones.
    </p>

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

      </article>
    </div>

    <p v-else>
      No hay suscripciones disponibles.
    </p>

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
  background: #ffffff;
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
</style>
