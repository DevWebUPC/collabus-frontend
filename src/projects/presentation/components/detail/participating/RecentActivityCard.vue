<!-- RecentActivityCard.vue -->
<template>
  <pv-card class="recent-activity-card">
    <template #title>
      Actividad Reciente
    </template>
    <template #content>
      <div class="activity-list">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <pv-progress-spinner />
          <span>Cargando estadísticas...</span>
        </div>

        <!-- Estadísticas -->
        <div v-else class="stats-container">
          <div class="stat-item">
            <div class="stat-icon completed">
              <i class="pi pi-check-circle"></i>
            </div>
            <div class="stat-content">
              <span class="stat-label">Tareas Completadas</span>
              <span class="stat-value">{{ completedTasks }}/{{ totalTasks }}</span>
              <div v-if="totalTasks > 0" class="progress-bar">
                <div
                    class="progress-fill"
                    :style="{ width: completionPercentage + '%' }"
                ></div>
              </div>
              <span v-if="totalTasks > 0" class="stat-percentage">
                {{ completionPercentage }}% completado
              </span>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-icon milestone">
              <i class="pi pi-flag"></i>
            </div>
            <div class="stat-content">
              <span class="stat-label">Hitos Completados</span>
              <span class="stat-value">{{ completedMilestones }}/{{ totalMilestones }}</span>
              <div v-if="totalMilestones > 0" class="progress-bar">
                <div
                    class="progress-fill milestone-progress"
                    :style="{ width: milestoneCompletionPercentage + '%' }"
                ></div>
              </div>
              <span v-if="totalMilestones > 0" class="stat-percentage">
                {{ milestoneCompletionPercentage }}% completado
              </span>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-icon deadline">
              <i class="pi pi-calendar"></i>
            </div>
            <div class="stat-content">
              <span class="stat-label">Próxima Entrega</span>
              <span v-if="nextDeadline" class="stat-value">
                {{ formatDate(nextDeadline.dueDate) }}
              </span>
              <span v-else class="stat-value">No hay entregas</span>
              <span v-if="nextDeadline" class="stat-deadline">
                {{ nextDeadline.title }}
              </span>
              <span v-if="nextDeadlineType" class="stat-deadline-type">
                {{ nextDeadlineType }}
              </span>
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
import { useUserStore } from '../../../../../iam/application/user-store.js';
import { useTaskSubmissionStore } from '../../../../../task-management/application/task-submission-store.js';
import { useMilestoneTaskSubmissionStore } from '../../../../../milestones-management/application/milestone-task-submission-store.js';

const projectDetailStore = useProjectDetailStore();
const userStore = useUserStore();
const taskSubmissionStore = useTaskSubmissionStore();
const milestoneSubmissionStore = useMilestoneTaskSubmissionStore();

const loading = ref(false);

// Computed: Obtener todas las tareas del usuario
const userTasks = computed(() => {
  if (!projectDetailStore.project?.tasks) {
    return [];
  }

  const userId = getNormalizedUserId();
  if (!userId) {
    return [];
  }

  return projectDetailStore.project.tasks.filter(task =>
      task.assignedTo && String(task.assignedTo) === userId
  );
});

// Computed: Tareas completadas (con submission)
const completedTasks = computed(() => {
  return userTasks.value.filter(task =>
      taskSubmissionStore.hasSubmissionForTask(task.id)
  ).length;
});

// Computed: Total de tareas asignadas
const totalTasks = computed(() => {
  return userTasks.value.length;
});

// Computed: Porcentaje de completado de tareas
const completionPercentage = computed(() => {
  if (totalTasks.value === 0) return 0;
  return Math.round((completedTasks.value / totalTasks.value) * 100);
});

// Computed: Hitos en los que participa el usuario
const userMilestones = computed(() => {
  if (!projectDetailStore.project?.milestones) return [];

  const userId = getNormalizedUserId();
  if (!userId) return [];

  // Filtrar hitos que tienen al menos una tarea asignada al usuario
  const userMilestones = projectDetailStore.project.milestones.filter(milestone => {
    const hasUserTasks = milestone.milestoneTasks?.some(task => {
      const taskUserId = task.assignedTo ? String(task.assignedTo) : null;
      return taskUserId === userId;
    });
    return hasUserTasks;
  });

  // Verificar estado de completado basado en submissions (MISMA LÓGICA QUE ParticipatingMilestonesView.vue)
  const updatedMilestones = userMilestones.map(milestone => {
    const allTasksCompleted = checkIfAllTasksHaveSubmissions(milestone);

    if (allTasksCompleted && milestone.status !== 'completed') {
      return {
        ...milestone,
        status: 'completed',
        progress: 100
      };
    }

    return milestone;
  });

  return updatedMilestones;
});

// MISMA FUNCIÓN QUE EN ParticipatingMilestonesView.vue
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

// Computed: Hitos completados por el usuario (INCLUYENDO LOS QUE SE MARCADOS COMO COMPLETADOS POR LA LÓGICA ANTERIOR)
const completedMilestones = computed(() => {
  return userMilestones.value.filter(milestone =>
      milestone.status === 'completed'
  ).length;
});

// Computed: Total de hitos en los que participa
const totalMilestones = computed(() => {
  return userMilestones.value.length;
});

// Computed: Porcentaje de completado de hitos
const milestoneCompletionPercentage = computed(() => {
  if (totalMilestones.value === 0) return 0;
  return Math.round((completedMilestones.value / totalMilestones.value) * 100);
});

// Computed: Próxima fecha de entrega (tarea o hito pendiente más cercano)
const nextDeadline = computed(() => {
  const userId = getNormalizedUserId();
  if (!userId) return null;

  const pendingItems = [];

  // Agregar tareas pendientes del usuario
  const pendingTasks = userTasks.value.filter(task =>
      !taskSubmissionStore.hasSubmissionForTask(task.id) &&
      task.dueDate
  );

  pendingTasks.forEach(task => {
    pendingItems.push({
      type: 'task',
      title: task.title,
      dueDate: task.dueDate,
      originalItem: task
    });
  });

  // Agregar hitos pendientes del usuario
  const pendingMilestones = userMilestones.value.filter(milestone =>
      milestone.status !== 'completed' &&
      milestone.dueDate
  );

  pendingMilestones.forEach(milestone => {
    pendingItems.push({
      type: 'milestone',
      title: milestone.title,
      dueDate: milestone.dueDate,
      originalItem: milestone
    });
  });

  if (pendingItems.length === 0) return null;

  // Ordenar por fecha más cercana
  const sortedItems = [...pendingItems].sort((a, b) =>
      new Date(a.dueDate) - new Date(b.dueDate)
  );

  return sortedItems[0];
});

// Computed: Tipo del próximo deadline (tarea o hito)
const nextDeadlineType = computed(() => {
  if (!nextDeadline.value) return '';
  return nextDeadline.value.type === 'task' ? 'Tarea' : 'Hito';
});

const getNormalizedUserId = () => {
  const userId = userStore.currentUser?.id || localStorage.getItem("userId");
  return userId ? String(userId) : null;
};

// Formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return 'Sin fecha';

  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Cargar datos cuando el componente se monte
onMounted(async () => {
  loading.value = true;
  try {
    // Cargar submissions para todas las tareas del usuario
    if (userTasks.value.length > 0) {
      for (const task of userTasks.value) {
        await taskSubmissionStore.loadSubmissionsByTask(task.id);
      }
    }

    // Cargar submissions de milestone tasks para verificar estado de hitos
    if (projectDetailStore.project?.id) {
      await milestoneSubmissionStore.loadSubmissionsByProject(projectDetailStore.project.id);
    }
  } catch (error) {
    console.error('Error loading activity data:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.recent-activity-card {
  height: 100%;
}

.activity-list {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Loading State */
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

/* Stats Container */
.stats-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: var(--color-gray-50);
  transition: all 0.2s ease;
}

.stat-item:hover {
  background: var(--color-gray-100);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  font-size: 1.2rem;
}

.stat-icon.completed {
  background: #d1fae5;
  color: #059669;
}

.stat-icon.milestone {
  background: #dbeafe;
  color: #3b82f6;
}

.stat-icon.deadline {
  background: #fef3c7;
  color: #d97706;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--color-gray-600);
  font-weight: 500;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-gray-800);
}

.stat-percentage {
  font-size: 0.8rem;
  color: var(--color-gray-500);
}

.stat-deadline {
  font-size: 0.85rem;
  color: var(--color-gray-600);
  font-style: italic;
}

.stat-deadline-type {
  font-size: 0.75rem;
  color: var(--color-gray-500);
  background: var(--color-gray-200);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  align-self: flex-start;
}

/* Progress Bar */
.progress-bar {
  width: 100%;
  height: 6px;
  background: var(--color-gray-200);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 0.25rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-fill.milestone-progress {
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
}

/* Responsive */
@media (max-width: 768px) {
  .stat-item {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .stat-icon {
    align-self: center;
  }

  .stat-value {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .stats-container {
    gap: 1rem;
  }

  .stat-item {
    padding: 0.75rem;
  }
}
</style>