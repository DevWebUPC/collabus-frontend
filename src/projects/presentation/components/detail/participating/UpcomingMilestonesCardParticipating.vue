<!-- UpcomingMilestonesCardParticipating.vue -->
<template>
  <pv-card class="upcoming-milestones-card">
    <template #title>
      Próximos Hitos
    </template>
    <template #content>
      <div class="milestones-list">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <pv-progress-spinner />
          <span>Cargando hitos...</span>
        </div>

        <!-- Empty State -->
        <div v-else-if="pendingMilestones.length === 0" class="empty-state">
          <i class="pi pi-flag empty-icon"></i>
          <h3>No tienes hitos pendientes</h3>
          <p>Cuando te asignen nuevos hitos, aparecerán aquí.</p>
        </div>

        <!-- Milestones List -->
        <div v-else class="milestones-container">
          <div class="milestones-scroll-container">
            <div
                v-for="milestone in pendingMilestones"
                :key="milestone.id"
                class="milestone-item"
            >
              <div class="milestone-info">
                <div class="milestone-header">
                  <h4 class="milestone-title">{{ milestone.title }}</h4>
                  <span class="status-badge pending">
                    <i class="pi pi-clock"></i>
                    Pendiente
                  </span>
                </div>

                <p class="milestone-description">{{ milestone.description || 'Sin descripción' }}</p>

                <div class="milestone-meta">
                  <div class="meta-item">
                    <i class="pi pi-calendar"></i>
                    <span class="meta-text">
                      {{ formatDate(milestone.dueDate) }}
                      <span v-if="getDaysRemaining(milestone.dueDate) !== null"
                            class="days-remaining">
                        ({{ getDaysRemaining(milestone.dueDate) + ' días restantes' }})
                      </span>
                    </span>
                  </div>

                  <div class="meta-item">
                    <i class="pi pi-check-circle"></i>
                    <span class="meta-text">
                      {{ milestone.progress }}% completado
                      ({{ getCompletedTasksCount(milestone) }}/{{ getTotalTasksCount(milestone) }} tareas)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Botón general Ver Hitos -->
          <div class="view-all-milestones-btn-container">
            <pv-button
                label="Ver Todos los Hitos"
                icon="pi pi-arrow-right"
                @click="viewAllMilestones"
                class="view-all-milestones-btn"
                outlined
            />
          </div>
        </div>
      </div>
    </template>
  </pv-card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useProjectDetailStore } from '../../../../application/project-detail.store.js';
import { useUserStore } from '../../../../../iam/application/user-store.js';
import { useMilestoneTaskSubmissionStore } from '../../../../../milestones-management/application/milestone-task-submission-store.js';

const projectDetailStore = useProjectDetailStore();
const userStore = useUserStore();
const milestoneSubmissionStore = useMilestoneTaskSubmissionStore();

const loading = ref(false);

// Computed: Obtener hitos pendientes del usuario actual (CORREGIDO)
const pendingMilestones = computed(() => {
  if (!projectDetailStore.project?.milestones) {
    return [];
  }

  const userId = getNormalizedUserId();
  if (!userId) {
    return [];
  }

  console.log('🔍 UpcomingMilestonesCard - Filtrando hitos pendientes para usuario:', userId);

  // Filtrar hitos en los que el usuario participa y que están activos Y no completados
  const userMilestones = projectDetailStore.project.milestones.filter(milestone => {
    // Verificar si el usuario tiene tareas en este hito
    const hasUserTasks = milestone.milestoneTasks?.some(task =>
        task.assignedTo && String(task.assignedTo) === userId
    );

    // Verificar si el hito está activo y no está completado
    const isActiveAndNotCompleted = milestone.status === 'active' &&
        !checkIfAllTasksHaveSubmissions(milestone);

    console.log(`   - Hito "${milestone.title}":
        Tiene tareas del usuario: ${hasUserTasks},
        Activo y no completado: ${isActiveAndNotCompleted}`);

    return hasUserTasks && isActiveAndNotCompleted;
  });

  console.log('✅ UpcomingMilestonesCard - Hitos pendientes encontrados:', userMilestones.length);
  return userMilestones;
});

// Verificar si todas las tareas del hito tienen submissions (NUEVA FUNCIÓN)
const checkIfAllTasksHaveSubmissions = (milestone) => {
  if (!milestone.milestoneTasks || milestone.milestoneTasks.length === 0) {
    return false;
  }

  const userId = getNormalizedUserId();

  // Solo verificar las tareas del usuario actual
  const userTasks = milestone.milestoneTasks.filter(task =>
      task.assignedTo && String(task.assignedTo) === userId
  );

  if (userTasks.length === 0) return false;

  // Verificar que todas las tareas del usuario tengan submissions
  const allTasksHaveSubmissions = userTasks.every(task => {
    const hasSubmission = milestoneSubmissionStore.hasSubmissionForMilestoneTask(task.id);
    console.log(`   - Tarea "${task.title}": ${hasSubmission ? 'TIENE' : 'NO TIENE'} submission`);
    return hasSubmission;
  });

  console.log(`   - Hito "${milestone.title}": ${allTasksHaveSubmissions ? 'TODAS' : 'NO TODAS'} las tareas tienen submissions`);
  return allTasksHaveSubmissions;
};

const getNormalizedUserId = () => {
  const userId = userStore.currentUser?.id || localStorage.getItem("userId");
  return userId ? String(userId) : null;
};

// Contar tareas completadas en un hito
const getCompletedTasksCount = (milestone) => {
  if (!milestone.milestoneTasks) return 0;

  const userId = getNormalizedUserId();
  return milestone.milestoneTasks.filter(task =>
      task.assignedTo && String(task.assignedTo) === userId &&
      milestoneSubmissionStore.hasSubmissionForMilestoneTask(task.id)
  ).length;
};

// Contar total de tareas del usuario en un hito
const getTotalTasksCount = (milestone) => {
  if (!milestone.milestoneTasks) return 0;

  const userId = getNormalizedUserId();
  return milestone.milestoneTasks.filter(task =>
      task.assignedTo && String(task.assignedTo) === userId
  ).length;
};

// Progreso de mis tareas en el hito (NUEVA FUNCIÓN)
const getMyProgressInMilestone = (milestone) => {
  const myTasks = getMyTasksInMilestone(milestone);
  if (myTasks.length === 0) return 0;

  const completedTasks = myTasks.filter(task =>
      milestoneSubmissionStore.hasSubmissionForMilestoneTask(task.id)
  ).length;

  return Math.round((completedTasks / myTasks.length) * 100);
};

// Obtener mis tareas en el hito (NUEVA FUNCIÓN)
const getMyTasksInMilestone = (milestone) => {
  const userId = getNormalizedUserId();
  if (!userId || !milestone.milestoneTasks) return [];

  return milestone.milestoneTasks.filter(task =>
      task.assignedTo && String(task.assignedTo) === userId
  );
};

// Formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return 'Sin fecha límite';

  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Obtener días restantes
const getDaysRemaining = (dueDate) => {
  if (!dueDate) return null;

  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
};

// Navegar a la pestaña Milestones
const viewAllMilestones = () => {
  console.log('🎯 Navegando a pestaña Milestones desde UpcomingMilestonesCard');
  // Emitir evento para cambiar a la pestaña milestones
  const event = new CustomEvent('view-all-milestones');
  window.dispatchEvent(event);
};

// Watch para detectar cambios en los submissions y actualizar la vista
watch(
    () => milestoneSubmissionStore.submissions,
    () => {
      console.log('🔄 UpcomingMilestonesCard - Submissions actualizados, recalculando hitos pendientes');
      // Forzar recálculo del computed
      pendingMilestones.value;
    },
    { deep: true }
);

// Cargar hitos cuando el componente se monte
onMounted(async () => {
  console.log('🚀 UpcomingMilestonesCard - Inicializando componente');
  console.log('Hitos pendientes en el card:', pendingMilestones.value);

  // Cargar submissions para poder determinar el progreso de los hitos
  if (projectDetailStore.project?.id) {
    loading.value = true;
    try {
      await milestoneSubmissionStore.loadSubmissionsByProject(projectDetailStore.project.id);
      console.log('✅ UpcomingMilestonesCard - Submissions cargados correctamente');
    } catch (error) {
      console.error('Error loading milestone submissions:', error);
    } finally {
      loading.value = false;
    }
  }
});
</script>

<style scoped>
.upcoming-milestones-card {
  height: 100%;
}

.milestones-list {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Estados de carga y vacío */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;
  color: var(--color-gray-600);
  height: 200px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: var(--color-gray-500);
  height: 200px;
}

.empty-icon {
  font-size: 3rem;
  color: var(--color-gray-300);
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: var(--color-gray-700);
}

.empty-state p {
  margin: 0;
  font-size: 0.9rem;
}

/* Lista de hitos */
.milestones-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 1rem;
}

.milestones-scroll-container {
  flex: 1;
  overflow-y: auto;
  max-height: 400px; /* Altura máxima antes de mostrar scroll */
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-right: 0.25rem;
}

/* Personalizar scrollbar */
.milestones-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.milestones-scroll-container::-webkit-scrollbar-track {
  background: var(--color-gray-100);
  border-radius: 3px;
}

.milestones-scroll-container::-webkit-scrollbar-thumb {
  background: var(--color-gray-300);
  border-radius: 3px;
}

.milestones-scroll-container::-webkit-scrollbar-thumb:hover {
  background: var(--color-gray-400);
}

.milestone-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  background: var(--color-gray-50);
  border-radius: 8px;
  border-left: 4px solid var(--color-warning);
  transition: all 0.2s ease;
  flex-shrink: 0; /* Evita que los hitos se compriman */
}

.milestone-item:hover {
  background: var(--color-gray-100);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.milestone-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.milestone-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.milestone-title {
  font-weight: 600;
  color: var(--color-gray-800);
  font-size: 0.9rem;
  margin: 0;
  flex: 1;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.status-badge.pending {
  background: #fef3c7;
  color: #d97706;
}

.milestone-description {
  font-size: 0.8rem;
  color: var(--color-gray-600);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.milestone-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--color-gray-500);
}

.meta-text {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.days-remaining {
  font-weight: 500;
  font-size: 0.7rem;
}

/* Contenedor y botón Ver Hitos */
.view-all-milestones-btn-container {
  display: flex;
  justify-content: center;
  margin-top: auto; /* Empuja el botón hacia abajo */
  padding-top: 1rem;
  border-top: 1px solid var(--color-gray-200);
  flex-shrink: 0; /* Evita que el botón se comprima */
}

.view-all-milestones-btn {
  color: var(--color-warning);
  border-color: var(--color-warning);
  font-weight: 500;
}

.view-all-milestones-btn:hover {
  background: var(--color-warning);
  color: var(--color-white);
}

/* Responsive */
@media (max-width: 768px) {
  .milestones-scroll-container {
    max-height: 350px; /* Altura menor en móviles */
  }

  .milestone-item {
    flex-direction: column;
    gap: 1rem;
  }

  .milestone-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>