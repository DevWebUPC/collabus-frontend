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
  milestones: {
    type: Array,
    default: () => []
  }
});

// Computed
const hasMilestones = computed(() => {
  return props.milestones && props.milestones.length > 0;
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

const handleViewMilestone = (milestone) => {
  // Emit event or navigate to milestone detail
  console.log('View milestone:', milestone);
};

const handleViewAll = () => {
  // Navigate to milestones view
  console.log('View all milestones');
};
</script>

<template>
  <pv-card class="section-card">
    <template #title>{{ $t('projects.detail.sections.upcoming-milestones') }}</template>
    <template #content>
      <div v-if="hasMilestones && milestones.length > 0">
        <div 
          v-for="milestone in milestones" 
          :key="milestone.id || milestone.title"
          class="milestone-item"
        >
          <div class="milestone-icon">
            <i class="pi pi-flag"></i>
          </div>
          <div class="milestone-info">
            <span class="milestone-title">{{ milestone.title || milestone.name }}</span>
            <span v-if="milestone.dueDate || milestone.endDate" class="milestone-date">
              {{ $t('projects.detail.dates.due-date') }}: {{ formatDate(milestone.dueDate || milestone.endDate) }}
            </span>
          </div>
          <pv-button 
            :label="$t('projects.detail.actions.view-milestone')" 
            size="small" 
            outlined
            @click="handleViewMilestone(milestone)"
          />
        </div>

        <div class="milestone-actions">
          <pv-button 
            :label="$t('projects.detail.actions.view-all')" 
            class="view-all-button"
            @click="handleViewAll"
          />
        </div>
      </div>
      
      <div v-else class="empty-section">
        <div class="empty-icon">
          <i class="pi pi-flag"></i>
        </div>
        <p class="empty-text">{{ $t('projects.detail.empty.no-milestones') }}</p>
        <p class="empty-desc">{{ $t('projects.detail.empty.no-milestones-desc') }}</p>
      </div>
    </template>
  </pv-card>
</template>

<style scoped>
.section-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.milestone-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-gray-200);
}

.milestone-item:last-child {
  border-bottom: none;
}

.milestone-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  flex-shrink: 0;
}

.milestone-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.milestone-title {
  font-weight: 500;
  color: var(--color-gray-800);
}

.milestone-date {
  font-size: 0.8rem;
  color: var(--color-gray-600);
}

.milestone-actions {
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
  .milestone-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>