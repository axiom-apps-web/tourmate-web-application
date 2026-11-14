<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSubscriptionStore } from '../../application/subscription.store.js';
import { Payment } from '../../domain/payment.entity.js';

const store = useSubscriptionStore();
const { t, locale } = useI18n();
const dialogVisible = ref(false);
const saving = ref(false);
const editingId = ref(null);
const form = ref(emptyForm());

function toLocalDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = number => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function emptyForm() {
  return {
    agencyId: null,
    planId: null,
    amount: null,
    currency: 'PEN',
    status: 'PENDING',
    requestedAt: toLocalDateTime(new Date())
  };
}

onMounted(async () => {
  store.clearErrors();
  await store.loadPlans();
  await store.loadPayments();
});

function formatAmount(amount, currency) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return `${currency} ${amount ?? '-'}`;
  return `${currency} ${value.toLocaleString(locale.value === 'es' ? 'es-PE' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function formatDate(value) {
  if (!value) return t('incidents.not_available');
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(locale.value === 'es' ? 'es-PE' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

function statusLabel(status) {
  const es = {
    PENDING: 'Pendiente', PROCESSING: 'En proceso',
    COMPLETED: 'Completado', PAID: 'Pagado', FAILED: 'Fallido'
  };
  const en = {
    PENDING: 'Pending', PROCESSING: 'Processing',
    COMPLETED: 'Completed', PAID: 'Paid', FAILED: 'Failed'
  };
  return (locale.value === 'es' ? es : en)[status] || status;
}

function statusClass(status) {
  return {
    PENDING: 'pending', PROCESSING: 'processing',
    COMPLETED: 'completed', PAID: 'completed', FAILED: 'failed'
  }[status] || 'default';
}

function planName(planId) {
  return store.plans.find(plan => String(plan.id) === String(planId))?.name || `#${planId}`;
}

function openNew() {
  store.clearErrors();
  editingId.value = null;
  form.value = emptyForm();
  dialogVisible.value = true;
}

function openEdit(payment) {
  store.clearErrors();
  editingId.value = payment.id;
  form.value = {
    agencyId: payment.agencyId,
    planId: payment.planId,
    amount: Number(payment.amount),
    currency: payment.currency,
    status: payment.status,
    requestedAt: toLocalDateTime(payment.requestedAt)
  };
  dialogVisible.value = true;
}

async function save() {
  const data = form.value;
  if (!Number.isInteger(Number(data.agencyId)) || Number(data.agencyId) < 1 ||
      !Number.isInteger(Number(data.planId)) || Number(data.planId) < 1 ||
      !Number.isFinite(Number(data.amount)) || Number(data.amount) <= 0 ||
      !data.currency?.trim() || !data.status?.trim() || !data.requestedAt) return;

  saving.value = true;
  try {
    const saved = await store.savePayment(new Payment({
      id: editingId.value,
      agencyId: Number(data.agencyId),
      planId: Number(data.planId),
      amount: Number(data.amount),
      currency: data.currency.trim().toUpperCase(),
      status: data.status,
      requestedAt: new Date(data.requestedAt).toISOString()
    }));
    if (saved) {
      dialogVisible.value = false;
      await store.loadPayments();
    }
  } finally {
    saving.value = false;
  }
}

async function remove(payment) {
  if (window.confirm(t('billing_admin.delete_payment_confirmation', { id: payment.id }))) {
    await store.deletePayment(payment.id);
  }
}
</script>

<template>
  <section class="p-4 payments-section" aria-labelledby="payments-title">
    <header class="payments-heading">
      <h1 id="payments-title">{{ t('billing_admin.payments_title') }}</h1>
      <button type="button" class="payment-action" :disabled="!store.plans.length" @click="openNew">
        + {{ t('billing_admin.register_payment') }}
      </button>
      <span v-if="!store.loading && !store.errors.length" class="count">
        {{ store.payments.length }} {{ locale === 'es' ? 'registros' : 'records' }}
      </span>
    </header>

    <p v-if="store.loading" role="status" aria-live="polite">
      {{ t('billing_admin.loading_payments') }}
    </p>
    <p v-else-if="store.errors.length" role="alert">
      {{ store.errors.map(error => error.message).join(', ') }}
    </p>
    <div v-else-if="store.payments.length" class="payments-grid">
      <article v-for="payment in store.payments" :key="payment.id" class="payment-card">
        <div class="card-header">
          <strong>{{ t('billing_admin.payments_title') }} #{{ payment.id }}</strong>
          <span class="status" :class="statusClass(payment.status)">
            {{ statusLabel(payment.status) }}
          </span>
        </div>

        <p class="amount">{{ formatAmount(payment.amount, payment.currency) }}</p>
        <div class="payment-details">
          <p><strong>{{ t('billing_admin.agency_id') }}:</strong> {{ payment.agencyId }}</p>
          <p><strong>{{ t('billing_admin.plan') }}:</strong> {{ planName(payment.planId) }}</p>
          <p>
            <strong>{{ t('billing_admin.requested_at') }}:</strong>
            <time v-if="payment.requestedAt" :datetime="payment.requestedAt">{{ formatDate(payment.requestedAt) }}</time>
            <span v-else>{{ t('incidents.not_available') }}</span>
          </p>
        </div>
        <div class="payment-actions">
          <button type="button" class="payment-edit" @click="openEdit(payment)">
            ✎ {{ t('billing_admin.edit') }}
          </button>
          <button type="button" class="payment-delete" @click="remove(payment)">
            {{ t('billing_admin.delete') }}
          </button>
        </div>
      </article>
    </div>
    <div v-else class="billing-empty">
      <p>{{ t(store.plans.length ? 'billing_admin.empty_payments' : 'billing_admin.no_plans') }}</p>
    </div>

    <pv-dialog
      v-model:visible="dialogVisible"
      modal
      :header="t(editingId === null ? 'billing_admin.register_payment' : 'billing_admin.edit_payment')"
      :style="{ width: 'min(34rem, calc(100vw - 2rem))' }"
    >
      <form class="payment-form" @submit.prevent="save">
        <label for="payment-agency">{{ t('billing_admin.agency_id') }}</label>
        <input id="payment-agency" v-model.number="form.agencyId" type="number" min="1" step="1" required />

        <label for="payment-plan">{{ t('billing_admin.plan') }}</label>
        <select id="payment-plan" v-model.number="form.planId" required>
          <option :value="null" disabled>{{ t('billing_admin.select_plan') }}</option>
          <option v-for="plan in store.plans" :key="plan.id" :value="plan.id">{{ plan.name }}</option>
        </select>

        <label for="payment-amount">{{ t('billing_admin.payment_amount') }}</label>
        <input id="payment-amount" v-model.number="form.amount" type="number" min="0.01" step="0.01" required />

        <label for="payment-currency">{{ t('billing_admin.currency') }}</label>
        <select id="payment-currency" v-model="form.currency" required>
          <option value="PEN">PEN</option>
          <option value="USD">USD</option>
        </select>

        <label for="payment-status">{{ t('billing_admin.status') }}</label>
        <select id="payment-status" v-model="form.status" required>
          <option value="PENDING">{{ statusLabel('PENDING') }}</option>
          <option value="PROCESSING">{{ statusLabel('PROCESSING') }}</option>
          <option value="COMPLETED">{{ statusLabel('COMPLETED') }}</option>
          <option value="PAID">{{ statusLabel('PAID') }}</option>
          <option value="FAILED">{{ statusLabel('FAILED') }}</option>
        </select>

        <label for="payment-requested-at">{{ t('billing_admin.requested_at') }}</label>
        <input id="payment-requested-at" v-model="form.requestedAt" type="datetime-local" required />

        <div class="form-actions">
          <button type="submit" class="payment-action" :disabled="saving">
            {{ saving ? '...' : t(editingId === null ? 'billing_admin.register_payment' : 'billing_admin.save_changes') }}
          </button>
          <button type="button" class="payment-cancel" :disabled="saving" @click="dialogVisible = false">
            {{ t('billing_admin.cancel') }}
          </button>
        </div>
      </form>
    </pv-dialog>
  </section>
</template>

<style scoped>
.payments-section { max-width: 1200px; margin: 0 auto; }
.payments-heading { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; }
.payments-heading h1 { margin: 0; }
.count { background: #e2efe7; color: #276347; padding: 7px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; }
.payments-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 16px; }
.payment-card { background: #fff; border: 1px solid #dce6df; border-radius: 12px; padding: 20px; min-width: 0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); }
.card-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
.card-header strong { font-size: 15px; color: #173d30; }
.status { padding: 6px 11px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.pending { background: #fff2cc; color: #946200; }
.processing { background: #e2edff; color: #2358a8; }
.completed { background: #dff4e7; color: #237647; }
.failed { background: #fde5e5; color: #a92d2d; }
.default { background: #eeeeee; color: #555555; }
.amount { font-size: 26px; font-weight: 700; color: #173d30; margin: 24px 0; }
.payment-details { border-top: 1px solid #edf0ed; padding-top: 12px; }
.payment-details p { margin: 9px 0; font-size: 14px; color: #46574e; }
.payment-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-top: 15px; }
.payment-action, .payment-edit, .payment-delete, .payment-cancel { border: none; border-radius: 8px; padding: 10px 15px; cursor: pointer; font-weight: 600; }
.payment-action { background: #176448; color: #fff; }
.payment-edit { background: #e2efe7; color: #176448; }
.payment-delete { background: #fde5e5; color: #a92d2d; }
.payment-cancel { background: #eeeeee; color: #333; }
.payment-action:disabled, .payment-cancel:disabled { opacity: 0.6; cursor: not-allowed; }
.billing-empty { padding: 20px; background: #fff; border: 1px solid #dce6df; border-radius: 12px; color: #46574e; }
.payment-form { display: grid; gap: 10px; }
.payment-form label { font-size: 14px; font-weight: 600; color: #173d30; }
.payment-form input, .payment-form select { width: 100%; min-height: 40px; padding: 10px; border: 1px solid #ccd8d0; border-radius: 7px; font: inherit; }
.form-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
</style>
