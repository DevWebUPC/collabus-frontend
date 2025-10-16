<template>
  <pv-card class="urgent-tasks-card">
    <template #title>
      Tareas Urgentes
    </template>
    <template #content>
      <div class="tasks-list">
        <div v-for="task in tasks" :key="task.id" class="task-item">
          <div class="task-info">
            <span class="task-name">{{ task.name }}</span>
            <span class="task-due">Vence en {{ task.dueDate }}</span>
          </div>
          <pv-button icon="pi pi-ellipsis-h" text rounded />
        </div>
      </div>
      <div class="view-all">
        <pv-button label="Ver Todos" text />
      </div>
    </template>
  </pv-card>
</template>

<script setup>

</script>

<style scoped>
.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-gray-200);
}

.task-item:last-child {
  border-bottom: none;
}

.task-info {
  display: flex;
  flex-direction: column;
}

.task-name {
  font-weight: 500;
  color: var(--color-gray-800);
  font-size: 0.9rem;
}

.task-due {
  font-size: 0.8rem;
  color: var(--color-error);
}

.view-all {
  display: flex;
  justify-content: flex-end;
}
</style>