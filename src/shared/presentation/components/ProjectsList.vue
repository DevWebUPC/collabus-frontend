<script setup>
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useHomeStore } from '../../application/home.store.js';
import {useUserStore} from "../../../iam/application/user-store.js";

const userStore = useUserStore();
const { t } = useI18n();
const router = useRouter();
const homeStore = useHomeStore();

// Computed properties
const projects = computed(() => {
  const currentUserId = userStore.currentUser?.id?.toString();
  return homeStore.paginatedProjects.filter(project =>
      project.userId !== currentUserId
  );
});
const isLoading = computed(() => homeStore.isLoadingProjects);
const totalProjects = computed(() => homeStore.filteredProjects.length);
const currentPage = computed(() => homeStore.currentPage);
const itemsPerPage = computed(() => homeStore.itemsPerPage);

// Handle pagination
const handlePageChange = (event) => {
  homeStore.changePage(event.page + 1);
};

// Handle project view
const handleViewProject = (project) => {
  router.push(`/projects/show/${project.id}`);
};

// Handle apply to project - ACTUALIZADO
const handleApplyToProject = (project) => {
  router.push(`/projects/${project.id}/apply`);
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

onMounted(() => {
  if (!userStore.currentUser) {
    userStore.initializeUser();
  }
});
</script>

<template>
  <div class="projects-list">
    <div class="section-header">
      <h2 class="section-title">{{ t('home.projects.title') }}</h2>
      <div class="results-info">
        <span class="results-count">
          {{ t('home.projects.resultsCount', { count: totalProjects }) }}
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="skeleton-project" v-for="i in 5" :key="i">
        <div class="skeleton-header">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-meta"></div>
        </div>
        <div class="skeleton-content">
          <div class="skeleton-line skeleton-description"></div>
          <div class="skeleton-line skeleton-description"></div>
        </div>
        <div class="skeleton-footer">
          <div class="skeleton-line skeleton-tag"></div>
          <div class="skeleton-line skeleton-progress"></div>
        </div>
      </div>
    </div>

    <!-- Projects List -->
    <div v-else-if="projects.length" class="projects-container">
      <div
          v-for="project in projects"
          :key="project.id"
          class="project-card"
      >
        <div class="project-header">
          <div class="project-title-section">
            <h3 class="project-title">{{ project.title || t('projects.untitled') }}</h3>
          </div>
        </div>

        <div class="project-content">
          <p class="project-description">
            {{ project.description || t('projects.noDescription') }}
          </p>

          <!-- Available Roles -->
          <div v-if="project.roles?.length" class="roles-section">
            <h4 class="roles-title">{{ t('home.projects.availableRoles') }}:</h4>
            <div class="roles-tags">
              <pv-chip
                  v-for="role in project.roles.slice(0, 3)"
                  :key="role.id"
                  :label="role.name"
                  class="role-chip"
              />
              <pv-chip
                  v-if="project.roles.length > 3"
                  :label="`+${project.roles.length - 3}`"
                  class="role-chip more-roles"
              />
            </div>
          </div>

          <!-- Areas -->
          <div v-if="project.areas?.length" class="areas-section">
            <h4 class="roles-title">{{ t('home.projects.areas') }}:</h4>
            <div class="areas-tags">
              <span
                  v-for="area in project.areas.slice(0, 2)"
                  :key="area"
                  class="area-tag"
              >
                {{ area }}
              </span>
              <span
                  v-if="project.areas.length > 2"
                  class="area-tag more-areas"
              >
                +{{ project.areas.length - 2 }}
              </span>
            </div>
          </div>

          <div class="project-meta">
            <span class="project-author">
              {{ t('home.projects.publishedBy') }} <strong>{{ project.authorName || project.owner || t('common.unknown') }}</strong>
            </span>
            <span class="project-duration">
              {{ t('home.projects.duration') }}: {{ project.durationQuantity }} {{ project.durationType }}
            </span>
          </div>

          <!-- Tags/Keywords -->
          <div v-if="project.tags?.length" class="tags-section">
            <div class="project-tags">
              <span
                  v-for="tag in project.tags.slice(0, 4)"
                  :key="tag"
                  class="project-tag"
              >
                #{{ tag }}
              </span>
            </div>
          </div>

        </div>

        <div class="project-actions">
          <pv-button
              :label="t('home.projects.viewMore')"
              icon="pi pi-eye"
              class="view-button"
              @click="handleViewProject(project)"
          />
          <pv-button
              :label="t('home.projects.apply')"
              icon="pi pi-send"
              class="apply-button"
              @click="handleApplyToProject(project)"
          />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <i class="pi pi-folder-open empty-icon"></i>
      <h3 class="empty-title">{{ t('home.projects.noProjects') }}</h3>
      <p class="empty-message">{{ t('home.projects.noProjectsMessage') }}</p>
      <pv-button
          :label="t('home.projects.clearFilters')"
          icon="pi pi-filter-slash"
          outlined
          @click="homeStore.clearFilters()"
      />
    </div>

    <!-- Pagination -->
    <div v-if="projects.length && homeStore.totalPages > 1" class="pagination-section">
      <pv-paginator
          :first="(currentPage - 1) * itemsPerPage"
          :rows="itemsPerPage"
          :total-records="totalProjects"
          @page="handlePageChange"
          template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
      />
    </div>
  </div>
</template>

<style scoped>
.projects-list {
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
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-900);
  margin: 0;
}

.results-info {
  display: flex;
  align-items: center;
}

.results-count {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  font-weight: var(--font-weight-medium);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.skeleton-project {
  padding: var(--space-6);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-xl);
  background: var(--color-white);
}

.skeleton-header,
.skeleton-content,
.skeleton-footer {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.skeleton-header:last-child,
.skeleton-content:last-child,
.skeleton-footer:last-child {
  margin-bottom: 0;
}

.skeleton-line {
  height: var(--space-3);
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg, var(--color-gray-200) 25%, var(--color-gray-100) 50%, var(--color-gray-200) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-title { width: 70%; height: 20px; }
.skeleton-meta { width: 50%; }
.skeleton-description { width: 100%; }
.skeleton-description:last-child { width: 80%; }
.skeleton-tag { width: 30%; }
.skeleton-progress { width: 60%; }

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Projects Container */
.projects-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.project-card {
  padding: var(--space-6);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-xl);
  background: var(--color-white);
  transition: all 0.2s ease;
}

.project-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 8px 25px rgba(var(--color-primary-rgb), 0.15);
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
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0 0 var(--space-2) 0;
  line-height: 1.3;
}

.project-meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  font-size: 0.875rem;
  color: var(--color-gray-600);
}

.project-author strong {
  color: var(--color-gray-700);
}

.status-tag {
  font-size: 0.75rem;
  font-weight: 600;
}

/* Project Content */
.project-content {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.project-description {
  font-size: 0.95rem;
  color: var(--color-gray-600);
  line-height: 1.6;
  margin: 0 0 var(--space-4) 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Roles Section */
.roles-section {
  margin-bottom: 1rem;
}

.roles-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-gray-700);
  margin: 0 0 var(--space-2) 0;
}

.roles-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.role-chip {
  background: var(--color-primary);
  color: var(--color-white);
  font-size: 0.75rem;
  padding: var(--space-1) var(--space-3);
}

.role-chip.more-roles {
  background: var(--color-gray-200);
  color: var(--color-gray-600);
}

/* Areas Section */
.areas-section {
  margin-bottom: 1rem;
}

.areas-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.area-tag {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  background: var(--color-gray-100);
  color: var(--color-gray-700);
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-gray-300);
}

.area-tag.more-areas {
  background: var(--color-gray-200);
  color: var(--color-gray-500);
}

/* Tags Section */
.tags-section {
  margin-bottom: 1rem;
}

.project-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.project-tag {
  font-size: 0.75rem;
  color: var(--color-primary);
  background: rgba(var(--color-primary-rgb), 0.1);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-weight: 500;
}

/* Project Actions */
.project-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--color-gray-100);
}

.view-button {
  flex: 1;
  height: 40px;
  background: var(--color-secondary);
  border-color: var(--color-secondary) !important;
}

.view-button:hover {
  background: var(--color-secondary) !important;
  border-color: var(--color-secondary) !important;
}

.apply-button {
  flex: 1;
  height: 40px;
  background: var(--color-primary);
  border-color: var(--color-primary) !important;
}

.apply-button:hover {
  background: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--color-gray-600);
}

.empty-icon {
  font-size: 4rem;
  color: var(--color-gray-300);
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-gray-700);
  margin: 0 0 0.5rem 0;
}

.empty-message {
  font-size: 1rem;
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

/* Pagination */
.pagination-section {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
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
    gap: 1rem;
  }

  .project-actions {
    flex-direction: column;
  }

  .view-button,
  .apply-button {
    width: 100%;
  }

  .roles-tags,
  .areas-tags,
  .project-tags {
    gap: 0.375rem;
  }

  .project-card {
    padding: 1rem;
  }
}
</style>