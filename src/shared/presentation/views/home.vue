<script setup>
import { useI18n } from "vue-i18n";
import { ref, computed, onMounted } from "vue";
import PlanActual from "../../../subscription/presentation/components/PlanActual.vue";
import PlanesModal from "../../../subscription/presentation/components/PlanesModal.vue";

const { t } = useI18n();

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
</script>

<template>
  <div class="home-container">
    <div class="align-content-start justify-content-start m-4">
      <h1>{{ t('home.title') }}</h1>
      <p>{{ t('home.content') }}</p>
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
  </div>
</template>

<style scoped>
.home-container {
  min-height: 60vh;
  position: relative;
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
@media (max-width: 1024px) {
  .floating-plan {
    width: 280px;
    left: 15px;
    bottom: 90px;
  }
}

@media (max-width: 768px) {
  /* Ocultar PlanActual flotante en móviles */
  .floating-plan {
    display: none;
  }
}
</style>