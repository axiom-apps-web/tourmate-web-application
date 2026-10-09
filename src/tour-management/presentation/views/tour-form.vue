<script setup>

import {useRoute, useRouter} from "vue-router";
import useTourManagementStore from "../../application/tour-management.store.js";
import {computed, onMounted, ref} from "vue";
import {Tour} from "../../domain/model/tour.entity.js";
import {InputNumber as PvInputNumber, InputText as PvInputText, Select as PvSelect} from "primevue";


const route = useRoute()
const router = useRouter()
const store = useTourManagementStore()
const { errors, addTour, updateTour, getTourById } = store

const form = ref({
  agencyId: 0,
  title: '',
  description: '',
  duration: '',
  difficulty: '',
  priceAmount: 0.0,
  priceCurrency: '',
  status: ''

})

const isEdit = computed(() => !!route.params.id )

onMounted(() => {
  if(isEdit.value) {
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

const saveTour = () => {
  const tour = new Tour({
    id: isEdit.value ? route.params.id : null,
    agencyId: form.value.agencyId,
    title: form.value.title,
    description: form.value.description,
    duration: form.value.duration,
    difficulty: form.value.difficulty,
    priceAmount: form.value.priceAmount,
    priceCurrency: form.value.priceCurrency,
    status: form.value.status,
  })

  if(isEdit.value) updateTour(tour)
  else addTour(tour)

  navigateBack()
}

const navigateBack = () => {
  router.push({name: 'tour-management-tours'})
}

const difficultyOptions = ref([
  { label: 'Easy', value: 'EASY' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'Hard', value: 'HARD' }
]);

const currencyOptions = ref([
    { label: 'USD', value: 'USD' },
    { label: 'PEN', value: 'PEN' },
])

const statusOptions = ref([
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
])

</script>

<template>

  <div class="form-container p-4">

    <a @click="navigateBack" class="back-link inline-flex align-items-center gap-2 mb-4 cursor-pointer">
      <i class="pi pi-arrow-left"></i>
      <span>Back</span>
    </a>

    <div class="tour-card-form p-6 border-round-3xl shadow-1">
      <span class="subtitle uppercase text-xs font-bold tracking-wider block mb-2">TOUR MANAGEMENT</span>
      <h1 class="title m-0 mb-2">{{ isEdit ? 'Edit tour' : 'New tour' }}</h1>
      <p class="description-text m-0 mb-5">Update the tour details</p>


      <form @submit.prevent="saveTour">
        <div class="grid formgrid p-fluid">
          <div class="field col-12 md:col-6 mb-4">
            <label for="agencyId" class="font-bold block mb-2">AgencyId</label>
            <pv-input-number id="agencyId" v-model="form.agencyId" placeholder="Ej. 1" :min="1" class="custom-input w-full"></pv-input-number>
          </div>

          <div class="field col-12 md:col-6 mb-4">
            <label for="title" class="font-bold block mb-2">Title</label>
            <pv-input-text id="title" v-model="form.title" class="custom-input w-full" required></pv-input-text>
          </div>

          <div class="field col-12 mb-4">
            <label for="description" class="font-bold block mb-2">Description</label>
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
            <label for="duration" class="font-bold block mb-2">Duration</label>
            <pv-input-text
                id="duration"
                v-model="form.duration"
                placeholder="4 hours"
                class="custom-input w-full"
                required
            />
          </div>

          <div class="field col-12 md:col-4 mb-4">
            <label for="priceAmount" class="font-bold block mb-2">Price amount</label>
            <pv-input-number
                id="priceAmount"
                v-model="form.priceAmount"
                placeholder="120"
                class="custom-input w-full"
            />
          </div>

          <div class="field col-12 md:col-4 mb-4">
            <label for="priceCurrency" class="font-bold block mb-2">Currency</label>
            <pv-select
                id="priceCurrency"
                v-model="form.priceCurrency"
                :options="currencyOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="USD"
                class="custom-input w-full"
            />
          </div>

          <div class="field col-12 md:col-6 mb-5">
            <label for="difficulty" class="font-bold block mb-2">Difficulty</label>
            <pv-select
                id="difficulty"
                v-model="form.difficulty"
                :options="difficultyOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Easy"
                class="custom-input w-full"
            />
          </div>


          <div class="field col-12 md:col-6 mb-5">
            <label for="status" class="font-bold block mb-2">Status</label>
            <pv-select
                id="status"
                v-model="form.status"
                :options="statusOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Active"
                class="custom-input w-full"
            />
          </div>

          <div class="col-12 mt-2">
            <pv-button
                type="submit"
                label="Save changes"
                class="submit-button w-full font-bold py-3 border-round-xl"
            />
          </div>

        </div>
      </form>

    </div>

  </div>

</template>

<style scoped>

.form-container {
  max-width: 900px;
  margin: 0 auto;
}

.back-link {
  color: #1e564d;
  font-weight: 600;
  text-decoration: none;
}

.tour-card-form {
  background-color: #ffffff;
  border: 1px solid #eef2f1;
}

.subtitle {
  color: #6a8c84;
}

.title {
  color: #14302c;
  font-size: 2.25rem;
}

.description-text {
  color: #798a85;
}

label {
  color: #3b524c;
  font-size: 0.95rem;
}

.submit-button {
  background-color: #1e564d;
  border-color: #1e564d;
  color: white;
}

.submit-button:hover {
  background-color: #17443d;
  border-color: #17443d;
  color: white;
}

:deep(.p-select .p-select-label),
:deep(.p-dropdown .p-dropdown-label),
:deep(.p-inputtext) {
  color: black !important;
}

:deep(.p-inputtext),
:deep(.p-select),
:deep(.p-textarea) {
  background-color: #eef2f1;
  color: black;
  border-radius: 0.75rem !important;
  border-color: #eef2f1 !important;
}

</style>