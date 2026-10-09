<script setup>


import {onMounted, toRefs} from "vue";
import useTourManagementStore from "../../application/tour-management.store.js";
import {ProgressSpinner as PvProgressSpinner, useConfirm} from "primevue";
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
  router.push({ name:'tour-management-tour-new' })
}

const navigateToEdit = (id) => {
  router.push({ name: 'tour-management-tour-edit', params: { id } })
}
const confirmDelete = (tour) => {
  confirm.require({
    message: `Are you sure you want to delete ${tour.name}?`,
    header: `Are you sure you want to delete ${tour.name}?`,
    icon: "pi pi-exclamation-triangle",
    accept: () => {
      deleteTour(tour)
    }
  })
}



</script>

<template>

  <section>
    <p class="mb-6 text-sm text-surface-500">
      {{ tours.length }}
      {{ tours.length === 1 ? "experience" : "experiences" }} in your catalog
    </p>

    <div v-if="!toursLoaded" class="flex justify-center py-12">
      <pv-progress-spinner></pv-progress-spinner>
    </div>

    <p v-else-if="tours.length === 0" class="py-12 text-center text-surface-500">
      There are no tours in your catalog yet
    </p>

    <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <tour-item v-for="tour in tours" :key="tour.id" :tour="tour" @edit="navigateToEdit" @delete="confirmDelete">
      </tour-item>
    </div>

  </section>

</template>

<style scoped>

</style>