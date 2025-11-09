

<script setup lang="js">
import { ref, onMounted, computed, defineProps } from 'vue';
import { useProfileStore } from '../../application/profile-store.js';
import { useUserStore } from '../../../iam/application/user-store.js';
import { useRouter, useRoute } from 'vue-router';
import CommentCardList from './comment-card-list.component.vue';
import { useProjectsStore } from '../../../projects/application/projects.store.js';

const selectedOption = ref(2);
const selectedProjectView = ref('my-projects'); // 'my-projects' o 'favorites'

const projectsStore = useProjectsStore();
const profileStore = useProfileStore();
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
  
// Props para vista pública
const props = defineProps({
  profileData: {
    type: Object,
    default: null
  },
  isPublic: {
    type: Boolean,
    default: false
  }
});

const showCommentModal = ref(false);

const profileId = computed(() => route.params.id);
const comments = computed(() => profileStore.comments);

const handleOpenCommentModal = () => {
  showCommentModal.value = true;
};

const handleCloseCommentModal = () => {
  showCommentModal.value = false;
};

const handleSubmitComment = async ({ rating, comment }) => {
  if (!profileId.value || !userStore.currentUser?.id) return;
  await profileStore.addComment({
    profileId: profileId.value,
    userId: userStore.currentUser.id,
    rating,
    comment
  });
  showCommentModal.value = false;
};

const currentProfile = computed(() => {
  // Si hay id en la ruta, buscar ese perfil
  if (profileId.value) {
    const found = profileStore.allProfiles?.find(p => String(p.id) === String(profileId.value));
    if (found) return found;
  }
  // Por defecto, usar el perfil actual
  return profileStore.currentProfile;
});

// Proyectos propios del perfil mostrado
const myProjects = computed(() => {
  if (!currentProfile.value) return [];
  return projectsStore.projects.filter(p => String(p.userId) == String(currentProfile.value.userId));
});

// Proyectos favoritos del perfil mostrado (únicos)
const favoriteProjects = computed(() => {
  if (!currentProfile.value) return [];
  // Eliminar duplicados por project.id
  const seen = new Set();
  return projectsStore.favoriteProjects.filter(p => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
});

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });
};

const navigateToProject = (projectId, fromFavorites = false) => {
  if (fromFavorites) {
    router.push(`/projects/show/${projectId}`);
  } else if (props.isPublic) {
    router.push(`/projects/show/${projectId}`);
  } else {
    router.push(`/projects/${projectId}`);
  }
};


onMounted(async () => {
  if (profileId.value) {
    await profileStore.fetchComments(profileId.value);
  }
    // Cargar proyectos y favoritos si es necesario
  if (!projectsStore.projects.length) {
    await projectsStore.fetchProjects();
  }
  if (currentProfile.value && currentProfile.value.id) {
    await projectsStore.fetchFavorites(currentProfile.value.id);
  }
});
</script>

<template>
  <div class="flex justify-content-center flex-column align-items-center">
    <!-- Tabs principales -->
    <div class="tabs-container mb-4">
      <div
          class="tab-option"
          :class="{ 'tab-active': selectedOption === 1 }"
          @click="selectedOption = 1"
      >
        {{ $t('profile.options.projects') }}
      </div>
      <div
          class="tab-option"
          :class="{ 'tab-active': selectedOption === 2 }"
          @click="selectedOption = 2"
      >
        {{ $t('profile.options.comments') }}
      </div>
    </div>

    <!-- Sub-tabs para proyectos (solo visible cuando selectedOption === 1) -->
    <div v-if="selectedOption === 1" class="sub-tabs-container">
      <div
          class="sub-tab-option"
          :class="{ 'sub-tab-active': selectedProjectView === 'my-projects' }"
          @click="selectedProjectView = 'my-projects'"
      >
        {{ $t('profile.subtabs.myProjects') }}
      </div>
      <div
          class="sub-tab-option"
          :class="{ 'sub-tab-active': selectedProjectView === 'favorites' }"
          @click="selectedProjectView = 'favorites'"
      >
        {{ $t('profile.subtabs.favorites') }}
      </div>
    </div>

    <!-- Contenido dinámico -->
    <div class="tab-content">
      <div v-if="selectedOption === 1">
        <div v-if="selectedProjectView === 'my-projects'">
          <!-- Contenido de Mis Proyectos -->
          <div v-if="myProjects.length === 0">
            <p>{{ $t('profile.noOwnProjects') }}</p>
          </div>
          <div v-else class="projects-list">
            <div 
              v-for="project in myProjects" 
              :key="project.id"
              class="project-item"
              @click="navigateToProject(project.id)"
              style="cursor:pointer;"
            >
              <div class="project-info">
                <strong class="project-title">{{ project.title || project.projectName }}</strong>
                <div class="project-author">{{ project.userName || $t('projects.user') }}</div>
                <div class="project-date">{{ formatDate(project.createdAt) }}</div>
              </div>
              <div class="project-arrow">
                <i class="pi pi-chevron-right"></i>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="selectedProjectView === 'favorites'">
          <!-- Contenido de Favoritos -->
          <div v-if="favoriteProjects.length === 0">
            <p>{{ $t('profile.noFavoriteProjects') }}</p>
          </div>
          <div v-else class="projects-list">
            <div 
              v-for="project in favoriteProjects" 
              :key="project.id"
              class="project-item"
              @click="navigateToProject(project.id, true)"
              style="cursor:pointer;"
            >
              <div class="project-info">
                <strong class="project-title">{{ project.title || project.projectName }}</strong>
                <div class="project-author">{{ project.userName || $t('projects.user') }}</div>
                <div class="project-date">{{ formatDate(project.createdAt) }}</div>
              </div>
              <div class="project-arrow">
                <i class="pi pi-chevron-right"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="selectedOption === 2" class="comments-container">
        <!-- Contenido de Comentarios -->
        <div class="comments-section">
          <template v-if="comments.length > 0">
            <CommentCardList :comments="comments" />
          </template>
          <template v-else>
            <div class="no-comments">{{ $t('profile.comments.empty') }}</div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-comments {
  color: #888;
  font-size: 1.1rem;
  text-align: center;
  margin: 2rem 0;
}

.comments-container{
  width: 100%;
}

.comments-section {
  margin-top: 2rem;
  width: 100%;
}
.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.add-comment-btn {
  background: #6C63FF;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.add-comment-btn:hover {
  background: #5a52d5;
}
</style>

<style scoped>
.tabs-container {
  display: flex;
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 4px;
  width: fit-content;
}

.tab-option {
  font-size: 20px;
  flex: 1;
  text-align: center;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 10px;
  width: 150px;
}

.tab-active {
  color: #6C63FF;
}

.sub-tabs-container {
  display: flex;
  background-color: #ffffff;
  color: #4A41CC;
  border-radius: 8px;
  padding: 2px;
  margin-bottom: 1rem;
  width: fit-content;
  gap: 40px;
}

.sub-tab-option {
  border: 2px solid #4A41CC;
  flex: 2;
  text-align: center;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  min-width: 150px;
}

.sub-tab-active {
  background-color: #6C63FF;
  color: #E0E0E0;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.tab-content {
  min-height: 200px;
  padding: 1rem;
  width: 100%;
  text-align: center;
}
</style>

<style scoped>
.projects-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 1rem;
}
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
  color: var(--color-primary);
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
  color: var(--color-primary);
  font-size: 0.875rem;
  margin-left: 1rem;
  transition: transform 0.2s ease;
}
.project-item:hover .project-arrow {
  transform: translateX(4px);
}
</style>