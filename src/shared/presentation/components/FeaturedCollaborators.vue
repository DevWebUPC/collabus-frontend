<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHomeStore } from '../../application/home.store.js';

const { t } = useI18n();
const homeStore = useHomeStore();

// Computed properties
const featuredCollaborators = computed(() => homeStore.featuredCollaborators);
const isLoading = computed(() => homeStore.isLoadingCollaborators);

// Handle view more collaborators
const handleViewMore = () => {
  // Navigate to collaborators page or show modal
  console.log('View more collaborators');
};

// Handle collaborator profile view
const handleViewProfile = (collaborator) => {
  console.log('View collaborator profile:', collaborator);
};

// Get rating stars
const getRatingStars = (rating) => {
  return Array.from({ length: 5 }, (_, index) => index < Math.floor(rating));
};

// Format rating
const formatRating = (rating) => {
  return rating ? rating.toFixed(1) : '0.0';
};
</script>

<template>
  <div class="featured-collaborators">
    <div class="section-header">
      <h2 class="section-title">{{ t('home.collaborators.title') }}</h2>
      <pv-button
        :label="t('home.collaborators.viewMore')"
        icon="pi pi-arrow-right"
        class="view-more-btn"
        text
        @click="handleViewMore"
      />
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="skeleton-card" v-for="i in 3" :key="i">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-content">
          <div class="skeleton-line skeleton-name"></div>
          <div class="skeleton-line skeleton-role"></div>
          <div class="skeleton-line skeleton-rating"></div>
        </div>
      </div>
    </div>

    <!-- Collaborators List -->
    <div v-else class="collaborators-list">
      <div
        v-for="collaborator in featuredCollaborators"
        :key="collaborator.id"
        class="collaborator-card"
        @click="handleViewProfile(collaborator)"
      >
        <div class="collaborator-avatar">
          <pv-avatar
            :image="collaborator.profilePicture"
            :label="collaborator.name?.charAt(0) || 'U'"
            size="large"
            shape="circle"
            class="avatar"
          />
          <div v-if="collaborator.isOnline" class="online-indicator"></div>
        </div>

        <div class="collaborator-info">
          <h3 class="collaborator-name">{{ collaborator.name || t('common.unnamed') }}</h3>
          <p class="collaborator-role">{{ collaborator.role || collaborator.profession || t('common.noRole') }}</p>

          <!-- Skills -->
          <div v-if="collaborator.skills?.length" class="skills-section">
            <div class="skill-tags">
              <span
                v-for="skill in collaborator.skills.slice(0, 2)"
                :key="skill"
                class="skill-tag"
              >
                {{ skill }}
              </span>
              <span
                v-if="collaborator.skills.length > 2"
                class="skill-tag more-skills"
              >
                +{{ collaborator.skills.length - 2 }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!featuredCollaborators.length" class="empty-state">
        <i class="pi pi-users empty-icon"></i>
        <p class="empty-message">{{ t('home.collaborators.noCollaborators') }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.featured-collaborators {
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

.skeleton-card {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  background: var(--color-gray-50);
}

.skeleton-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: linear-gradient(90deg, var(--color-gray-200) 25%, var(--color-gray-100) 50%, var(--color-gray-200) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton-line {
  height: var(--space-3);
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg, var(--color-gray-200) 25%, var(--color-gray-100) 50%, var(--color-gray-200) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-name { width: 80%; }
.skeleton-role { width: 60%; }
.skeleton-rating { width: 40%; }

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Collaborators List */
.collaborators-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.collaborator-card {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.collaborator-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb), 0.15);
  transform: translateY(-2px);
}

/* Avatar Section */
.collaborator-avatar {
  position: relative;
  flex-shrink: 0;
}

.avatar {
  width: 48px;
  height: 48px;
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: var(--space-3);
  height: var(--space-3);
  background: var(--color-success);
  border: 2px solid var(--color-white);
  border-radius: var(--radius-full);
}

/* Collaborator Info */
.collaborator-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.collaborator-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0;
  line-height: 1.2;
}

.collaborator-role {
  font-size: 0.875rem;
  color: var(--color-gray-600);
  margin: 0;
  line-height: 1.2;
}

/* Rating Section */
.rating-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stars {
  display: flex;
  gap: 2px;
}

.star-icon {
  font-size: 0.75rem;
  color: var(--color-warning);
}

.star-icon.pi-star {
  color: var(--color-gray-300);
}

.rating-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-gray-700);
}

/* Skills Section */
.skills-section {
  margin-top: 0.25rem;
}

.skill-tags {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.skill-tag {
  display: inline-block;
  padding: 0.125rem 0.375rem;
  background: var(--color-primary-light);
  color: var(--color-primary-dark);
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: var(--radius-full);
  line-height: 1.2;
}

.skill-tag.more-skills {
  background: var(--color-gray-100);
  color: var(--color-gray-500);
}

/* Stats Section */
.stats-section {
  margin-top: 0.25rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #64748b;
  font-size: 0.75rem;
}

.stat-icon {
  font-size: 0.75rem;
}

.stat-value {
  font-weight: 600;
  color: #374151;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: #64748b;
}

.empty-icon {
  font-size: 3rem;
  color: #cbd5e1;
  margin-bottom: 1rem;
}

.empty-message {
  font-size: 0.875rem;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .collaborator-card {
    padding: 0.75rem;
  }

  .collaborator-info {
    gap: 0.375rem;
  }
}
</style>