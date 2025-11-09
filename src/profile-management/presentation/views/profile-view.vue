<script setup lang="js">
import {  ref, onMounted, computed, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useProfileStore } from '../../application/profile-store.js';
import { useUserStore } from '../../../iam/application/user-store.js';
import ProfileHeader from '../components/profile-header.component.vue';
import ProfileStats from '../components/profile-stats.component.vue';
import ProfileDescription from '../components/profile-description.component.vue';
import ProfileSkills from '../components/profile-skills.component.vue';
import ProfileExperiences from '../components/profile-experiences.component.vue';
import ProfileTabs from '../components/profile-tabs.component.vue';
import LanguageSwitcher from '../../../shared/presentation/components/language-switcher.vue';

const profileStore = useProfileStore();
const userStore = useUserStore();
const router = useRouter();
const { t } = useI18n();
const isLoadingProfile = ref(false);

// 🔥 ESTADO SIMPLIFICADO - solo un estado de carga
const isLoading = ref(true);
const showContent = ref(false);

// 🔥 NUEVO: Estado para controlar la inicialización
const isInitialized = ref(false);

// Computed para obtener los datos del store
const profileData = computed(() => {
  if (profileStore.currentProfile) {
    return transformProfileData(profileStore.currentProfile);
  }
  return getMockProfileData();
});

// 🔥 NUEVO: Computed simplificado para estados
const showProfileContent = computed(() =>
    !isLoading.value && profileStore.currentProfile && !profileStore.error
);

const showNoProfile = computed(() =>
    !isLoading.value &&
    userStore.isAuthenticated &&
    !profileStore.currentProfile?.id &&  // ✅ Verificar específicamente el ID
    !profileStore.error
);

const showError = computed(() =>
    !isLoading.value && profileStore.error
);

const showNotAuthenticated = computed(() =>
    !isLoading.value && !userStore.isAuthenticated
);

// Función para transformar los datos del store
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
    cv: storeProfile.cv || null,
    experiences: (storeProfile.experiences || []).map(exp => ({
      company: exp.company || 'Empresa',
      role: exp.position || 'Rol',
      duration: exp.duration || 'No especificado'
    }))
  };
};

// Función para datos mock
const getMockProfileData = () => ({
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

// 🔥 FUNCIÓN MEJORADA: Cargar perfil sin duplicados
const loadUserProfile = async () => {
  if (!userStore.currentUser?.id) {
    console.log('❌ No hay usuario autenticado');
    isLoading.value = false;
    return;
  }

  try {
    console.log('📥 Cargando perfil para userId:', userStore.currentUser.id);

    // 🔥 BUSCAR primero en los perfiles ya cargados
    const existingProfile = profileStore.allProfiles.find(profile =>
        String(profile.userId) === String(userStore.currentUser.id)
    );

    if (existingProfile) {
      console.log('✅ Perfil encontrado en store:', existingProfile);
      profileStore.currentProfile = existingProfile;
      return;
    }

    // 🔥 SI NO EXISTE, cargar desde API
    console.log('🔄 Perfil no encontrado en store, cargando desde API...');
    const profile = await profileStore.getProfileByUserId(userStore.currentUser.id);

    if (profile) {
      console.log('✅ Perfil cargado desde API:', profile);
      // El store debería actualizar currentProfile automáticamente
      // Si no lo hace, forzar la actualización:
      if (!profileStore.currentProfile) {
        profileStore.currentProfile = profile;
      }
    } else {
      console.log('⚠️ No se encontró perfil para el usuario');
    }

  } catch (error) {
    console.error('❌ Error cargando perfil:', error);
  }
};
// 🔥 NUEVA FUNCIÓN: Inicialización única
const initializeProfileView = async () => {
  if (isInitialized.value) {
    console.log('🔄 Ya inicializado, omitiendo...');
    return;
  }

  try {
    isLoading.value = true;
    isInitialized.value = true;

    console.log('🎯 Inicializando profile-view...');

    // 1. Inicializar stores
    userStore.initializeUser();
    profileStore.initializeProfile();

    // 2. Verificar autenticación
    if (!userStore.isAuthenticated) {
      console.log('⚠️ No autenticado, redirigiendo...');
      router.push('/login');
      return;
    }

    console.log('✅ Usuario autenticado:', userStore.currentUser?.id);

    // 3. Estrategia de carga optimizada
    if (profileStore.currentProfile) {
      console.log('📂 Perfil ya cargado en store');
      // 🔥 Pequeña pausa para evitar parpadeo
      await new Promise(resolve => setTimeout(resolve, 50));
    } else {
      console.log('🔄 Cargando perfil desde API...');
      await loadUserProfile();
    }

  } catch (error) {
    console.error('❌ Error en inicialización:', error);
  } finally {
    setTimeout(() => {
      isLoading.value = false;
      console.log('🚀 Carga completada');
    }, 100);
  }
};

// 👇 Función para hacer logout
const handleLogout = async () => {
  try {
    // Mostrar confirmación
    if (!confirm(t('profile.logoutConfirm'))) {
      return;
    }

    console.log('🚪 Iniciando logout...');
    await userStore.logout();
    profileStore.clearProfile();
    router.push('/login');

  } catch (error) {
  console.error('❌ Error en logout:', error);
  alert(t('profile.logoutError'));
  }
};

// 🔥 INICIALIZACIÓN ÚNICA al montar
onMounted(() => {
  console.log('🏁 Mounted profile-view');
  initializeProfileView();
});

// 🔥 WATCH MEJORADO: Solo para cambios de autenticación
watch(() => userStore.isAuthenticated, (isAuthenticated) => {
  if (isAuthenticated && !profileStore.currentProfile && !isLoading.value) {
    console.log('🔄 Cambio de autenticación, recargando perfil...');
    loadUserProfile();
  }
});
watch(() => profileStore.currentProfile, (newProfile) => {
  console.log('🔄 Watch - currentProfile cambiado:', newProfile);
  console.log('🔍 Estado actual:', {
    isLoading: isLoading.value,
    isAuthenticated: userStore.isAuthenticated,
    currentProfile: profileStore.currentProfile,
    error: profileStore.error,
    showProfileContent: showProfileContent.value,
    showNoProfile: showNoProfile.value
  });
}, { immediate: true });

// 🔥 NUEVO: Watch para los computed properties
watch([showProfileContent, showNoProfile], ([showContent, showNoProfile]) => {
  console.log('📊 Estados computados:', {
    showProfileContent: showContent,
    showNoProfile: showNoProfile
  });
});
</script>

<template>
  <div class="profile-view-container">
    <!-- Header Section - SIEMPRE visible -->
    <div class="profile-header-section">
      <div class="header-content">
        <div class="header-title">
          <h1 class="profile-title">{{ $t('profile.myProfileTitle') }}</h1>
          <p class="profile-subtitle">{{ $t('profile.subtitle') }}</p>
        </div>
        <language-switcher/>
    <pv-button
      @click="handleLogout"
      class="logout-button"
      icon="pi pi-sign-out"
      :label="$t('profile.logout')"
      severity="secondary"
      outlined
    />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-content">
  <pv-progressspinner class="loading-spinner" />
  <p class="loading-text">{{ $t('profile.loadingYourProfile') }}</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="showError" class="error-container">
      <pv-card class="error-card">
        <template #content>
          <div class="error-content">
            <i class="pi pi-exclamation-triangle error-icon"></i>
            <h3>{{ $t('profile.errorLoadingProfileTitle') }}</h3>
              <p>{{ profileStore.error }}</p>
      <pv-button
        @click="loadUserProfile"
        :label="$t('profile.retry')"
        class="retry-button"
        icon="pi pi-refresh"
      />
          </div>
        </template>
      </pv-card>
    </div>

    <!-- No Profile State -->
    <div v-else-if="showNoProfile" class="no-profile-container">
      <pv-card class="no-profile-card">
        <template #content>
          <div class="no-profile-content">
            <i class="pi pi-user-edit no-profile-icon"></i>
            <h3>{{ $t('profile.noProfileTitle') }}</h3>
            <p>{{ $t('profile.noProfileMessage') }}</p>
            <pv-button
                @click="router.push('/create-account')"
                :label="$t('profile.completeProfile')"
                class="complete-profile-button"
                icon="pi pi-user-plus"
            />
          </div>
        </template>
      </pv-card>
    </div>

    <!-- Profile Content -->
    <div v-else-if="showProfileContent" class="profile-content">
      <div class="profile-main-section">
        <div class="profile-layout">
          <!-- Left Column - Profile Header -->
          <div class="left-column">
            <ProfileHeader :profile-data="profileData" />
          </div>

          <!-- Right Column - Profile Details -->
          <div class="right-column">
            <div class="content-grid">
              <div class="stats-section">
                <ProfileStats :profile-data="profileData" :is-public="false" />
              </div>

              <div class="description-section">
                <ProfileDescription :profile-data="profileData" />
              </div>

              <div class="skills-section">
                <ProfileSkills :profile-data="profileData" />
              </div>

              <div class="experiences-section">
                <ProfileExperiences :profile-data="profileData" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Tabs -->
      <ProfileTabs
          :profile-data="profileData"
          :is-public="false"
      />
    </div>

    <!-- Not Authenticated State -->
    <div v-else-if="showNotAuthenticated" class="not-authenticated">
      <pv-card class="auth-card">
        <template #content>
          <div class="auth-content">
            <i class="pi pi-lock auth-icon"></i>
            <h3>{{ $t('profile.accessRestricted') }}</h3>
            <p>{{ $t('profile.mustLogin') }}</p>
            <pv-button
                @click="router.push('/login')"
                :label="$t('profile.goToLogin')"
                class="login-button"
                icon="pi pi-sign-in"
            />
          </div>
        </template>
      </pv-card>
    </div>
  </div>
</template>

<style scoped>
.profile-view-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  position: relative;
  min-height: calc(100vh - 120px);
}

/* Header Section */
.profile-header-section {
  background: linear-gradient(135deg, #6C63FF 0%, #8B84FF 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(108, 99, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.profile-header-section::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
  border-radius: 50%;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  position: relative;
  z-index: 2;
}

.header-title {
  flex: 1;
}

.profile-title {
  color: var(--color-white, #FFFFFF);
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  margin: 0;
  font-weight: 400;
}

.logout-button {
  background: rgba(255, 255, 255, 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: white !important;
  padding: 0.75rem 1.5rem !important;
  border-radius: 12px !important;
  font-weight: 600 !important;
  transition: all 0.3s ease !important;
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.logout-button:hover {
  background: rgba(255, 255, 255, 0.25) !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

/* Loading State */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 2rem;
  min-height: 400px;
}

.loading-content {
  text-align: center;
}

.loading-spinner {
  width: 60px !important;
  height: 60px !important;
}

.loading-spinner :deep(.p-progress-spinner-circle) {
  stroke: #6C63FF;
}

.loading-text {
  margin-top: 1.5rem;
  color: #6b7280;
  font-size: 1.2rem;
  font-weight: 500;
}

/* Error State */
.error-container {
  padding: 2rem;
}

.error-card {
  max-width: 500px;
  margin: 0 auto;
  border-left: 6px solid #ef4444;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.error-content {
  text-align: center;
  padding: 2rem;
}

.error-icon {
  font-size: 4rem;
  color: #ef4444;
  margin-bottom: 1.5rem;
}

.error-content h3 {
  color: #1f2937;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.error-content p {
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.6;
  font-size: 1.1rem;
}

.retry-button {
  background: #6C63FF !important;
  border-color: #6C63FF !important;
  padding: 0.75rem 1.5rem !important;
  font-weight: 600 !important;
}

/* No Profile State */
.no-profile-container {
  padding: 2rem;
}

.no-profile-card {
  max-width: 500px;
  margin: 0 auto;
  border-left: 6px solid #f59e0b;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.no-profile-content {
  text-align: center;
  padding: 2rem;
}

.no-profile-icon {
  font-size: 4rem;
  color: #f59e0b;
  margin-bottom: 1.5rem;
}

.no-profile-content h3 {
  color: #1f2937;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.no-profile-content p {
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.6;
  font-size: 1.1rem;
}

.complete-profile-button {
  background: #6C63FF !important;
  border-color: #6C63FF !important;
  padding: 0.75rem 1.5rem !important;
  font-weight: 600 !important;
}

/* Not Authenticated State */
.not-authenticated {
  padding: 2rem;
}

.auth-card {
  max-width: 500px;
  margin: 0 auto;
  border-left: 6px solid #6C63FF;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.auth-content {
  text-align: center;
  padding: 2rem;
}

.auth-icon {
  font-size: 4rem;
  color: #6C63FF;
  margin-bottom: 1.5rem;
}

.auth-content h3 {
  color: #1f2937;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.auth-content p {
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.6;
  font-size: 1.1rem;
}

.login-button {
  background: #6C63FF !important;
  border-color: #6C63FF !important;
  padding: 0.75rem 1.5rem !important;
  font-weight: 600 !important;
}

/* Profile Content */
.profile-content {
  background: var(--color-white, #FFFFFF);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 2rem;
}

.profile-main-section {
  padding: 0;
}

.profile-layout {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 0;
  min-height: 600px;
}

/* Left Column */
.left-column {
  background: var(--color-gray-300, #f8fafc);
  border-right: 1px solid var(--color-gray-300, #e5e7eb);
  padding: 2rem;
  display: flex;
  flex-direction: column;
}

/* Right Column */
.right-column {
  padding: 2rem;
  background: var(--color-white, #FFFFFF);
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

/* Tabs Section */
.tabs-section {
  background: var(--color-white, #FFFFFF);
  border-top: 1px solid var(--color-gray-300, #e5e7eb);
  padding: 2rem;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .profile-layout {
    grid-template-columns: 340px 1fr;
  }
}

@media (max-width: 1024px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }

  .left-column {
    border-right: none;
    border-bottom: 1px solid var(--color-gray-300, #e5e7eb);
  }
}

@media (max-width: 768px) {
  .profile-view-container {
    padding: 0.5rem;
  }

  .profile-header-section {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    border-radius: 12px;
  }

  .header-content {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }

  .profile-title {
    font-size: 1.75rem;
  }

  .profile-subtitle {
    font-size: 1rem;
  }

  .logout-button {
    width: 100%;
    justify-content: center;
  }

  .left-column,
  .right-column {
    padding: 1.5rem;
  }

  .tabs-section {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .profile-header-section {
    padding: 1rem;
  }

  .profile-title {
    font-size: 1.5rem;
  }

  .left-column,
  .right-column {
    padding: 1rem;
  }

  .tabs-section {
    padding: 1rem;
  }
}

/* Animation for smooth transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>