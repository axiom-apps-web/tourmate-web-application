<script setup>
import { onMounted } from 'vue';
import { useSubscriptionStore } from '../../application/subscription.store.js';

const store = useSubscriptionStore();

onMounted(() => {
  store.loadSubscriptions();
});
</script>

<template>
  <section class="p-4">
    <h1>Suscripciones</h1>

    <p v-if="store.loading">Cargando suscripciones...</p>

    <p v-else-if="store.errors.length">
      No se pudieron cargar las suscripciones.
    </p>

    <div v-else-if="store.subscriptions.length">
      <article
        v-for="subscription in store.subscriptions"
        :key="subscription.id"
        class="p-3 mb-3 border-round border-1 surface-border"
      >
        <p><strong>ID:</strong> {{ subscription.id }}</p>
        <p><strong>Plan:</strong> {{ subscription.planId }}</p>
        <p><strong>Estado:</strong> {{ subscription.status }}</p>
        <p><strong>Activada:</strong> {{ subscription.activatedAt }}</p>
      </article>
    </div>

    <p v-else>No hay suscripciones disponibles.</p>
  </section>
</template>
