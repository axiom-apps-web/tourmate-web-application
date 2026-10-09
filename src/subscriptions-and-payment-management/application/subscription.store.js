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

  function clearErrors() {
    errors.value = [];
  }

  async function loadPlans() {
    loading.value = true;
    try {
      const response = await api.getPlans();
      plans.value = SubscriptionAssembler.toPlanEntities(response.data);
    } catch (error) {
      errors.value.push(error);
    } finally {
      loading.value = false;
    }
  }

  async function loadSubscriptions() {
    loading.value = true;
    try {
      const response = await api.getSubscriptions();
      subscriptions.value =
          SubscriptionAssembler.toSubscriptionEntities(response.data);
    } catch (error) {
      errors.value.push(error);
    } finally {
      loading.value = false;
    }
  }

  async function loadPayments() {
    loading.value = true;
    try {
      const response = await api.getPayments();
      payments.value = SubscriptionAssembler.toPaymentEntities(response.data);
    } catch (error) {
      errors.value.push(error);
    } finally {
      loading.value = false;
    }
  }

  async function saveResource(collection, entity, create, update, toEntity) {
    errors.value = [];
    try {
      const response = entity.id == null
        ? await create(entity)
        : await update(entity.id, entity);
      const saved = toEntity(response.data);
      const index = collection.value.findIndex(item => String(item.id) === String(saved.id));
      if (index < 0) collection.value.push(saved);
      else collection.value[index] = saved;
      return true;
    } catch (error) {
      errors.value.push(error);
      return false;
    }
  }

  async function removeResource(collection, id, remove) {
    errors.value = [];
    try {
      await remove(id);
      collection.value = collection.value.filter(item => String(item.id) !== String(id));
      return true;
    } catch (error) {
      errors.value.push(error);
      return false;
    }
  }

  function savePlan(plan) {
    return saveResource(plans, plan, api.createPlan.bind(api), api.updatePlan.bind(api), SubscriptionAssembler.toPlanEntity);
  }

  function deletePlan(id) {
    return removeResource(plans, id, api.deletePlan.bind(api));
  }

  function saveSubscription(subscription) {
    return saveResource(subscriptions, subscription, api.createSubscription.bind(api), api.updateSubscription.bind(api), SubscriptionAssembler.toSubscriptionEntity);
  }

  function deleteSubscription(id) {
    return removeResource(subscriptions, id, api.deleteSubscription.bind(api));
  }

  function savePayment(payment) {
    return saveResource(payments, payment, api.createPayment.bind(api), api.updatePayment.bind(api), SubscriptionAssembler.toPaymentEntity);
  }

  function deletePayment(id) {
    return removeResource(payments, id, api.deletePayment.bind(api));
  }

  return {
    plans,
    subscriptions,
    payments,
    errors,
    loading,
    clearErrors,
    loadPlans,
    loadSubscriptions,
    loadPayments,
    savePlan,
    deletePlan,
    saveSubscription,
    deleteSubscription,
    savePayment,
    deletePayment,
  };
});
