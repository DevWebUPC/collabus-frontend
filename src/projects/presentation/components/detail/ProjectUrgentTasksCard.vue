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
  urgentTasks: {
    type: Array,
    default: () => []
  }
});

// Computed
const hasUrgentTasks = computed(() => {
  return props.urgentTasks && props.urgentTasks.length > 0;
});

const displayTasks = computed(() => {
  return props.urgentTasks.slice(0, 3); // Show only first 3
});

// Methods
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch {
    return dateString;
  }
};

const getDaysUntilDue = (dateString) => {
  if (!dateString) return null;
  try {
    const dueDate = new Date(dateString);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch {
    return null;
  }
};

const handleViewAll = () => {
  // Navigate to urgent tasks view
  console.log('View all urgent tasks');
};
</script>

<template>
  <pv-card class="section-card">
    <template #title>{{ $t('projects.detail.sections.urgent-tasks') }}</template>
    <template #content>
      <div v-if="hasUrgentTasks">
        <div 
          v-for="task in displayTasks" 
          :key="task.id || task.title"
          class="urgent-task-item"
        >
          <div class="urgent-icon">
            <i class="pi pi-exclamation-triangle"></i>
          </div>
          <div class="urgent-info">
            <span class="urgent-title">{{ task.title || task.name }}</span>
            <span v-if="task.dueDate" class="urgent-date">
              <template v-if="getDaysUntilDue(task.dueDate) !== null">
                {{ $t('projects.detail.dates.expires-in') }} {{ getDaysUntilDue(task.dueDate) }} {{ $t('projects.detail.stats.days') }}
              </template>
              <template v-else>
                {{ $t('projects.detail.dates.due-date') }}: {{ formatDate(task.dueDate) }}
              </template>
            </span>
          </div>
        </div>

        <div class="urgent-actions">
          <pv-button 
            :label="$t('projects.detail.actions.view-all')" 
            class="view-all-button"
            @click="handleViewAll"
          />
        </div>
      </div>
      
      <div v-else class="empty-section">
        <div class="empty-icon">
          <i class="pi pi-check-circle"></i>
        </div>
        <p class="empty-text">{{ $t('projects.detail.empty.no-urgent-tasks') }}</p>
        <p class="empty-desc">{{ $t('projects.detail.empty.no-urgent-tasks-desc') }}</p>
      </div>
    </template>
  </pv-card>
</template>

<style scoped>
.section-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.urgent-task-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-gray-200);
}

.urgent-task-item:last-child {
  border-bottom: none;
}

.urgent-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-error);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  font-size: 0.75rem;
  flex-shrink: 0;
}

.urgent-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.urgent-title {
  font-weight: 500;
  color: var(--color-gray-800);
  font-size: 0.875rem;
}

.urgent-date {
  font-size: 0.75rem;
  color: var(--color-gray-600);
}

.urgent-actions {
  display: flex;
  justify-content: center;
  padding-top: 1rem;
  margin-top: 1rem;
  border-top: 1px solid var(--color-gray-200);
}

.view-all-button {
  background: #6366f1 !important;
  color: white !important;
  border: none !important;
  border-radius: 8px !important;
  padding: 0.5rem 1.5rem !important;
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  transition: all 0.2s ease !important;
}

.view-all-button:hover {
  background: #5855eb !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3) !important;
}

.empty-section {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  font-size: 3rem;
  color: var(--color-success);
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