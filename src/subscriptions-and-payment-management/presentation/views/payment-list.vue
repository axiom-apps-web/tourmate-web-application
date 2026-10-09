<script setup>
import { onMounted, ref } from 'vue';
import {useI18n} from 'vue-i18n';
import { useSubscriptionStore } from '../../application/subscription.store.js';
import {Payment} from '../../domain/payment.entity.js';

const store = useSubscriptionStore();
const {t, locale} = useI18n();
const dialogVisible = ref(false);
const saving = ref(false);
const editingId = ref(null);
const form = ref({agencyId: null, planId: null, amount: null, currency: 'USD', status: 'PENDING', requestedAt: ''});

onMounted(async () => {
  store.clearErrors();
  await store.loadPlans();
  await store.loadPayments();
});

function toLocalDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = number => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDate(value) {
  if (!value) return t('incidents.not_available');
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return t('incidents.not_available');
  return new Intl.DateTimeFormat(locale.value === 'es' ? 'es-PE' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

function openNew() {
  editingId.value = null;
  form.value = {agencyId: null, planId: null, amount: null, currency: 'USD', status: 'PENDING', requestedAt: toLocalDateTime(new Date().toISOString())};
  dialogVisible.value = true;
}

function openEdit(payment) {
  editingId.value = payment.id;
  form.value = {
    agencyId: payment.agencyId,
    planId: payment.planId,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    requestedAt: toLocalDateTime(payment.requestedAt)
  };
  dialogVisible.value = true;
}

async function save() {
  if (!form.value.agencyId || !form.value.planId || !Number.isFinite(Number(form.value.amount)) ||
      Number(form.value.amount) < 0 ||
      !form.value.currency.trim() || !form.value.status.trim() || !form.value.requestedAt) return;
  saving.value = true;
  const saved = await store.savePayment(new Payment({
    id: editingId.value,
    agencyId: Number(form.value.agencyId),
    planId: Number(form.value.planId),
    amount: Number(form.value.amount),
    currency: form.value.currency.trim().toUpperCase(),
    status: form.value.status.trim(),
    requestedAt: new Date(form.value.requestedAt).toISOString()
  }));
  saving.value = false;
  if (saved) dialogVisible.value = false;
}

async function remove(payment) {
  if (window.confirm(t('billing_admin.delete_payment_confirmation', {id: payment.id}))) {
    await store.deletePayment(payment.id);
  }
}
</script>

<template>
  <section class="billing-page page-shell" aria-labelledby="payments-title">
    <header class="resource-header">
      <h1 id="payments-title" class="page-heading">{{ t('billing_admin.payments_title') }}</h1>
      <pv-button :label="t('billing_admin.register_payment')" icon="pi pi-plus" :disabled="!store.plans.length" @click="openNew" />
    </header>

    <p v-if="store.loading" role="status" aria-live="polite">{{ t('billing_admin.loading_payments') }}</p>
    <p v-else-if="store.errors.length" role="alert">{{ store.errors.map(error => error.message).join(', ') }}</p>

    <div v-else-if="store.payments.length" class="billing-records">
      <article
        v-for="payment in store.payments"
        :key="payment.id"
        class="billing-record surface-card"
      >
        <p><strong>{{ t('billing_admin.id') }}:</strong> {{ payment.id }}</p>
        <p><strong>{{ t('billing_admin.plan') }}:</strong> {{ store.plans.find(plan => String(plan.id) === String(payment.planId))?.name || payment.planId }}</p>
        <p><strong>{{ t('billing_admin.payment_amount') }}:</strong> {{ payment.currency }} {{ payment.amount }}</p>
        <p><strong>{{ t('billing_admin.status') }}:</strong> {{ payment.status }}</p>
        <p><strong>{{ t('billing_admin.requested_at') }}:</strong>
          <time v-if="payment.requestedAt" :datetime="payment.requestedAt">{{ formatDate(payment.requestedAt) }}</time>
          <span v-else>{{ t('incidents.not_available') }}</span>
        </p>
        <div class="resource-actions">
          <pv-button :label="t('billing_admin.edit')" icon="pi pi-pencil" text @click="openEdit(payment)" />
          <pv-button :label="t('billing_admin.delete')" icon="pi pi-trash" severity="danger" text @click="remove(payment)" />
        </div>
      </article>
    </div>

    <div v-else-if="!store.loading" class="billing-empty">
      <p>{{ t(store.plans.length ? 'billing_admin.empty_payments' : 'billing_admin.no_plans') }}</p>
      <pv-button v-if="store.plans.length" :label="t('billing_admin.register_payment')" icon="pi pi-plus" @click="openNew" />
    </div>

    <pv-dialog v-model:visible="dialogVisible" modal :header="t(editingId ? 'billing_admin.edit_payment' : 'billing_admin.register_payment')" :style="{width: 'min(34rem, calc(100vw - 2rem))'}">
      <form class="resource-form" @submit.prevent="save">
        <label for="payment-agency">{{ t('billing_admin.agency_id') }}</label>
        <input id="payment-agency" v-model.number="form.agencyId" type="number" min="1" required>
        <label for="payment-plan">{{ t('billing_admin.plan') }}</label>
        <select id="payment-plan" v-model="form.planId" required>
          <option :value="null" disabled>{{ t('billing_admin.select_plan') }}</option>
          <option v-for="plan in store.plans" :key="plan.id" :value="plan.id">{{ plan.name }}</option>
        </select>
        <label for="payment-amount">{{ t('billing_admin.payment_amount') }}</label>
        <input id="payment-amount" v-model.number="form.amount" type="number" min="0" step="0.01" required>
        <label for="payment-currency">{{ t('billing_admin.currency') }}</label>
        <input id="payment-currency" v-model.trim="form.currency" required maxlength="3">
        <label for="payment-status">{{ t('billing_admin.status') }}</label>
        <input id="payment-status" v-model.trim="form.status" required>
        <label for="payment-requested-at">{{ t('billing_admin.requested_at') }}</label>
        <input id="payment-requested-at" v-model="form.requestedAt" type="datetime-local" required>
        <div class="resource-actions">
          <pv-button type="submit" :label="editingId ? t('billing_admin.save_changes') : t('billing_admin.register_payment')" icon="pi pi-save" :loading="saving" />
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

.billing-record > p {
  margin: 0 0 0.65rem;
  color: var(--tm-muted);
}

.billing-record strong {
  color: var(--tm-text);
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

.resource-header,
.resource-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.6rem;
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

.resource-form input,
.resource-form select {
  width: 100%;
  min-width: 0;
  min-height: 2.6rem;
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--tm-border);
  border-radius: 0.5rem;
  background: var(--tm-surface);
  color: var(--tm-text);
}

@media (max-width: 480px) {
  .resource-header {
    align-items: stretch;
    flex-direction: column;
  }

  .resource-header :deep(.p-button) {
    width: 100%;
    justify-content: center;
  }
}
</style>
