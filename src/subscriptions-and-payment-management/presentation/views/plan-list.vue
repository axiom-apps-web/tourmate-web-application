<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {useI18n} from 'vue-i18n';
import { useSubscriptionStore } from '../../application/subscription.store.js';
import {Plan} from '../../domain/plan.entity.js';

const store = useSubscriptionStore();
const router = useRouter();
const {t} = useI18n();
const dialogVisible = ref(false);
const saving = ref(false);
const editingId = ref(null);
const form = ref({name: '', priceAmount: null, priceCurrency: 'USD'});

onMounted(() => {
  store.clearErrors();
  store.loadPlans();
});

function openNew() {
  editingId.value = null;
  form.value = {name: '', priceAmount: null, priceCurrency: 'USD'};
  dialogVisible.value = true;
}

function openEdit(plan) {
  editingId.value = plan.id;
  form.value = {name: plan.name, priceAmount: plan.priceAmount, priceCurrency: plan.priceCurrency};
  dialogVisible.value = true;
}

async function save() {
  if (!form.value.name.trim() || !Number.isFinite(Number(form.value.priceAmount)) ||
      Number(form.value.priceAmount) < 0 || !form.value.priceCurrency.trim()) return;
  saving.value = true;
  const saved = await store.savePlan(new Plan({
    id: editingId.value,
    name: form.value.name.trim(),
    priceAmount: Number(form.value.priceAmount),
    priceCurrency: form.value.priceCurrency.trim().toUpperCase()
  }));
  saving.value = false;
  if (saved) dialogVisible.value = false;
}

async function remove(plan) {
  if (window.confirm(t('billing_admin.delete_plan_confirmation', {name: plan.name}))) {
    await store.deletePlan(plan.id);
  }
}
</script>

<template>
  <section class="billing-page page-shell" aria-labelledby="plans-title">
    <header class="plan-list-header">
      <h1 id="plans-title" class="page-heading">{{ t('billing_admin.plans_title') }}</h1>
      <nav class="plan-list-navigation" :aria-label="t('billing_admin.plans_title')">
        <pv-button
            :label="t('billing_admin.view_subscriptions')"
            icon="pi pi-list"
            severity="secondary"
            outlined
            @click="router.push({ name: 'subscriptions-list' })"
        />
        <pv-button :label="t('billing_admin.add_plan')" icon="pi pi-plus" @click="openNew" />
        <pv-button
            :label="t('billing_admin.view_payments')"
            icon="pi pi-wallet"
            @click="router.push({ name: 'subscriptions-payments' })"
        />
      </nav>
    </header>

    <p v-if="store.loading" role="status" aria-live="polite">{{ t('billing_admin.loading_plans') }}</p>

    <p v-else-if="store.errors.length" role="alert">{{ store.errors.map(error => error.message).join(', ') }}</p>

    <div v-else-if="store.plans.length" class="billing-records">
      <article
        v-for="plan in store.plans"
        :key="plan.id"
        class="billing-record surface-card"
      >
        <h2>{{ plan.name }}</h2>
        <p>{{ t('billing_admin.plan_price', {currency: plan.priceCurrency, amount: plan.priceAmount}) }}</p>
        <div class="plan-actions">
          <pv-button :label="t('billing_admin.edit')" icon="pi pi-pencil" text @click="openEdit(plan)" />
          <pv-button :label="t('billing_admin.delete')" icon="pi pi-trash" severity="danger" text @click="remove(plan)" />
        </div>
      </article>
    </div>

    <div v-else-if="!store.loading" class="billing-empty">
      <p>{{ t('billing_admin.empty_plans') }}</p>
      <pv-button :label="t('billing_admin.add_plan')" icon="pi pi-plus" @click="openNew" />
    </div>

    <pv-dialog v-model:visible="dialogVisible" modal :header="t(editingId ? 'billing_admin.edit_plan' : 'billing_admin.new_plan')" :style="{width: 'min(32rem, calc(100vw - 2rem))'}">
      <form class="resource-form" @submit.prevent="save">
        <label for="plan-name">{{ t('billing_admin.plan_name') }}</label>
        <input id="plan-name" v-model.trim="form.name" required maxlength="120">
        <label for="plan-price">{{ t('billing_admin.price') }}</label>
        <input id="plan-price" v-model.number="form.priceAmount" type="number" min="0" step="0.01" required>
        <label for="plan-currency">{{ t('billing_admin.currency') }}</label>
        <input id="plan-currency" v-model.trim="form.priceCurrency" required maxlength="3">
        <div class="resource-form__actions">
          <pv-button type="submit" :label="editingId ? t('billing_admin.save_changes') : t('billing_admin.create_plan')" icon="pi pi-save" :loading="saving" />
          <pv-button type="button" :label="t('billing_admin.cancel')" severity="secondary" outlined @click="dialogVisible = false" />
        </div>
      </form>
    </pv-dialog>
  </section>
</template>

<style scoped>
.billing-page {
  display: grid;
  gap: 1rem;
}

.billing-records {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  gap: 1rem;
}

.billing-record {
  min-width: 0;
  padding: clamp(1rem, 3vw, 1.5rem);
  overflow-wrap: anywhere;
}

.billing-record h2 {
  margin-top: 0;
  font-size: 1.25rem;
}

.billing-record p {
  color: var(--tm-muted);
}

.billing-empty {
  display: grid;
  justify-items: start;
  gap: 0.75rem;
  padding: 1.25rem;
  border: 1px solid var(--tm-border);
  border-radius: 0.8rem;
  background: var(--tm-surface);
  color: var(--tm-muted);
}

.plan-actions,
.resource-form__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.resource-form {
  display: grid;
  gap: 0.55rem;
}

.resource-form label {
  margin-top: 0.3rem;
  color: var(--tm-text);
  font-weight: 600;
}

.resource-form input {
  min-height: 2.6rem;
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--tm-border);
  border-radius: 0.5rem;
  background: var(--tm-surface);
  color: var(--tm-text);
}

.resource-form__actions {
  margin-top: 0.75rem;
}

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
    flex: 1 1 100%;
    justify-content: center;
  }
}
</style>
