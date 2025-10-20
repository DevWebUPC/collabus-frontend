<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMilestonesStore } from '../../application/milestone-store.js';
import { useUserStore } from '../../../iam/application/user-store.js';
import { useProjectDetailStore } from '../../../projects/application/project-detail.store.js';

const route = useRoute();
const router = useRouter();
const milestonesStore = useMilestonesStore();
const userStore = useUserStore();
const projectDetailStore = useProjectDetailStore();

// Estado reactivo
const loading = ref(false);
const milestone = ref(null);
const myTasks = ref([]);

// Obtener IDs de los parámetros
const projectId = computed(() => route.params.projectId);
const milestoneId = computed(() => route.query.milestone);

// Computed: Obtener el ID normalizado del usuario
const normalizedUserId = computed(() => {
  const userId = userStore.currentUser?.id || localStorage.getItem("userId");
  return userId ? String(userId) : null;
});

// Computed: Filtrar tareas asignadas al usuario
const assignedTasks = computed(() => {
  if (!milestone.value?.milestoneTasks) return [];

  return milestone.value.milestoneTasks.filter(task => {
    const taskUserId = task.assignedTo ? String(task.assignedTo) : null;
    return taskUserId === normalizedUserId.value;
  });
});

// Computed: Estadísticas de las tareas
const taskStats = computed(() => {
  const tasks = assignedTasks.value;
  const total = tasks.length;
  const completed = tasks.filter(task => task.status === 'completed').length;
  const pending = tasks.filter(task => task.status === 'pending').length;
  const inProgress = tasks.filter(task => task.status === 'in_progress').length;
  const overdue = tasks.filter(task => isOverdue(task.dueDate)).length;

  return {
    total,
    completed,
    pending,
    inProgress,
    overdue
  };
});

// Computed: Tareas agrupadas por estado
const tasksByStatus = computed(() => {
  return {
    pending: assignedTasks.value.filter(task => task.status === 'pending'),
    inProgress: assignedTasks.value.filter(task => task.status === 'in_progress'),
    completed: assignedTasks.value.filter(task => task.status === 'completed')
  };
});

// Cargar datos del hito
const loadMilestoneData = async () => {
  try {
    loading.value = true;

    // Cargar el milestone específico
    await milestonesStore.loadMilestone(projectId.value, milestoneId.value);
    milestone.value = milestonesStore.currentMilestone;

    console.log('✅ Milestone cargado:', milestone.value);
    console.log('📋 Tareas del usuario:', assignedTasks.value);

  } catch (error) {
    console.error('❌ Error cargando milestone:', error);
  } finally {
    loading.value = false;
  }
};

// Actualizar progreso de una tarea


const goBack = () => {
  router.go(-1)
};

// Inicializar componente
onMounted(async () => {
  await loadMilestoneData();
});

// Helpers para UI
const formatDate = (dateString) => {
  if (!dateString) return 'Sin fecha límite';
  return new Date(dateString).toLocaleDateString('es-ES');
};

const getDaysRemaining = (dueDate) => {
  if (!dueDate) return null;
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'completed': return 'status-completed';
    case 'in_progress': return 'status-in-progress';
    default: return 'status-pending';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'completed': return 'Completado';
    case 'in_progress': return 'En Progreso';
    default: return 'Pendiente';
  }
};

const startTask = (task) => {
  console.log('🚀 Iniciando tarea:', {
    taskId: task.id,
    taskTitle: task.title,
    typeOfTaskId: typeof task.id
  });

  router.push({
    name: 'milestone-task-submit',
    params: { projectId: projectId.value },
    query: {
      milestone: milestoneId.value,
      task: task.id // Asegúrate de que esto no sea undefined
    }
  });
};


</script>

<template>
  <div class="milestone-tasks-view">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="back-navigation">
          <pv-button
              icon="pi pi-arrow-left"
              class="p-button-text p-button-secondary"
              @click="goBack"
              label="Volver al proyecto"
          />
        </div>

        <div class="header-main">
          <h1 class="page-title">
            <i class="pi pi-list-check mr-2"></i>
            Mis Tareas del Hito
          </h1>
          <p class="page-subtitle" v-if="milestone">
            Hito: <strong>{{ milestone.title }}</strong>
          </p>
        </div>

        <!-- Espacio vacío para balancear el layout -->
        <div class="header-actions"></div>
      </div>
    </div>

    <!-- Estadísticas -->
    <div class="stats-section" v-if="milestone">
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon total">
            <i class="pi pi-list"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ taskStats.total }}</div>
            <div class="stat-label">Total Tareas</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon completed">
            <i class="pi pi-check"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ taskStats.completed }}</div>
            <div class="stat-label">Completadas</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon pending">
            <i class="pi pi-clock"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ taskStats.pending }}</div>
            <div class="stat-label">Pendientes</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon overdue">
            <i class="pi pi-exclamation-triangle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ taskStats.overdue }}</div>
            <div class="stat-label">Retrasadas</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <pv-progress-spinner />
      <span>Cargando tareas...</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="assignedTasks.length === 0" class="empty-state">
      <div class="empty-content">
        <i class="pi pi-inbox empty-icon"></i>
        <h3>No tienes tareas asignadas</h3>
        <p>No se te han asignado tareas específicas en este hito.</p>
        <pv-button
            label="Volver al proyecto"
            @click="goBack"
            class="p-button-primary"
        />
      </div>
    </div>

    <!-- Contenido Principal -->
    <div v-else class="tasks-content">
      <!-- Tareas Pendientes -->
      <div class="tasks-section" v-if="tasksByStatus.pending.length > 0">
        <div class="section-header">
          <h2 class="section-title">
            <i class="pi pi-clock text-yellow-500"></i>
            Pendientes ({{ tasksByStatus.pending.length }})
          </h2>
        </div>

        <div class="tasks-list">
          <div
              v-for="task in tasksByStatus.pending"
              :key="task.id"
              class="task-card"
          >
            <div class="task-header">
              <h3 class="task-title">{{ task.title }}</h3>
              <span :class="['status-badge', getStatusBadgeClass(task.status)]">
                {{ getStatusText(task.status) }}
              </span>
            </div>

            <p class="task-description" v-if="task.description">
              {{ task.description }}
            </p>

            <!-- Fecha límite -->
            <div class="task-meta" v-if="task.dueDate">
              <i class="pi pi-calendar"></i>
              <span class="meta-text">
                Vence: {{ formatDate(task.dueDate) }}
                <span
                    v-if="isOverdue(task.dueDate)"
                    class="overdue-badge"
                >
                  (Vencido)
                </span>
                <span v-else class="days-remaining">
                  ({{ getDaysRemaining(task.dueDate) }} días restantes)
                </span>
              </span>
            </div>

            <!-- Botón para hacer la tarea -->
            <div class="task-actions">
              <pv-button
                  label="Hacer Tarea"
                  icon="pi pi-play"
                  class="p-button-primary"
                  @click="startTask(task)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Tareas en Progreso -->
      <div class="tasks-section" v-if="tasksByStatus.inProgress.length > 0">
        <div class="section-header">
          <h2 class="section-title">
            <i class="pi pi-spinner text-blue-500"></i>
            En Progreso ({{ tasksByStatus.inProgress.length }})
          </h2>
        </div>

        <div class="tasks-list">
          <div
              v-for="task in tasksByStatus.inProgress"
              :key="task.id"
              class="task-card"
          >
            <div class="task-header">
              <h3 class="task-title">{{ task.title }}</h3>
              <span :class="['status-badge', getStatusBadgeClass(task.status)]">
                {{ getStatusText(task.status) }}
              </span>
            </div>

            <p class="task-description" v-if="task.description">
              {{ task.description }}
            </p>

            <!-- Checklist -->
            <div class="checklist-section" v-if="task.checklist && task.checklist.length > 0">
              <h4 class="checklist-title">Checklist:</h4>
              <div class="checklist-items">
                <div
                    v-for="(item, index) in task.checklist"
                    :key="index"
                    class="checklist-item"
                >
                  <pv-checkbox
                      v-model="item.completed"
                      :binary="true"
                      @change="toggleChecklistItem(task, index)"
                  />
                  <span
                      class="checklist-text"
                      :class="{ 'completed': item.completed }"
                  >
                    {{ item.text }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tareas Completadas -->
      <div class="tasks-section" v-if="tasksByStatus.completed.length > 0">
        <div class="section-header">
          <h2 class="section-title">
            <i class="pi pi-check-circle text-green-500"></i>
            Completadas ({{ tasksByStatus.completed.length }})
          </h2>
        </div>

        <div class="tasks-list">
          <div
              v-for="task in tasksByStatus.completed"
              :key="task.id"
              class="task-card completed"
          >
            <div class="task-header">
              <h3 class="task-title">{{ task.title }}</h3>
              <span :class="['status-badge', getStatusBadgeClass(task.status)]">
                {{ getStatusText(task.status) }}
              </span>
            </div>

            <p class="task-description" v-if="task.description">
              {{ task.description }}
            </p>

            <!-- Progreso -->
            <div class="task-progress">
              <div class="progress-info">
                <span class="progress-text">Completado al 100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.milestone-tasks-view {
  min-height: 100vh;
  background: #f8fafc;
  padding: 0;
}

/* Header */
.page-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 1.5rem 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.back-navigation {
  flex: 1;
  display: flex;
  justify-content: flex-start;
}

.header-main {
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.header-actions {
  flex: 1;
  display: flex;
  justify-content: flex-end;
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

/* Estadísticas */
.stats-section {
  background: white;
  padding: 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-icon.total {
  background: #dbeafe;
  color: #3b82f6;
}

.stat-icon.completed {
  background: #dcfce7;
  color: #16a34a;
}

.stat-icon.pending {
  background: #fef3c7;
  color: #d97706;
}

.stat-icon.overdue {
  background: #fee2e2;
  color: #dc2626;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-gray-800);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--color-gray-600);
}

/* Contenido Principal */
.tasks-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.tasks-section {
  margin-bottom: 2rem;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-gray-800);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* CAMBIO PRINCIPAL: Lista vertical en lugar de grid horizontal */
.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.task-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  width: 100%;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.task-card.completed {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.task-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-gray-800);
  margin: 0;
  flex: 1;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-pending {
  background: #fef3c7;
  color: #d97706;
}

.status-in-progress {
  background: #dbeafe;
  color: #3b82f6;
}

.status-completed {
  background: #dcfce7;
  color: #16a34a;
}

.task-description {
  color: var(--color-gray-600);
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

/* NUEVO: Acciones de la tarea */
.task-actions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
}

/* Checklist */
.checklist-section {
  margin: 1rem 0;
}

.checklist-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-gray-700);
  margin: 0 0 0.75rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.checklist-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 6px;
  background: #f8fafc;
}

.checklist-item.completed {
  background: #f0fdf4;
}

.checklist-text {
  font-size: 0.875rem;
  color: var(--color-gray-700);
  flex: 1;
}

.checklist-text.completed {
  text-decoration: line-through;
  color: var(--color-gray-500);
}

/* Progreso */
.task-progress {
  margin: 1rem 0;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-gray-700);
}

.progress-bar {
  height: 6px;
}

.progress-bar.completed :deep(.p-progressbar-value) {
  background: #16a34a !important;
}

/* Meta información */
.task-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-gray-500);
  margin-top: 1rem;
}

.overdue-badge {
  color: #dc2626;
  font-weight: 600;
}

.days-remaining {
  color: #059669;
  font-weight: 500;
}

/* Estados vacíos y loading */
.loading-state,
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  margin: 2rem;
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
  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .back-navigation {
    justify-content: center;
    width: 100%;
  }

  .header-main {
    order: -1; /* Poner el título primero */
  }

  .header-actions {
    display: none; /* Ocultar en móvil ya que está vacío */
  }

  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .task-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .page-header {
    padding: 1rem;
  }

  .tasks-content {
    padding: 1rem;
  }

  .task-actions {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>