<script setup>


import {onMounted, toRefs} from "vue";
import useTourManagementStore from "../../application/tour-management.store.js";
import {Button as PvButton, ProgressSpinner as PvProgressSpinner, useConfirm} from "primevue";
import TourItem from "../components/tour-item.vue";
import {useRouter} from "vue-router";

const store = useTourManagementStore()
const router = useRouter()
const confirm = useConfirm()
const { tours, errors, toursLoaded} = toRefs(store)
const { fetchTours, deleteTour } = store

onMounted(() => {
  if(!store.toursLoaded) {
    fetchTours()
    toursLoaded.value = store.toursLoaded
  }
})

const navigateToNew = () => {
  router.push({ name:'tour-management-tours-new' })
}

const navigateToEdit = (tour) => {
  router.push({ name: 'tour-management-tours-edit', params: { id: tour.id } })
}
const confirmDelete = (tour) => {
  confirm.require({
    message: `Are you sure you want to delete ${tour.title}?`,
    header: `Are you sure you want to delete ${tour.title}?`,
    icon: "pi pi-exclamation-triangle",
    acceptClass: 'p-button-danger',
    accept: () => {
      deleteTour(tour)
    }
  })
}

</script>

<template>
  <section class="p-4">

    <header class="flex align-items-start justify-content-between gap-3 mb-4">
      <div>
        <h2 class="tour-list-title m-0">Tour catalog</h2>
        <p class="tour-list-subtitle mt-1 mb-0">
          {{ tours.length }}
          {{ tours.length === 1 ? "experience" : "experiences" }} in your catalog
        </p>
      </div>

      <pv-button class="tour-list-new" label="New Tour" icon="pi pi-plus" rounded @click="navigateToNew">

      </pv-button>

    </header>

    <div v-if="!toursLoaded" class="flex justify-content-center py-6">
      <pv-progress-spinner aria-label="Loading tours" />
    </div>

    <p v-else-if="tours.length === 0" class="text-center text-500 py-6">
      There are no tours in your catalog yet.
    </p>

    <div v-else class="grid">
      <div
          v-for="tour in tours"
          :key="tour.id"
          class="col-12 md:col-6 lg:col-4"
      >
        <tour-item :tour="tour" @edit="navigateToEdit" @delete="confirmDelete" />
      </div>
    </div>
  </section>
</template>

<style scoped>

.tour-list-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #14302c;
}

.tour-list-subtitle {
  font-size: 0.9rem;
  color: #8a9794;
}

.tour-list-new {
  flex-shrink: 0;
  background: #e3efe9;
  border-color: #e3efe9;
  color: #2d6a58;
  font-weight: 600;
  text-transform: none;
  box-shadow: none;
}

.tour-list-new:hover {
  background: #d3e6dd;
  border-color: #d3e6dd;
  color: #2d6a58;
}

</style>