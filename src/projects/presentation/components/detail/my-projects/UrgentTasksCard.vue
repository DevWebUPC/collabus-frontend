<template>
  <pv-card class="urgent-tasks-card">
    <template #title>
      <div class="card-title">
        Tareas Urgentes
        <span class="badge" :class="urgentTasks.length > 0 ? 'urgent' : 'normal'">
          {{ urgentTasks.length }}
        </span>
      </div>
    </template>
    <template #content>
      <div class="tasks-list">
        <div
            v-for="task in urgentTasks"
            :key="task.id"
            class="task-item"
            :class="{ overdue: isOverdue(task.dueDate) }"
        >
          <div class="task-info">
            <span class="task-name">{{ task.title }}</span>
            <div class="task-meta">
              <span class="task-assignee" v-if="task.assignedToName">
                Asignada a: {{ task.assignedToName }}
              </span>
              <span class="task-due" :class="{ overdue: isOverdue(task.dueDate) }">
                {{ formatDueDate(task.dueDate) }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="urgentTasks.length === 0" class="no-tasks">
        <i class="pi pi-check-circle" style="font-size: 2rem; color: var(--color-success); margin-bottom: 0.5rem;"></i>
        <p>No hay tareas urgentes</p>
      </div>
      <div class="view-all">
        <pv-button
            label="Ver Todas las Tareas"
            text
            icon="pi pi-list"
            @click="handleViewAllTasks"
        />
      </div>
    </template>
  </pv-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useProjectDetailStore } from '../../../../application/project-detail.store.js';

const route = useRoute();
const store = useProjectDetailStore();

// Emit para navegación
const emit = defineEmits(['view-all-tasks']);

// Computed property para obtener tareas urgentes
const urgentTasks = computed(() => {
  if (!store.project || !store.project.tasks || !Array.isArray(store.project.tasks)) {
    return [];
  }

  const now = new Date();
  const urgentThreshold = new Date();
  urgentThreshold.setDate(urgentThreshold.getDate() + 3); // 3 días en el futuro

  return store.project.tasks
      .filter(task => {
        if (!task.dueDate) return false;

        const dueDate = new Date(task.dueDate);
        return dueDate <= urgentThreshold; // Incluye vencidas y próximas
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
});

// Verificar si una tarea está vencida
const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

// Formatear la fecha de vencimiento
const formatDueDate = (dueDate) => {
  if (!dueDate) return 'Sin fecha';

  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `Vencida hace ${Math.abs(diffDays)} día${Math.abs(diffDays) !== 1 ? 's' : ''}`;
  } else if (diffDays === 0) {
    return 'Vence hoy';
  } else if (diffDays === 1) {
    return 'Vence mañana';
  } else {
    return `Vence en ${diffDays} días`;
  }
};

// Manejar clic en "Ver Todas las Tareas"
const handleViewAllTasks = () => {
  console.log('🔄 Navegando a la pestaña de Tasks');
  emit('view-all-tasks');
};

// Debug
onMounted(() => {
  console.log('📋 Urgent Tasks Loaded:', urgentTasks.value);
});
</script>

<style scoped>
/* Tus estilos existentes se mantienen igual */
.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--color-gray-200);
  background: white;
  transition: all 0.2s ease;
}

.task-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.task-item.overdue {
  border-left: 4px solid #dc2626;
  background: #fef2f2;
}

.task-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.task-name {
  font-weight: 600;
  color: var(--color-gray-800);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.task-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.task-assignee {
  font-size: 0.75rem;
  color: var(--color-gray-600);
}

.task-due {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-warning);
}

.task-due.overdue {
  color: #dc2626;
  font-weight: bold;
}

.no-tasks {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--color-gray-500);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge.urgent {
  background: var(--color-error);
  color: white;
}

.badge.normal {
  background: var(--color-success);
  color: white;
}

.view-all {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
  border-top: 1px solid var(--color-gray-200);
  padding-top: 1rem;
}
</style>