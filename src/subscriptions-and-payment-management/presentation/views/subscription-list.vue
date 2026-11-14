<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSubscriptionStore } from '../../application/subscription.store.js';
import { Subscription } from '../../domain/subscription.entity.js';

const store = useSubscriptionStore();
const { t, locale } = useI18n();
const dialogVisible = ref(false);
const saving = ref(false);
const editingId = ref(null);
const formError = ref('');
const form = ref(emptyForm());

function emptyForm() {
  return { agencyId: null, planId: null, status: 'PENDING', activatedAt: '' };
}

onMounted(async () => {
  store.clearErrors();
  await store.loadPlans();
  await store.loadSubscriptions();
});

function toLocalDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDate(value) {
  if (!value) return t('incidents.not_available');
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(locale.value === 'es' ? 'es-PE' : 'en-US', {
    dateStyle: 'medium', timeStyle: 'short'
  }).format(date);
}

function statusLabel(status) {
  const key = String(status ?? '').toUpperCase();
  const es = {
    ACTIVE: 'Activa', PENDING: 'Pendiente', SUSPENDED: 'Suspendida',
    CANCELLED: 'Cancelada', CANCELED: 'Cancelada', EXPIRED: 'Expirada'
  };
  const en = {
    ACTIVE: 'Active', PENDING: 'Pending', SUSPENDED: 'Suspended',
    CANCELLED: 'Cancelled', CANCELED: 'Cancelled', EXPIRED: 'Expired'
  };
  return (locale.value === 'es' ? es : en)[key] || status;
}

function statusClass(status) {
  return {
    ACTIVE: 'active', PENDING: 'pending', SUSPENDED: 'suspended',
    CANCELLED: 'cancelled', CANCELED: 'cancelled', EXPIRED: 'cancelled'
  }[String(status ?? '').toUpperCase()] || 'default';
}

function planName(planId) {
  return store.plans.find(plan => String(plan.id) === String(planId))?.name || `#${planId}`;
}

function openNew() {
  store.clearErrors();
  formError.value = '';
  editingId.value = null;
  form.value = emptyForm();
  dialogVisible.value = true;
}

function openEdit(subscription) {
  store.clearErrors();
  formError.value = '';
  editingId.value = subscription.id;
  form.value = {
    agencyId: subscription.agencyId,
    planId: subscription.planId,
    status: subscription.status,
    activatedAt: toLocalDateTime(subscription.activatedAt)
  };
  dialogVisible.value = true;
}

async function save() {
  formError.value = '';
  const data = form.value;
  const agencyId = Number(data.agencyId);
  const planId = Number(data.planId);

  if (!Number.isInteger(agencyId) || agencyId < 1 ||
      !Number.isInteger(planId) || planId < 1 ||
      !String(data.status || '').trim()) {
    formError.value = locale.value === 'es'
      ? 'Revisa la agencia, el plan y el estado.'
      : 'Check the agency, plan and status.';
    return;
  }

  saving.value = true;
  try {
    const saved = await store.saveSubscription(new Subscription({
      id: editingId.value,
      agencyId,
      planId,
      status: data.status,
      activatedAt: data.activatedAt
        ? new Date(data.activatedAt).toISOString()
        : null
    }));

    if (saved) {
      dialogVisible.value = false;
      await store.loadSubscriptions();
    } else {
      formError.value = store.errors.map(error => error.message).join(', ') ||
        (locale.value === 'es' ? 'No se pudo guardar la suscripción.' : 'Could not save subscription.');
    }
  } catch (error) {
    formError.value = error.response?.data?.message || error.message ||
      (locale.value === 'es' ? 'No se pudo guardar la suscripción.' : 'Could not save subscription.');
  } finally {
    saving.value = false;
  }
}

async function remove(subscription) {
  if (window.confirm(t('billing_admin.delete_subscription_confirmation', { id: subscription.id }))) {
    await store.deleteSubscription(subscription.id);
  }
}
</script>

<template>
  <section class="p-4 subscriptions-section" aria-labelledby="subscriptions-title">
    <header class="subscriptions-heading">
      <h1 id="subscriptions-title">{{ t('billing_admin.subscriptions_title') }}</h1>
      <div class="heading-actions">
        <button type="button" class="subscription-action" :disabled="!store.plans.length" @click="openNew">
          + {{ t('billing_admin.create_subscription') }}
        </button>
        <span v-if="!store.loading && !store.errors.length" class="count">
          {{ store.subscriptions.length }} {{ locale === 'es' ? 'registros' : 'records' }}
        </span>
      </div>
    </header>

    <p v-if="store.loading" role="status" aria-live="polite">
      {{ t('billing_admin.loading_subscriptions') }}
    </p>
    <p v-else-if="store.errors.length" role="alert">
      {{ store.errors.map(error => error.message).join(', ') }}
    </p>

    <div v-else-if="store.subscriptions.length" class="subscriptions-grid">
      <article v-for="(subscription, index) in store.subscriptions" :key="subscription.id" class="subscription-card">
        <div class="card-header">
          <strong>{{ t('billing_admin.subscriptions_title') }} #{{ index + 1 }}</strong>
          <span class="status" :class="statusClass(subscription.status)">
            {{ statusLabel(subscription.status) }}
          </span>
        </div>

        <div class="plan-info">
          <span class="field-label">{{ t('billing_admin.plan') }}</span>
          <h2>{{ planName(subscription.planId) }}</h2>
        </div>

        <div class="subscription-details">
          <p><strong>{{ t('billing_admin.id') }}:</strong> {{ subscription.id }}</p>
          <p><strong>{{ t('billing_admin.agency_id') }}:</strong> {{ subscription.agencyId }}</p>
          <p>
            <strong>{{ t('billing_admin.activated_at') }}:</strong>
            <time v-if="subscription.activatedAt" :datetime="subscription.activatedAt">{{ formatDate(subscription.activatedAt) }}</time>
            <span v-else>{{ t('incidents.not_available') }}</span>
          </p>
        </div>

        <div class="subscription-actions">
          <button type="button" class="subscription-edit" @click="openEdit(subscription)">
            ✎ {{ t('billing_admin.edit') }}
          </button>
          <button type="button" class="subscription-delete" @click="remove(subscription)">
            {{ t('billing_admin.delete') }}
          </button>
        </div>
      </article>
    </div>
    <div v-else class="billing-empty">
      <p>{{ t(store.plans.length ? 'billing_admin.empty_subscriptions' : 'billing_admin.no_plans') }}</p>
    </div>

    <pv-dialog
      v-model:visible="dialogVisible"
      modal
      :header="t(editingId === null ? 'billing_admin.new_subscription' : 'billing_admin.edit_subscription')"
      :style="{ width: 'min(34rem, calc(100vw - 2rem))' }"
    >
      <form class="subscription-form" @submit.prevent="save">
        <label for="subscription-agency">{{ t('billing_admin.agency_id') }}</label>
        <input id="subscription-agency" v-model.number="form.agencyId" type="number" min="1" step="1" required>

        <label for="subscription-plan">{{ t('billing_admin.plan') }}</label>
        <select id="subscription-plan" v-model="form.planId" required>
          <option :value="null" disabled>{{ t('billing_admin.select_plan') }}</option>
          <option v-for="plan in store.plans" :key="plan.id" :value="plan.id">{{ plan.name }}</option>
        </select>

        <label for="subscription-status">{{ t('billing_admin.status') }}</label>
        <select id="subscription-status" v-model="form.status" required>
          <option value="PENDING">{{ statusLabel('PENDING') }}</option>
          <option value="ACTIVE">{{ statusLabel('ACTIVE') }}</option>
          <option value="SUSPENDED">{{ statusLabel('SUSPENDED') }}</option>
          <option value="CANCELLED">{{ statusLabel('CANCELLED') }}</option>
          <option value="EXPIRED">{{ statusLabel('EXPIRED') }}</option>
        </select>

        <label for="subscription-activated-at">{{ t('billing_admin.activated_at') }}</label>
        <input id="subscription-activated-at" v-model="form.activatedAt" type="datetime-local">

        <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>
        <div class="form-actions">
          <button type="submit" class="subscription-action" :disabled="saving">
            {{ saving ? (locale === 'es' ? 'Guardando...' : 'Saving...') : t(editingId === null ? 'common.create' : 'billing_admin.save_changes') }}
          </button>
          <button type="button" class="subscription-cancel" :disabled="saving" @click="dialogVisible = false">
            {{ t('billing_admin.cancel') }}
          </button>
        </div>
      </form>
    </pv-dialog>
  </section>
</template>

<style scoped>
.subscriptions-section { max-width: 1200px; margin: 0 auto; }
.subscriptions-heading {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 12px; margin-bottom: 24px;
}
.subscriptions-heading h1 { margin: 0; font-size: 2.2rem; }
.heading-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; }
.count {
  background: #e2efe7; color: #276347; padding: 7px 14px;
  border-radius: 20px; font-size: 13px; font-weight: 600;
}
.subscriptions-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap: 16px;
}
.subscription-card {
  background: #fff; border: 1px solid #dce6df; border-radius: 12px;
  padding: 20px; min-width: 0; box-shadow: 0 2px 8px rgba(0, 0, 0, .04);
}
.card-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
.card-header strong { font-size: 15px; color: #173d30; }
.status { padding: 6px 11px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.active { background: #dff4e7; color: #237647; }
.pending { background: #fff2cc; color: #946200; }
.suspended { background: #e2edff; color: #2358a8; }
.cancelled { background: #fde5e5; color: #a92d2d; }
.default { background: #eee; color: #555; }
.plan-info { margin: 24px 0; }
.field-label { font-size: 13px; color: #698578; }
.plan-info h2 { font-size: 22px; color: #173d30; margin: 8px 0; overflow-wrap: anywhere; }
.subscription-details { border-top: 1px solid #edf0ed; padding-top: 12px; }
.subscription-details p { margin: 10px 0; font-size: 14px; line-height: 1.5; color: #46574e; }
.subscription-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px; }
.subscription-action, .subscription-edit, .subscription-delete, .subscription-cancel {
  border: none; border-radius: 8px; padding: 10px 15px;
  cursor: pointer; font-weight: 600;
}
.subscription-action { background: #176448; color: white; }
.subscription-action:hover { background: #115139; }
.subscription-edit { background: #e2efe7; color: #176448; }
.subscription-edit:hover { background: #cee5d6; }
.subscription-delete { background: #fde5e5; color: #a92d2d; }
.subscription-cancel { background: #eee; color: #333; }
.subscription-action:disabled, .subscription-cancel:disabled { opacity: .6; cursor: not-allowed; }
.subscription-form { display: grid; gap: 10px; }
.subscription-form label { font-size: 14px; font-weight: 600; color: #173d30; }
.subscription-form input, .subscription-form select {
  padding: 10px; border: 1px solid #ccd8d0; border-radius: 7px;
  font: inherit; width: 100%; background: white; color: #173d30;
}
.form-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 8px; }
.form-error { color: #b42318; }
.billing-empty {
  padding: 20px; background: white; border: 1px solid #dce6df;
  border-radius: 12px; color: #46574e;
}
@media (max-width: 480px) {
  .subscriptions-heading { align-items: flex-start; }
  .heading-actions { width: 100%; }
}
</style>
