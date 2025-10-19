<!-- CollaboratorsCard.vue - VERSIÓN SIMPLIFICADA -->
<template>
  <pv-card class="collaborators-card">
    <template #title>
      Colaboradores de tu proyecto
    </template>
    <template #content>
      <div v-if="collaborators.length === 0" class="empty-state">
        <i class="pi pi-users empty-icon"></i>
        <p>No hay colaboradores en el proyecto</p>
        <small>Los colaboradores aceptados aparecerán aquí</small>
      </div>

      <div v-else class="collaborators-list">
        <div v-for="collaborator in collaboratorsWithProgress" :key="collaborator.id" class="collaborator-item">
          <div class="collaborator-info">
            <span class="collaborator-name">{{ collaborator.name }}</span>
            <span class="collaborator-role">{{ collaborator.role }}</span>
          </div>
          <div class="collaborator-progress">
            <div class="progress-bar-container">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: collaborator.calculatedProgress + '%' }"></div>
              </div>
              <span class="progress-value">{{ collaborator.calculatedProgress }}%</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </pv-card>
</template>

<script setup>
import { useProjectDetailStore } from '../../../../application/project-detail.store.js';
import { computed } from 'vue';

const projectDetailStore = useProjectDetailStore();

// ✅ SOLUCIÓN: Usar computed para reactividad
const collaborators = computed(() => {
  return projectDetailStore.project?.collaborators || [];
});

// ✅ Calcular progreso real basado en tareas
const collaboratorsWithProgress = computed(() => {
  if (!collaborators.value.length || !projectDetailStore.project?.tasks) {
    return collaborators.value;
  }

  return collaborators.value.map(collaborator => {
    // Filtrar tareas asignadas a este colaborador
    const collaboratorTasks = projectDetailStore.project.tasks.filter(
        task => task.assignedTo === collaborator.applicantId
    );

    const totalTasks = collaboratorTasks.length;

    if (totalTasks === 0) {
      return {
        ...collaborator,
        calculatedProgress: 0
      };
    }

    // Calcular progreso basado en el campo progress de cada tarea
    const totalProgress = collaboratorTasks.reduce((sum, task) => {
      return sum + (task.progress || 0);
    }, 0);

    const calculatedProgress = Math.round(totalProgress / totalTasks);

    return {
      ...collaborator,
      calculatedProgress
    };
  });
});

console.log('👥 CollaboratorsCard loaded with progress:', collaboratorsWithProgress.value);
</script>

<style scoped>
.collaborators-card {
  margin-top: 1rem;
}

.collaborators-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.collaborator-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-gray-200);
}

.collaborator-item:last-child {
  border-bottom: none;
}

.collaborator-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.collaborator-name {
  font-weight: 500;
  color: var(--color-gray-800);
  margin-bottom: 0.25rem;
}

.collaborator-role {
  font-size: 0.8rem;
  color: var(--color-gray-600);
}

.collaborator-progress {
  display: flex;
  align-items: center;
  min-width: 100px;
}

.collaborator-progress .progress-bar-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.collaborator-progress .progress-bar {
  width: 80px;
  height: 6px;
  background: var(--color-gray-200);
  border-radius: 3px;
  overflow: hidden;
  flex-shrink: 0;
}

/* ✅ BARRA MORADA */
.collaborator-progress .progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b5cf6, #7c3aed);
  border-radius: 3px;
  transition: width 0.3s ease;
  box-shadow: 0 1px 2px rgba(139, 92, 246, 0.3);
}

.collaborator-progress .progress-value {
  font-size: 0.8rem;
  color: var(--color-gray-700);
  min-width: 2.5rem;
  font-weight: 600;
  text-align: right;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--color-gray-500);
}

.empty-icon {
  font-size: 2rem;
  color: var(--color-gray-300);
  margin-bottom: 0.5rem;
}

.empty-state p {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
}

.empty-state small {
  font-size: 0.8rem;
  color: var(--color-gray-400);
}

/* Responsive */
@media (max-width: 768px) {
  .collaborator-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .collaborator-progress {
    width: 100%;
  }

  .collaborator-progress .progress-bar-container {
    width: 100%;
  }

  .collaborator-progress .progress-bar {
    flex: 1;
  }
}
</style>