<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Props
const props = defineProps({
  collaborators: {
    type: Array,
    default: () => []
  }
});

// Computed
const hasCollaborators = computed(() => {
  return props.collaborators && props.collaborators.length > 0;
});

const displayedCollaborators = computed(() => {
  // Show up to 5 collaborators, rest can be viewed in "View All"
  return props.collaborators.slice(0, 5);
});
</script>

<template>
  <pv-card class="section-card">
    <template #title>{{ $t('projects.detail.sections.collaborators') }}</template>
    <template #content>
      <div v-if="hasCollaborators">
        <div 
          v-for="collaborator in displayedCollaborators" 
          :key="collaborator.id"
          class="collaborator-item"
        >
          <div class="collaborator-avatar">
            <pv-avatar
              v-if="collaborator.avatar"
              :image="collaborator.avatar" 
              size="large" 
              shape="circle"
            />
            <pv-avatar 
              v-else
              :label="collaborator.getInitials()" 
              size="large" 
              shape="circle"
              style="background-color: var(--color-primary); color: white"
            />
          </div>
          
          <div class="collaborator-info">
            <div class="collaborator-main">
              <span class="collaborator-name">{{ collaborator.name }}</span>
              <span class="collaborator-role">{{ collaborator.role }}</span>
            </div>
            
            <div class="collaborator-progress">
              <div class="progress-section">
                <span class="progress-label">{{ $t('projects.detail.collaborators.progress') }}</span>
                <span class="progress-percentage">{{ collaborator.getCompletionRate() }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-section">
        <div class="empty-icon">
          <i class="pi pi-users"></i>
        </div>
        <p class="empty-text">{{ $t('projects.detail.empty.no-collaborators') }}</p>
        <p class="empty-desc">{{ $t('projects.detail.empty.no-collaborators-desc') }}</p>
      </div>
    </template>
  </pv-card>
</template>

<style scoped>
.section-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.collaborator-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-gray-200);
}

.collaborator-item:last-child {
  border-bottom: none;
}

.collaborator-avatar {
  flex-shrink: 0;
}

.collaborator-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.collaborator-main {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.collaborator-name {
  font-weight: 600;
  color: var(--color-gray-800);
  font-size: 0.95rem;
  line-height: 1.2;
}

.collaborator-role {
  font-size: 0.8rem;
  color: var(--color-gray-600);
  font-weight: 500;
  line-height: 1.1;
}

.collaborator-progress {
  display: flex;
  align-items: center;
  min-width: 80px;
}

.progress-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.progress-label {
  font-size: 0.75rem;
  color: var(--color-gray-600);
  font-weight: 500;
}

.progress-percentage {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary);
}

.collaborator-actions {
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
  .collaborator-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .collaborator-header {
    flex-wrap: wrap;
  }
  
  .collaborator-stats {
    flex-direction: row;
    gap: 1rem;
  }
}
</style>