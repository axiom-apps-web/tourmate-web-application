<script setup>

import {Tour} from "../../domain/model/tour.entity.js";
import {computed, ref} from "vue";
import {Button as PvButton, Card as PvCard, Menu as PvMenu, Tag as PvTag} from "primevue";

const props = defineProps({
  tour: {
    type: Tour,
    required: true
  }
})

const emit = defineEmits(['edit','delete'])

const menu = ref()
const toggleMenu = (event) => menu.value.toggle(event)

const menuItems = computed(() => [
  {
    label: 'edit',
    icon: 'pi pi-pencil',
    command: () => emit('edit', props.tour)
  },
  {
    label: 'delete',
    icon: 'pi pi-trash',
    class: 'tour-item__delete',
    command: () => emit('delete', props.tour)
  }
])

</script>

<template>

  <pv-card class="w-full max-w-sm rounded-2x1 shadow-md">

    <template #title>
      <div class="flex items-start justify-between gap-2">
        <h3 class="font-serif text-xl font-bold leading">{{ tour.title }}</h3>

        <pv-button icon="pi pi-ellipsis-h" text rounded severity="secondary" @click="toggleMenu"></pv-button>

        <pv-menu ref="menu" :model="menuItems" popup>
          <template #item="{ item, props: itemProps }" >
            <a v-bind="itemProps.action" :class="item.danger ? 'text-red-600' : ''">
              <span :class="item.icon"></span>
              <span>{{ item.label }}</span>
            </a>
          </template>
        </pv-menu>
      </div>
    </template>


    <template #content>
      <p class="line-clamp-2 text-sm text-surface-500">
        {{ tour.description }}
      </p>

      <div class="mt-4 flex flex-wrap gap-2">
        <pv-tag :value="tour.duration" severity="success" rounded></pv-tag>
        <pv-tag :value="tour.difficulty" severity="warn" rounded />
        <pv-tag :value="tour.agencyId" severity="secondary" rounded />
      </div>
    </template>


    <template #footer>
      <pv-divider />
      <div class="flex items-end justify-between">
        <div class="flex flex-col gap-1">
          <span class="text-xs text-surface-500">Duration</span>
          <strong>{{ tour.duration }}</strong>
        </div>
        <div class="flex flex-col items-end gap-1">
          <span class="text-xs text-surface-500">From</span>
          <strong class="text-xl">${{ tour.priceAmount }} {{ tour.priceCurrency }}</strong>
        </div>
      </div>
    </template>
  </pv-card>

</template>

<style scoped>

</style>