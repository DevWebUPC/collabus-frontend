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

        <!-- Barra normal para hitos -->
        <div class="progress-item">
          <span class="progress-label">Hitos completados</span>
          <div class="progress-bar-container">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: milestonesProgress + '%' }"></div>
            </div>
            <span class="progress-value">{{ completedMilestonesCount }}/{{ totalMilestonesCount }} ({{ milestonesProgress }}%)</span>
          </div>
        </div>
      </div>
    </template>
  </pv-card>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useProjectDetailStore } from '../../../../application/project-detail.store.js';

const route = useRoute();
const store = useProjectDetailStore();

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

const completedMilestonesCount = computed(() => {
  if (!store.project?.milestones || !Array.isArray(store.project.milestones)) return 0;
  return store.project.milestones.filter(milestone =>
      milestone.status === 'completed' || milestone.completed === true
  ).length;
});

const milestonesProgress = computed(() => {
  if (totalMilestonesCount.value === 0) return 0;
  return Math.round((completedMilestonesCount.value / totalMilestonesCount.value) * 100);
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

/* Barra morada para tareas */
.progress-bar {
  width: 100%;
  height: 12px;
  background: var(--color-gray-200);
  border-radius: 6px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.progress-fill.task-progress {
  height: 100%;
  background: linear-gradient(90deg, #8b5cf6, #7c3aed);
  border-radius: 6px;
  transition: width 0.5s ease-in-out;
  position: relative;
  box-shadow: 0 2px 4px rgba(139, 92, 246, 0.3);
}

/* Barra normal para hitos */
.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-fill:not(.task-progress) {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-dark));
  border-radius: 5px;
  transition: width 0.5s ease-in-out;
  position: relative;
}

/* Responsive */
@media (max-width: 768px) {
  .progress-bar-container {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .progress-value {
    text-align: center;
  }
}
</style>