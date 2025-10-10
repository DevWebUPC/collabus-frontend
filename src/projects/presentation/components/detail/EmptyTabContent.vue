<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Props
const props = defineProps({
  tabName: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'pi-info-circle'
  }
});

// Computed
const title = computed(() => {
  return t(`projects.detail.empty.${props.tabName}-content`);
});
</script>

<template>
  <div class="empty-tab-content">
    <div class="empty-icon">
      <i :class="['pi', icon]"></i>
    </div>
    <p class="empty-text">{{ title }}</p>
    <p class="empty-desc">{{ $t('projects.detail.empty.coming-soon') }}</p>
  </div>
</template>

<style scoped>
.empty-tab-content {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--color-gray-600);
}

.empty-icon {
  font-size: 4rem;
  color: var(--color-gray-400);
  margin-bottom: 1.5rem;
}

.empty-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-gray-700);
  margin: 0 0 0.5rem 0;
}

.empty-desc {
  font-size: 1rem;
  color: var(--color-gray-600);
  margin: 0;
}
</style>