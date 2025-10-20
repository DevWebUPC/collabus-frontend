<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectDetailStore } from '../../../projects/application/project-detail.store.js';
import { useUserStore } from '../../../iam/application/user-store.js';
import { useMilestonesStore } from '../../application/milestone-store.js';

const router = useRouter();
const projectDetailStore = useProjectDetailStore();
const userStore = useUserStore();
const milestonesStore = useMilestonesStore();

// Estado reactivo
const loading = ref(false);
const activeFilter = ref('all'); // 'all', 'pending', 'completed', 'overdue'

// Computed: Obtener hitos donde el usuario tiene tareas asignadas
const myMilestones = computed(() => {
  if (!projectDetailStore.project?.milestones) {
    console.log('❌ No project milestones available');
    return [];
  }

  const userId = getNormalizedUserId();
  if (!userId) {
    console.log('❌ No user ID available');
    return [];
  }

  console.log('🔍 Filtering milestones for user:', userId);
  console.log('📋 All milestones:', projectDetailStore.project.milestones);

  // Filtrar hitos que tienen al menos una tarea asignada al usuario
  const userMilestones = projectDetailStore.project.milestones.filter(milestone => {
    const hasUserTasks = milestone.milestoneTasks?.some(task => {
      const taskUserId = task.assignedTo ? String(task.assignedTo) : null;
      const matches = taskUserId === userId;
      if (matches) {
        console.log(`   - Milestone "${milestone.title}": Tarea "${task.title}" asignada al usuario`);
      }
      return matches;
    });

    console.log(`   - Milestone "${milestone.title}": ${hasUserTasks ? 'TIENE' : 'NO TIENE'} tareas del usuario`);
    return hasUserTasks;
  });

  console.log('✅ User milestones found:', userMilestones.length, userMilestones);
  return userMilestones;
});

const getNormalizedUserId = () => {
  const userId = userStore.currentUser?.id || localStorage.getItem("userId");
  return userId ? String(userId) : null;
};

// Computed: Obtener mis tareas dentro de los hitos
const getMyTasksInMilestone = (milestone) => {
  const userId = getNormalizedUserId();
  if (!userId || !milestone.milestoneTasks) return [];

  return milestone.milestoneTasks.filter(task =>
      task.assignedTo && String(task.assignedTo) === userId
  );
};

// Computed: Progreso de mis tareas en el hito
const getMyProgressInMilestone = (milestone) => {
  const myTasks = getMyTasksInMilestone(milestone);
  if (myTasks.length === 0) return 0;

  const totalProgress = myTasks.reduce((sum, task) => sum + (task.progress || 0), 0);
  return Math.round(totalProgress / myTasks.length);
};

// Computed: Verificar si un hito está completado
const isMilestoneCompleted = (milestone) => {
  return milestone.status === 'completed';
};

// Computed: Hitos filtrados
const filteredMilestones = computed(() => {
  const milestones = myMilestones.value;

  switch (activeFilter.value) {
    case 'pending':
      return milestones.filter(milestone => milestone.status === 'active' && !isOverdue(milestone.dueDate));
    case 'overdue':
      return milestones.filter(milestone => milestone.status === 'active' && isOverdue(milestone.dueDate));
    case 'completed':
      return milestones.filter(milestone => milestone.status === 'completed');
    default:
      return milestones;
  }
});

// Computed: Estadísticas
const milestoneStats = computed(() => {
  const milestones = myMilestones.value;
  const completed = milestones.filter(milestone => milestone.status === 'completed').length;
  const pending = milestones.filter(milestone => milestone.status === 'active' && !isOverdue(milestone.dueDate)).length;
  const overdue = milestones.filter(milestone => milestone.status === 'active' && isOverdue(milestone.dueDate)).length;

  return {
    total: milestones.length,
    pending,
    overdue,
    completed,
    completionRate: milestones.length > 0 ? Math.round((completed / milestones.length) * 100) : 0
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

// Verificar si el hito está vencido
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

// Navegar a vista de hito
const viewMilestone = (milestone) => {
  console.log('Ver hito:', milestone);
  router.push({
    name: 'milestone-detail',
    params: {
      projectId: projectDetailStore.project.id,
      milestoneId: milestone.id
    }
  });
};

// Navegar a vista de tareas del hito
const viewMilestoneTasks = (milestone) => {
  console.log('Ver tareas del hito:', milestone);
  // Aquí podrías navegar a una vista específica de tareas del hito
  // o mostrar un modal/dialog con las tareas
  router.push({
    name: 'participating-tasks',
    params: {
      projectId: projectDetailStore.project.id
    },
    query: {
      milestone: milestone.id
    }
  });
};

// Cambiar filtro
const setFilter = (filter) => {
  activeFilter.value = filter;
};

// Cargar hitos cuando el componente se monte
onMounted(async () => {
  console.log('Hitos del usuario en pestaña Milestones:', myMilestones.value);

  if (projectDetailStore.project?.id) {
    loading.value = true;
    try {
      await milestonesStore.loadProjectMilestones(projectDetailStore.project.id);
    } catch (error) {
      console.error('Error loading milestones:', error);
    } finally {
      loading.value = false;
    }
  }
});
</script>

<template>
  <div class="participating-milestones-view">
    <!-- Header con estadísticas -->
    <div class="milestones-header">
      <div class="header-content">
        <h1 class="page-title">Mis Hitos</h1>
        <p class="page-subtitle">Hitos del proyecto donde tienes tareas asignadas</p>
      </div>

      <div class="stats-container">
        <div class="stat-card">
          <div class="stat-value">{{ milestoneStats.total }}</div>
          <div class="stat-label">Total</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ milestoneStats.pending }}</div>
          <div class="stat-label">Pendientes</div>
        </div>
        <div class="stat-card">
          <div class="stat-value overdue-count">{{ milestoneStats.overdue }}</div>
          <div class="stat-label">Vencidos</div>
        </div>
        <div class="stat-card">
          <div class="stat-value completed-count">{{ milestoneStats.completed }}</div>
          <div class="stat-label">Completados</div>
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
          Todos ({{ milestoneStats.total }})
        </pv-button>
        <pv-button
            :class="['filter-btn', { active: activeFilter === 'pending' }]"
            @click="setFilter('pending')"
            text
        >
          Pendientes ({{ milestoneStats.pending }})
        </pv-button>
        <pv-button
            :class="['filter-btn', { active: activeFilter === 'overdue' }]"
            @click="setFilter('overdue')"
            text
        >
          Vencidos ({{ milestoneStats.overdue }})
        </pv-button>
        <pv-button
            :class="['filter-btn', { active: activeFilter === 'completed' }]"
            @click="setFilter('completed')"
            text
        >
          Completados ({{ milestoneStats.completed }})
        </pv-button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <pv-progress-spinner />
      <span>Cargando hitos...</span>
    </div>

    <!-- Empty State -->
    <div v-else-if="myMilestones.length === 0" class="empty-state">
      <div class="empty-content">
        <i class="pi pi-flag empty-icon"></i>
        <h3>No tienes hitos asignados</h3>
        <p>Cuando te asignen tareas dentro de hitos en este proyecto, aparecerán aquí.</p>
      </div>
    </div>

    <!-- Milestones Grid -->
    <div v-else class="milestones-grid">
      <div
          v-for="milestone in filteredMilestones"
          :key="milestone.id"
          class="milestone-card"
          :class="{
          'overdue': isOverdue(milestone.dueDate) && milestone.status === 'active',
          'completed': milestone.status === 'completed'
        }"
      >
        <!-- Header del hito -->
        <div class="milestone-header">
          <div class="milestone-status">
            <span v-if="milestone.status === 'completed'" class="status-badge completed">
              <i class="pi pi-check-circle"></i>
              Completado
            </span>
            <span v-else-if="isOverdue(milestone.dueDate)" class="status-badge overdue">
              <i class="pi pi-exclamation-triangle"></i>
              Vencido
            </span>
            <span v-else class="status-badge pending">
              <i class="pi pi-clock"></i>
              Pendiente
            </span>
          </div>
        </div>

        <!-- Contenido del hito -->
        <div class="milestone-content">
          <h3 class="milestone-title">{{ milestone.title }}</h3>

          <!-- Mis tareas en este hito -->

          <div class="milestone-meta">
            <div class="meta-item">
              <i class="pi pi-calendar"></i>
              <span class="meta-text">
                Vence: {{ formatDate(milestone.dueDate) }}
                <span v-if="milestone.status === 'active' && getDaysRemaining(milestone.dueDate) !== null"
                      class="days-remaining"
                      :class="{ 'overdue': isOverdue(milestone.dueDate) }">
                  ({{ isOverdue(milestone.dueDate) ? Math.abs(getDaysRemaining(milestone.dueDate)) + ' días de retraso' : getDaysRemaining(milestone.dueDate) + ' días restantes' }})
                </span>
              </span>
            </div>
          </div>
        </div>

        <!-- Acciones -->
        <div class="milestone-actions">
          <pv-button
              label="Ver Hito"
              icon="pi pi-eye"
              severity="secondary"
              outlined
              @click="viewMilestone(milestone)"
              class="view-btn"
          />
          <pv-button
              label="Ver Tareas"
              icon="pi pi-list-check"
              severity="primary"
              @click="viewMilestoneTasks(milestone)"
              class="tasks-btn"
          />
        </div>
      </div>
    </div>

    <!-- Filtro vacío -->
    <div v-if="myMilestones.length > 0 && filteredMilestones.length === 0" class="empty-filter-state">
      <div class="empty-content">
        <i class="pi pi-filter empty-icon"></i>
        <h3>No hay hitos con este filtro</h3>
        <p>No se encontraron hitos que coincidan con el filtro "{{ activeFilter }}".</p>
        <pv-button
            label="Mostrar todos los hitos"
            @click="setFilter('all')"
            class="show-all-btn"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.participating-milestones-view {
  padding: 0;
  background: transparent;
}

/* Header */
.milestones-header {
  background: white;
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
  background: #f8fafc;
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
  background: white;
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
  color: white;
}

.filter-btn:not(.active):hover {
  background: #f1f5f9;
}

/* Milestones Grid */
.milestones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 1.5rem;
}

.milestone-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.milestone-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.milestone-card.overdue {
  border-left: 4px solid var(--color-red-500);
  background: #fef2f2;
}

.milestone-card.completed {
  border-left: 4px solid var(--color-green-500);
  background: #f0fdf4;
  opacity: 0.9;
}

/* Milestone Header */
.milestone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.milestone-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 100px;
}

.progress-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-gray-700);
  min-width: 40px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-fill.completed {
  background: var(--color-green-500);
}

.progress-fill.overdue {
  background: var(--color-red-500);
}

/* Milestone Content */
.milestone-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.milestone-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-gray-800);
  margin: 0;
  line-height: 1.4;
}

.milestone-description {
  color: var(--color-gray-600);
  margin: 0;
  line-height: 1.5;
}

/* Mis Tareas Section */
.my-tasks-section {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
}

.tasks-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-gray-700);
  margin: 0 0 0.75rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-radius: 6px;
  background: white;
  border: 1px solid #e2e8f0;
}

.task-item.completed {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.task-item.overdue {
  background: #fef2f2;
  border-color: #fecaca;
}

.task-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.task-icon {
  font-size: 0.875rem;
}

.task-item.completed .task-icon {
  color: var(--color-green-500);
}

.task-item.overdue .task-icon {
  color: var(--color-red-500);
}

.task-item:not(.completed):not(.overdue) .task-icon {
  color: var(--color-blue-500);
}

.task-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-gray-700);
}

.task-progress {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-gray-600);
  min-width: 35px;
  text-align: right;
}

/* Milestone Meta */
.milestone-meta {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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

/* Milestone Actions */
.milestone-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.milestone-actions .p-button {
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
  background: white;
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
  .milestones-grid {
    grid-template-columns: 1fr;
  }

  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .milestone-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .milestone-progress {
    width: 100%;
  }

  .milestone-actions {
    flex-direction: column;
  }

  .milestone-actions .p-button {
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
  .milestones-header {
    padding: 1.5rem;
  }

  .milestone-card {
    padding: 1rem;
  }

  .stats-container {
    grid-template-columns: 1fr;
  }
}

/* Button Styles */
:deep(.view-btn.p-button) {
  background: white;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

:deep(.view-btn.p-button:hover) {
  background: var(--color-primary);
  color: white;
}

:deep(.tasks-btn.p-button) {
  background: var(--color-primary);
  color: white;
  border: 1px solid var(--color-primary);
}

:deep(.tasks-btn.p-button:hover) {
  background: var(--color-primary-600);
  border-color: var(--color-primary-600);
}

:deep(.show-all-btn.p-button) {
  background: var(--color-primary);
  color: white;
  border: 1px solid var(--color-primary);
}
</style>