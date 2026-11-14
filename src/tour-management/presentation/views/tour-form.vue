<script setup>

import {useRoute, useRouter} from "vue-router";
import useTourManagementStore from "../../application/tour-management.store.js";
import {computed, onMounted, ref} from "vue";
import {Tour} from "../../domain/model/tour.entity.js";
import {useI18n} from "vue-i18n";

const route = useRoute()
const router = useRouter()
const store = useTourManagementStore()
const {t} = useI18n()
const { errors, addTour, updateTour, getTourById } = store
const saving = ref(false)

const form = ref({
  agencyId: null,
  title: '',
  description: '',
  duration: '',
  difficulty: '',
  priceAmount: 0.0,
  priceCurrency: '',
  status: ''

})

const isEdit = computed(() => !!route.params.id )

onMounted(async () => {
  if(isEdit.value) {
    if (!store.toursLoaded) await store.fetchTours()
    const tour = getTourById(route.params.id)

    if(tour) {
      form.value.agencyId = tour.agencyId
      form.value.title = tour.title
      form.value.description = tour.description
      form.value.duration = tour.duration
      form.value.difficulty = tour.difficulty
      form.value.priceAmount = tour.priceAmount
      form.value.priceCurrency = tour.priceCurrency
      form.value.status = tour.status
    } else {
      router.push({name: 'tour-management-tours'})
    }
  }
})

const saveTour = async () => {
  if (saving.value || !form.value.agencyId || !form.value.title.trim() ||
      !form.value.description.trim() || !form.value.duration.trim() ||
      !Number.isFinite(Number(form.value.priceAmount)) || Number(form.value.priceAmount) < 0 ||
      !form.value.priceCurrency || !form.value.difficulty || !form.value.status) return

  const tour = new Tour({
    id: isEdit.value ? route.params.id : null,
    agencyId: form.value.agencyId,
    title: form.value.title.trim(),
    description: form.value.description.trim(),
    duration: form.value.duration.trim(),
    difficulty: form.value.difficulty,
    priceAmount: form.value.priceAmount,
    priceCurrency: form.value.priceCurrency.trim().toUpperCase(),
    status: form.value.status,
  })

  saving.value = true
  const saved = isEdit.value ? await updateTour(tour) : await addTour(tour)
  saving.value = false
  if (saved) navigateBack()
}

const navigateBack = () => {
  router.push({name: 'tour-management-tours'})
}

const difficultyOptions = computed(() => [
  { label: t('tours.difficulty_easy'), value: 'EASY' },
  { label: t('tours.difficulty_medium'), value: 'MEDIUM' },
  { label: t('tours.difficulty_hard'), value: 'HARD' }
]);

const currencyOptions = [
    { label: 'USD', value: 'USD' },
    { label: 'PEN', value: 'PEN' },
]

const statusOptions = computed(() => [
  { label: t('tours.status_active'), value: 'ACTIVE' },
  { label: t('tours.status_inactive'), value: 'INACTIVE' },
])

</script>

<template>

  <div class="form-container p-4">

    <button type="button" @click="navigateBack" class="back-link inline-flex align-items-center gap-2 mb-4">
      <i class="pi pi-arrow-left"></i>
      <span>{{ t('common.back') }}</span>
    </button>

    <div class="tour-card-form surface-card">
      <span class="subtitle">{{ t('shell.workspace') }}</span>
      <h1 class="title page-heading">{{ isEdit ? t('tours.edit_title') : t('tours.new_title') }}</h1>
      <p class="description-text page-description">{{ t('tours.form_description') }}</p>


      <form @submit.prevent="saveTour">
        <div class="grid formgrid p-fluid">
          <div class="field col-12 md:col-6 mb-4">
            <label for="agencyId" class="font-bold block mb-2">{{ t('tours.agency_id') }} *</label>
            <pv-input-number id="agencyId" v-model="form.agencyId" :min="1" required class="custom-input w-full"></pv-input-number>
          </div>

          <div class="field col-12 md:col-6 mb-4">
            <label for="title" class="font-bold block mb-2">{{ t('tours.title') }} *</label>
            <pv-input-text id="title" v-model="form.title" class="custom-input w-full" required></pv-input-text>
          </div>

          <div class="field col-12 mb-4">
            <label for="description" class="font-bold block mb-2">{{ t('tours.description') }} *</label>
            <pv-textarea
                id="description"
                v-model="form.description"
                placeholder="Describe this experience"
                rows="4"
                autoResize
                class="custom-input w-full"
                required
            />
          </div>

          <div class="field col-12 md:col-4 mb-4">
            <label for="duration" class="font-bold block mb-2">{{ t('tours.duration') }} *</label>
            <pv-input-text
                id="duration"
                v-model="form.duration"
                placeholder="4 hours"
                class="custom-input w-full"
                required
            />
          </div>

          <div class="field col-12 md:col-4 mb-4">
            <label for="priceAmount" class="font-bold block mb-2">{{ t('tours.amount') }} *</label>
            <pv-input-number
                id="priceAmount"
                v-model="form.priceAmount"
                placeholder="120"
                :min="0"
                :min-fraction-digits="2"
                :max-fraction-digits="2"
                class="custom-input w-full"
                required
            />
          </div>

          <div class="field col-12 md:col-4 mb-4">
            <label for="priceCurrency" class="font-bold block mb-2">{{ t('tours.currency') }} *</label>
            <pv-select
                id="priceCurrency"
                v-model="form.priceCurrency"
                :options="currencyOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="USD"
                class="custom-input w-full"
                required
            />
          </div>

          <div class="field col-12 md:col-6 mb-5">
            <label for="difficulty" class="font-bold block mb-2">{{ t('tours.difficulty') }} *</label>
            <pv-select
                id="difficulty"
                v-model="form.difficulty"
                :options="difficultyOptions"
                optionLabel="label"
                optionValue="value"
                :placeholder="t('tours.difficulty')"
                class="custom-input w-full"
                required
            />
          </div>


          <div class="field col-12 md:col-6 mb-5">
            <label for="status" class="font-bold block mb-2">{{ t('tours.status') }} *</label>
            <pv-select
                id="status"
                v-model="form.status"
                :options="statusOptions"
                optionLabel="label"
                optionValue="value"
                :placeholder="t('tours.status')"
                class="custom-input w-full"
                required
            />
          </div>

          <div class="col-12 mt-2">
            <pv-button
                type="submit"
                :label="isEdit ? t('tours.update') : t('tours.create')"
                :loading="saving"
                :disabled="saving"
                class="submit-button w-full font-bold py-3 border-round-xl"
            />
          </div>

        </div>
      </form>

      <p v-if="errors.length" class="tour-form-error" role="alert">
        {{ errors.map(error => error.message).join(', ') }}
      </p>
    </div>

  </div>

</template>

<style scoped>

.form-container {
  width: min(100% - 2rem, 56.25rem);
  max-width: 900px;
  margin: 0 auto;
  padding-block: clamp(1.5rem, 4vw, 3rem);
}

.back-link {
  min-height: 2.75rem;
  padding: 0.5rem 0;
  border: 0;
  background: transparent;
  color: var(--tm-green-900);
  font-weight: 600;
  cursor: pointer;
}

.tour-card-form {
  padding: clamp(1.25rem, 4vw, 2.5rem);
}

.subtitle {
  color: var(--tm-green-800);
  font-size: 0.75rem;
  font-weight: 750;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.title {
  margin-top: 0.55rem;
}

.description-text {
  margin-bottom: 1.5rem;
}

.tour-form-error {
  color: var(--tm-danger);
  overflow-wrap: anywhere;
}

label {
  color: var(--tm-text);
  font-size: 0.95rem;
}

:deep(.p-inputtext),
:deep(.p-select),
:deep(.p-textarea) {
  min-height: 2.75rem;
  background-color: var(--tm-surface);
  color: var(--tm-text);
  border-radius: 0.75rem !important;
  border-color: var(--tm-border) !important;
}

</style>