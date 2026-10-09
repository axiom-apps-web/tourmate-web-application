<script setup>
import {Tour} from "../../domain/model/tour.entity.js";
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";

const props = defineProps({
  tour: {
    type: Tour,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete']);

const {t} = useI18n();
const menu = ref();
const toggleMenu = (event) => menu.value?.toggle(event);

const menuItems = computed(() => [
  {
    label: t('tours.edit'),
    icon: 'pi pi-pencil',
    command: () => emit('edit', props.tour)
  },
  {
    label: t('tours.delete'),
    icon: 'pi pi-trash',
    danger: true,
    command: () => emit('delete', props.tour)
  }
]);

</script>

<template>
  <article class="tour-item surface-card" :aria-labelledby="`tour-title-${tour.id}`">
    <header class="tour-item__header">
      <span class="tour-item__badge"><i class="pi pi-map-marker" aria-hidden="true"></i>{{ tour.duration }}</span>
      <pv-button
          icon="pi pi-ellipsis-h"
          text
          rounded
          severity="secondary"
          :aria-label="`${t('tours.actions')}: ${tour.title}`"
          :aria-haspopup="true"
          @click="toggleMenu"
      />
      <pv-menu ref="menu" :model="menuItems" popup>
        <template #item="{item, props: itemProps}">
          <a v-bind="itemProps.action" :class="['tour-menu-item', {'tour-menu-item--danger': item.danger}]">
            <i :class="item.icon" aria-hidden="true"></i>
            <span>{{ item.label }}</span>
          </a>
        </template>
      </pv-menu>
    </header>

    <div class="tour-item__content">
      <h2 :id="`tour-title-${tour.id}`">{{ tour.title }}</h2>
      <p class="tour-item__description">{{ tour.description }}</p>
      <div class="tour-item__tags" :aria-label="t('tours.difficulty')">
        <span class="tour-tag">{{ tour.difficulty }}</span>
        <span class="tour-tag tour-tag--muted">{{ t('tours.agency_id') }} · {{ tour.agencyId }}</span>
      </div>
    </div>

    <footer class="tour-item__footer">
      <div>
        <span>{{ t('tours.price') }}</span>
        <strong>{{ tour.priceAmount }} {{ tour.priceCurrency }}</strong>
      </div>
      <div>
        <span>{{ t('tours.status') }}</span>
        <strong>{{ tour.status }}</strong>
      </div>
    </footer>
  </article>
</template>

<style scoped>
.tour-item {
  display: flex;
  min-width: 0;
  flex-direction: column;
  padding: 1.25rem;
  transition: transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
}

.tour-item:hover {
  transform: translateY(-2px);
  border-color: var(--tm-green-700);
  box-shadow: 0 0.8rem 1.8rem rgb(19 53 31 / 12%);
}

.tour-item__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.tour-item__badge,
.tour-tag {
  display: inline-flex;
  min-height: 1.8rem;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  background: var(--tm-green-100);
  color: var(--tm-green-900);
  font-size: 0.78rem;
  font-weight: 650;
}

.tour-item__content {
  flex: 1;
  padding-block: 0.75rem 1.15rem;
}

.tour-item__content h2 {
  margin: 0;
  color: var(--tm-text);
  font-size: 1.2rem;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.tour-item__description {
  display: -webkit-box;
  min-height: 3.2rem;
  margin: 0.65rem 0 1rem;
  overflow: hidden;
  color: var(--tm-muted);
  line-height: 1.6;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.tour-item__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tour-tag--muted {
  background: transparent;
  border: 1px solid var(--tm-border);
  color: var(--tm-muted);
}

.tour-item__footer {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--tm-border);
}

.tour-item__footer div {
  display: grid;
  gap: 0.25rem;
}

.tour-item__footer div:last-child {
  text-align: right;
}

.tour-item__footer span {
  color: var(--tm-muted);
  font-size: 0.78rem;
}

.tour-item__footer strong {
  color: var(--tm-text);
}

:deep(.p-menu-item-content .tour-menu-item--danger) {
  color: var(--tm-danger);
}
</style>