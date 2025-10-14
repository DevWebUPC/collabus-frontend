<script setup lang="js">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useProfileStore } from '../../application/profile-store.js';
import { useAuthStore } from '../../../iam/application/auth-store.js';
import { useUserStore } from '../../../iam/application/user-store.js';
import ProfileHeader from '../components/profile-header.component.vue';
import ProfileStats from '../components/profile-stats.component.vue';
import ProfileDescription from '../components/profile-description.component.vue';
import ProfileSkills from '../components/profile-skills.component.vue';
import ProfileExperiences from '../components/profile-experiences.component.vue';
import ProfileTabs from '../components/profile-tabs.component.vue';

const profileStore = useProfileStore();
const authStore = useAuthStore();
const userStore = useUserStore();
const router = useRouter();
const experiencesOpen = ref(false);
const isLoadingProfile = ref(false);

// 👇 Watch para detectar cambios en el usuario autenticado
watch(
    () => userStore.currentUser,
    async (newUser, oldUser) => {
      if (newUser && newUser.id !== oldUser?.id) {
        console.log('🔄 Usuario cambiado, cargando perfil...');
        await loadUserProfile();
      }
    }
);

// 👇 Watch para detectar cuando el usuario se desautentica
watch(
    () => userStore.isAuthenticated,
    (isAuthenticated) => {
      if (!isAuthenticated) {
        console.log('🚪 Usuario cerró sesión, limpiando perfil');
        profileStore.clearProfile();
      }
    }
);

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
    points: storeProfile.points || 0, // 👈 Usar puntos reales
    projects: storeProfile.projects || [], // 👈 Usar proyectos reales
    comments: [],
    description: storeProfile.bio || 'Sin descripción',
    skills: storeProfile.abilities || [],
    avatar: storeProfile.avatar || null,
    experiences: (storeProfile.experiences || []).map(exp => ({
      company: exp.company || 'Empresa',
      role: exp.position || 'Rol',
      duration: exp.duration || 'No especificado'
    }))
  };
};

const toggleExperiences = (isOpen) => {
  experiencesOpen.value = isOpen;
};

// 👇 Función centralizada para cargar el perfil
const loadUserProfile = async () => {
  try {
    isLoadingProfile.value = true;

    const currentUser = userStore.currentUser;
    console.log('👤 Usuario del store:', currentUser);

    const userId = currentUser?.id;
    console.log('🆔 ID de usuario para buscar perfil:', userId);

    if (!userId) {
      console.log('❌ No hay usuario autenticado');
      profileStore.clearProfile();
      return;
    }

    console.log('📥 Buscando perfil para userId:', userId);

    // Siempre recargar el perfil desde la API, sin importar si ya está cargado
    await profileStore.getProfileByUserId(userId);

    console.log('✅ Perfil cargado exitosamente:', profileStore.currentProfile);

  } catch (error) {
    console.error('❌ Error cargando perfil:', error);
  } finally {
    isLoadingProfile.value = false;
  }
};

// 👇 Función para hacer logout
const handleLogout = async () => {
  try {
    // Mostrar confirmación
    if (!confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      return;
    }

    console.log('🚪 Iniciando logout...');

    // Ejecutar logout en el store de usuario
    await userStore.logout();

    // Limpiar el perfil localmente también
    profileStore.clearProfile();

    console.log('✅ Logout completado, redirigiendo...');

    // Redirigir al login
    router.push('/login');

  } catch (error) {
    console.error('❌ Error en logout:', error);
    alert('Error al cerrar sesión');
  }
};

// Cargar el perfil al montar el componente
onMounted(async () => {
  try {
    console.log('🎯 Componente profile-view montado');

    // Inicializar stores
    userStore.initializeUser();
    profileStore.initializeProfile();

    // Verificar si hay usuario autenticado
    if (userStore.isAuthenticated) {
      console.log('🔍 Usuario autenticado encontrado, cargando perfil...');
      await loadUserProfile();
    } else {
      console.log('⚠️ No hay usuario autenticado');
      // Redirigir al login si no está autenticado
      router.push('/login');
    }

  } catch (error) {
    console.error('❌ Error inicializando profile-view:', error);
  }
});
</script>

<template>
  <div class="profile-container">
    <!-- Botón de logout en la esquina superior derecha -->
    <div class="logout-container">
      <pv-button
          @click="handleLogout"
          class="logout-button"
          icon="pi pi-sign-out"
          label="Cerrar Sesión"
          severity="secondary"
          text
      />
    </div>

    <!-- Mostrar loading state -->
    <div v-if="isLoadingProfile || profileStore.loading" class="loading-container">
      <pv-progressspinner />
      <p>Cargando perfil...</p>
    </div>

    <!-- Mostrar error -->
    <div v-else-if="profileStore.error" class="error-container">
      <pv-message severity="error">
        {{ profileStore.error }}
      </pv-message>
      <pv-button
          @click="loadUserProfile"
          label="Reintentar"
          class="mt-2"
      />
    </div>

    <!-- Mostrar contenido cuando no hay perfil pero sí usuario -->
    <div v-else-if="userStore.isAuthenticated && !profileStore.currentProfile" class="no-profile-container">
      <pv-message severity="warn">
        No se encontró un perfil para este usuario.
      </pv-message>
      <pv-button
          @click="router.push('/create-account')"
          label="Completar Perfil"
          class="mt-2"
      />
    </div>

    <!-- Mostrar contenido del perfil -->
    <template v-else-if="profileStore.currentProfile">
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

    <!-- Mensaje cuando no hay usuario autenticado -->
    <div v-else class="not-authenticated">
      <pv-message severity="error">
        No estás autenticado. Por favor inicia sesión.
      </pv-message>
      <pv-button
          @click="router.push('/login')"
          label="Ir al Login"
          class="mt-2"
      />
    </div>
  </div>

  <!-- Tabs siempre visibles (solo si hay perfil) -->
  <ProfileTabs v-if="profileStore.currentProfile" :profile-data="profileData" />
</template>

<style scoped>
.profile-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
  margin-bottom: 2rem;
  position: relative;
  min-height: 400px;
}

.logout-container {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
}

.logout-button {
  color: #6b7280 !important;
  border: 1px solid #d1d5db !important;
  background: white !important;
  padding: 0.5rem 1rem !important;
  border-radius: 6px !important;
  font-size: 0.875rem !important;
  transition: all 0.2s ease-in-out !important;
}

.logout-button:hover {
  color: #dc2626 !important;
  border-color: #dc2626 !important;
  background: #fef2f2 !important;
}

.loading-container,
.error-container,
.no-profile-container,
.not-authenticated {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  width: 100%;
  text-align: center;
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

  .logout-container {
    position: relative;
    top: 0;
    right: 0;
    width: 100%;
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1rem;
  }

  .logout-button {
    font-size: 0.8rem !important;
    padding: 0.4rem 0.8rem !important;
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