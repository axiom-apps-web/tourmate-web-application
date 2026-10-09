<script setup>
import { onMounted } from 'vue';
import { useSubscriptionStore } from '../../application/subscription.store.js';

const store = useSubscriptionStore();

onMounted(() => {
  store.loadPayments();
});
</script>

<template>
  <section class="p-4">
    <h1>Pagos</h1>

    <p v-if="store.loading">Cargando pagos...</p>

    <p v-else-if="store.errors.length">
      No se pudieron cargar los pagos.
    </p>

    <div v-else-if="store.payments.length">
      <article
        v-for="payment in store.payments"
        :key="payment.id"
        class="p-3 mb-3 border-round border-1 surface-border"
      >
        <p><strong>ID:</strong> {{ payment.id }}</p>
        <p><strong>Monto:</strong> {{ payment.currency }} {{ payment.amount }}</p>
        <p><strong>Estado:</strong> {{ payment.status }}</p>
        <p><strong>Fecha:</strong> {{ payment.requestedAt }}</p>
      </article>
    </div>

    <p v-else>No hay pagos disponibles.</p>
  </section>
</template>
