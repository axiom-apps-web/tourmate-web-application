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


    <div v-else-if="store.plans.length" class="plans-grid">
    <article
        v-for="plan in store.plans"
        :key="plan.id"
        class="plan-card"
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
.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
  gap: 16px;
}

.plans-grid .plan-card {
  background: white;
  border: 1px solid #dce6df;
  border-radius: 12px;
  padding: 20px;
  margin: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.plans-grid .plan-card h2 {
  font-size: 20px;
  color: #173d30;
  margin: 0 0 20px;
}

.plans-grid .plan-card p {
  font-size: 16px;
  color: #276347;
  margin: 0;
}

</style>
