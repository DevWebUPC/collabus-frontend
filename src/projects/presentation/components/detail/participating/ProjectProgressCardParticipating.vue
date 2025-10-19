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

const projectDetailStore = useProjectDetailStore();
const taskSubmissionStore = useTaskSubmissionStore();

const loading = ref(false);

// Computed: Obtener todas las tareas del proyecto
const projectTasks = computed(() => {
  return projectDetailStore.project?.tasks || [];
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

// Computed: Tareas pendientes
const pendingTasks = computed(() => {
  return totalTasks.value - completedTasks.value;
});

// Computed: Progreso general del proyecto basado en tareas completadas
const progress = computed(() => {
  if (totalTasks.value === 0) return 0;
  const percentage = (completedTasks.value / totalTasks.value) * 100;
  return Math.round(percentage * 10) / 10; // Redondear a 1 decimal
});

// Cargar submissions para todas las tareas del proyecto
onMounted(async () => {
  loading.value = true;
  try {
    // Cargar submissions para todas las tareas del proyecto
    if (projectTasks.value.length > 0) {
      for (const task of projectTasks.value) {
        await taskSubmissionStore.loadSubmissionsByTask(task.id);
      }
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