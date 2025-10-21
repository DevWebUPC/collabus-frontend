<!-- ProjectProgressCardParticipating.vue -->
<template>
  <pv-card class="project-progress-card">
    <template #title>
      Avance General del Proyecto
    </template>
    <template #content>
      <div class="progress-content">
        <!-- Círculo de progreso -->
        <div class="progress-circle-container">
          <div class="progress-circle">
            <div class="progress-circle-fill" :style="{ transform: `rotate(${progress * 3.6}deg)` }"></div>
            <div class="progress-circle-mask"></div>
            <div class="progress-text">
              <span class="progress-percentage">{{ (progress).toFixed(1) }}%</span>
              <span class="progress-label">Completado</span>
            </div>
          </div>
        </div>

      </div>
    </template>
  </pv-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useProjectDetailStore } from '../../../../application/project-detail.store.js';
import { useTaskSubmissionStore } from '../../../../../task-management/application/task-submission-store.js';
import { useMilestoneTaskSubmissionStore } from '../../../../../milestones-management/application/milestone-task-submission-store.js';

const projectDetailStore = useProjectDetailStore();
const taskSubmissionStore = useTaskSubmissionStore();
const milestoneSubmissionStore = useMilestoneTaskSubmissionStore();

const loading = ref(false);

// Computed: Obtener todas las tareas del proyecto
const projectTasks = computed(() => {
  return projectDetailStore.project?.tasks || [];
});

// Computed: Obtener todos los hitos del proyecto
const projectMilestones = computed(() => {
  return projectDetailStore.project?.milestones || [];
});

// Computed: Total de tareas
const totalTasks = computed(() => {
  return projectTasks.value.length;
});

// Computed: Tareas completadas (con submission)
const completedTasks = computed(() => {
  return projectTasks.value.filter(task =>
      taskSubmissionStore.hasSubmissionForTask(task.id)
  ).length;
});

// Computed: Total de hitos
const totalMilestones = computed(() => {
  return projectMilestones.value.length;
});

// Computed: Hitos completados (todos los milestoneTasks tienen submissions)
const completedMilestones = computed(() => {
  return projectMilestones.value.filter(milestone => {
    // Verificar si todos los milestoneTasks tienen submissions
    return checkIfAllTasksHaveSubmissions(milestone);
  }).length;
});

// Función para verificar si todas las tareas de un hito tienen submissions
const checkIfAllTasksHaveSubmissions = (milestone) => {
  if (!milestone.milestoneTasks || milestone.milestoneTasks.length === 0) {
    return false;
  }

  // Verificar cada tarea del hito
  const allTasksHaveSubmissions = milestone.milestoneTasks.every(task => {
    const hasSubmission = milestoneSubmissionStore.hasSubmissionForMilestoneTask(task.id);
    return hasSubmission;
  });

  return allTasksHaveSubmissions;
};

// Computed: Tareas pendientes
const pendingTasks = computed(() => {
  return totalTasks.value - completedTasks.value;
});

// Computed: Progreso general del proyecto basado en tareas y hitos completados
const progress = computed(() => {
  const totalItems = totalTasks.value + totalMilestones.value;
  if (totalItems === 0) return 0;

  const completedItems = completedTasks.value + completedMilestones.value;
  const percentage = (completedItems / totalItems) * 100;
  return Math.round(percentage * 10) / 10; // Redondear a 1 decimal
});

// Cargar submissions para todas las tareas y hitos del proyecto
onMounted(async () => {
  loading.value = true;
  try {
    // Cargar submissions para todas las tareas del proyecto
    if (projectTasks.value.length > 0) {
      for (const task of projectTasks.value) {
        await taskSubmissionStore.loadSubmissionsByTask(task.id);
      }
    }

    // Cargar submissions para todos los milestone tasks del proyecto
    if (projectDetailStore.project?.id) {
      await milestoneSubmissionStore.loadSubmissionsByProject(projectDetailStore.project.id);
    }
  } catch (error) {
    console.error('Error loading project progress data:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.project-progress-card {
  height: 100%;
}

.progress-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Estilos para el círculo de progreso */
.progress-circle-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.progress-circle {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(
      var(--color-primary) 0% calc(v-bind(progress) * 1%),
      var(--color-gray-200) calc(v-bind(progress) * 1%) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-circle::before {
  content: '';
  position: absolute;
  width: 100px;
  height: 100px;
  background: white;
  border-radius: 50%;
}

.progress-text {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.progress-percentage {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1.2;
}

.progress-label {
  font-size: 0.8rem;
  color: var(--color-gray-600);
  text-align: center;
}

.progress-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-gray-200);
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  color: var(--color-gray-600);
  font-size: 0.9rem;
}

.stat-value {
  font-weight: 600;
  color: var(--color-gray-800);
}

.stat-value.completed {
  color: var(--color-green-600);
}

.stat-value.pending {
  color: var(--color-orange-600);
}

/* Responsive */
@media (max-width: 768px) {
  .progress-circle {
    width: 100px;
    height: 100px;
  }

  .progress-circle::before {
    width: 80px;
    height: 80px;
  }

  .progress-percentage {
    font-size: 1.1rem;
  }

  .stat-item {
    padding: 0.4rem 0;
  }

  .stat-label {
    font-size: 0.85rem;
  }

  .stat-value {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .progress-content {
    gap: 1rem;
  }

  .progress-circle-container {
    padding: 0.5rem;
  }
}
</style>