<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import { useProjectsStore } from '../../application/projects.store.js';

const { t } = useI18n();
const router = useRouter();
const projectsStore = useProjectsStore();

// State
const activeTab = ref('participating'); // Default to participating tab

// Computed properties from store
const { 
  participatingProjects, 
  ownedProjects, 
  loading, 
  error 
} = projectsStore;

// Computed
const currentProjects = computed(() => {
  return activeTab.value === 'participating' ? participatingProjects : ownedProjects;
});

// Helper to get current user ID
const getCurrentUserId = () => {
  return localStorage.getItem('userId') || '1';
};

// Methods
const switchTab = async (tab) => {
  activeTab.value = tab;
  
  // Load data when switching tabs
  try {
    if (tab === 'participating') {
      await projectsStore.fetchParticipatingProjects();
    } else if (tab === 'owned') {
      const userId = getCurrentUserId();
      await projectsStore.fetchProjectsByUserId(userId);
    }
  } catch (error) {
    console.error('Error loading projects:', error);
  }
};

const navigateToProject = (projectId) => {
  router.push(`/projects/${projectId}`);
};

const navigateToCreateProject = () => {
  router.push('/projects/create');
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });
};
</script>

<template>
  <div class="project-list-container">
    <!-- Tab Navigation -->
    <div class="tab-navigation">
      <button 
        :class="['tab-button', { active: activeTab === 'participating' }]"
        @click="switchTab('participating')"
      >
        Participados
      </button>
      <button 
        :class="['tab-button', { active: activeTab === 'owned' }]"
        @click="switchTab('owned')"
      >
        Mis Proyectos
      </button>
    </div>

    <!-- Projects List -->
    <div class="projects-list">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>Cargando proyectos...</span>
      </div>

      <div v-else-if="currentProjects.length === 0" class="empty-state">
        <p>{{ activeTab === 'participating' ? 'No tienes proyectos en participación' : 'No tienes proyectos creados' }}</p>
      </div>

      <div v-else class="project-items">
        <div 
          v-for="project in currentProjects" 
          :key="project.id"
          class="project-item"
          @click="navigateToProject(project.id)"
        >
          <div class="project-info">
            <h3 class="project-title">{{ project.title || project.projectName }}</h3>
            <p class="project-author">{{ project.userName || 'Usuario' }}</p>
            <p class="project-date">{{ formatDate(project.createdAt) }}</p>
          </div>
          <div class="project-arrow">
            <i class="pi pi-chevron-right"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
	
    <!-- Floating Action Button -->
    <Button 
      @click="navigateToCreateProject"
      class="fab-button"
      rounded
      severity="secondary"
    >
      <i class="pi pi-plus"></i>
    </Button>
</template>

<style scoped>
.project-list-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
  background: #f8f9fa;
  min-height: 100vh;
}

/* Tab Navigation */
.tab-navigation {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tab-button {
  flex: 1;
  padding: 12px 24px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-weight: 500;
  font-size: 0.95rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-button.active {
  background: #8b5cf6;
  color: white;
  box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);
}

.tab-button:hover:not(.active) {
  background: #f3f4f6;
  color: #374151;
}

/* Projects List */
.projects-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  color: #6b7280;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #8b5cf6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  padding: 3rem 2rem;
  text-align: center;
  color: #6b7280;
}

.empty-state p {
  margin: 0;
  font-size: 0.95rem;
}

/* Project Items */

.project-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f3f4f6;
}

.project-item:last-child {
  border-bottom: none;
}

.project-item:hover {
  background: #f8f9fa;
  padding-left: 2rem;
}

.project-info {
  flex: 1;
}

.project-title {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #8b5cf6;
  line-height: 1.4;
}

.project-author {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.project-date {
  margin: 0;
  font-size: 0.8rem;
  color: #9ca3af;
}

.project-arrow {
  color: #8b5cf6;
  font-size: 0.875rem;
  margin-left: 1rem;
  transition: transform 0.2s ease;
}

.project-item:hover .project-arrow {
  transform: translateX(4px);
}

/* Floating Action Button */
.fab-button {
  position: fixed !important;
  bottom: 2rem !important;
  right: 2rem !important;
  width: 56px !important;
  height: 56px !important;
  border-radius: 50% !important;
  background: #8b5cf6 !important;
  border: none !important;
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4) !important;
  transition: all 0.2s ease;
  z-index: 9999 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.fab-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5);
  background: #7c3aed !important;
}

.fab-button i {
  font-size: 1.25rem;
  color: white;
}

/* Responsive */
@media (max-width: 640px) {
  .project-list-container {
    padding: 0.5rem;
  }
  
  .tab-navigation {
    margin-bottom: 1rem;
  }
  
  .tab-button {
    padding: 10px 16px;
    font-size: 0.9rem;
  }
  
  .project-item {
    padding: 1rem;
  }
  
  .project-item:hover {
    padding-left: 1.25rem;
  }
  
  .project-title {
    font-size: 0.95rem;
  }
  
  .project-author {
    font-size: 0.8rem;
  }
  
  .project-date {
    font-size: 0.75rem;
  }
  
  .fab-button {
    bottom: 1.5rem;
    right: 1.5rem;
    width: 52px;
    height: 52px;
  }
  
  .fab-button i {
    font-size: 1.1rem;
  }
}
</style>