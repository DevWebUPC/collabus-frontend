<template>
  <pv-card class="collaborators-card">
    <template #title>
      Colaboradores de tu proyecto
    </template>
    <template #content>
      <div class="collaborators-list">
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
defineProps({
  collaborators: {
    type: Array,
    default: () => [
      { id: 1, name: 'Ariana Lizeth', role: 'UX Designer', progress: 70 },
      { id: 2, name: 'Dyaron Huapeya', role: 'Backend', progress: 50 },
      { id: 3, name: 'Gilbert Alonso', role: 'Frontend', progress: 60 },
      { id: 4, name: 'Sebastián Pariachi', role: 'QA Tester', progress: 90 }
    ]
  }
});
</script>

<style scoped>
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
</style>