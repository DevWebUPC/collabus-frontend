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
const projectStats = computed(() => {
  return {
    tasksCompleted: props.stats.completedTasks ?? 0,
    totalTasks: props.stats.totalTasks ?? 0,
    milestonesAchieved: props.stats.completedMilestones ?? 0,
    totalMilestones: props.stats.totalMilestones ?? 0,
    nextDeliveryDays: props.stats.nextDeliveryDays ?? null
  };
});

const hasStats = computed(() => {
  return props.stats && (
    typeof props.stats.completedTasks === 'number' ||
    typeof props.stats.completedMilestones === 'number' ||
    typeof props.stats.nextDeliveryDays === 'number'
  );
});

// Computed for owned projects - circular progress view
const tasksPercentage = computed(() => {
  if (projectStats.value.totalTasks === 0) return 0;
  return Math.round((projectStats.value.tasksCompleted / projectStats.value.totalTasks) * 100);
});

const milestonesPercentage = computed(() => {
  if (projectStats.value.totalMilestones === 0) return 0;
  return Math.round((projectStats.value.milestonesAchieved / projectStats.value.totalMilestones) * 100);
});
</script>

<template>
  <pv-card class="stats-card">
    <template #content>
      <div v-if="hasStats && projectStats">
        <div class="stat-item" v-if="typeof projectStats.totalTasks === 'number'">
          <div class="stat-icon completed">
            <i class="pi pi-check"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">{{ $t('projects.detail.stats.tasks-completed') }}</span>
            <span class="stat-value">{{ projectStats.tasksCompleted }}/{{ projectStats.totalTasks }}</span>
          </div>
        </div>
        
        <div class="stat-item" v-if="typeof projectStats.totalMilestones === 'number'">
          <div class="stat-icon milestones">
            <i class="pi pi-flag"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">{{ $t('projects.detail.stats.milestones-achieved') }}</span>
            <span class="stat-value">{{ projectStats.milestonesAchieved }}/{{ projectStats.totalMilestones }}</span>
          </div>
        </div>
        
        <div class="stat-item" v-if="projectStats.nextDeliveryDays">
          <div class="stat-icon delivery">
            <i class="pi pi-calendar"></i>
          </div>
          <div class="stat-info">
            <span class="stat-label">{{ $t('projects.detail.stats.next-delivery') }}</span>
            <span class="stat-value">{{ projectStats.nextDeliveryDays }} {{ $t('projects.detail.stats.days') }}</span>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-stats">
        <div class="empty-icon">
          <i class="pi pi-chart-bar"></i>
        </div>
        <p class="empty-text">{{ $t('projects.detail.empty.no-stats') }}</p>
        <p class="empty-desc">{{ $t('projects.detail.empty.no-stats-desc') }}</p>
      </div>
    </template>
  </pv-card>
</template>

<style scoped>
.stats-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-gray-200);
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  flex-shrink: 0;
}

.stat-icon.completed {
  background: var(--color-success);
}

.stat-icon.milestones {
  background: var(--color-info);
}

.stat-icon.delivery {
  background: var(--color-warning);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--color-gray-600);
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-gray-800);
}

.empty-stats {
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