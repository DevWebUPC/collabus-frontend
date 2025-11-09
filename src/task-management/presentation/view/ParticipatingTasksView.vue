<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectDetailStore } from '../../../projects/application/project-detail.store.js';
import { useUserStore } from '../../../iam/application/user-store.js';
import { useTaskSubmissionStore } from '../../application/task-submission-store.js';
import { useTaskStore } from '../../application/task-store.js';

const router = useRouter();
const projectDetailStore = useProjectDetailStore();
const userStore = useUserStore();
const taskSubmissionStore = useTaskSubmissionStore();
const taskStore = useTaskStore();

// Estado reactivo
const loading = ref(false);
const activeFilter = ref('all');

// Computed: Obtener tareas del usuario actual - ACTUALIZADO
const myTasks = computed(() => {
  const projectId = projectDetailStore.project?.id;
  if (!projectId) {
    console.log('❌ No project ID available');
    return [];
  }

  const userId = getNormalizedUserId();
  if (!userId) {
    console.log('❌ No user ID available');
    return [];
  }

  console.log('🔍 Buscando tareas para usuario:', userId, 'en proyecto:', projectId);

  // ✅ OBTENER TAREAS DEL TASK STORE
  const projectTasks = taskStore.getProjectTasks(projectId) || [];
  console.log('📋 Tareas del proyecto desde taskStore:', projectTasks);

  const userTasks = projectTasks.filter(task => {
    const taskUserId = task.assignedTo ? String(task.assignedTo) : null;
    const matches = taskUserId === userId;
    console.log(`   - Task "${task.title}": ${taskUserId} vs ${userId} -> ${matches}`);
    return matches;
  });

  console.log('✅ Tareas del usuario encontradas:', userTasks.length, userTasks);
  return userTasks;
});

const isTaskOverdue = (task) => {
  const isOverdueStatus = task.status === 'retrasado';
  console.log(`⏰ Tarea ${task.id} (${task.title}): Estado=${task.status}, Retrasada=${isOverdueStatus}`);
  return isOverdueStatus;
};

const getNormalizedUserId = () => {
  const userId = userStore.currentUser?.id || localStorage.getItem("userId");
  return userId ? String(userId) : null;
};

// ✅ CORREGIDO: Determinar si una tarea está completada (usar estado de la tarea)
const isTaskCompleted = (task) => {
  // ✅ PRIMERO verificar el estado real de la tarea desde la base de datos
  const isCompleted = task.status === 'completed';
  console.log(`🔍 Estado de tarea ${task.id} (${task.title}): ${task.status} -> Completada: ${isCompleted}`);
  return isCompleted;
};

// ✅ NUEVO: Verificar si una tarea tiene submission
const hasTaskSubmission = (taskId) => {
  const hasSubmission = taskSubmissionStore.hasSubmissionForTask(taskId);
  console.log(`📝 Submission para tarea ${taskId}: ${hasSubmission}`);
  return hasSubmission;
};

// ✅ NUEVO: Obtener el estado visual de la tarea
const getTaskDisplayStatus = (task) => {
  if (isTaskCompleted(task)) {
    return 'completed';
  } else if (isTaskOverdue(task)) {
    return 'overdue';
  } else {
    return 'pending';
  }
};

// Computed: Tareas filtradas - ACTUALIZADO para usar estado real
const filteredTasks = computed(() => {
  const tasks = myTasks.value;

  switch (activeFilter.value) {
    case 'pending':
      return tasks.filter(task => getTaskDisplayStatus(task) === 'pending');
    case 'overdue':
      return tasks.filter(task => getTaskDisplayStatus(task) === 'overdue');
    case 'completed':
      return tasks.filter(task => getTaskDisplayStatus(task) === 'completed');
    default:
      return tasks;
  }
});
// Computed: Estadísticas - ACTUALIZADO para usar estado real
const taskStats = computed(() => {
  const tasks = myTasks.value;

  const completed = tasks.filter(task => isTaskCompleted(task)).length;
  const overdue = tasks.filter(task => isTaskOverdue(task)).length;
  const pending = tasks.filter(task => getTaskDisplayStatus(task) === 'pending').length;

  return {
    total: tasks.length,
    pending,
    overdue,
    completed,
    completionRate: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0
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

const isOverdueByDate = (dueDate) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
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

// Navegar a vista de tarea
const viewTask = (task) => {
  console.log('Ver tarea:', task);
  router.push({
    name: 'task-detail',
    params: {
      projectId: projectDetailStore.project.id,
      taskId: task.id
    }
  });
};

// Iniciar tarea - SOLO para tareas sin completar
const startTask = (task) => {
  if (isTaskCompleted(task) || isTaskOverdue(task)) {
    console.log('ℹ️ Tarea completada o retrasada, no se puede iniciar:', task.title);
    return;
  }

  console.log('Iniciar tarea:', task);
  router.push({
    name: 'task-execution',
    params: {
      projectId: projectDetailStore.project.id,
      taskId: task.id
    }
  });
};


// Cambiar filtro
const setFilter = (filter) => {
  activeFilter.value = filter;
};

// Cargar tareas y submissions cuando el componente se monte - ACTUALIZADO
onMounted(async () => {
  console.log('🔄 Iniciando carga de tareas del usuario...');

  const projectId = projectDetailStore.project?.id;
  if (!projectId) {
    console.error('❌ No hay projectId disponible');
    return;
  }

  loading.value = true;
  try {
    // ✅ PRIMERO: Cargar las tareas del proyecto desde la API
    console.log('📥 Cargando tareas del proyecto...');
    await taskStore.loadProjectTasks(projectId);

    console.log('✅ Tareas cargadas desde API');
    console.log('📋 Tareas del usuario después de carga:', myTasks.value);

    // ✅ SEGUNDO: Cargar submissions para las tareas del usuario (solo para referencia)
    if (myTasks.value.length > 0) {
      console.log('📥 Cargando submissions para referencia...');
      for (const task of myTasks.value) {
        await taskSubmissionStore.loadSubmissionsByTask(task.id);
      }
      console.log('✅ Submissions cargadas para referencia');
    }

    // ✅ LOG PARA DEBUG: Mostrar estado de todas las tareas
    console.log('🎯 ESTADO FINAL DE TAREAS:');
    myTasks.value.forEach(task => {
      console.log(`   - "${task.title}": Estado=${task.status}, Completada=${isTaskCompleted(task)}, Display=${getTaskDisplayStatus(task)}`);
    });

  } catch (error) {
    console.error('❌ Error cargando datos:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="participating-tasks-view">
    <!-- Header con estadísticas -->
    <div class="tasks-header">
      <div class="header-content">
        <h1 class="page-title">Mis Tareas</h1>
        <p class="page-subtitle">Gestiona las tareas asignadas en este proyecto</p>
      </div>

      <div class="stats-container">
        <div class="stat-card">
          <div class="stat-value">{{ taskStats.total }}</div>
          <div class="stat-label">Total</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ taskStats.pending }}</div>
          <div class="stat-label">Pendientes</div>
        </div>
        <div class="stat-card">
          <div class="stat-value overdue-count">{{ taskStats.overdue }}</div>
          <div class="stat-label">Vencidas</div>
        </div>
        <div class="stat-card">
          <div class="stat-value completed-count">{{ taskStats.completed }}</div>
          <div class="stat-label">Completadas</div>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-section">
      <div class="filter-buttons">
        <pv-button
            :class="['filter-btn', { active: activeFilter === 'all' }]"
            @click="setFilter('all')"
            text
        >
          Todas ({{ taskStats.total }})
        </pv-button>
        <pv-button
            :class="['filter-btn', { active: activeFilter === 'pending' }]"
            @click="setFilter('pending')"
            text
        >
          Pendientes ({{ taskStats.pending }})
        </pv-button>
        <pv-button
            :class="['filter-btn', { active: activeFilter === 'overdue' }]"
            @click="setFilter('overdue')"
            text
        >
          Vencidas ({{ taskStats.overdue }})
        </pv-button>
        <pv-button
            :class="['filter-btn', { active: activeFilter === 'completed' }]"
            @click="setFilter('completed')"
            text
        >
          Completadas ({{ taskStats.completed }})
        </pv-button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <pv-progress-spinner />
      <span>Cargando tareas...</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="myTasks.length === 0" class="empty-state">
      <div class="empty-content">
        <i class="pi pi-inbox empty-icon"></i>
        <h3>No tienes tareas asignadas</h3>
        <p>Cuando te asignen tareas en este proyecto, aparecerán aquí.</p>
      </div>
    </div>

    <!-- Tasks Grid -->
    <div v-else class="tasks-grid">
      <div
          v-for="task in filteredTasks"
          :key="task.id"
          class="task-card"
          :class="getTaskDisplayStatus(task)"
      >
        <!-- Header de la tarjeta -->
        <div class="task-header">
          <div class="task-status">
            <span v-if="isTaskCompleted(task)" class="status-badge completed">
              <i class="pi pi-check-circle"></i>
              Completada
            </span>
            <span v-else-if="isOverdue(task.dueDate)" class="status-badge overdue">
              <i class="pi pi-exclamation-triangle"></i>
              Vencida
            </span>
            <span v-else class="status-badge pending">
              <i class="pi pi-clock"></i>
              Pendiente
            </span>
          </div>
        </div>

        <!-- Contenido de la tarea -->
        <div class="task-content">
          <h3 class="task-title">{{ task.title }}</h3>
          <p class="task-description">{{ task.description || 'Sin descripción' }}</p>

          <div class="task-meta">
            <div class="meta-item">
              <i class="pi pi-calendar"></i>
              <span class="meta-text">
                {{ formatDate(task.dueDate) }}
                <span v-if="!isTaskCompleted(task) && getDaysRemaining(task.dueDate) !== null"
                      class="days-remaining"
                      :class="{ 'overdue': isOverdue(task.dueDate) }">
                  ({{ isOverdue(task.dueDate) ? Math.abs(getDaysRemaining(task.dueDate)) + ' días de retraso' : getDaysRemaining(task.dueDate) + ' días restantes' }})
                </span>
              </span>
            </div>

            <div v-if="task.createdAt" class="meta-item">
              <i class="pi pi-clock"></i>
              <span class="meta-text">
                Creada: {{ formatDate(task.createdAt) }}
              </span>
            </div>

            <!-- Mostrar información de submission si existe -->
            <div v-if="hasTaskSubmission(task.id)" class="meta-item">
              <i class="pi pi-check"></i>
              <span class="meta-text" style="color: var(--color-green-600);">
                Entregada correctamente
              </span>
            </div>

            <!-- ✅ NUEVO: Mostrar estado real desde BD -->
          </div>
        </div>

        <!-- Acciones - ACTUALIZADO: Usar estado real de la tarea -->
        <div class="task-actions">
          <pv-button
              label="Ver Tarea"
              icon="pi pi-eye"
              severity="secondary"
              outlined
              @click="viewTask(task)"
              class="view-btn"
          />
          <pv-button
              v-if="!isTaskCompleted(task) && !isTaskOverdue(task)"
              label="Hacer Tarea"
              icon="pi pi-play"
              severity="primary"
              @click="startTask(task)"
              class="start-btn"
          />
        </div>
      </div>
    </div>

    <!-- Filtro vacío -->
    <div v-if="myTasks.length > 0 && filteredTasks.length === 0" class="empty-filter-state">
      <div class="empty-content">
        <i class="pi pi-filter empty-icon"></i>
        <h3>No hay tareas con este filtro</h3>
        <p>No se encontraron tareas que coincidan con el filtro "{{ activeFilter }}".</p>
        <pv-button
            label="Mostrar todas las tareas"
            @click="setFilter('all')"
            class="show-all-btn"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.participating-tasks-view {
  padding: 0;
  background: transparent;
}

/* Header */
.tasks-header {
  background: var(--color-white, #FFFFFF);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-gray-800);
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  color: var(--color-gray-600);
  margin: 0;
  font-size: 1rem;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: var(--color-gray-300, #f8fafc);
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #e2e8f0;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.stat-value.overdue-count {
  color: var(--color-red-600);
}

.stat-value.completed-count {
  color: var(--color-green-600);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--color-gray-600);
  font-weight: 500;
}

/* Filtros */
.filters-section {
  background: var(--color-white, #FFFFFF);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.filter-btn.active {
  background: var(--color-primary);
  color: var(--color-white, #FFFFFF);
}

.filter-btn:not(.active):hover {
  background: #f1f5f9;
}

/* Tasks Grid */
.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.task-card {
  background: var(--color-white, #FFFFFF);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.task-card.overdue {
  border-left: 4px solid var(--color-red-500);
  background: #fef2f2;
}

.task-card.completed {
  border-left: 4px solid var(--color-green-500);
  background: #f0fdf4;
  opacity: 0.9;
}

/* Task Header */
.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.overdue {
  background: #fecaca;
  color: #dc2626;
}

.status-badge.completed {
  background: #d1fae5;
  color: #059669;
}

.task-role {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
  padding: 0.375rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

/* Task Content */
.task-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-gray-800);
  margin: 0;
  line-height: 1.4;
}

.task-description {
  color: var(--color-gray-600);
  margin: 0;
  line-height: 1.5;
  flex: 1;
}

.task-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-gray-500);
}

.meta-text {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.days-remaining {
  font-weight: 500;
}

.days-remaining.overdue {
  color: var(--color-red-600);
}

/* Task Actions */
.task-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.task-actions .p-button {
  min-width: 120px;
}

/* Estados vacíos */
.loading-state,
.empty-state,
.empty-filter-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 2rem;
  background: var(--color-white, #FFFFFF);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-content {
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  font-size: 4rem;
  color: var(--color-gray-300);
  margin-bottom: 1.5rem;
}

.empty-content h3 {
  font-size: 1.5rem;
  color: var(--color-gray-700);
  margin: 0 0 1rem 0;
}

.empty-content p {
  color: var(--color-gray-500);
  margin: 0 0 2rem 0;
  line-height: 1.5;
}

/* Responsive */
@media (max-width: 768px) {
  .tasks-grid {
    grid-template-columns: 1fr;
  }

  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .task-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .task-actions {
    flex-direction: column;
  }

  .task-actions .p-button {
    min-width: auto;
    width: 100%;
  }

  .filter-buttons {
    flex-direction: column;
  }

  .filter-btn {
    text-align: left;
  }
}

@media (max-width: 480px) {
  .tasks-header {
    padding: 1.5rem;
  }

  .task-card {
    padding: 1rem;
  }

  .stats-container {
    grid-template-columns: 1fr;
  }
}

/* Button Styles */
:deep(.view-btn.p-button) {
  background: var(--color-white, #FFFFFF);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

:deep(.view-btn.p-button:hover) {
  background: var(--color-primary);
  color: var(--color-white, #FFFFFF);
}

:deep(.start-btn.p-button) {
  background: var(--color-primary);
  color: var(--color-white, #FFFFFF);
  border: 1px solid var(--color-primary);
}

:deep(.start-btn.p-button:hover) {
  background: var(--color-primary-600);
  border-color: var(--color-primary-600);
}

:deep(.reviewed-btn.p-button) {
  background: var(--color-green-500);
  color: var(--color-white, #FFFFFF);
  border: 1px solid var(--color-green-500);
}

:deep(.show-all-btn.p-button) {
  background: var(--color-primary);
  color: var(--color-white, #FFFFFF);
  border: 1px solid var(--color-primary);
}
</style>