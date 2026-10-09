import { defineStore } from 'pinia';
import { ref } from 'vue';
import { SubscriptionApi } from '../infrastructure/subscription-api.js';
import { SubscriptionAssembler } from '../infrastructure/subscription.assembler.js';

export const useSubscriptionStore = defineStore('subscription', () => {
  const api = new SubscriptionApi();

  const plans = ref([]);
  const subscriptions = ref([]);
  const payments = ref([]);
  const errors = ref([]);
  const loading = ref(false);

  async function loadPlans() {
    loading.value = true;
    try {
      const data = await api.getPlans();
      plans.value = SubscriptionAssembler.toPlanEntities(data);
    } catch (error) {
      errors.value.push(error);
    } finally {
      loading.value = false;
    }
  }

  async function loadSubscriptions() {
    loading.value = true;
    try {
      const data = await api.getSubscriptions();
      subscriptions.value =
        SubscriptionAssembler.toSubscriptionEntities(data);
    } catch (error) {
      errors.value.push('Error al cargar las suscripciones.');
    } finally {
      loading.value = false;
    }
  }

  async function loadPayments() {
    loading.value = true;
    try {
      const data = await api.getPayments();
      payments.value = SubscriptionAssembler.toPaymentEntities(data);
    } catch (error) {
      errors.value.push('Error al cargar los pagos.');
    } finally {
      loading.value = false;
    }
  }

  return {
    plans,
    subscriptions,
    payments,
    errors,
    loading,
    loadPlans,
    loadSubscriptions,
    loadPayments,
  };
});
