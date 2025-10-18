<!-- MyTasksCard.vue -->
<template>
  <pv-card class="my-tasks-card">
    <template #title>
      Mis Tareas
    </template>
    <template #content>
      <div class="tasks-list">

      </div>
    </template>
  </pv-card>
</template>

<style scoped>
.my-tasks-card {
  height: 100%;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  background: var(--color-gray-50);
  border-radius: 8px;
  border-left: 4px solid var(--color-primary);
}

.task-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.task-title {
  font-weight: 600;
  color: var(--color-gray-800);
  font-size: 0.9rem;
}

.task-due-date {
  font-size: 0.8rem;
  color: var(--color-gray-600);
}

.view-task-btn {
  color: var(--color-primary);
  font-size: 0.8rem;
  font-weight: 500;
}
</style>