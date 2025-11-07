<script setup lang="js">
import { ref, onMounted, computed, defineProps, watch } from 'vue';
import { useProfileStore } from '../../application/profile-store.js';
import { useUserStore } from '../../../iam/application/user-store.js';
import { useRouter, useRoute } from 'vue-router';
import CommentCardList from './comment-card-list.component.vue';
import { useProjectsStore } from '../../../projects/application/projects.store.js';

const selectedOption = ref(2);
const selectedProjectView = ref('my-projects');

const projectsStore = useProjectsStore();
const profileStore = useProfileStore();
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

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

// 🔥 CORREGIDO: Obtener el profileId correctamente
const profileId = computed(() => {
  // Si es vista pública, usar el ID de la ruta
  if (props.isPublic && route.params.id) {
    return parseInt(route.params.id);
  }
  // Si es perfil propio, usar el ID del perfil actual
  if (profileStore.currentProfile?.id) {
    return profileStore.currentProfile.id;
  }
  return null;
});

// 🔥 CORREGIDO: Obtener userId del perfil
const profileUserId = computed(() => {
  // Si es vista pública, usar el userId del perfil que estamos viendo
  if (props.isPublic) {
    // Obtener el userId del perfil público que estamos viendo
    const publicProfile = profileStore.allProfiles.find(p =>
        p.id.toString() === route.params.id.toString()
    );
    return publicProfile?.userId;
  }

  // Si es perfil propio, usar el userId del usuario autenticado
  return userStore.currentUser?.id;
});

// 🔥 FALTA: Agregar la propiedad comments
const comments = computed(() => {
  if (!profileId.value) return [];

  // 🔥 FILTRAR: Solo mostrar comentarios que pertenecen a este perfil específico
  return profileStore.comments.filter(comment =>
      String(comment.profileId) === String(profileId.value)
  );
});
// Proyectos propios del perfil mostrado
const myProjects = computed(() => {
  if (!profileUserId.value) return [];

  console.log('🔍 Filtering projects for userId:', profileUserId.value);

  const filteredProjects = projectsStore.projects.filter(p =>
      String(p.userId) === String(profileUserId.value)
  );

  console.log('📁 Found projects:', filteredProjects.length);
  filteredProjects.forEach(p => console.log('   -', p.title, 'by userId:', p.userId));

  return filteredProjects;
});

const loadComments = async () => {
  if (profileId.value) {
    console.log('🔄 Cargando comentarios para profileId:', profileId.value);
    await profileStore.fetchComments(profileId.value);
    console.log('✅ Comentarios cargados:', comments.value.length);
  }
};

// 🔥 MODIFICADO: Cargar comentarios cuando cambie el profileId
watch(profileId, (newProfileId) => {
  if (newProfileId) {
    console.log('🔄 ProfileId cambiado, cargando comentarios...');
    loadComments();
  }
});


// 🔥 CORREGIDO: Proyectos favoritos - usar directamente los favorites del store
const favoriteProjects = computed(() => {
  console.log('🔄 Computed favoriteProjects:', projectsStore.favoriteProjects.length);
  return projectsStore.favoriteProjects;
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
  if (fromFavorites || props.isPublic) {
    router.push(`/projects/show/${projectId}`);
  } else {
    router.push(`/projects/${projectId}`);
  }
};

// 🔥 CORREGIDO: Función para cargar favoritos
const loadFavorites = async () => {
  if (profileId.value) {
    console.log('⭐ Cargando favoritos para profileId:', profileId.value);
    await projectsStore.fetchFavorites(profileId.value);
    console.log('✅ Favoritos cargados:', projectsStore.favoriteProjects.length);
  } else {
    console.log('❌ No hay profileId para cargar favoritos');
  }
};

// 🔥 NUEVO: Cargar favoritos cuando se cambie a la pestaña de favoritos
watch([selectedOption, selectedProjectView], ([newOption, newView]) => {
  if (newOption === 1 && newView === 'favorites' && profileId.value) {
    console.log('🔄 Cambiando a pestaña de favoritos, cargando...');
    loadFavorites();
  }
});

watch(profileId, (newProfileId, oldProfileId) => {
  if (newProfileId && newProfileId !== oldProfileId) {
    console.log('🔄 ProfileId cambiado, cargando comentarios...');
    loadComments();
  }
});

// 🔥 NUEVO: Cargar favoritos cuando el profileId esté disponible
watch(profileId, (newProfileId) => {
  if (newProfileId) {
    console.log('🔄 ProfileId disponible, precargando favoritos...');
    // Precargar favoritos para que estén listos cuando el usuario haga clic
    loadFavorites();
  }
});

watch(profileId, (newProfileId) => {
  if (newProfileId) {
    console.log('🔄 ProfileId cambiado, cargando comentarios...');
    loadComments();
  }
});

watch(selectedOption, (newOption) => {
  if (newOption === 2 && profileId.value) {
    console.log('📝 Pestaña de comentarios seleccionada, recargando...');
    loadComments();
  }
});


onMounted(async () => {
  console.log('🎯 ProfileTabs montado - profileId:', profileId.value);

  // Cargar proyectos si es necesario
  if (!projectsStore.projects.length) {
    console.log('🔄 Cargando proyectos...');
    await projectsStore.fetchProjects();
  }

  // 🔥 MODIFICADO: Cargar comentarios específicos para este perfil
  if (profileId.value) {
    await loadComments();
  }

  // Cargar favoritos
  if (profileId.value) {
    console.log('🔄 Cargando favoritos iniciales...');
    await loadFavorites();
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
        Mis Proyectos
      </div>
      <div
          class="sub-tab-option"
          :class="{ 'sub-tab-active': selectedProjectView === 'favorites' }"
          @click="selectedProjectView = 'favorites'"
      >
        Favoritos
      </div>
    </div>

    <!-- Contenido dinámico -->
    <div class="tab-content">
      <div v-if="selectedOption === 1">
        <div v-if="selectedProjectView === 'my-projects'">
          <!-- Contenido de Mis Proyectos -->
          <div v-if="myProjects.length === 0">
            <p>No tienes proyectos propios.</p>
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
                <div class="project-author">{{ project.authorName || $t('projects.user') }}</div>
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
            <p>No tienes proyectos favoritos.</p>
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
                <div class="project-author">{{ project.authorName || $t('projects.user') }}</div>
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