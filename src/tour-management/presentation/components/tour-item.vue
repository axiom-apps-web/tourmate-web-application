<script setup>
import { computed, ref } from "vue";
import { Tour } from "../../domain/model/tour.entity.js";

const props = defineProps({
  tour: { type: Tour, required: true },
});

const emit = defineEmits(["edit", "delete"]);

const menu = ref();
const toggleMenu = (event) => menu.value.toggle(event);

const menuItems = computed(() => [
  { label: "Edit", icon: "pi pi-pencil", command: () => emit("edit", props.tour) },
  { label: "Delete", icon: "pi pi-trash", danger: true, command: () => emit("delete", props.tour) },
]);

const menuTokens = {
  background: "#ffffff",
  borderColor: "#e7ecea",
  borderRadius: "0.75rem",
  shadow: "0 8px 24px rgba(20, 40, 35, 0.15)",
  list: {
    padding: "0.4rem",
    gap: "0.1rem",
  },
  item: {
    color: "#14302c",
    focusColor: "#14302c",
    focusBackground: "#f3f6f5",
    borderRadius: "0.5rem",
    padding: "0.5rem 0.75rem",
    icon: {
      color: "#6b7a77",
      focusColor: "#14302c",
    },
  },
};

</script>

<template>
  <pv-card class="tour-card w-full">
    <template #title>
      <div class="flex align-items-start justify-content-between gap-2">
        <h3 class="tour-card-title m-0">{{ tour.title }}</h3>

        <pv-button
            class="tour-card-more"
            icon="pi pi-ellipsis-h"
            text
            rounded
            severity="secondary"
            aria-label="Tour actions"
            aria-haspopup="true"
            @click="toggleMenu"
        />
        <pv-menu ref="menu" :model="menuItems" popup :dt="menuTokens">
          <template #item="{ item, props: itemProps }">
            <a v-bind="itemProps.action" :class="{ 'tour-menu-danger' : item.danger }">
              <span :class="item.icon" />
              <span class="ml-2">{{ item.label }}</span>
            </a>
          </template>
        </pv-menu>
      </div>
    </template>

    <template #content>
      <p class="tour-card-description mt-0 mb-3">
        {{ tour.description }}
      </p>

      <div class="flex flex-wrap gap-2">
        <span class="tour-tag tour-tag--green">
          {{ tour.duration }}
        </span>
        <span class="tour-tag tour-tag--amber">
          {{ tour.difficulty }}
        </span>
        <span class="tour-tag tour-tag--violet">
          {{ tour.agencyId }}
        </span>
      </div>
    </template>

    <template #footer>
      <pv-divider />
      <div class="tour-card-footer flex align-items-end justify-content-between">
        <div class="flex flex-column gap-1">
          <span class="tour-card-label">Duration</span>
          <strong class="tour-card-value" >{{ tour.duration }}</strong>
        </div>
        <div class="flex flex-column align-items-end gap-1">
          <span class="tour-card-label">From</span>
          <strong class="tour-card-price">${{ tour.priceAmount }} {{ tour.priceCurrency }}</strong>
        </div>
      </div>
    </template>
  </pv-card>
</template>

<style scoped>

.tour-card {
  background: white;
  border-radius: 1.25rem;
  box-shadow: 0 1px 3px rgba(20, 40, 35, 0.08), 0 8px 24px rgba(20, 40, 35, 0.08);
}

.tour-card :deep(.p-card-body) {
  padding: 1.5rem;
  gap: 0;
}
.tour-card :deep(.p-card-title) {
  font-size: inherit;
  font-weight: inherit;
}

.tour-card-title {
  font-size: 1.35rem;
  line-height: 1.25;
  font-weight: 700;
  color: #14302c;
}

.tour-card-more {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  color: #8a9794;
}

.tour-card-description {
  margin-top: 0.6rem;
  font-size: 0.95rem;
  line-height: 1.45;
  color: #6b7a77;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tour-tag {
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.tour-tag--green  { background: #e6f2ee; color: #2d6a58; }
.tour-tag--amber  { background: #f6ebdd; color: #9a6a2f; }
.tour-tag--violet { background: #ececf5; color: #5b5f86; }

.tour-card-footer {
  margin-top: 1.5rem;
  padding-top: 1.1rem;
}

.tour-card-label { font-size: 0.8rem; color: #8a9794; }
.tour-card-value { font-size: 0.95rem; color: #14302c; }
.tour-card-price { font-size: 1.35rem; color: #14302c; }

</style>

<style>
.tour-menu-danger,
.tour-menu-danger .pi {
  color: #c0252b !important;
}
</style>