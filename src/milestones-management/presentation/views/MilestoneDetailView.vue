<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMilestonesStore } from '../../application/milestone-store.js';
import { useProjectDetailStore } from '../../../projects/application/project-detail.store.js';
import { useMilestoneTaskSubmissionStore } from '../../application/milestone-task-submission-store.js';

const route = useRoute();
const router = useRouter();
const milestonesStore = useMilestonesStore();
const projectDetailStore = useProjectDetailStore();
const submissionStore = useMilestoneTaskSubmissionStore();

const loading = ref(false);

// Computed properties
const milestone = computed(() => milestonesStore.currentMilestone);
const project = computed(() => projectDetailStore.project);

watch(
    () => submissionStore.submissions,
    () => {
      updateMilestoneStatusBasedOnSubmissions();
    },
    { deep: true }
);

const updateMilestoneStatusBasedOnSubmissions = () => {
  if (!milestone.value) return;

  const allTasksHaveSubmissions = checkIfAllTasksHaveSubmissions(milestone.value);

  if (allTasksHaveSubmissions && milestone.value.status !== 'completed') {
    console.log('🎯 Actualizando hito a completado basado en submissions');

    // Actualizar en el store
    const updatedMilestone = {
      ...milestone.value,
      status: 'completed',
      progress: 100,
      completedAt: new Date().toISOString()
    };

    // Actualizar en el store local (no hace llamada API para evitar loops)
    milestonesStore.currentMilestone = updatedMilestone;

    // También actualizar en la lista de milestones del store
    const index = milestonesStore.milestones.findIndex(m => m.id === milestone.value.id);
    if (index !== -1) {
      milestonesStore.milestones[index] = updatedMilestone;
    }
  }
};

const checkIfAllTasksHaveSubmissions = (milestone) => {
  if (!milestone.milestoneTasks || milestone.milestoneTasks.length === 0) {
    return false;
  }

  return milestone.milestoneTasks.every(task => {
    const hasSubmission = submissionStore.hasSubmissionForMilestoneTask(task.id);
    console.log(`   - Tarea "${task.title}": ${hasSubmission ? 'TIENE' : 'NO TIENE'} submission`);
    return hasSubmission;
  });
};

const isOverdue = computed(() => {
  if (!milestone.value?.dueDate || milestone.value.status === 'completed') return false;
  return new Date(milestone.value.dueDate) < new Date();
});

const daysRemaining = computed(() => {
  if (!milestone.value?.dueDate || milestone.value.status === 'completed') return null;

  const today = new Date();
  const due = new Date(milestone.value.dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
});

// Determinar el estado del hito
const milestoneStatus = computed(() => {
  if (milestone.value?.status === 'completed') return 'completed';

  // Verificar si debería estar completado basado en submissions
  const allTasksHaveSubmissions = milestone.value ?
      checkIfAllTasksHaveSubmissions(milestone.value) : false;

  if (allTasksHaveSubmissions) return 'completed';
  if (isOverdue.value) return 'overdue';
  return 'pending';
});

// Métodos de formato
const formatDate = (dateString) => {
  if (!dateString) return 'Sin fecha límite';
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatFullDate = (dateString) => {
  if (!dateString) return 'No especificada';
  return new Date(dateString).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getStatusText = (status) => {
  const statusMap = {
    'pending': 'Pendiente',
    'completed': 'Completado',
    'overdue': 'Retrasado'
  };
  return statusMap[status] || status;
};

const getStatusClass = (status) => {
  return `status-${status}`;
};

const getTaskStatusText = (status) => {
  const statusMap = {
    'pending': 'Pendiente',
    'in_progress': 'En Progreso',
    'completed': 'Completado'
  };
  return statusMap[status] || status;
};

const getTaskStatusClass = (status) => {
  return `task-status-${status}`;
};

const getInitials = (name) => {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

// Verificar si se debe mostrar el botón de ver tarea
const shouldShowViewTask = (task) => {
  return task.status === 'completed';
};

// Navegación
const goBack = () => {
  router.go(-1);
};

const viewTask = (task) => {
  console.log('Ver tarea:', task);
  // Aquí podrías navegar a una vista detallada de la tarea
  // o mostrar un modal/dialog con los detalles
};

const downloadAttachment = (attachment) => {
  if (attachment.url) {
    window.open(attachment.url, '_blank');
  } else {
    console.warn('No hay URL para descargar el archivo');
  }
};

const viewAttachment = (attachment) => {
  if (attachment.url) {
    window.open(attachment.url, '_blank');
  }
};

// Cargar datos
onMounted(async () => {
  try {
    loading.value = true;

    const { projectId, milestoneId } = route.params;

    // Cargar proyecto si no está cargado
    if (!projectDetailStore.project) {
      await projectDetailStore.loadProjectDetail(projectId);
    }

    // Cargar milestone específico
    await milestonesStore.loadMilestone(projectId, milestoneId);

    // Cargar submissions para este proyecto
    await submissionStore.loadSubmissionsByProject(projectId);

    // Verificar y actualizar estado basado en submissions
    updateMilestoneStatusBasedOnSubmissions();

    console.log('✅ Milestone cargado:', milestone.value);
  } catch (error) {
    console.error('Error cargando milestone:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="milestone-detail-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <pv-progress-spinner />
      <span>Cargando hito...</span>
    </div>

    <!-- Milestone Content -->
    <div v-else-if="milestone" class="milestone-content">
      <!-- Header -->
      <div class="milestone-header">
        <div class="breadcrumb">
          <a href="#" class="breadcrumb-link" @click.prevent="goBack">
            ← Volver a mis hitos
          </a>
        </div>

        <div class="header-main">
          <div class="title-section">
            <h1 class="milestone-title">{{ milestone.title }}</h1>
            <div class="milestone-meta">
              <span class="status-badge" :class="getStatusClass(milestoneStatus)">
                {{ getStatusText(milestoneStatus) }}
              </span>
              <span class="due-date" :class="{ 'overdue': isOverdue }">
                <i class="pi pi-calendar"></i>
                Fecha de Vencimiento: {{ formatDate(milestone.dueDate) }}
                <span v-if="daysRemaining !== null" class="days-remaining">
                  ({{ isOverdue ? Math.abs(daysRemaining) + ' días de retraso' : daysRemaining + ' días restantes' }})
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="milestone-main-content">
        <!-- Left Column - Main Details -->
        <div class="main-details">
          <!-- Descripción -->
          <section class="detail-section">
            <h2 class="section-title">
              <i class="pi pi-file"></i>
              Descripción
            </h2>
            <div class="description-content">
              <p>{{ milestone.description || 'No hay descripción disponible' }}</p>
            </div>
          </section>

          <!-- Herramientas -->
          <section v-if="milestone.tools && milestone.tools.length > 0" class="detail-section">
            <h2 class="section-title">
              <i class="pi pi-wrench"></i>
              Herramientas
            </h2>
            <div class="tools-list">
              <div
                  v-for="(tool, index) in milestone.tools"
                  :key="index"
                  class="tool-item"
              >
                <i class="pi pi-check-circle tool-icon"></i>
                <span class="tool-name">{{ tool }}</span>
              </div>
            </div>
          </section>

          <!-- Comentario General -->
          <section v-if="milestone.generalComment" class="detail-section">
            <h2 class="section-title">
              <i class="pi pi-comment"></i>
              Comentario General del Hito
            </h2>
            <div class="comment-content">
              <div class="comment-bubble">
                <p>{{ milestone.generalComment }}</p>
              </div>
            </div>
          </section>

          <!-- Archivos Adjuntos -->
          <section v-if="milestone.attachments && milestone.attachments.length > 0" class="detail-section">
            <h2 class="section-title">
              <i class="pi pi-paperclip"></i>
              Archivos Adjuntos
            </h2>
            <div class="attachments-grid">
              <div
                  v-for="attachment in milestone.attachments"
                  :key="attachment.id"
                  class="attachment-card"
                  @click="viewAttachment(attachment)"
              >
                <div class="attachment-icon">
                  <i :class="attachment.icon || 'pi pi-file'"></i>
                </div>
                <div class="attachment-info">
                  <span class="attachment-name">{{ attachment.name }}</span>
                  <span class="attachment-type">{{ attachment.type === 'link' ? 'Enlace' : 'Archivo' }}</span>
                </div>
                <pv-button
                    icon="pi pi-download"
                    class="p-button-text p-button-sm download-btn"
                    @click.stop="downloadAttachment(attachment)"
                />
              </div>
            </div>
          </section>
        </div>

        <!-- Right Column - Tasks -->
        <div class="tasks-sidebar">
          <section class="tasks-section">
            <h2 class="section-title">
              <i class="pi pi-list-check"></i>
              Tareas del Hito
            </h2>

            <div v-if="!milestone.milestoneTasks || milestone.milestoneTasks.length === 0" class="empty-tasks">
              <i class="pi pi-inbox empty-icon"></i>
              <p>No hay tareas asignadas en este hito</p>
            </div>

            <div v-else class="tasks-list">
              <div
                  v-for="task in milestone.milestoneTasks"
                  :key="task.id"
                  class="task-card"
                  :class="getTaskStatusClass(task.status)"
              >
                <div class="task-header">
                  <h3 class="task-title">{{ task.title }}</h3>
                  <span class="task-status" :class="getTaskStatusClass(task.status)">
                    {{ getTaskStatusText(task.status) }}
                  </span>
                </div>

                <div v-if="task.description" class="task-description">
                  <p>{{ task.description }}</p>
                </div>

                <div class="task-assignee">
                  <div class="assignee-info">
                    <div class="user-avatar">
                      {{ getInitials(task.assignedToName) }}
                    </div>
                    <div class="user-details">
                      <span class="user-name">{{ task.assignedToName }}</span>
                      <span class="user-role">Colaborador</span>
                    </div>
                  </div>
                </div>

                <div class="task-progress">
                  <div class="progress-info">
                    <span class="progress-text">Progreso: {{ task.progress }}%</span>
                    <div class="progress-bar">
                      <div
                          class="progress-fill"
                          :class="getTaskStatusClass(task.status)"
                          :style="{ width: task.progress + '%' }"
                      ></div>
                    </div>
                  </div>
                </div>

                <div class="task-actions">
                  <pv-button
                      v-if="shouldShowViewTask(task)"
                      label="Ver Tarea"
                      icon="pi pi-eye"
                      severity="secondary"
                      outlined
                      @click="viewTask(task)"
                      class="view-task-btn"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-content">
        <i class="pi pi-flag empty-icon"></i>
        <h3>Hito no encontrado</h3>
        <p>El hito que buscas no existe o no tienes permisos para verlo.</p>
        <pv-button
            label="Volver a mis hitos"
            @click="goBack"
            class="go-back-btn"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.milestone-detail-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 80vh;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
  color: var(--color-gray-600);
}

/* Breadcrumb */
.breadcrumb {
  margin-bottom: 1.5rem;
}

.breadcrumb-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: var(--color-primary-600);
  text-decoration: underline;
}

/* Header */
.milestone-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.milestone-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.milestone-meta {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-completed {
  background: #d1fae5;
  color: #065f46;
}

.status-overdue {
  background: #fee2e2;
  color: #dc2626;
}

.due-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-weight: 500;
}

.due-date.overdue {
  color: #dc2626;
}

.days-remaining {
  font-weight: 600;
}

/* Main Content Layout */
.milestone-main-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.main-details {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.tasks-sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Detail Sections */
.detail-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Description */
.description-content p {
  line-height: 1.6;
  color: #4b5563;
  margin: 0;
  font-size: 1rem;
}

/* Tools */
.tools-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tool-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.tool-icon {
  color: var(--color-green-500);
}

.tool-name {
  color: #374151;
  font-weight: 500;
}

/* Comment */
.comment-bubble {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  border-left: 4px solid var(--color-primary);
}

.comment-bubble p {
  line-height: 1.6;
  color: #4b5563;
  margin: 0;
  font-style: italic;
}

/* Attachments */
.attachments-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.attachment-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s ease;
}

.attachment-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.attachment-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.attachment-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.attachment-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.attachment-type {
  color: #6b7280;
  font-size: 0.875rem;
}

.download-btn {
  color: var(--color-primary);
}

/* Tasks Section */
.tasks-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.empty-tasks {
  text-align: center;
  padding: 2rem 1rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 3rem;
  color: #d1d5db;
  margin-bottom: 1rem;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.task-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  color: #1f2937;
  margin: 0;
  flex: 1;
}

.task-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.task-status-pending {
  background: #fef3c7;
  color: #92400e;
}

.task-status-in_progress {
  background: #dbeafe;
  color: #1e40af;
}

.task-status-completed {
  background: #d1fae5;
  color: #065f46;
}

.task-description {
  margin-bottom: 1rem;
}

.task-description p {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
}

.task-assignee {
  margin-bottom: 1rem;
}

.assignee-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.75rem;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
}

.user-role {
  color: #6b7280;
  font-size: 0.75rem;
}

.task-progress {
  margin-bottom: 1rem;
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-text {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.progress-bar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-fill.task-status-pending {
  background: #f59e0b;
}

.progress-fill.task-status-in_progress {
  background: #3b82f6;
}

.progress-fill.task-status-completed {
  background: #10b981;
}

.task-actions {
  display: flex;
  justify-content: flex-end;
}

/* Empty State */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 2rem;
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
@media (max-width: 1024px) {
  .milestone-main-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .milestone-detail-container {
    padding: 1rem;
  }

  .milestone-title {
    font-size: 1.75rem;
  }

  .milestone-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .task-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .task-status {
    align-self: flex-start;
  }
}

@media (max-width: 480px) {
  .attachment-card {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .attachment-info {
    align-items: center;
  }
}

/* Button Styles */
:deep(.view-task-btn.p-button) {
  background: white;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

:deep(.view-task-btn.p-button:hover) {
  background: var(--color-primary);
  color: white;
}

:deep(.go-back-btn.p-button) {
  background: var(--color-primary);
  color: white;
  border: 1px solid var(--color-primary);
}
</style>