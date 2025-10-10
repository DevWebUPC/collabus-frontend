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
      <!-- Left Sidebar -->
      <aside class="left-sidebar">
        <!-- Featured Collaborators Section -->
        <section class="collaborators-section">
          <FeaturedCollaborators />
        </section>

        <!-- PlanActual debajo de FeaturedCollaborators -->
        <section class="plan-section">
          <PlanActual @plan-modal-open="handlePlanModalOpen" />
        </section>
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

/* Left Sidebar */
.left-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Collaborators Section */
.collaborators-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  height: fit-content;
}

/* Plan Section */
.plan-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  height: fit-content;
}

/* Main Content */
.main-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  /* Propiedades para hacerlo scrollable */
  height: calc(100vh - 200px);
  overflow-y: auto;
}

/* Projects List Section */
.projects-list-section {
  height: 100%;
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

/* Responsive - Solo mostrar ProjectsList */
@media (max-width: 1024px) {
  .home-content {
    grid-template-columns: 1fr;
    gap: 0;
    padding: 1rem;
  }

  .left-sidebar,
  .featured-projects-section {
    display: none; /* Ocultar todos los componentes excepto ProjectsList */
  }

  .main-content {
    margin: 0;
    padding: 0;
    background: transparent;
    box-shadow: none;
    border-radius: 0;
    height: calc(100vh - 150px); /* Altura ajustada para móvil */
  }

  .projects-list-section {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .search-section {
    padding: 1rem 0;
  }

  .home-content {
    padding: 0.5rem;
  }

  .error-banner {
    width: calc(100% - 40px);
    top: 10px;
    right: 20px;
    left: 20px;
  }

  .main-content {
    height: calc(100vh - 120px); /* Altura más ajustada para móviles pequeños */
  }
}

/* Personalizar la barra de scroll */
.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>