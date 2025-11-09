<!-- milestones-management/presentation/views/MilestoneTaskDetailView.vue -->
<script setup>
import { ref, computed, onMounted } from 'vue';
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
const task = ref(null);
const milestone = ref(null);
const project = ref(null);
const taskSubmission = ref(null);

// Computed properties
const isOverdue = computed(() => {
  if (!task.value?.dueDate || task.value.status === 'completed') return false;
  return new Date(task.value.dueDate) < new Date();
});

const daysRemaining = computed(() => {
  if (!task.value?.dueDate || task.value.status === 'completed') return null;

  const today = new Date();
  const due = new Date(task.value.dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
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
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusText = (status) => {
  const statusMap = {
    'pending': 'Pendiente',
    'in_progress': 'En Progreso',
    'completed': 'Completada'
  };
  return statusMap[status] || status;
};

const getStatusClass = (status) => {
  return `status-${status}`;
};

const getInitials = (name) => {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
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

// Navegación
const goBack = () => {
  router.go(-1);
};

const goToMilestoneDetail = () => {
  const { projectId, milestoneId } = route.params;
  router.push({
    name: 'milestone-detail',
    params: { projectId, milestoneId }
  });
};

// Cargar datos
const loadTaskData = async () => {
  try {
    loading.value = true;

    const { projectId, milestoneId, taskId } = route.params;

    // Cargar proyecto si no está cargado
    if (!projectDetailStore.project) {
      await projectDetailStore.loadProjectDetail(projectId);
    }
    project.value = projectDetailStore.project;

    // Cargar milestone específico
    await milestonesStore.loadMilestone(projectId, milestoneId);
    milestone.value = milestonesStore.currentMilestone;

    if (!milestone.value) {
      throw new Error('Milestone no encontrado');
    }

    // Buscar la tarea específica
    const foundTask = milestone.value.milestoneTasks.find(t => t.id === taskId);
    if (!foundTask) {
      throw new Error('Tarea no encontrada');
    }
    task.value = foundTask;

    // Cargar submission si existe
    await submissionStore.loadSubmissionsByProject(projectId);
    taskSubmission.value = submissionStore.getSubmissionByMilestoneTaskId(taskId);

    console.log('✅ Tarea cargada:', task.value);
    console.log('✅ Submission encontrado:', taskSubmission.value);

  } catch (error) {
    console.error('Error cargando tarea:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await loadTaskData();
});
</script>

<template>
  <div class="milestone-task-detail-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <pv-progress-spinner />
      <span>Cargando tarea...</span>
    </div>

    <!-- Task Content -->
    <div v-else-if="task" class="task-content">
      <!-- Header -->
      <div class="task-header">
        <div class="breadcrumb">
          <a href="#" class="breadcrumb-link" @click.prevent="goBack">
            ← Volver
          </a>
        </div>

        <div class="header-main">
          <div class="title-section">
            <h1 class="task-title">{{ task.title }}</h1>
            <div class="task-meta">
              <span class="status-badge" :class="getStatusClass(task.status)">
                {{ getStatusText(task.status) }}
              </span>
              <span class="due-date" :class="{ 'overdue': isOverdue }">
                <i class="pi pi-calendar"></i>
                Fecha de Vencimiento: {{ formatDate(task.dueDate) }}
                <span v-if="daysRemaining !== null" class="days-remaining">
                  ({{ isOverdue ? Math.abs(daysRemaining) + ' días de retraso' : daysRemaining + ' días restantes' }})
                </span>
              </span>
              <span class="progress-info">
                <i class="pi pi-chart-line"></i>
                Progreso: {{ task.progress }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="task-main-content">
        <!-- Left Column - Task Details -->
        <div class="main-details">
          <!-- Descripción -->
          <section class="detail-section">
            <h2 class="section-title">
              <i class="pi pi-file"></i>
              Descripción de la Tarea
            </h2>
            <div class="description-content">
              <p>{{ task.description || 'No hay descripción disponible' }}</p>
            </div>
          </section>

          <!-- Checklist -->
          <section v-if="task.checklist && task.checklist.length > 0" class="detail-section">
            <h2 class="section-title">
              <i class="pi pi-list-check"></i>
              Checklist
            </h2>
            <div class="checklist">
              <div
                  v-for="(item) in task.checklist"
                  :key="item.id"
                  class="checklist-item"
                  :class="{ 'completed': item.completed }"
              >
                <div class="checklist-checkbox">
                  <i
                      class="pi"
                      :class="item.completed ? 'pi-check-circle completed' : 'pi-circle'"
                  ></i>
                </div>
                <span class="checklist-text">{{ item.text }}</span>
              </div>
            </div>
          </section>

          <!-- Comentarios de la Tarea -->
          <section v-if="task.comment" class="detail-section">
            <h2 class="section-title">
              <i class="pi pi-comment"></i>
              Comentarios
            </h2>
            <div class="comment-content">
              <div class="comment-bubble">
                <p>{{ task.comment }}</p>
              </div>
            </div>
          </section>

          <!-- Archivos Adjuntos de la Tarea -->
          <section v-if="task.attachments && task.attachments.length > 0" class="detail-section">
            <h2 class="section-title">
              <i class="pi pi-paperclip"></i>
              Archivos Adjuntos de la Tarea
            </h2>
            <div class="attachments-grid">
              <div
                  v-for="attachment in task.attachments"
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

        <!-- Right Column - Task Info & Submission -->
        <div class="task-sidebar">
          <!-- Información del Asignado -->
          <section class="info-section">
            <h2 class="section-title">
              <i class="pi pi-user"></i>
              Asignado a
            </h2>
            <div class="assignee-info">
              <div class="user-avatar large">
                {{ getInitials(task.assignedToName) }}
              </div>
              <div class="user-details">
                <span class="user-name">{{ task.assignedToName }}</span>
                <span class="user-role">Colaborador</span>
              </div>
            </div>
          </section>

          <!-- Información del Hito -->

          <!-- Información de Envío -->
          <section v-if="taskSubmission" class="info-section">
            <h2 class="section-title">
              <i class="pi pi-send"></i>
              Envío Realizado
            </h2>
            <div class="submission-info">
              <div class="submission-meta">
                <span class="submission-date">
                  <i class="pi pi-clock"></i>
                  Enviado: {{ formatFullDate(taskSubmission.submittedAt) }}
                </span>
              </div>

              <div v-if="taskSubmission.notes" class="submission-notes">
                <h4>Notas del envío:</h4>
                <p>{{ taskSubmission.notes }}</p>
              </div>

              <div v-if="taskSubmission.links && taskSubmission.links.length > 0" class="submission-links">
                <h4>Enlaces enviados:</h4>
                <div class="links-list">
                  <a
                      v-for="(link, index) in taskSubmission.links"
                      :key="index"
                      :href="link"
                      target="_blank"
                      class="submission-link"
                  >
                    <i class="pi pi-external-link"></i>
                    {{ link }}
                  </a>
                </div>
              </div>

              <div v-if="taskSubmission.attachments && taskSubmission.attachments.length > 0" class="submission-attachments">
                <h4>Archivos enviados:</h4>
                <div class="attachments-list">
                  <div
                      v-for="attachment in taskSubmission.attachments"
                      :key="attachment.id"
                      class="submission-attachment"
                      @click="viewAttachment(attachment)"
                  >
                    <i :class="attachment.type === 'link' ? 'pi pi-link' : 'pi pi-file'"></i>
                    <span>{{ attachment.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section v-else class="info-section">
            <h2 class="section-title">
              <i class="pi pi-info-circle"></i>
              Estado del Envío
            </h2>
            <div class="no-submission">
              <i class="pi pi-inbox no-submission-icon"></i>
              <p>No se ha enviado esta tarea aún</p>
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-content">
        <i class="pi pi-exclamation-circle empty-icon"></i>
        <h3>Tarea no encontrada</h3>
        <p>La tarea que buscas no existe o no tienes permisos para verla.</p>
        <pv-button
            label="Volver"
            @click="goBack"
            class="go-back-btn"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.milestone-task-detail-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background: var(--color-white, #FFFFFF);
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.breadcrumb-separator {
  color: var(--color-gray-400);
}

/* Header */
.task-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-gray-300, #e5e7eb);
}

.task-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.task-meta {
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

.status-in_progress {
  background: #dbeafe;
  color: #1e40af;
}

.status-completed {
  background: #d1fae5;
  color: #065f46;
}

.due-date, .progress-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-gray-900, #6b7280);
  font-weight: 500;
}

.due-date.overdue {
  color: #dc2626;
}

.days-remaining {
  font-weight: 600;
}

/* Main Content Layout */
.task-main-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.main-details {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.task-sidebar {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Detail Sections */
.detail-section, .info-section {
  background: var(--color-gray-50, #f8f9fa);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--color-gray-300, #e5e7eb);
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

/* Checklist */
.checklist {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--color-white, #FFFFFF);
  border-radius: 6px;
  border: 1px solid var(--color-gray-300, #e5e7eb);
  transition: all 0.2s ease;
}

.checklist-item.completed {
  background: #f0f9ff;
  border-color: #0ea5e9;
}

.checklist-checkbox {
  color: var(--color-gray-900, #6b7280);
}

.checklist-checkbox .completed {
  color: #10b981;
}

.checklist-text {
  color: var(--color-gray-900, #374151);
  flex: 1;
}

.checklist-item.completed .checklist-text {
  text-decoration: line-through;
  color: var(--color-gray-900, #6b7280);
}

/* Comment */
.comment-bubble {
  background: var(--color-white, #FFFFFF);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--color-gray-300, #e5e7eb);
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
  background: var(--color-white, #FFFFFF);
  border-radius: 8px;
  border: 1px solid var(--color-gray-300, #e5e7eb);
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
  color: var(--color-white, #FFFFFF);
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
  color: var(--color-gray-900, #6b7280);
  font-size: 0.875rem;
}

.download-btn {
  color: var(--color-primary);
}

/* Assignee Info */
.assignee-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar.large {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-white, #FFFFFF);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.25rem;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 1.125rem;
}

.user-role {
  color: var(--color-gray-900, #6b7280);
  font-size: 0.875rem;
}

/* Milestone Info */
.milestone-info {
  background: var(--color-white, #FFFFFF);
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid var(--color-gray-300, #e5e7eb);
}

.milestone-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.milestone-description {
  color: var(--color-gray-900, #6b7280);
  font-size: 0.875rem;
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

.milestone-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.milestone-status, .milestone-progress {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.milestone-progress {
  background: #e0f2fe;
  color: #0369a1;
}

/* Submission Info */
.submission-meta {
  margin-bottom: 1rem;
}

.submission-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-gray-900, #6b7280);
  font-size: 0.875rem;
}

.submission-notes, .submission-links, .submission-attachments {
  margin-bottom: 1rem;
}

.submission-notes h4, .submission-links h4, .submission-attachments h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-gray-900, #374151);
  margin: 0 0 0.5rem 0;
}

.submission-notes p {
  color: #4b5563;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
  background: var(--color-white, #FFFFFF);
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--color-gray-300, #e5e7eb);
}

.links-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.submission-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-primary);
  text-decoration: none;
  font-size: 0.875rem;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.submission-link:hover {
  background: #f3f4f6;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.submission-attachment {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--color-white, #FFFFFF);
  border-radius: 4px;
  border: 1px solid var(--color-gray-300, #e5e7eb);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.submission-attachment:hover {
  border-color: var(--color-primary);
}

.no-submission {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--color-gray-900, #6b7280);
}

.no-submission-icon {
  font-size: 3rem;
  color: #d1d5db;
  margin-bottom: 1rem;
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
  .task-main-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .milestone-task-detail-container {
    padding: 1rem;
  }

  .task-title {
    font-size: 1.75rem;
  }

  .task-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
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

  .assignee-info {
    flex-direction: column;
    text-align: center;
  }
}

/* Button Styles */
:deep(.go-back-btn.p-button) {
  background: var(--color-primary);
  color: var(--color-white, #FFFFFF);
  border: 1px solid var(--color-primary);
}
</style>