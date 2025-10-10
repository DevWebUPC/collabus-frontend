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
const tasksPercentage = computed(() => {
  if (!props.stats.totalTasks || props.stats.totalTasks === 0) return 0;
  return Math.round((props.stats.completedTasks / props.stats.totalTasks) * 100);
});

const milestonesPercentage = computed(() => {
  if (!props.stats.totalMilestones || props.stats.totalMilestones === 0) return 0;
  return Math.round((props.stats.completedMilestones / props.stats.totalMilestones) * 100);
});

const hasData = computed(() => {
  return props.stats && (props.stats.totalTasks > 0 || props.stats.totalMilestones > 0);
});
</script>

<template>
  <pv-card class="overall-progress-card">
    <template #title>{{ $t('projects.detail.progress.overall-title') }}</template>
    <template #content>
      <div v-if="hasData" class="progress-circles-container">
        <!-- Tasks Progress Circle -->
        <div class="progress-circle-item">
          <div class="progress-circle">
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-gray-200)" stroke-width="8"/>
              <circle 
                cx="50" cy="50" r="45" 
                fill="none" 
                stroke="var(--color-primary)" 
                stroke-width="8"
                stroke-linecap="round"
                :stroke-dasharray="282.74"
                :stroke-dashoffset="282.74 - (282.74 * tasksPercentage / 100)"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div class="progress-text">
              <span class="progress-percentage">{{ tasksPercentage }}%</span>
            </div>
          </div>
          <span class="progress-label">{{ $t('projects.detail.progress.tasks-completed') }}</span>
        </div>

        <!-- Milestones Progress Circle -->
        <div class="progress-circle-item">
          <div class="progress-circle">
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--color-gray-200)" stroke-width="8"/>
              <circle 
                cx="50" cy="50" r="45" 
                fill="none" 
                stroke="var(--color-primary)" 
                stroke-width="8"
                stroke-linecap="round"
                :stroke-dasharray="282.74"
                :stroke-dashoffset="282.74 - (282.74 * milestonesPercentage / 100)"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div class="progress-text">
              <span class="progress-percentage">{{ milestonesPercentage }}%</span>
            </div>
          </div>
          <span class="progress-label">{{ $t('projects.detail.progress.milestones-completed') }}</span>
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
.overall-progress-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.progress-circles-container {
  display: flex;
  flex-direction: row;
	justify-content: center;
  gap: 2rem;
  padding: 1rem 0;
}

.progress-circle-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
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
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-gray-800);
}

.progress-label {
  font-size: 0.875rem;
  color: var(--color-gray-600);
  text-align: center;
  font-weight: 500;
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