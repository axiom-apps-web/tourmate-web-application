<script setup>
import { onMounted } from 'vue';
import { useSubscriptionStore } from '../../application/subscription.store.js';

const store = useSubscriptionStore();

onMounted(() => {
  store.loadPlans();
});
</script>

<template>
  <section class="p-4">
    <h1>Planes de suscripción</h1>

    <p v-if="store.loading">Cargando planes...</p>

    <p v-else-if="store.errors.length">
      No se pudieron cargar los planes. Verifica la conexión con la API.
    </p>

    <div v-else-if="store.plans.length">
      <article
        v-for="plan in store.plans"
        :key="plan.id"
        class="p-3 mb-3 border-round border-1 surface-border"
      >
        <h2>{{ plan.name }}</h2>
        <p>Precio: {{ plan.priceCurrency }} {{ plan.priceAmount }}</p>
      </article>
    </div>

    <p v-else>No hay planes disponibles.</p>
  </section>
</template>
