<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Props
const props = defineProps({
  project: {
    type: Object,
    default: null
  },
  stats: {
    type: Object,
    default: () => ({})
  }
});

// Computed
const progressPercentage = computed(() => {
  return props.project?.progress ?? 0;
});

const hasProgress = computed(() => {
  return props.project && typeof props.project.progress === 'number';
});

const hasDetailedStats = computed(() => {
  return props.stats && (
    props.stats.completedTasks > 0 ||
    props.stats.totalTasks > 0 ||
    props.stats.completedMilestones > 0 ||
    props.stats.totalMilestones > 0
  );
});
</script>

<template>
  <pv-card class="progress-card">
    <template #title>{{ $t('projects.detail.progress.title') }}</template>
    <template #content>
      <div v-if="hasProgress" class="progress-circle-container">
        <div class="progress-circle">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="var(--color-gray-200)" stroke-width="12"/>
            <circle 
              cx="60" cy="60" r="54" 
              fill="none" 
              stroke="var(--color-primary)" 
              stroke-width="12"
              stroke-linecap="round"
              :stroke-dasharray="339.29"
              :stroke-dashoffset="339.29 - (339.29 * progressPercentage / 100)"
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div class="progress-text">
            <span class="progress-percentage">{{ progressPercentage }}%</span>
            <span class="progress-label">{{ $t('projects.detail.progress.completed') }}</span>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-progress">
        <div class="empty-icon">
          <i class="pi pi-chart-line"></i>
        </div>
        <p class="empty-text">{{ $t('projects.detail.empty.no-progress') }}</p>
        <p class="empty-desc">{{ $t('projects.detail.empty.no-progress-desc') }}</p>
      </div>
    </template>
  </pv-card>
</template>

<style scoped>
.progress-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.progress-circle-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.progress-circle {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.progress-text {
  position: absolute;
  text-align: center;
  display: flex;
  flex-direction: column;
}

.progress-percentage {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-gray-800);
}

.progress-label {
  font-size: 0.875rem;
  color: var(--color-gray-600);
}

.empty-progress {
  text-align: center;
  padding: 2rem 1rem;
}

.empty-icon {
  font-size: 3rem;
  color: var(--color-gray-400);
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-gray-700);
  margin: 0 0 0.5rem 0;
}

.empty-desc {
  font-size: 0.9rem;
  color: var(--color-gray-600);
  margin: 0;
}
</style>