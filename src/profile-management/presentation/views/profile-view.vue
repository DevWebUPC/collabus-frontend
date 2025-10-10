<script setup lang="js">
import { ref, onMounted, computed } from 'vue';
import { useProfileStore } from '../../application/profile-store.js';
import ProfileHeader from '../components/profile-header.component.vue';
import ProfileStats from '../components/profile-stats.component.vue';
import ProfileDescription from '../components/profile-description.component.vue';
import ProfileSkills from '../components/profile-skills.component.vue';
import ProfileExperiences from '../components/profile-experiences.component.vue';
import ProfileTabs from '../components/profile-tabs.component.vue';

const profileStore = useProfileStore();
const experiencesOpen = ref(false);



// Computed para obtener los datos del store o mock
const profileData = computed(() => {
  if (profileStore.currentProfile) {
    return transformProfileData(profileStore.currentProfile);
  }
  return mockProfileData.value;
});

// Función para transformar los datos del store al formato que esperan los componentes
const transformProfileData = (storeProfile) => {
  return {
    name: storeProfile.username || 'Usuario',
    roles: storeProfile.role ? [storeProfile.role] : ['Developer'],
    mainRole: storeProfile.role || 'Full Stack Developer',
    points: 0, // Puedes calcular esto basado en actividades del usuario
    projects: [], // Esto lo puedes obtener de otra parte de tu aplicación
    comments: [],
    description: storeProfile.bio || 'Sin descripción',
    skills: storeProfile.abilities || [],
    experiences: (storeProfile.experiences || []).map(exp => ({
      company: exp.company || 'Empresa',
      role: exp.company || 'Rol',
      duration: exp.duration || 'No especificado'
    }))
  };
};

const toggleExperiences = (isOpen) => {
  experiencesOpen.value = isOpen;
};

// Cargar el perfil al montar el componente
onMounted(async () => {
  try {
    // Inicializar el store
    profileStore.initializeProfile();

    // Si no hay perfil cargado, intentar obtenerlo por userId
    // Reemplaza '1' con el ID real del usuario actual
    const userId = '1'; // Esto debería venir de tu sistema de autenticación
    if (!profileStore.currentProfile) {
      await profileStore.getProfileByUserId(userId);
    }
  } catch (error) {
    console.error('Error loading profile:', error);
  }
});
</script>

<template>
  <div class="profile-container">
    <!-- Mostrar loading state -->
    <div v-if="profileStore.loading" class="loading-container">
      <pv-progressspinner />
      <p>Cargando perfil...</p>
    </div>

    <!-- Mostrar error -->
    <div v-else-if="profileStore.error" class="error-container">
      <pv-message severity="error">
        {{ profileStore.error }}
      </pv-message>
      <pv-button
          @click="profileStore.initializeProfile()"
          label="Reintentar"
          class="mt-2"
      />
    </div>

    <!-- Mostrar contenido del perfil -->
    <template v-else>
      <!-- Header siempre visible -->
      <ProfileHeader :profile-data="profileData" />

      <!-- Contenido principal - oculto en móvil -->
      <div class="main-content col-12 md:col-9 gap-1 hidden-on-mobile">
        <ProfileStats :profile-data="profileData" />
        <ProfileDescription :profile-data="profileData" />
        <ProfileSkills :profile-data="profileData" />
        <ProfileExperiences
            :profile-data="profileData"
            @toggle-experiences="toggleExperiences"
        />
      </div>
    </template>
  </div>

  <!-- Tabs siempre visibles -->
  <ProfileTabs :profile-data="profileData" />
</template>

<style scoped>
.profile-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
  margin-bottom: 2rem;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  width: 100%;
}

/* En pantallas grandes */
@media (min-width: 768px) {
  .profile-container {
    flex-direction: row;
    align-items: flex-start;
  }

  .hidden-on-mobile {
    display: block;
  }
}

/* En pantallas pequeñas */
@media (max-width: 767px) {
  .hidden-on-mobile {
    display: none !important;
  }
}

.color-text {
  color: #6C63FF;
}
.color-bg {
  background-color: #6C63FF;
}
.color-border {
  border-color: #6C63FF;
}
.color-bg-white {
  background-color: #fff;
}
</style>