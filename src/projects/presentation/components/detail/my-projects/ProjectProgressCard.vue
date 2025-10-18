<template>
  <pv-card class="project-progress-card">
    <template #title>
      Progreso del Proyecto
    </template>
    <template #content>
      <div class="progress-bars">
        <div class="progress-item">
          <span class="progress-label">Tareas Completadas</span>
          <div class="progress-bar-container">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: tasksProgress + '%' }"></div>
            </div>
            <span class="progress-value">{{ tasksProgress }}%</span>
          </div>
        </div>
        <div class="progress-item">
          <span class="progress-label">Hitos completados</span>
          <div class="progress-bar-container">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: milestonesProgress + '%' }"></div>
            </div>
            <span class="progress-value">{{ milestonesProgress }}%</span>
          </div>
        </div>
      </div>
    </template>
  </pv-card>
</template>

<script setup>

</script>

<style scoped>
.progress-bars {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-label {
  font-size: 0.9rem;
  color: var(--color-gray-700);
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: var(--color-gray-200);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-value {
  font-size: 0.8rem;
  color: var(--color-gray-600);
  min-width: 2.5rem;
}
</style>