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
            <span class="collaborator-name">{{ collaborator.applicantName }}</span>
            <span class="collaborator-role">{{ getRoleName(collaborator.roleId) }}</span>
          </div>
          <div class="collaborator-status">
            <div class="progress-section">
              <div class="progress-bar-container">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: collaborator.calculatedProgress + '%' }"></div>
                </div>
                <span class="progress-value">{{ collaborator.calculatedProgress }}%</span>
              </div>
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

// Computed para colaboradores
const collaborators = computed(() => {
  if (!projectDetailStore.project?.collaborators) return [];

  console.log('👥 All collaborators from project:', projectDetailStore.project.collaborators);

  // Mostrar todos los colaboradores sin filtrar por status
  return projectDetailStore.project.collaborators;
});

// Función para obtener el nombre del rol
const getRoleName = (roleId) => {
  if (!projectDetailStore.project?.roles || !roleId) return 'Rol no especificado';

  const role = projectDetailStore.project.roles.find(r =>
      String(r.id) === String(roleId)
  );

  console.log(`🔍 Buscando rol ID ${roleId}:`, role);
  return role?.name || 'Rol no encontrado';
};

// Calcular progreso real basado en tareas
const collaboratorsWithProgress = computed(() => {
  if (!collaborators.value.length || !projectDetailStore.project?.tasks) {
    return collaborators.value.map(collaborator => ({
      ...collaborator,
      calculatedProgress: collaborator.progress || 0
    }));
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
        calculatedProgress: collaborator.progress || 0
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
  padding: 1rem;
  border: 1px solid var(--color-gray-200);
  border-radius: 8px;
  background: var(--color-gray-50);
}

.collaborator-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.collaborator-name {
  font-weight: 600;
  color: var(--color-gray-800);
  margin-bottom: 0.25rem;
}

.collaborator-role {
  font-size: 0.875rem;
  color: var(--color-gray-600);
}

.collaborator-status {
  display: flex;
  align-items: center;
}

.progress-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-bar {
  width: 100px;
  height: 8px;
  background: var(--color-gray-200);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b5cf6, #7c3aed);
  border-radius: 4px;
  transition: width 0.3s ease;
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.4);
}

.progress-value {
  font-size: 0.75rem;
  color: var(--color-gray-700);
  font-weight: 600;
  min-width: 2.5rem;
  text-align: right;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.accepted {
  background: var(--color-green-50);
  color: var(--color-green-600);
  border: 1px solid var(--color-green-200);
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

  .collaborator-status {
    align-self: stretch;
  }

  .progress-section {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .progress-bar {
    flex: 1;
    max-width: 120px;
  }
}
</style>