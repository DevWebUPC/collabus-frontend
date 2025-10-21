<template>
  <pv-card class="project-progress-card">
    <template #title>
      Progreso del Proyecto
    </template>
    <template #content>
      <div class="progress-bars">
        <!-- Barra morada para el progreso de tareas -->
        <div class="progress-item">
          <div class="progress-info">
            <span class="progress-label">Progreso de Tareas</span>
            <span class="progress-value">{{ overallProgress }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill task-progress" :style="{ width: overallProgress + '%' }"></div>
          </div>
        </div>

        <!-- Barra morada para hitos -->
        <div class="progress-item">
          <div class="progress-info">
            <span class="progress-label">Hitos completados</span>
            <span class="progress-value">{{ milestonesProgress }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill task-progress" :style="{ width: milestonesProgress + '%' }"></div>
          </div>
        </div>
      </div>
    </template>
  </pv-card>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useProjectDetailStore } from '../../../../application/project-detail.store.js';
import { useMilestonesStore } from '../../../../../milestones-management/application/milestone-store.js';
import { useMilestoneTaskSubmissionStore } from '../../../../../milestones-management/application/milestone-task-submission-store.js';

const route = useRoute();
const store = useProjectDetailStore();
const milestonesStore = useMilestonesStore();
const submissionStore = useMilestoneTaskSubmissionStore();

// Computed properties para calcular el progreso
const totalTasksCount = computed(() => {
  if (!store.project?.tasks || !Array.isArray(store.project.tasks)) return 0;
  return store.project.tasks.length;
});

// Progreso general basado en el campo progress de cada tarea (BARRA MORADA)
const overallProgress = computed(() => {
  if (!store.project?.tasks || !Array.isArray(store.project.tasks) || store.project.tasks.length === 0) return 0;

  const totalProgress = store.project.tasks.reduce((sum, task) => {
    // Usar el campo progress de la tarea (0-100), si no existe usar 0
    return sum + (task.progress || 0);
  }, 0);

  return Math.round(totalProgress / store.project.tasks.length);
});

const totalMilestonesCount = computed(() => {
  if (!store.project?.milestones || !Array.isArray(store.project.milestones)) return 0;
  return store.project.milestones.length;
});

// ✅ CORREGIDO: Función para verificar si todas las tareas de un hito tienen submissions
const checkIfAllTasksHaveSubmissions = (milestone) => {
  if (!milestone.milestoneTasks || milestone.milestoneTasks.length === 0) {
    return false;
  }

  return milestone.milestoneTasks.every(task => {
    const hasSubmission = submissionStore.hasSubmissionForMilestoneTask(task.id);
    return hasSubmission;
  });
};

// ✅ CORREGIDO: Determinar si un hito está completado considerando submissions
const isMilestoneCompleted = (milestone) => {
  // Si ya está marcado como completado en el store
  if (milestone.status === 'completed' || milestone.progress === 100) {
    return true;
  }

  // ✅ NUEVO: Verificar si todas las tareas tienen submissions
  const allTasksHaveSubmissions = checkIfAllTasksHaveSubmissions(milestone);
  if (allTasksHaveSubmissions) {
    console.log(`🎯 Hito "${milestone.title}" está completado por submissions`);
    return true;
  }

  return false;
};

// ✅ CORREGIDO: Contar hitos completados considerando submissions
const completedMilestonesCount = computed(() => {
  if (!store.project?.milestones || !Array.isArray(store.project.milestones)) return 0;

  return store.project.milestones.filter(milestone =>
      isMilestoneCompleted(milestone)
  ).length;
});

// ✅ CORREGIDO: Calcular progreso de hitos
const milestonesProgress = computed(() => {
  if (totalMilestonesCount.value === 0) return 0;
  return Math.round((completedMilestonesCount.value / totalMilestonesCount.value) * 100);
});

// Cargar submissions al montar el componente
onMounted(async () => {
  const projectId = route.params.projectId || route.params.id;
  if (projectId) {
    try {
      await submissionStore.loadSubmissionsByProject(String(projectId));
      console.log('✅ Submissions cargados para calcular progreso de hitos');
    } catch (error) {
      console.error('❌ Error cargando submissions:', error);
    }
  }
});

// Debug para verificar cálculos
console.log('📊 Project Progress:', {
  totalTasks: totalTasksCount.value,
  overallProgress: overallProgress.value,
  totalMilestones: totalMilestonesCount.value,
  completedMilestones: completedMilestonesCount.value,
  milestonesProgress: milestonesProgress.value
});
</script>

<style scoped>
.progress-bars {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  font-size: 0.9rem;
  color: var(--color-gray-700);
  font-weight: 500;
}

.progress-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-gray-700);
}

/* Barra de fondo para ambas */
.progress-bar {
  width: 100%;
  height: 12px;
  background: var(--color-gray-200);
  border-radius: 6px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* Barra morada para tareas Y hitos */
.progress-fill.task-progress {
  height: 100%;
  background: linear-gradient(90deg, #8b5cf6, #7c3aed);
  border-radius: 6px;
  transition: width 0.5s ease-in-out;
  position: relative;
  box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);
}

/* Eliminar la barra normal que ya no se usa */
.progress-fill:not(.task-progress) {
  display: none; /* O eliminar esta regla completamente */
}

/* Responsive */
@media (max-width: 768px) {
  .progress-bars {
    gap: 1rem;
  }

  .progress-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .progress-value {
    text-align: left;
  }
}
</style>