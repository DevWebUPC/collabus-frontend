<script setup lang="js">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProfileStore } from '../../application/profile-store.js';
import ProfileHeader from '../components/profile-header.component.vue';
import ProfileStats from '../components/profile-stats.component.vue';
import ProfileDescription from '../components/profile-description.component.vue';
import ProfileSkills from '../components/profile-skills.component.vue';
import ProfileExperiences from '../components/profile-experiences.component.vue';
import ProfileTabs from '../components/profile-tabs.component.vue';
import CommentModal from '../../../shared/presentation/components/modal-comment.component.vue'; // 👈 NUEVA IMPORTACIÓN

const route = useRoute();
const router = useRouter();
const profileStore = useProfileStore();
const isLoading = ref(false);
const profileNotFound = ref(false);
const isUpdatingPoints = ref(false);
const showCommentModal = ref(false); // 👈 NUEVA REF PARA CONTROLAR EL MODAL

// 👇 Obtener el ID del perfil desde la ruta
const profileId = computed(() => route.params.id);

// Datos mock para cuando no hay perfil cargado
const mockProfileData = ref({
  name: 'Usuario',
  roles: ['Developer'],
  mainRole: 'Full Stack Developer',
  points: 0,
  projects: [],
  comments: [],
  description: 'Sin descripción',
  skills: [],
  experiences: []
});

// Función opcional para actualizar puntos en el backend
const updateProfilePoints = async (profileId, updateData) => {
  try {
    await profileStore.updateProfileById(profileId, updateData);
    console.log('✅ Puntos actualizados en el backend para el perfil:', profileId);
  } catch (error) {
    console.error('❌ Error actualizando puntos:', error);
    throw error;
  }
};

// Perfil público cargado
const publicProfile = ref(null);

// Computed para obtener los datos del perfil cargado
const profileData = computed(() => {
  if (publicProfile.value) {
    return transformProfileData(publicProfile.value);
  }
  return mockProfileData.value;
});

// Función para transformar los datos del store al formato que esperan los componentes
const transformProfileData = (storeProfile) => {
  return {
    name: storeProfile.username || 'Usuario',
    roles: storeProfile.role ? [storeProfile.role] : ['Developer'],
    mainRole: storeProfile.role || 'Full Stack Developer',
    points: storeProfile.points || 0,
    projects: storeProfile.projects || [],
    comments: [],
    description: storeProfile.bio || 'Sin descripción',
    skills: storeProfile.abilities || [],
    avatar: storeProfile.avatar || null,
    cv: storeProfile.cv || "null",
    experiences: (storeProfile.experiences || []).map(exp => ({
      company: exp.company || 'Empresa',
      role: exp.position || 'Rol',
      duration: exp.duration || 'No especificado'
    }))
  };
};

// 👇 Función para manejar el clic en los puntos
const handlePointsClick = async () => {
  if (publicProfile.value && !isUpdatingPoints.value) {
    isUpdatingPoints.value = true;

    try {
      // Obtener el ID del usuario actual (debes tener esto en tu store de auth)
      const currentUserId = 'current-user-id'; // 👈 Reemplaza con el ID real del usuario

      // Verificar si el usuario ya dio puntos
      const hasGivenPoint = publicProfile.value.pointsGivenBy?.includes(currentUserId);

      let newPoints;
      let newPointsGivenBy;

      if (hasGivenPoint) {
        // Quitar punto
        newPoints = Math.max(0, (publicProfile.value.points || 0) - 1);
        newPointsGivenBy = publicProfile.value.pointsGivenBy?.filter(id => id !== currentUserId) || [];
        console.log('👎 Punto quitado del perfil:', publicProfile.value.username);
      } else {
        // Agregar punto
        newPoints = (publicProfile.value.points || 0) + 1;
        newPointsGivenBy = [...(publicProfile.value.pointsGivenBy || []), currentUserId];
        console.log('⭐ Punto agregado al perfil:', publicProfile.value.username);
      }

      // Actualizar localmente
      publicProfile.value.points = newPoints;
      publicProfile.value.pointsGivenBy = newPointsGivenBy;

      // Actualizar en el backend
      await updateProfilePoints(publicProfile.value.id, {
        points: newPoints,
        pointsGivenBy: newPointsGivenBy
      });

    } catch (error) {
      console.error('Error al actualizar puntos:', error);
    } finally {
      isUpdatingPoints.value = false;
    }
  }
};

// 👇 Función para cargar el perfil público
const loadPublicProfile = async () => {
  try {
    isLoading.value = true;
    profileNotFound.value = false;

    console.log('📥 Cargando perfil público con ID:', profileId.value);

    // Cargar todos los perfiles
    await profileStore.fetchAllProfiles();

    // Buscar el perfil específico por ID
    const profile = profileStore.allProfiles.find(p => p.id.toString() === profileId.value.toString());

    if (profile) {
      publicProfile.value = profile;
      console.log('✅ Perfil público cargado:', publicProfile.value);

      // 👇 AGREGAR ESTOS LOGS PARA DEBUGGING DEL CV
      console.log('🔍 Datos del CV en el perfil:', profile.cv);
      console.log('📊 Tipo de datos del CV:', typeof profile.cv);
      console.log('📁 Estructura completa del CV:', JSON.stringify(profile.cv, null, 2));

      if (profile.cv) {
        console.log('✅ CV encontrado en el perfil');
        console.log('📄 Nombre del archivo:', profile.cv.fileName);
        console.log('🔠 Tipo de archivo:', profile.cv.fileType);
        console.log('💾 Tamaño del archivo:', profile.cv.fileSize);
        console.log('📝 Datos (primeros 100 chars):', profile.cv.data?.substring(0, 100));
      } else {
        console.log('❌ NO hay CV en este perfil');
      }
    } else {
      profileNotFound.value = true;
      console.log('❌ Perfil no encontrado');
    }

  } catch (error) {
    console.error('❌ Error cargando perfil público:', error);
    profileNotFound.value = true;
  } finally {
    isLoading.value = false;
  }
};
const hasUserGivenPoint = (profile) => {
  if (!profile || !profile.pointsGivenBy) return false;
  const currentUserId = 'current-user-id'; // 👈 Reemplaza con el ID real del usuario
  return profile.pointsGivenBy.includes(currentUserId);
};

// 👇 Funciones para los botones
const handleInvite = () => {
  console.log('📩 Invitar a colaborar con:', publicProfile.value?.username);
  // Aquí irá la lógica de invitación en el futuro
  alert(`Función de invitar a ${publicProfile.value?.username} - Próximamente`);
};

// 👇 MODIFICADA: Ahora abre el modal
const handleComment = () => {
  console.log('💬 Abriendo modal de comentario para:', publicProfile.value?.username);
  showCommentModal.value = true;
};

// 👇 NUEVA FUNCIÓN: Manejar el envío del comentario (sin funcionalidad real por ahora)
const handleCommentSubmit = (commentData) => {
  console.log('📝 Comentario enviado:', commentData);
  console.log('⭐ Calificación:', commentData.rating);
  console.log('💬 Texto:', commentData.comment);
  console.log('👤 Para el perfil:', publicProfile.value?.username);

  // Aquí en el futuro irá la lógica para enviar el comentario al backend
  // Por ahora solo mostramos un mensaje
  alert(`Comentario enviado con ${commentData.rating} estrellas - Próximamente`);
};

const goBack = () => {
  router.go(-1);
};

// Cargar el perfil al montar el componente o cuando cambie el ID
onMounted(async () => {
  await loadPublicProfile();
});
</script>

<template>
  <div class="public-profile-view-container">
    <!-- Header Section -->
    <div class="profile-header-section">
      <div class="header-content">
        <button class="back-button" @click="goBack">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Volver
        </button>
        <h1 class="profile-title">Perfil de Colaborador</h1>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-content">
        <pv-progressspinner class="loading-spinner" />
        <p class="loading-text">Cargando perfil...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="profileNotFound" class="error-container">
      <pv-card class="error-card">
        <template #content>
          <div class="error-content">
            <i class="pi pi-exclamation-triangle error-icon"></i>
            <h3>Perfil no encontrado</h3>
            <p>No se pudo encontrar el perfil solicitado.</p>
            <div class="error-actions">
              <pv-button
                  @click="loadPublicProfile"
                  label="Reintentar"
                  class="retry-button"
                  icon="pi pi-refresh"
              />
              <pv-button
                  @click="goBack"
                  label="Volver"
                  class="secondary-button"
                  severity="secondary"
                  outlined
              />
            </div>
          </div>
        </template>
      </pv-card>
    </div>

    <!-- Profile Content -->
    <div v-else-if="publicProfile" class="profile-content">
      <!-- Mobile Layout -->
      <div class="mobile-layout">
        <ProfileHeader :profile-data="profileData" />

        <!-- Public Actions -->
        <div class="public-actions">
          <pv-button
              @click="handleInvite"
              class="action-button invite-button"
              icon="pi pi-user-plus"
              label="Invitar a Colaborar"
          />
          <pv-button
              @click="handleComment"
              class="action-button comment-button"
              icon="pi pi-comment"
              label="Dejar Comentario"
              severity="secondary"
              outlined
          />
        </div>
      </div>

      <!-- Desktop Layout -->
      <div class="desktop-layout">
        <div class="profile-layout">
          <!-- Left Column -->
          <div class="left-column">
            <ProfileHeader :profile-data="profileData" />

            <!-- Public Actions -->
            <div class="public-actions">
              <pv-button
                  @click="handleInvite"
                  class="action-button invite-button"
                  icon="pi pi-user-plus"
                  label="Invitar a Colaborar"
              />
              <pv-button
                  @click="handleComment"
                  class="action-button comment-button"
                  icon="pi pi-comment"
                  label="Dejar Comentario"
                  severity="secondary"
                  outlined
              />
            </div>
          </div>

          <!-- Right Column -->
          <div class="right-column">
            <ProfileStats
                :profile-data="profileData"
                :is-public="true"
                :has-given-point="hasUserGivenPoint(publicProfile)"
                @points-click="handlePointsClick"
            />
            <ProfileDescription :profile-data="profileData" />
            <ProfileSkills :profile-data="profileData" />
            <ProfileExperiences :profile-data="profileData" />
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs Section -->
    <ProfileTabs v-if="publicProfile" :profile-data="profileData" :is-public="true" />

    <!-- 👇 NUEVO: Modal de comentarios -->
    <CommentModal
        :visible="showCommentModal"
        @close="showCommentModal = false"
        @submit="handleCommentSubmit"
    />
  </div>
</template>

<style scoped>
.public-profile-view-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  position: relative;
  min-height: calc(100vh - 120px);
}

/* Header Section */
.profile-header-section {
  background: linear-gradient(135deg, #6C63FF 0%, #8B84FF 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(108, 99, 255, 0.2);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  backdrop-filter: blur(10px);
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

.profile-title {
  color: white;
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Loading State */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 2rem;
  min-height: 300px;
}

.loading-content {
  text-align: center;
}

.loading-spinner {
  width: 50px !important;
  height: 50px !important;
}

.loading-spinner :deep(.p-progress-spinner-circle) {
  stroke: #6C63FF;
}

.loading-text {
  margin-top: 1rem;
  color: #6b7280;
  font-size: 1.1rem;
}

/* Error State */
.error-container {
  padding: 2rem;
}

.error-card {
  max-width: 500px;
  margin: 0 auto;
  border-left: 4px solid #ef4444;
}

.error-content {
  text-align: center;
  padding: 1rem;
}

.error-icon {
  font-size: 3rem;
  color: #ef4444;
  margin-bottom: 1rem;
}

.error-content h3 {
  color: #374151;
  margin-bottom: 0.5rem;
}

.error-content p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.retry-button {
  background: #6C63FF !important;
  border-color: #6C63FF !important;
}

.secondary-button {
  border-color: #6C63FF !important;
  color: #6C63FF !important;
}

/* Profile Content */
.profile-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 2rem;
}

/* Mobile Layout - Mostrar por defecto */
.mobile-layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
}

/* Desktop Layout - Ocultar por defecto en móvil */
.desktop-layout {
  display: none;
}

.profile-layout {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  padding: 2rem;
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

/* Public Actions */
.public-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-button {
  width: 100%;
  padding: 0.75rem 1rem;
  font-weight: 600;
  justify-content: center;
  border-radius: 8px;
}

.invite-button {
  background: #6C63FF !important;
  border-color: #6C63FF !important;
}

.comment-button {
  border-color: #6C63FF !important;
  color: #6C63FF !important;
}

/* Responsive Design */
@media (min-width: 1025px) {
  /* En desktop: ocultar mobile layout, mostrar desktop layout */
  .mobile-layout {
    display: none;
  }

  .desktop-layout {
    display: block;
  }
}

@media (max-width: 1024px) {
  .profile-layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .public-profile-view-container {
    padding: 0.5rem;
  }

  .profile-header-section {
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .back-button {
    width: 100%;
    justify-content: center;
  }

  .profile-title {
    font-size: 1.5rem;
  }

  .mobile-layout {
    padding: 1rem;
  }

  .public-actions {
    gap: 0.75rem;
  }
}

@media (max-width: 480px) {
  .error-actions {
    flex-direction: column;
  }

  .error-actions .p-button {
    width: 100%;
  }

  .mobile-layout {
    padding: 0.75rem;
  }
}
</style>