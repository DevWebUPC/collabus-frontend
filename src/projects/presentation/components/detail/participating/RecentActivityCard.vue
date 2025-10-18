<!-- RecentActivityCard.vue -->
<template>
  <pv-card class="recent-activity-card">
    <template #title>
      Actividad Reciente
    </template>
    <template #content>
      <div class="activity-list">
          <div class="stat-item">
            <span class="stat-label">Tareas Completadas</span>
            <span class="stat-value"> </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Hitos Alcanzados</span>
            <span class="stat-value"> </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Próxima Entrega</span>
            <span class="stat-value"> </span>
          </div>
      </div>
    </template>
  </pv-card>
</template>

<style scoped>
.recent-activity-card {
  height: 100%;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.activity-item:hover {
  background: var(--color-gray-50);
}

.activity-icon {
  color: var(--color-primary);
  font-size: 1.1rem;
  margin-top: 0.1rem;
}

.activity-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.activity-text {
  font-size: 0.9rem;
  color: var(--color-gray-800);
  line-height: 1.4;
}

.activity-time {
  font-size: 0.8rem;
  color: var(--color-gray-600);
}
</style>
<script setup lang="ts">
</script>