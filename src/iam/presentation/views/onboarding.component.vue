<script setup>
import {reactive, ref, onMounted} from 'vue';
import {useRouter} from 'vue-router';
import ProgressStepper from "../components/progress-stepper.component.vue";
import ProfileStep from "../components/profile-step.component.vue"
import SkillsStep from "../components/skill-step.component.vue";
import RoleStep from "../components/role-step.component.vue";
import DescriptionStep from "../components/description-step.component.vue";
import { useProfileStore  } from '../../../profile-management/application/profile-store.js';
import {useUserStore} from "../../application/user-store.js";
import languageSwitcher from '../../../shared/presentation/components/language-switcher.vue';

const userStore = useUserStore();
const profileStore = useProfileStore();
const router = useRouter();
const currentStep = ref(1);

// Datos compartidos
const formData = reactive({
  profile: { avatar: null, username: '' },
  role: { selectedRole: '', customRole: '' },
  description: { bio: '' },
  skills: { abilities: [], experiences: [], cv: null },
});

// Verificar si el usuario está autenticado
onMounted(() => {
  if (!userStore.isAuthenticated) {
    console.log('❌ Usuario no autenticado, redirigiendo a login');
    router.push('/login');
    return;
  }

  console.log('✅ Usuario autenticado:', userStore.currentUser);
});

// Navegacion entre pasos
const nextStep = () => {
  if(currentStep.value < 4) {
    currentStep.value++;
  } else {
    completeOnboarding()
  }
}

const prevStep  = () => {
  if(currentStep.value > 1) {
    currentStep.value--;
  }
}

const completeOnboarding = async () => {
  try {
    console.log("📝 Completando onboarding...");
    console.log("Datos del formulario:", formData);
    console.log("Usuario actual:", userStore.currentUser);

    if (!userStore.currentUser || !userStore.currentUser.id) {
      throw new Error('No hay usuario autenticado');
    }

    // Usar el profile store para completar el onboarding
    const newProfile = await profileStore.completeOnboarding(formData, userStore.currentUser.id);

    if (newProfile) {
      console.log('✅ Onboarding completado exitosamente');
      console.log('Nuevo perfil creado:', newProfile);

      // Redirigir directamente al perfil
      router.push("/profile");
    } else {
      throw new Error('No se pudo crear el perfil');
    }
  } catch (error) {
    console.error('❌ Error completando onboarding:', error);
    alert(error.message || 'Error al completar el onboarding');
  }
};
</script>

<template>
  <div class="onboarding-container">
    <!--Header-->
    <header class="onboarding-header">
      <div class="header-content">
        <img src="/logo.png" alt="CollabUs Logo" class="logo">
      </div>
      <div class="right-container">
        <language-switcher />
      </div>
    </header>

    <!-- Progress Stepper -->
    <div class="progress-stepper-wrapper">
      <div class="progress-stepper-container">
        <ProgressStepper :current-step="currentStep" :total-steps="4"/>
      </div>
    </div>

    <!-- Contenido de pasos -->
    <div class="onboarding-main">
      <div class="onboarding-content">
        <!--Paso 1: Perfil-->
        <profile-step
            v-if="currentStep===1"
            v-model="formData.profile"
            @next="nextStep"
        />
        <!--Paso 2: Skill-->
        <skills-step
            v-else-if="currentStep === 2"
            v-model="formData.skills"
            @next="nextStep"
            @prev="prevStep"
        />

        <!--Paso 3: Rol-->
        <RoleStep
            v-else-if="currentStep === 3"
            v-model="formData.role"
            @next="nextStep"
            @prev="prevStep"
        />

        <!--Paso 4: Description-->
        <description-step
            v-else-if="currentStep === 4"
            v-model="formData.description"
            @complete="completeOnboarding"
            @prev="prevStep"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.onboarding-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: white;
}

.right-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.onboarding-header {
  background-color: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  height: 60px;
  width: auto;
  object-fit: contain;
}

.progress-stepper-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem 0;
  width: 100%;
}

.progress-stepper-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

/* Nuevos estilos para centrar el contenido con más altura */
.onboarding-main {
  display: flex;
  justify-content: center;
  align-items: flex-start; /* Cambiado a flex-start para dar más espacio arriba */
  flex: 1;
  padding: 2rem 2rem; /* Aumentado el padding superior */
  margin-top: 1rem; /* Añadido margen superior */
}

.onboarding-content {
  width: 100%;
  max-width: 500px;
  display: flex;
  justify-content: center;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    padding: 0 1rem;
  }

  .progress-stepper-container {
    max-width: 70%;
    padding: 0 1rem;
  }

  .progress-stepper-wrapper {
    padding-left: 33px;
  }

  .onboarding-main {
    padding: 1.5rem 1rem; /* Ajustado para móviles */
    margin-top: 0.5rem;
  }

  .onboarding-content {
    max-width: 100%;
  }
}

/* Para pantallas muy grandes */
@media (min-width: 1200px) {
  .onboarding-main {
    padding-top: 3rem; /* Más espacio en pantallas grandes */
  }
}
</style>