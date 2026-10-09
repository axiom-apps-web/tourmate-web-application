<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSubscriptionStore } from '../../application/subscription.store.js';

const store = useSubscriptionStore();
const router = useRouter();

onMounted(() => {
  store.loadPlans();
});
</script>

<template>
  <section class="p-4">
    <header class="plan-list-header">
      <h1>Planes de suscripción</h1>
      <nav class="plan-list-navigation" aria-label="Navegación de suscripciones">
        <pv-button
            label="Ver suscripciones"
            icon="pi pi-list"
            severity="secondary"
            outlined
            @click="router.push({ name: 'subscriptions-list' })"
        />
        <pv-button
            label="Ver pagos"
            icon="pi pi-wallet"
            @click="router.push({ name: 'subscriptions-payments' })"
        />
      </nav>
    </header>

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

<style scoped>
.plan-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.plan-list-header h1 {
  margin: 0;
}

.plan-list-navigation {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

@media (max-width: 480px) {
  .plan-list-navigation {
    width: 100%;
  }

  .plan-list-navigation :deep(.p-button) {
    flex: 1;
    justify-content: center;
  }
}
</style>
