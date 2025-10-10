<script setup>
import { useI18n } from "vue-i18n";
import { ref, onMounted } from "vue";
import { useHomeStore } from "../../application/home.store.js";
import PlanActual from "../../../subscription/presentation/components/PlanActual.vue";
import PlanesModal from "../../../subscription/presentation/components/PlanesModal.vue";
import HomeSearchFilters from "../components/HomeSearchFilters.vue";
import FeaturedCollaborators from "../components/FeaturedCollaborators.vue";
import ProjectsList from "../components/ProjectsList.vue";
import FeaturedProjects from "../components/FeaturedProjects.vue";

const { t } = useI18n();
const homeStore = useHomeStore();

// Estado para controlar el modal de planes
const showPlansModal = ref(false);

// Función para abrir el modal de planes
const handlePlanModalOpen = () => {
  showPlansModal.value = true;
};

// Función para cerrar el modal de planes
const handlePlanModalClose = () => {
  showPlansModal.value = false;
};

// Función para manejar selección de plan
const handlePlanSelect = (newPlan) => {
  console.log('Plan seleccionado:', newPlan);
  showPlansModal.value = false;
};

// Initialize home data on component mount
onMounted(async () => {
  await homeStore.initializeHome();
});
</script>

<template>
  <div class="home-container">
    <!-- Search and Filters Section -->
    <section class="search-section">
      <HomeSearchFilters />
    </section>

    <div class="home-content">
      <!-- Featured Collaborators Section -->
      <aside class="collaborators-section">
        <FeaturedCollaborators />
      </aside>

      <!-- Main Content Area -->
      <main class="main-content">
        <!-- Projects List Section -->
        <section class="projects-list-section">
          <ProjectsList />
        </section>
      </main>

      <!-- Featured Projects Section -->
      <aside class="featured-projects-section">
        <FeaturedProjects />
      </aside>
    </div>

    <!-- PlanActual posicionado en esquina inferior izquierda (solo en home) -->
    <div class="floating-plan">
      <PlanActual @plan-modal-open="handlePlanModalOpen" />
    </div>

    <!-- Modal de planes -->
    <PlanesModal
        v-if="showPlansModal"
        @close="handlePlanModalClose"
        @select="handlePlanSelect"
    />

    <!-- Loading State -->
    <div v-if="homeStore.isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
        <p>{{ t('common.loading') }}</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="homeStore.hasError" class="error-banner">
      <pv-message severity="error" :closable="true" @close="homeStore.clearError()">
        {{ homeStore.error }}
      </pv-message>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  position: relative;
}

/* Search Section */
.search-section {
  padding: 2rem 0;
}

/* Main Content Layout */
.home-content {
  display: grid;
  grid-template-columns: 300px 1fr 350px;
  gap: 2rem;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Collaborators Section */
.collaborators-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
}

/* Main Content */
.main-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

/* Featured Projects Section */
.featured-projects-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
}

/* PlanActual flotante en esquina inferior izquierda */
.floating-plan {
  position: fixed;
  bottom: 100px;
  left: 20px;
  width: 300px;
  z-index: 10;
  animation: fadeInUp 0.5s ease-out;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  text-align: center;
  color: #667eea;
}

.loading-spinner p {
  margin-top: 1rem;
  font-size: 1.1rem;
}

/* Error Banner */
.error-banner {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1001;
  width: 400px;
}

/* Animación para el PlanActual flotante */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 1200px) {
  .home-content {
    grid-template-columns: 280px 1fr 320px;
    gap: 1.5rem;
    padding: 1.5rem;
  }
}

@media (max-width: 1024px) {
  .home-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 1rem;
  }

  .collaborators-section,
  .featured-projects-section {
    position: static;
  }

  .floating-plan {
    width: 280px;
    left: 15px;
    bottom: 90px;
  }
}

@media (max-width: 768px) {
  .search-section {
    padding: 1.5rem 0;
  }

  .home-content {
    padding: 1rem;
    gap: 1rem;
  }

  /* Ocultar PlanActual flotante en móviles */
  .floating-plan {
    display: none;
  }

  .error-banner {
    width: calc(100% - 40px);
    top: 10px;
    right: 20px;
    left: 20px;
  }
}
</style>