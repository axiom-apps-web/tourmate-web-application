<script setup>
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import {useConfirm} from "primevue";
import useTourMonitoringStore from "../../application/tour-monitoring.store.js";
import {onMounted, toRefs} from "vue";

const { t } = useI18n();
const router = useRouter();
const confirm = useConfirm();
const store = useTourMonitoringStore();
const { activeTours, activeToursLoaded, errors} = toRefs(store);
const { fetchActiveTours, deleteActiveTour } = store;

onMounted(() => {
  if (!store.activeToursLoaded) {
    fetchActiveTours();
    activeToursLoaded.value = store.activeToursLoaded;
  }
});

/**
 * Navigate to the new activeTour creation page.
 */
const navigateToNew = () => {
  router.push({ name: 'tourMonitoring-activeTour-new' });
};

/**
 * Navigate to the activeTour editing page.
 * @param {number} id - The ID of the activeTour to edit.
 */
const navigateToEdit = (id) => {
  console.log(id);
  router.push({ name: 'tourMonitoring-activeTour-edit', params: { id } });
};

/**
 * Confirm and delete a activeTour.
 * @param {Object} activeTour - The activeTour to delete.
 */
const confirmDelete = (activeTour) => {
  confirm.require({
    message: t('activeTours.confirm-delete', { title: activeTour.title }),
    header: t('activeTours.delete-header'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => { deleteActiveTour(activeTour); },
  });
};
</script>

<template>
  <div class="p-4">
    <h1>{{ t('activeTours.id') }}</h1>
    <pv-button :label="t('activeTours.new')" icon="pi pi-plus" class="mb-3" @click="navigateToNew" />
    <pv-data-table
        :value="activeTours"
        :loading="!activeToursLoaded"
        striped-rows
        table-style="min-width: 50rem"
        paginator
        :rows="5"
        :rows-per-page-options="[5, 10, 20]"
    >
      <pv-column field="id" :header="t('activeTours.id')" sortable />
      <pv-column field="status" :header="t('activeTours.status')" sortable />
      <pv-column field="startedAt" :header="t('activeTour.startedAt')" />
      <pv-column field="guideId" :header="t('activeTour.guideId')" />>
      <pv-column :header="t('activeTours.actions')">
        <template #body="slotProps">
          <pv-button icon="pi pi-pencil" text rounded @click="navigateToEdit(slotProps.data.id)" />
          <pv-button icon="pi pi-trash" text rounded severity="danger" @click="confirmDelete(slotProps.data)" />
        </template>
      </pv-column>
    </pv-data-table>
    <div v-if="errors.length" class="text-red-500 mt-3">
      {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
    </div>
    <pv-confirm-dialog />
  </div>
</template>

<style scoped>

</style>