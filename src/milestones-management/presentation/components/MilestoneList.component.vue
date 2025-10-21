<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMilestonesStore } from '../../application/milestone-store.js';
import MilestoneRescheduleModal from './MilestoneRescheduleModal.vue';
import MilestoneDeleteModal from './MilestoneDeleteModal.vue';

// Stores y route
const milestonesStore = useMilestonesStore();
const route = useRoute();
const router = useRouter();

const props = defineProps({
  projectId: {
    type: [String, Number],
    required: true
  },
  milestones: {
    type: Array,
    default: null
  }
});

// Datos reactivos
const milestones = ref([]);
const loading = ref(false);
const error = ref(null);
const expandedMilestones = ref(new Set());
const showRescheduleModal = ref(false);
const showDeleteModal = ref(false);
const selectedMilestone = ref(null);

const viewTaskDetails = (milestoneId, taskId) => {
  console.log('🔍 Navegando a detalles de tarea:', { milestoneId, taskId });

  router.push({
    name: 'milestone-task-detail',
    params: {
      projectId: props.projectId,
      milestoneId: milestoneId,
      taskId: taskId
    }
  });
};

const isTaskCompleted = (task) => {
  return task.status === 'completed' || task.progress === 100;
};

// Cargar hitos del proyecto
const loadMilestones = async (projectIdToLoad = props.projectId) => {
  try {
    loading.value = true;
    error.value = null;

    console.log('🔄 Loading milestones for project:', projectIdToLoad);

    if (!projectIdToLoad) {
      error.value = 'No se pudo identificar el proyecto';
      return;
    }

    // ✅ MODIFICACIÓN: Usar milestones de la prop si están disponibles
    if (props.milestones !== null) {
      console.log('📋 Using filtered milestones from prop:', props.milestones);
      milestones.value = props.milestones;
      return;
    }

    // Código original para cargar desde el store...
    const projectMilestones = milestonesStore.getProjectMilestones(projectIdToLoad);

    console.log('📋 Milestones from store:', projectMilestones);

    if (projectMilestones && projectMilestones.length > 0) {
      milestones.value = projectMilestones;
    } else {
      console.log('🔄 No cached milestones, loading from API...');
      const loadedMilestones = await milestonesStore.loadProjectMilestones(projectIdToLoad);
      milestones.value = loadedMilestones || [];
    }

    console.log('✅ Final milestones:', milestones.value);

  } catch (err) {
    console.error('❌ Error cargando hitos:', err);
    error.value = 'Error al cargar los hitos: ' + (err.message || 'Error desconocido');
    milestones.value = [];
  } finally {
    loading.value = false;
  }
};

// Watch para cambios en projectId
watch(() => props.milestones, (newMilestones) => {
  if (newMilestones !== null) {
    console.log('🔄 Filtered milestones changed:', newMilestones);
    milestones.value = newMilestones;
  }
}, { immediate: true });

watch(() => props.projectId, async (newProjectId) => {
  if (newProjectId) {
    console.log('🔄 Project ID changed:', newProjectId);
    await loadMilestones(newProjectId);
  }
}, { immediate: true });

// Formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return 'Sin fecha';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES');
};

// Determinar el estado del hito basado en progreso y fecha
const determineMilestoneStatus = (milestone) => {
  // Si está completado, retornar completado
  if (milestone.status === 'completed' || milestone.progress === 100) {
    return 'completed';
  }

  // Si está retrasado (fecha vencida y no completado)
  if (milestone.dueDate) {
    const now = new Date();
    const dueDate = new Date(milestone.dueDate);
    if (dueDate < now) {
      return 'overdue';
    }
  }

  // Por defecto, pendiente
  return 'pending';
};

// Obtener texto del estado
const getStatusText = (status) => {
  const statusMap = {
    'pending': 'Pendiente',
    'completed': 'Completado',
    'overdue': 'Retrasado'
  };
  return statusMap[status] || status;
};

// Obtener clase CSS para el estado
const getStatusClass = (status) => {
  const classMap = {
    'pending': 'status-pending',
    'completed': 'status-completed',
    'overdue': 'status-overdue'
  };
  return classMap[status] || 'status-default';
};

// Calcular progreso total
const calculateProgress = (milestone) => {
  if (milestone.progress !== undefined) return milestone.progress;

  if (milestone.milestoneTasks && milestone.milestoneTasks.length > 0) {
    const completedTasks = milestone.milestoneTasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / milestone.milestoneTasks.length) * 100);
  }

  return 0;
};

// Toggle para expandir/contraer tareas
const toggleMilestoneTasks = (milestoneId) => {
  if (expandedMilestones.value.has(milestoneId)) {
    expandedMilestones.value.delete(milestoneId);
  } else {
    expandedMilestones.value.add(milestoneId);
  }
};

// Verificar si un hito está expandido
const isMilestoneExpanded = (milestoneId) => {
  return expandedMilestones.value.has(milestoneId);
};

// Obtener colaboradores únicos del hito
const getMilestoneCollaborators = (milestone) => {
  if (!milestone.milestoneTasks) return [];

  const collaborators = new Map();

  milestone.milestoneTasks.forEach(task => {
    if (task.assignedTo) {
      collaborators.set(task.assignedTo, {
        id: task.assignedTo,
        name: task.assignedToName || 'Sin nombre',
        completedTasks: 0,
        totalTasks: 0
      });
    }
  });

  // Contar tareas completadas y totales por colaborador
  Array.from(collaborators.values()).forEach(collaborator => {
    const collaboratorTasks = milestone.milestoneTasks.filter(task =>
        task.assignedTo === collaborator.id
    );

    collaborator.totalTasks = collaboratorTasks.length;
    collaborator.completedTasks = collaboratorTasks.filter(task =>
        task.status === 'completed'
    ).length;
  });

  return Array.from(collaborators.values());
};

// Obtener tareas por colaborador
const getTasksByCollaborator = (milestone, collaboratorId) => {
  if (!milestone.milestoneTasks) return [];
  return milestone.milestoneTasks.filter(task => task.assignedTo === collaboratorId);
};

// Métodos para los modales de hitos atrasados
const openRescheduleModal = (milestone) => {
  selectedMilestone.value = milestone;
  showRescheduleModal.value = true;
};

const openDeleteModal = (milestone) => {
  selectedMilestone.value = milestone;
  showDeleteModal.value = true;
};

const handleMilestoneRescheduled = (result) => {
  console.log('✅ Hito reprogramado:', result);
  // En lugar de recargar, actualiza el milestone específico
  const index = milestones.value.findIndex(m => m.id === result.milestoneId);
  if (index !== -1) {
    // Actualiza la fecha en el array local
    milestones.value[index].dueDate = result.newDueDate;
    // Forzar reactividad
    milestones.value = [...milestones.value];
  }
};


const handleMilestoneDeleted = (result) => {
  console.log('🗑️ Hito eliminado:', result);
  // En lugar de recargar, elimina el milestone del array local
  milestones.value = milestones.value.filter(m => m.id !== result.milestoneId);
};

const handleModalCancel = () => {
  console.log('❌ Operación cancelada');
};
</script>

<template>
  <div class="milestones-list">
    <!-- Estado de error -->
    <div v-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Error al cargar hitos</h3>
      <p>{{ error }}</p>
      <pv-button @click="loadMilestones" label="Reintentar" class="retry-btn" />
    </div>

    <!-- Estado de carga -->
    <div v-else-if="loading" class="loading-state">
      <p>Cargando hitos...</p>
    </div>

    <!-- Lista de hitos en diseño vertical -->
    <div v-else-if="milestones.length > 0" class="milestones-vertical">
      <div
          v-for="milestone in milestones"
          :key="milestone.id"
          class="milestone-item"
      >
        <!-- Header del hito -->
        <div class="milestone-header">
          <div class="milestone-main-info">
            <h3 class="milestone-title">{{ milestone.title }}</h3>
            <span :class="['status-badge', getStatusClass(determineMilestoneStatus(milestone))]">
              {{ getStatusText(determineMilestoneStatus(milestone)) }}
            </span>
          </div>

          <!-- Botón para toggle de tareas -->
          <pv-button
              class="toggle-tasks-btn"
              severity="secondary"
              @click="toggleMilestoneTasks(milestone.id)"
          >
            <i class="pi" :class="isMilestoneExpanded(milestone.id) ? 'pi-chevron-up' : 'pi-chevron-down'"></i>
          </pv-button>
        </div>

        <!-- Descripción -->
        <p v-if="milestone.description" class="milestone-description">
          {{ milestone.description }}
        </p>

        <!-- Información de fechas y progreso -->
        <div class="milestone-details">
          <div class="milestone-date">
            <span class="pi pi-calendar date-icon"></span>
            <span>Vence: {{ formatDate(milestone.dueDate) }}</span>
          </div>

          <!-- Barra de progreso -->
          <div class="progress-section">
            <div class="progress-info">
              <span>Progreso: {{ calculateProgress(milestone) }}%</span>
            </div>
            <div class="progress-bar">
              <div
                  class="progress-fill"
                  :style="{ width: calculateProgress(milestone) + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Sección de acciones para hitos atrasados -->
        <div
            v-if="determineMilestoneStatus(milestone) === 'overdue'"
            class="milestone-actions"
        >
          <div class="overdue-warning">
            <i class="pi pi-exclamation-triangle"></i>
            <span>Este hito está atrasado</span>
          </div>
          <div class="action-buttons">
            <pv-button
                label="Reprogramar"
                severity="warning"
                size="small"
                @click="openRescheduleModal(milestone)"
                class="action-btn"
            >
              <i class="pi pi-calendar-plus"></i>
            </pv-button>
            <pv-button
                label="Eliminar"
                severity="danger"
                size="small"
                @click="openDeleteModal(milestone)"
                class="action-btn"
            >
              <i class="pi pi-trash"></i>
            </pv-button>
          </div>
        </div>

        <!-- Información de tareas -->
        <div class="tasks-info">
          <span class="pi pi-list-check task-icon"></span>
          <span>{{ milestone.milestoneTasks ? milestone.milestoneTasks.length : 0 }} tareas asignadas</span>
        </div>

        <!-- Herramientas -->
        <div v-if="milestone.tools && milestone.tools.length > 0" class="tools-section">
          <div class="tools-label">Herramientas:</div>
          <div class="tools-list">
            <span
                v-for="tool in milestone.tools"
                :key="tool"
                class="tool-tag"
            >
              {{ tool }}
            </span>
          </div>
        </div>

        <!-- Sección expandible de tareas por colaborador -->
        <div
            v-if="isMilestoneExpanded(milestone.id)"
            class="tasks-expansion"
        >
          <div class="expansion-header">
            <h4>Tareas del Hito</h4>
            <span class="total-tasks">
              {{ milestone.milestoneTasks ? milestone.milestoneTasks.length : 0 }} tareas totales
            </span>
          </div>

          <div class="collaborators-tasks">
            <div
                v-for="collaborator in getMilestoneCollaborators(milestone)"
                :key="collaborator.id"
                class="collaborator-section"
            >
              <div class="collaborator-header">
                <div class="collaborator-info">
                  <div class="collaborator-name">{{ collaborator.name }}</div>
                  <div class="collaborator-stats">
                    <span class="completed-tasks">{{ collaborator.completedTasks }}/{{ collaborator.totalTasks }}</span> tareas completadas
                  </div>
                </div>

                <div class="collaborator-progress">
                  <span class="progress-percentage">
                    {{ collaborator.totalTasks > 0 ? Math.round((collaborator.completedTasks / collaborator.totalTasks) * 100) : 0 }}%
                  </span>
                  <div class="progress-bar small">
                    <div
                        class="progress-fill"
                        :style="{
                        width: collaborator.totalTasks > 0
                          ? (collaborator.completedTasks / collaborator.totalTasks) * 100 + '%'
                          : '0%'
                      }"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- Lista de tareas del colaborador -->
              <div class="tasks-list">
                <div
                    v-for="task in getTasksByCollaborator(milestone, collaborator.id)"
                    :key="task.id"
                    class="task-item"
                >
                  <div class="task-main">
                    <div class="task-info">
                      <div class="task-title">{{ task.title }}</div>
                      <div v-if="task.description" class="task-description">
                        {{ task.description }}
                      </div>
                      <div class="task-details">
                        <span class="task-progress">Progreso: {{ task.progress }}%</span>
                        <span v-if="task.dueDate" class="task-due-date">
                          Vence: {{ formatDate(task.dueDate) }}
                        </span>
                      </div>
                    </div>
                    <div class="task-actions">
                      <span :class="['task-status', task.status]">
                        {{ task.status === 'completed' ? 'Completada' : 'Pendiente' }}
                      </span>
                      <pv-button
                          v-if="isTaskCompleted(task)"
                          class="view-task-btn"
                          severity="secondary"
                          size="small"
                          @click="viewTaskDetails(milestone.id, task.id)"
                      >
                        <i class="pi pi-eye"></i>
                        Ver Tarea
                      </pv-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="getMilestoneCollaborators(milestone).length === 0" class="no-tasks">
            <p>No hay tareas asignadas en este hito</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else class="empty-state">
      <div class="empty-icon">📋</div>
      <h3>No hay hitos creados</h3>
      <p>Crea tu primer hito para organizar las tareas del proyecto</p>
    </div>

    <!-- Modales para hitos atrasados -->
    <MilestoneRescheduleModal
        v-model:visible="showRescheduleModal"
        :milestone="selectedMilestone"
        :projectId="projectId"
        @rescheduled="handleMilestoneRescheduled"
        @cancel="handleModalCancel"
    />

    <MilestoneDeleteModal
        v-model:visible="showDeleteModal"
        :milestone="selectedMilestone"
        :projectId="projectId"
        @deleted="handleMilestoneDeleted"
        @cancel="handleModalCancel"
    />
  </div>
</template>

<style scoped>
.milestones-list {
  width: 100%;
}

.error-state {
  text-align: center;
  padding: 2rem;
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  margin: 1rem 0;
}

.error-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.retry-btn {
  margin-top: 1rem;
}

.loading-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
}

/* Diseño vertical para hitos */
.milestones-vertical {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.milestone-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease;
}

.milestone-item:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.milestone-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.milestone-main-info {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex: 1;
}

.milestone-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  flex: 1;
}

.toggle-tasks-btn {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  white-space: nowrap;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
}

.status-completed {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.status-overdue {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.status-default {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.milestone-description {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.milestone-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.milestone-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.date-icon {
  font-size: 0.75rem;
}

.progress-section {
  flex: 1;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #f3f4f6;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar.small {
  height: 4px;
  width: 80px;
}

.progress-fill {
  height: 100%;
  background: #3b82f6;
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* Estilos para la sección de acciones de hitos atrasados */
.milestone-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #fef2f2;
  border-radius: 6px;
  border: 1px solid #fecaca;
  margin-bottom: 1rem;
}

.overdue-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #dc2626;
  font-weight: 500;
  font-size: 0.875rem;
}

.overdue-warning i {
  font-size: 1rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  font-size: 0.75rem;
  padding: 0.4rem 0.75rem;
}

.action-btn .pi {
  font-size: 0.75rem;
  margin-right: 0.25rem;
}

.tasks-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.task-icon {
  font-size: 0.75rem;
}

.tools-section {
  border-top: 1px solid #f3f4f6;
  padding-top: 1rem;
}

.tools-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.tools-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tool-tag {
  background: #f3f4f6;
  color: #374151;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  border: 1px solid #e5e7eb;
}

/* Sección expandible de tareas */
.tasks-expansion {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.expansion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.expansion-header h4 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
}

.total-tasks {
  font-size: 0.875rem;
  color: #6b7280;
}

.collaborators-tasks {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.collaborator-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
}

.collaborator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.collaborator-info {
  flex: 1;
}

.collaborator-name {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
  font-size: 1rem;
}

.collaborator-stats {
  font-size: 0.875rem;
  color: #6b7280;
}

.completed-tasks {
  color: #059669;
  font-weight: 500;
}

.collaborator-progress {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress-percentage {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  min-width: 40px;
}

/* Lista de tareas individuales */
.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.task-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 1rem;
  transition: border-color 0.2s ease;
}

.task-item:hover {
  border-color: #3b82f6;
}

.task-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.task-info {
  flex: 1;
}

.task-title {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.task-description {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.task-details {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.task-progress {
  font-weight: 500;
}

.task-due-date {
  color: #dc2626;
}

.task-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.task-status {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.task-status.completed {
  background: #d1fae5;
  color: #065f46;
}

.task-status.pending {
  background: #fef3c7;
  color: #92400e;
}

.view-task-btn {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  white-space: nowrap;
}

.view-task-btn .pi {
  font-size: 0.75rem;
  margin-right: 0.25rem;
}

.no-tasks {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px dashed #e5e7eb;
}

/* Responsive */
@media (max-width: 768px) {
  .milestone-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .milestone-main-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .milestone-title {
    margin-right: 0;
  }

  .toggle-tasks-btn {
    align-self: stretch;
  }

  .milestone-actions {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }

  .action-buttons {
    justify-content: space-between;
  }

  .action-btn {
    flex: 1;
  }

  .collaborator-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .collaborator-progress {
    align-self: stretch;
    justify-content: space-between;
  }

  .expansion-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .task-main {
    flex-direction: column;
    gap: 0.5rem;
  }

  .task-actions {
    align-self: stretch;
    justify-content: space-between;
  }

  .task-details {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>