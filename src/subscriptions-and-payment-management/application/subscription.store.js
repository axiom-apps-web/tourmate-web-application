import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSubscriptionStore = defineStore('subscription', () => {
  const plans = ref([]);
  const subscriptions = ref([]);
  const payments = ref([]);
  const errors = ref([]);
  const loading = ref(false);

  const setPlans = (data) => {
    plans.value = data;
  };

  const setSubscriptions = (data) => {
    subscriptions.value = data;
  };

  const setPayments = (data) => {
    payments.value = data;
  };

  const setError = (error) => {
    errors.value.push(error);
  };

  return {
    plans,
    subscriptions,
    payments,
    errors,
    loading,
    setPlans,
    setSubscriptions,
    setPayments,
    setError,
  };
});
