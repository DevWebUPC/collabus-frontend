<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t, locale, availableLocales } = useI18n();

// Normalize availableLocales (could be ref or array) and build option objects
const languageOptions = computed(() => {
  const list = (availableLocales && availableLocales.value) || availableLocales || [];
  return list.map((loc) => ({
    value: loc
  }));
});

// optionDisabled function used by PrimeVue SelectButton: returns true
// when the option value equals the current locale so the active option
// is rendered disabled.
const isOptionDisabled = (option) => {
  const current = (locale && locale.value) || locale;
  // option may be the raw value or an object depending on optionValue prop
  const val = option && (option.value ?? option);
  return val === current;
};
</script>

<template>
  <pv-select-button
    v-model="locale"
    :options="languageOptions"
    :optionDisabled="isOptionDisabled"
    optionLabel="value"
    optionValue="value"
  />
</template>

<style scoped>

</style>