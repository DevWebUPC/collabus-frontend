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
              <span class="stat-label">Hitos Alcanzados</span>
              <span class="stat-value">{{ completedMilestones }}/{{ totalMilestones }}</span>
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

const projectDetailStore = useProjectDetailStore();
const userStore = useUserStore();
const taskSubmissionStore = useTaskSubmissionStore();

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

// Computed: Porcentaje de completado
const completionPercentage = computed(() => {
  if (totalTasks.value === 0) return 0;
  return Math.round((completedTasks.value / totalTasks.value) * 100);
});

// Computed: Hitos (usando milestones del proyecto)
const completedMilestones = computed(() => {
  if (!projectDetailStore.project?.milestones) return 0;
  return projectDetailStore.project.milestones.filter(milestone =>
      milestone.completed
  ).length;
});

const totalMilestones = computed(() => {
  if (!projectDetailStore.project?.milestones) return 0;
  return projectDetailStore.project.milestones.length;
});

// Computed: Próxima fecha de entrega (tarea pendiente más cercana)
const nextDeadline = computed(() => {
  const pendingTasks = userTasks.value.filter(task =>
      !taskSubmissionStore.hasSubmissionForTask(task.id) &&
      task.dueDate
  );

  if (pendingTasks.length === 0) return null;

  // Ordenar por fecha más cercana
  const sortedTasks = [...pendingTasks].sort((a, b) =>
      new Date(a.dueDate) - new Date(b.dueDate)
  );

  return sortedTasks[0];
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