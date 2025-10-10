<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useProjectDetailStore } from '../../application/project-detail.store.js';

// Import modular components
import ProjectProgressCard from '../components/detail/ProjectProgressCard.vue';
import ProjectStatsCard from '../components/detail/ProjectStatsCard.vue';
import ProjectOverallProgressCard from '../components/detail/ProjectOverallProgressCard.vue';
import ProjectTasksCard from '../components/detail/ProjectTasksCard.vue';
import ProjectMilestonesCard from '../components/detail/ProjectMilestonesCard.vue';
import ProjectNotificationsCard from '../components/detail/ProjectNotificationsCard.vue';
import ProjectUrgentTasksCard from '../components/detail/ProjectUrgentTasksCard.vue';
import ProjectCollaboratorsCard from '../components/detail/ProjectCollaboratorsCard.vue';
import EmptyTabContent from '../components/detail/EmptyTabContent.vue';

const route = useRoute();
const router = useRouter();
const store = useProjectDetailStore();
const { t } = useI18n();

// State
const activeTab = ref('overview');


// Methods
const navigateBack = () => {
  router.push({ name: 'projects' });
};

onMounted(async () => {
  console.log('Project ID:', route.params.id);
  
  const projectId = route.params.id;
  if (!projectId) {
    router.push({ name: 'projects' });
    return;
  }

  try {
    // Load all project detail data
    await store.loadProjectDetail(projectId);
    console.log('Project loaded:', store.project);
  } catch (err) {
    console.error('Error loading project:', err);
    router.push({ name: 'projects' });
  }
});

// Clear store when component is unmounted
onUnmounted(() => {
  console.log('Clearing project detail store on unmount');
  store.reset();
});
</script>

<template>
  <div class="project-detail-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-actions">
        <pv-button 
          icon="pi pi-arrow-left"
          text
          @click="navigateBack"
          class="back-btn"
        />
        <h1 class="page-title">{{ store.project?.title || 'Cargando...' }}</h1>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="store.loading" class="loading-container">
      <pv-progressspinner />
      <span>{{ $t('projects.detail.loading') }}</span>
    </div>

    <!-- Error State -->
    <pv-message v-if="store.error" severity="error" :closable="false">
      {{ store.error }}
    </pv-message>

    <!-- Content -->
    <div v-if="store.project && !store.loading" class="project-content">
      <!-- Tab Navigation -->
      <div class="tab-navigation">
        <button 
          :class="['tab-button', { active: activeTab === 'overview' }]"
          @click="activeTab = 'overview'"
        >
          {{ $t('projects.detail.tabs.overview') }}
        </button>
        <button 
          :class="['tab-button', { active: activeTab === 'tasks' }]"
          @click="activeTab = 'tasks'"
        >
          {{ $t('projects.detail.tabs.tasks') }}
        </button>
        <button 
          :class="['tab-button', { active: activeTab === 'milestones' }]"
          @click="activeTab = 'milestones'"
        >
          {{ $t('projects.detail.tabs.milestones') }}
        </button>
        <button 
          v-if="store.isOwned"
          :class="['tab-button', { active: activeTab === 'contributions' }]"
          @click="activeTab = 'contributions'"
        >
          {{ $t('projects.detail.tabs.contributions') }}
        </button>
        <button 
          v-if="store.isOwned"
          :class="['tab-button', { active: activeTab === 'applicants' }]"
          @click="activeTab = 'applicants'"
        >
          {{ $t('projects.detail.tabs.applicants') }}
        </button>
        <button 
          v-if="store.isParticipating"
          :class="['tab-button', { active: activeTab === 'feedback' }]"
          @click="activeTab = 'feedback'"
        >
          {{ $t('projects.detail.tabs.feedback') }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Overview Tab -->
        <div v-if="activeTab === 'overview'" class="overview-content">
          <!-- Top Row: Progress and Stats -->
          <div  v-if="!store.isOwned" class="dashboard-grid">
            <ProjectProgressCard 
              :project="store.project" 
              :stats="store.projectStats"
            />
            <ProjectStatsCard 
              :project="store.project" 
              :stats="store.projectStats"
            />
          </div>

          <!-- Content based on ownership -->
          <template v-if="store.isOwned">
            <!-- For Owned Projects: Special 3-column layout -->
            <div class="owned-project-layout">
              <!-- First row: 3 columns -->
              <div class="dashboard-three-columns">
                <!-- Left column: Overall Progress -->
                <div class="left-column">
                  <ProjectOverallProgressCard 
                    :project="store.project" 
                    :stats="store.projectStats"
                  />

                  <ProjectCollaboratorsCard 
                    v-if="store.hasCollaboratorsData"
                    :collaborators="store.collaborators"
                  />
                </div>
                
                <!-- Center column: Notifications -->
                <ProjectNotificationsCard 
                  v-if="store.hasNotificationsData"
                  :notifications="store.projectNotifications"
                />
                
                <!-- Right column: Milestones and Urgent Tasks -->
                <div class="right-column">
                  <ProjectMilestonesCard 
                    v-if="store.hasMilestonesData"
                    :milestones="store.upcomingMilestones"
                  />
                  <ProjectUrgentTasksCard 
                    v-if="store.urgentTasks.length > 0"
                    :urgentTasks="store.urgentTasks"
                  />
                </div>
              </div>

            </div>
          </template>

          <template v-else>
            <!-- For Participating Projects: My Tasks and Milestones -->
            <div v-if="store.hasTasksData || store.hasMilestonesData" class="dashboard-row">
              <ProjectTasksCard 
                v-if="store.hasTasksData"
                :tasks="store.myTasks"
                :title="$t('projects.detail.sections.my-tasks')"
              />
              <ProjectMilestonesCard 
                v-if="store.hasMilestonesData"
                :milestones="store.upcomingMilestones"
              />
            </div>
          </template>
        </div>

        <!-- Other tabs content -->
        <EmptyTabContent 
          v-else-if="activeTab === 'tasks'" 
          tab-name="tasks" 
          icon="pi-check-square"
        />

        <EmptyTabContent 
          v-else-if="activeTab === 'milestones'" 
          tab-name="milestones" 
          icon="pi-flag"
        />

        <EmptyTabContent 
          v-else-if="activeTab === 'contributions'" 
          tab-name="contributions" 
          icon="pi-dollar"
        />

        <EmptyTabContent 
          v-else-if="activeTab === 'applicants'" 
          tab-name="applicants" 
          icon="pi-users"
        />

        <EmptyTabContent 
          v-else-if="activeTab === 'feedback'" 
          tab-name="feedback" 
          icon="pi-comments"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.project-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  background: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 2rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  color: var(--color-primary);
  font-size: 1.25rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-primary);
  margin: 0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
  color: var(--color-gray-600);
}

.debug-info {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  font-family: monospace;
}

.debug-info h3 {
  margin: 0 0 0.5rem 0;
  color: #856404;
}

.debug-info p {
  margin: 0.25rem 0;
  color: #856404;
}

/* Tab Navigation */
.tab-navigation {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
  gap: 2px;
}

.tab-button {
  flex: 1;
  min-width: max-content;
  padding: 12px 20px;
  border: none;
  background: transparent;
  color: var(--color-gray-600);
  font-weight: 500;
  font-size: 0.9rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tab-button.active {
  background: var(--color-primary);
  color: var(--color-white);
  box-shadow: 0 2px 4px var(--color-primary-200);
}

.tab-button:hover:not(.active) {
  background: var(--color-gray-100);
  color: var(--color-gray-800);
}

/* Tab Content */
.tab-content {
  background: transparent;
}

.overview-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  min-height: 400px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.dashboard-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

/* Owned project layout styles */
.owned-project-layout {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: 2rem;
}

.dashboard-three-columns {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 2rem;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.collaborators-row {
  margin-top: 1.5rem;
}

.collaborators-left-column {
  grid-column: 1;
}

.empty-right-space {
  grid-column: 2;
}

/* Cards - basic styles for layout only */
:deep(.p-card) {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: none;
}

:deep(.p-card .p-card-body) {
  padding: 1.5rem;
}

:deep(.p-card .p-card-title) {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-gray-800);
  margin-bottom: 1rem;
}

/* Specific styling for owned project layout */
.owned-project-layout :deep(.p-card) {
  height: fit-content;
}

.left-column :deep(.p-card) {
  margin-bottom: 0;
}

.collaborators-row :deep(.p-card) {
  margin-top: 0;
}

/* Custom Button Styles to match design */
:deep(.p-button.p-button-outlined) {
  background: var(--color-primary);
  color: var(--color-white);
  border: 1px solid var(--color-primary);
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  transition: all 0.2s ease;
}

:deep(.p-button.p-button-outlined:hover) {
  background: var(--color-primary-600);
  border-color: var(--color-primary-600);
  color: var(--color-white);
}

:deep(.p-button.p-button-outlined:focus) {
  box-shadow: 0 0 0 2px var(--color-primary-200);
}

/* Layout and responsive styles */

/* Responsive */
@media (max-width: 768px) {
  .project-detail-container {
    padding: 0.5rem;
  }
  
  .dashboard-grid,
  .dashboard-row,
  .dashboard-three-columns {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .left-column,
  .right-column {
    gap: 1rem;
  }
  
  .collaborators-row {
    margin-top: 1rem;
  }
  
  .owned-project-layout {
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .tab-navigation {
    overflow-x: auto;
  }
  
  .tab-button {
    min-width: 120px;
  }
  
  /* Responsive adjustments are handled by individual components */
}

@media (max-width: 1024px) {
  .dashboard-three-columns {
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
  
  .right-column {
    grid-column: span 2;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
  
  .left-column {
    grid-column: 1;
  }
}

/* Additional sections styling */
.tasks-milestones-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
}

.tasks-milestones-section .p-card {
  flex: 1;
  min-height: 280px;
}

.notifications-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>