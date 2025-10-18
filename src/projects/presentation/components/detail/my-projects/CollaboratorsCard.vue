<!-- CollaboratorsCard.vue - VERSIÓN ACTUALIZADA Y REACTIVA -->
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
        <div v-for="collaborator in collaborators" :key="collaborator.id" class="collaborator-item">
          <div class="collaborator-info">
            <span class="collaborator-name">{{ collaborator.name }}</span>
            <span class="collaborator-role">{{ collaborator.role }}</span>
          </div>
          <div class="collaborator-progress">
            <span class="progress-label">Progreso</span>
            <div class="progress-bar-container">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: collaborator.progress + '%' }"></div>
              </div>
              <span class="progress-value">{{ collaborator.progress }}%</span>
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

console.log('👥 CollaboratorsCard loaded with:', collaborators.value);
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
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-gray-200);
}

.collaborator-item:last-child {
  border-bottom: none;
}

.collaborator-info {
  display: flex;
  flex-direction: column;
}

.collaborator-name {
  font-weight: 500;
  color: var(--color-gray-800);
}

.collaborator-role {
  font-size: 0.8rem;
  color: var(--color-gray-600);
}

.collaborator-progress {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.collaborator-progress .progress-label {
  font-size: 0.7rem;
  color: var(--color-gray-600);
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
}

.collaborator-progress .progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 3px;
}

.collaborator-progress .progress-value {
  font-size: 0.7rem;
  color: var(--color-gray-600);
  min-width: 2rem;
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
</style>