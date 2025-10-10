<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useHomeStore } from '../../application/home.store.js';

const { t } = useI18n();
const router = useRouter();
const homeStore = useHomeStore();

// Computed properties
const featuredProjects = computed(() => homeStore.featuredProjects);
const isLoading = computed(() => homeStore.isLoadingFeaturedProjects);

// Handle view more projects
const handleViewMore = () => {
  router.push('/projects');
};

// Handle project view
const handleViewProject = (project) => {
  router.push(`/projects/${project.id}`);
};

// Handle apply to project
const handleApplyToProject = (project) => {
  console.log('Apply to project:', project);
  // Navigate to application or show modal
};

// Get project status color
const getStatusColor = (status) => {
  const statusMap = {
    'active': 'success',
    'planning': 'info',
    'completed': 'secondary',
    'paused': 'warning',
    'cancelled': 'danger'
  };
  return statusMap[status?.toLowerCase()] || 'info';
};
</script>

<template>
  <div class="featured-projects">
    <div class="section-header">
      <h2 class="section-title">{{ t('home.featuredProjects.title') }}</h2>
      <pv-button
        :label="t('home.featuredProjects.viewMore')"
        icon="pi pi-arrow-right"
        class="view-more-btn"
        text
        @click="handleViewMore"
      />
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="skeleton-project" v-for="i in 4" :key="i">
        <div class="skeleton-header">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-meta"></div>
        </div>
        <div class="skeleton-content">
          <div class="skeleton-line skeleton-roles"></div>
          <div class="skeleton-line skeleton-areas"></div>
          <div class="skeleton-line skeleton-progress"></div>
        </div>
      </div>
    </div>

    <!-- Featured Projects List -->
    <div v-else class="projects-container">
      <div
        v-for="project in featuredProjects"
        :key="project.id"
        class="featured-project-card"
        @click="handleViewProject(project)"
      >
        <!-- Project Header -->
        <div class="project-header">
          <div class="project-title-section">
            <h3 class="project-title">{{ project.title || t('projects.untitled') }}</h3>
          </div>
        </div>

        <!-- Project Content -->
        <div class="project-content">
          <!-- Available Roles -->
          <div v-if="project.roles?.length" class="roles-section">
            <p class="roles-label">{{ t('home.featuredProjects.roles') }}:</p>
            <div class="roles-tags">
              <pv-chip
                v-for="role in project.roles.slice(0, 2)"
                :key="role"
                :label="role.name"
                class="role-chip"
              />
              <span
                v-if="project.roles.length > 2"
                class="more-roles"
              >
                +{{ project.roles.length - 2 }}
              </span>
            </div>
          </div>

          <!-- Areas -->
          <div v-if="project.areas?.length" class="areas-section">
            <p class="roles-label">{{ t('home.projects.areas') }}:</p>
            <div class="areas-tags">
              <span
                v-for="area in project.areas.slice(0, 2)"
                :key="area"
                class="area-tag"
              >
                {{ area }}
              </span>
            </div>
          </div>

          <div class="project-meta">
            <span class="project-duration">
              {{ t('home.projects.duration') }}: {{ project.durationQuantity }} {{ project.durationType }}
            </span>
          </div>
        </div>

        <!-- Project Actions -->
        <div class="project-actions">
          <pv-button
            :label="t('home.featuredProjects.viewDetails')"
            icon="pi pi-eye"
            size="small"
            outlined
            class="view-button"
            @click.stop="handleViewProject(project)"
          />
          <pv-button
            :label="t('home.featuredProjects.apply')"
            icon="pi pi-send"
            size="small"
            class="apply-button"
            @click.stop="handleApplyToProject(project)"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!featuredProjects.length" class="empty-state">
        <i class="pi pi-star empty-icon"></i>
        <p class="empty-message">{{ t('home.featuredProjects.noFeaturedProjects') }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.featured-projects {
  height: 100%;
}

/* Section Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-gray-200);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0;
}

.view-more-btn {
  font-size: 0.875rem;
  color: var(--color-primary);
  padding: var(--space-1) var(--space-2);
}

.view-more-btn:hover {
  background: rgba(102, 126, 234, 0.1);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-project {
  padding: var(--space-4);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  background: var(--color-white);
}

.skeleton-header,
.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.skeleton-content:last-child {
  margin-bottom: 0;
}

.skeleton-line {
  height: var(--space-3);
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg, var(--color-gray-200) 25%, var(--color-gray-100) 50%, var(--color-gray-200) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-title { width: 80%; height: 16px; }
.skeleton-meta { width: 60%; }
.skeleton-roles { width: 70%; }
.skeleton-areas { width: 50%; }
.skeleton-progress { width: 90%; }

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Projects Container */
.projects-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.featured-project-card {
  padding: var(--space-4);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  background: var(--color-white);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.featured-project-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.15);
  transform: translateY(-2px);
}

.featured-project-card:before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(to bottom, var(--color-primary), var(--color-primary-dark));
  border-radius: var(--radius-lg) 0 0 var(--radius-lg);
}

/* Project Header */
.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.project-title-section {
  flex: 1;
}

.project-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0 0 var(--space-1) 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-meta {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  font-size: 0.75rem;
  color: var(--color-gray-600);
}

.project-author {
  font-weight: 500;
  color: var(--color-gray-700);
}

.status-tag {
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
}

/* Project Content */
.project-content {
  margin-bottom: 1rem;
}

/* Roles Section */
.roles-section {
  margin-bottom: 0.75rem;
}

.roles-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-gray-700);
  margin-bottom: var(--space-1);
}

.roles-tags {
  display: flex;
  gap: 0.25rem;
  align-items: center;
  flex-wrap: wrap;
}

.role-chip {
  background: var(--color-primary);
  color: var(--color-white);
  font-size: 0.625rem;
  padding: 0.125rem var(--space-2);
  height: auto;
}

.more-roles {
  font-size: 0.625rem;
  color: var(--color-gray-600);
  background: var(--color-gray-100);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-full);
  font-weight: 500;
}

/* Areas Section */
.areas-section {
  margin-bottom: 0.75rem;
}

.areas-tags {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.area-tag {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background: var(--color-gray-100);
  color: var(--color-gray-700);
  font-size: 0.625rem;
  font-weight: 500;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-gray-300);
}

/* Project Actions */
.project-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-gray-100);
}

.view-button {
  flex: 1;
  height: 32px;
  font-size: 0.75rem;
}

.apply-button {
  flex: 1;
  height: 32px;
  font-size: 0.75rem;
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.apply-button:hover {
  background: var(--color-primary-dark);
  border-color: var(--color-primary-dark);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-gray-600);
}

.empty-icon {
  font-size: 3rem;
  color: var(--color-gray-300);
  margin-bottom: 1rem;
}

.empty-message {
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.5;
}

/* Responsive */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .project-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .project-actions {
    flex-direction: column;
  }

  .view-button,
  .apply-button {
    width: 100%;
  }

  .featured-project-card {
    padding: 0.75rem;
  }
}
</style>