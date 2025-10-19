<template>
  <pv-card class="my-tasks-card">
    <template #title>
      Mis Tareas Pendientes
    </template>
    <template #content>
      <div class="tasks-list">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <pv-progress-spinner />
          <span>Cargando tareas...</span>
        </div>

        <!-- Empty State -->
        <div v-else-if="pendingTasks.length === 0" class="empty-state">
          <i class="pi pi-inbox empty-icon"></i>
          <h3>No tienes tareas pendientes</h3>
          <p>Cuando te asignen nuevas tareas por hacer, aparecerán aquí.</p>
        </div>

        <!-- Tasks List -->
        <div v-else class="tasks-container">
          <div class="tasks-scroll-container">
            <div
                v-for="task in pendingTasks"
                :key="task.id"
                class="task-item"
            >
              <div class="task-info">
                <div class="task-header">
                  <h4 class="task-title">{{ task.title }}</h4>
                  <span class="status-badge pending">
                    <i class="pi pi-clock"></i>
                    Pendiente
                  </span>
                </div>

                <p class="task-description">{{ task.description || 'Sin descripción' }}</p>

                <div class="task-meta">
                  <div class="meta-item">
                    <i class="pi pi-calendar"></i>
                    <span class="meta-text">
                      {{ formatDate(task.dueDate) }}
                      <span v-if="getDaysRemaining(task.dueDate) !== null"
                            class="days-remaining">
                        ({{ getDaysRemaining(task.dueDate) + ' días restantes' }})
                      </span>
                    </span>
                  </div>

                  <div class="meta-item">
                    <i class="pi pi-briefcase"></i>
                    <span class="meta-text">{{ task.role || 'Sin rol específico' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Botón general Ver Tareas -->
          <div class="view-all-tasks-btn-container">
            <pv-button
                label="Ver Todas las Tareas"
                icon="pi pi-arrow-right"
                @click="viewAllTasks"
                class="view-all-tasks-btn"
                outlined
            />
          </div>
        </div>
      </div>
    </template>
  </pv-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useProjectDetailStore } from '../../../../application/project-detail.store.js';
import { useUserStore } from '../../../../../iam/application/user-store.js';
import { useTaskSubmissionStore } from '../../../../../task-management/application/task-submission-store.js';

const projectDetailStore = useProjectDetailStore();
const userStore = useUserStore();
const taskSubmissionStore = useTaskSubmissionStore();

const loading = ref(false);

// Computed: Obtener tareas pendientes del usuario actual (sin submission y no vencidas)
const pendingTasks = computed(() => {
  if (!projectDetailStore.project?.tasks) {
    return [];
  }

  const userId = getNormalizedUserId();
  if (!userId) {
    return [];
  }

  // Filtrar tareas asignadas al usuario y que NO tengan submission
  const userTasks = projectDetailStore.project.tasks.filter(task =>
      task.assignedTo && String(task.assignedTo) === userId
  );

  // Solo devolver las tareas que:
  // 1. No tienen submission (pendientes)
  // 2. No están vencidas
  return userTasks.filter(task =>
      !taskSubmissionStore.hasSubmissionForTask(task.id) &&
      !isOverdue(task.dueDate)
  );
});

const getNormalizedUserId = () => {
  const userId = userStore.currentUser?.id || localStorage.getItem("userId");
  return userId ? String(userId) : null;
};

// Computed: Estadísticas rápidas para mostrar en el card (solo pendientes)
const taskStats = computed(() => {
  const tasks = pendingTasks.value;
  return {
    total: tasks.length
  };
});

// Formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return 'Sin fecha límite';

  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Verificar si la tarea está vencida
const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

// Obtener días restantes
const getDaysRemaining = (dueDate) => {
  if (!dueDate) return null;

  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

// Navegar a la pestaña Tasks
const viewAllTasks = () => {
  console.log('🎯 Navegando a pestaña Tasks desde MyTaskCard');
  // Emitir evento para cambiar a la pestaña tasks
  const event = new CustomEvent('view-all-tasks');
  window.dispatchEvent(event);
};

// Cargar tareas cuando el componente se monte
onMounted(async () => {
  console.log('Tareas pendientes en el card:', pendingTasks.value);

  // Cargar submissions para poder determinar qué tareas están pendientes
  if (pendingTasks.value.length > 0) {
    loading.value = true;
    try {
      for (const task of pendingTasks.value) {
        await taskSubmissionStore.loadSubmissionsByTask(task.id);
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      loading.value = false;
    }
  }
});
</script>

<style scoped>
.my-tasks-card {
  height: 100%;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Estados de carga y vacío */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;
  color: var(--color-gray-600);
  height: 200px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: var(--color-gray-500);
  height: 200px;
}

.empty-icon {
  font-size: 3rem;
  color: var(--color-gray-300);
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  color: var(--color-gray-700);
}

.empty-state p {
  margin: 0;
  font-size: 0.9rem;
}

/* Lista de tareas */
.tasks-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 1rem;
}

.tasks-scroll-container {
  flex: 1;
  overflow-y: auto;
  max-height: 400px; /* Altura máxima antes de mostrar scroll */
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-right: 0.25rem;
}

/* Personalizar scrollbar */
.tasks-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.tasks-scroll-container::-webkit-scrollbar-track {
  background: var(--color-gray-100);
  border-radius: 3px;
}

.tasks-scroll-container::-webkit-scrollbar-thumb {
  background: var(--color-gray-300);
  border-radius: 3px;
}

.tasks-scroll-container::-webkit-scrollbar-thumb:hover {
  background: var(--color-gray-400);
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  background: var(--color-gray-50);
  border-radius: 8px;
  border-left: 4px solid var(--color-primary);
  transition: all 0.2s ease;
  flex-shrink: 0; /* Evita que las tareas se compriman */
}

.task-item:hover {
  background: var(--color-gray-100);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.task-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.task-title {
  font-weight: 600;
  color: var(--color-gray-800);
  font-size: 0.9rem;
  margin: 0;
  flex: 1;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.status-badge.pending {
  background: #fef3c7;
  color: #d97706;
}

.task-description {
  font-size: 0.8rem;
  color: var(--color-gray-600);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--color-gray-500);
}

.meta-text {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.days-remaining {
  font-weight: 500;
  font-size: 0.7rem;
}

/* Contenedor y botón Ver Tareas */
.view-all-tasks-btn-container {
  display: flex;
  justify-content: center;
  margin-top: auto; /* Empuja el botón hacia abajo */
  padding-top: 1rem;
  border-top: 1px solid var(--color-gray-200);
  flex-shrink: 0; /* Evita que el botón se comprima */
}

.view-all-tasks-btn {
  color: var(--color-primary);
  border-color: var(--color-primary);
  font-weight: 500;
}

.view-all-tasks-btn:hover {
  background: var(--color-primary);
  color: var(--color-white);
}

/* Responsive */
@media (max-width: 768px) {
  .tasks-scroll-container {
    max-height: 350px; /* Altura menor en móviles */
  }

  .task-item {
    flex-direction: column;
    gap: 1rem;
  }

  .task-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>