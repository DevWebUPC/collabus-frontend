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
  tasks: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: null
  }
});

// Computed
const hasTasks = computed(() => {
  return props.tasks && props.tasks.length > 0;
});

const userTasks = computed(() => {

  console.log(props.tasks, 'urgent')
  // Tasks are already filtered by the store, so just return them
  return props.tasks || [];
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

const handleViewTask = (task) => {
  // Emit event or navigate to task detail
  console.log('View task:', task);
};
</script>

<template>
  <pv-card class="section-card">
    <template #title>{{ title || $t('projects.detail.sections.my-tasks') }}</template>
    <template #content>
      <div v-if="hasTasks">
        <div 
          v-for="task in userTasks" 
          :key="task.id || task.title"
          class="task-item"
        >
          <div class="task-info">
            <span class="task-title">{{ task.title || task.name }}</span>
            <span v-if="task.dueDate" class="task-date">
              {{ $t('projects.detail.dates.due-date') }}: {{ formatDate(task.dueDate) }}
            </span>
          </div>
          <div class="task-actions">
            <pv-button 
              :label="$t('projects.detail.actions.view-task')" 
              size="small" 
              outlined
              @click="handleViewTask(task)"
            />
          </div>
        </div>
      </div>
      
      <div v-else class="empty-section">
        <div class="empty-icon">
          <i class="pi pi-check-square"></i>
        </div>
        <p class="empty-text">{{ $t('projects.detail.empty.no-tasks') }}</p>
        <p class="empty-desc">{{ $t('projects.detail.empty.no-tasks-desc') }}</p>
      </div>
    </template>
  </pv-card>
</template>

<style scoped>
.section-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-gray-200);
}

.task-item:last-child {
  border-bottom: none;
}

.task-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.task-title {
  font-weight: 500;
  color: var(--color-gray-800);
}

.task-date {
  font-size: 0.8rem;
  color: var(--color-gray-600);
}

.task-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.empty-section {
  text-align: center;
  padding: 3rem 1rem;
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

/* Responsive */
@media (max-width: 768px) {
  .task-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .task-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>