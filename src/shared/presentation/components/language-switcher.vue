<script setup>
  import {useI18n} from "vue-i18n";
  const { t, locale, availableLocales } = useI18n();

</script>

<template>
  <pv-select-button
      v-model="locale"
      :options="availableLocales"
      :aria-label="t('shell.preferred_language')"
      class="language-switcher"
  >
    <template #option="slotProps">
      <span :aria-label="slotProps.option === 'es' ? 'Español' : 'English'">
        {{ slotProps.option.toUpperCase() }}
      </span>
    </template>
  </pv-select-button>
</template>

<style scoped>

</style>