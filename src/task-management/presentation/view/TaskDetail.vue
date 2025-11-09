<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTaskStore } from '../../application/task-store.js'
import { useProjectDetailStore } from '../../../projects/application/project-detail.store.js'

const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()
const projectDetailStore = useProjectDetailStore()

const task = ref(null)
const loading = ref(false)

// Computed
const isOverdue = computed(() => {
  if (!task.value?.dueDate) return false
  return new Date(task.value.dueDate) < new Date()
})

const daysRemaining = computed(() => {
  if (!task.value?.dueDate) return null

  const today = new Date()
  const due = new Date(task.value.dueDate)
  const diffTime = due - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
})

const goBack = () => {
  router.go(-1)
}

// Métodos de formato y utilidad
const getStatusText = (status) => {
  const statusMap = {
    'pending': 'Pendiente',
    'in_progress': 'En Progreso',
    'completed': 'Completado',
    'retrasado': 'Retrasado'
  }
  return statusMap[status] || status
}

const getStatusClass = (status) => {
  return `status-${status}`
}

const getPriorityText = (priority) => {
  const priorityMap = {
    'low': 'Baja',
    'medium': 'Media',
    'high': 'Alta',
    'urgent': 'Urgente'
  }
  return priorityMap[priority] || priority
}

const getPriorityClass = (priority) => {
  return `priority-${priority}`
}

const formatDate = (dateString) => {
  if (!dateString) return 'No especificada'
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDueDate = (dueDate) => {
  if (!dueDate) return 'Sin fecha de entrega'

  const today = new Date()
  const due = new Date(dueDate)
  const diffTime = due - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Mañana'
  if (diffDays === -1) return 'Ayer'
  if (diffDays < 0) return `Hace ${Math.abs(diffDays)} días`
  return `En ${diffDays} días`
}

const getDueDateClass = (dueDate) => {
  if (!dueDate) return ''

  const today = new Date()
  const due = new Date(dueDate)
  const diffTime = due - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'overdue'
  if (diffDays <= 3) return 'urgent'
  return ''
}

const getInitials = (name) => {
  if (!name) return '??'
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const getEntrepreneurName = () => {
  return projectDetailStore.project?.authorName || 'Emprendedor'
}

// Métodos de acciones
const toggleChecklistItem = async (itemId) => {
  try {
    console.log('🔄 Toggle checklist item:', itemId);

    // ✅ LLAMAR AL BACKEND para toggle
    await taskStore.toggleChecklistItem(
        route.params.projectId,
        task.value.id,
        itemId
    );

    // ✅ RECARGAR la tarea completa para obtener datos actualizados
    const updatedTask = await taskStore.loadTask(
        route.params.projectId,
        route.params.taskId
    );
    task.value = updatedTask;

    console.log('✅ Checklist item toggled successfully');

  } catch (error) {
    console.error('Error actualizando checklist:', error);
  }
}


const toggleTool = async (toolId) => {
  try {
    console.log('🔄 Toggle tool:', toolId);

    // ✅ LLAMAR AL BACKEND para toggle
    await taskStore.toggleTaskTool(
        route.params.projectId,
        task.value.id,
        toolId
    );

    // ✅ RECARGAR la tarea completa
    const updatedTask = await taskStore.loadTask(
        route.params.projectId,
        route.params.taskId
    );
    task.value = updatedTask;

    console.log('✅ Tool toggled successfully');

  } catch (error) {
    console.error('Error actualizando herramienta:', error);
  }
}

const downloadAttachment = (attachment) => {
  if (attachment.url) {
    window.open(attachment.url, '_blank')
  } else {
    console.warn('No hay URL para descargar el archivo')
  }
}

const viewAttachment = (attachment) => {
  if (attachment.url) {
    window.open(attachment.url, '_blank')
  }
}

// Cargar datos
onMounted(async () => {
  try {
    loading.value = true

    // Primero cargar el proyecto si no está cargado
    if (!projectDetailStore.project) {
      await projectDetailStore.loadProjectDetail(route.params.projectId)
    }

    // Cargar la tarea específica
    const taskData = await taskStore.loadTask(
        route.params.projectId,
        route.params.taskId
    )
    task.value = taskData

    console.log('✅ Tarea cargada:', task.value)
    console.log('📋 Proyecto:', projectDetailStore.project)
    console.log('📋 Checklist recibido:', task.value.checklist);
    console.log('🛠️ Tools recibidos:', task.value.tools);
    console.log('📎 Attachments recibidos:', task.value.attachments);

  } catch (error) {
    console.error('Error cargando tarea:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="task-detail-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <pv-progress-spinner />
      <span>Cargando tarea...</span>
    </div>

    <!-- Task Content -->
    <div v-else-if="task" class="task-content">
      <!-- Header de la tarea -->
      <div class="task-header">
        <div class="task-title-section">
          <div class="breadcrumb">
            <a
                href="#"
                class="breadcrumb-link"
                @click.prevent="goBack"
            >
              ← Volver a tareas
            </a>
          </div>
          <h1 class="task-title">{{ task.title }}</h1>
          <div class="task-meta">
            <span class="task-status" :class="getStatusClass(task.status)">
              {{ getStatusText(task.status) }}
            </span>
            <span class="task-priority" :class="getPriorityClass(task.priority)">
              {{ getPriorityText(task.priority) }}
            </span>
            <span class="task-due-date" :class="getDueDateClass(task.dueDate)">
              <i class="pi pi-calendar"></i>
              {{ formatDueDate(task.dueDate) }}
              <span v-if="daysRemaining !== null && !task.completed" class="days-remaining">
                ({{ isOverdue ? Math.abs(daysRemaining) + ' días de retraso' : daysRemaining + ' días restantes' }})
              </span>
            </span>
          </div>
        </div>
      </div>

      <!-- Información principal -->
      <div class="task-main-content">
        <!-- Columna izquierda - Detalles principales -->
        <div class="main-details">
          <!-- Descripción -->
          <div class="detail-section">
            <h3 class="section-title">
              <i class="pi pi-file"></i>
              Descripción
            </h3>
            <div class="description-content">
              <p>{{ task.description || 'No hay descripción disponible' }}</p>
            </div>
          </div>

          <!-- Checklist -->
          <div class="detail-section" v-if="task.checklist && task.checklist.length > 0">
            <h3 class="section-title">
              <i class="pi pi-check-circle"></i>
              Checklist
            </h3>
            <div class="checklist-items">
              <div
                  v-for="item in task.checklist"
                  :key="item.id"
                  class="checklist-item"
                  :class="{ completed: item.completed }"
              >
                <pv-checkbox
                    v-model="item.completed"
                    :binary="true"
                    @change="toggleChecklistItem(item.id)"
                />
                <span class="checklist-text">{{ item.text }}</span>
              </div>
            </div>
          </div>

          <!-- Comentario del emprendedor -->
          <div class="detail-section" v-if="task.comment">
            <h3 class="section-title">
              <i class="pi pi-comment"></i>
              Comentario del Emprendedor
            </h3>
            <div class="comment-content">
              <div class="comment-header">
                <div class="comment-author-info">
                  <div class="author-avatar">
                    {{ getInitials(getEntrepreneurName()) }}
                  </div>
                  <div class="author-details">
                    <span class="comment-author">{{ getEntrepreneurName() }}</span>
                    <span class="comment-role">Emprendedor del Proyecto</span>
                  </div>
                </div>
                <span class="comment-date">{{ formatDate(task.updatedAt) }}</span>
              </div>
              <p class="comment-text">{{ task.comment }}</p>
            </div>
          </div>

          <!-- Archivos adjuntos del emprendedor -->
          <div class="detail-section" v-if="task.attachments && task.attachments.length > 0">
            <h3 class="section-title">
              <i class="pi pi-paperclip"></i>
              Archivos Adjuntos del Emprendedor
            </h3>
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
                  <span class="attachment-date">{{ formatDate(attachment.uploadedAt) }}</span>
                </div>
                <pv-button
                    icon="pi pi-download"
                    class="p-button-text p-button-sm download-btn"
                    @click.stop="downloadAttachment(attachment)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Columna derecha - Información adicional -->
        <div class="sidebar-details">
          <!-- Información de asignación -->
          <div class="detail-card">
            <h4 class="card-title">
              <i class="pi pi-user"></i>
              Asignado a
            </h4>
            <div class="assigned-info">
              <div class="user-avatar">
                {{ getInitials(task.assignedToName) }}
              </div>
              <div class="user-details">
                <span class="user-name">{{ task.assignedToName }}</span>
              </div>
            </div>
          </div>

          <!-- Información del proyecto -->
          <div class="detail-card">
            <h4 class="card-title">
              <i class="pi pi-briefcase"></i>
              Proyecto
            </h4>
            <div class="project-info">
              <span class="project-name">{{ projectDetailStore.project?.title }}</span>
              <span class="project-entrepreneur">por {{ getEntrepreneurName() }}</span>
            </div>
          </div>

          <!-- Fechas -->
          <div class="detail-card">
            <h4 class="card-title">
              <i class="pi pi-clock"></i>
              Fechas
            </h4>
            <div class="date-info">
              <div class="date-item">
                <span class="date-label">Fecha de entrega:</span>
                <span class="date-value" :class="getDueDateClass(task.dueDate)">
                  {{ formatDate(task.dueDate) }}
                </span>
              </div>
              <div class="date-item">
                <span class="date-label">Creada:</span>
                <span class="date-value">{{ formatDate(task.createdAt) }}</span>
              </div>
            </div>
          </div>

          <!-- Herramientas -->
          <div class="detail-card" v-if="task.tools && task.tools.length > 0">
            <h4 class="card-title">
              <i class="pi pi-wrench"></i>
              Herramientas
            </h4>
            <div class="tools-list">
              <div
                  v-for="tool in task.tools"
                  :key="tool.id"
                  class="tool-item"
              >
                <pv-checkbox
                    v-model="tool.checked"
                    :binary="true"
                    @change="toggleTool(tool.id)"
                />
                <span class="tool-name">{{ tool.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.task-detail-container {
  padding: 2rem;
  max-width: 1200px;
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
  margin-bottom: 1rem;
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

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-gray-300, #e5e7eb);
}

.task-title-section {
  flex: 1;
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
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.task-status,
.task-priority,
.task-due-date {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Estados */
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

.status-retrasado {
  background: #fee2e2;
  color: #991b1b;
}

/* Prioridades */
.priority-low {
  background: #f3f4f6;
  color: var(--color-gray-900, #374151);
}

.priority-medium {
  background: #fef3c7;
  color: #92400e;
}

.priority-high {
  background: #fecaca;
  color: #991b1b;
}

.priority-urgent {
  background: #fee2e2;
  color: #dc2626;
  animation: pulse 2s infinite;
}

/* Fechas */
.task-due-date.overdue {
  background: #fee2e2;
  color: #991b1b;
}

.task-due-date.urgent {
  background: #fef3c7;
  color: #92400e;
}

.days-remaining {
  font-weight: 500;
  font-size: 0.8em;
}

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

.sidebar-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-section {
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

.description-content p {
  line-height: 1.6;
  color: #4b5563;
  margin: 0;
  font-size: 1rem;
}

.checklist-items {
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

.checklist-item:hover {
  border-color: var(--color-primary);
}

.checklist-item.completed {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.checklist-item.completed .checklist-text {
  text-decoration: line-through;
  color: #9ca3af;
}

.checklist-text {
  flex: 1;
  color: var(--color-gray-900, #374151);
  font-weight: 500;
}

.comment-content {
  background: var(--color-white, #FFFFFF);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--color-gray-300, #e5e7eb);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.comment-author-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-white, #FFFFFF);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.comment-author {
  font-weight: 600;
  color: #1f2937;
}

.comment-role {
  color: #6b7280;
  font-size: 0.875rem;
}

.comment-date {
  color: #6b7280;
  font-size: 0.875rem;
}

.comment-text {
  line-height: 1.6;
  color: #4b5563;
  margin: 0;
  font-size: 1rem;
  background: var(--color-gray-50, #f8f9fa);
  padding: 1rem;
  border-radius: 6px;
  border-left: 4px solid var(--color-primary);
}

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

.attachment-date {
  color: #6b7280;
  font-size: 0.875rem;
}

.download-btn {
  color: var(--color-primary);
}

.detail-card {
  background: var(--color-gray-50, #f8f9fa);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--color-gray-300, #e5e7eb);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.assigned-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-white, #FFFFFF);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: #1f2937;
}

.user-role {
  color: #6b7280;
  font-size: 0.875rem;
}

.project-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.project-name {
  font-weight: 600;
  color: #1f2937;
}

.project-entrepreneur {
  color: #6b7280;
  font-size: 0.875rem;
}

.date-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.date-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date-label {
  color: #6b7280;
  font-size: 0.875rem;
}

.date-value {
  font-weight: 500;
  color: var(--color-gray-900, #374151);
}

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
  background: var(--color-white, #FFFFFF);
  border-radius: 6px;
  border: 1px solid var(--color-gray-300, #e5e7eb);
}

.tool-name {
  flex: 1;
  color: var(--color-gray-900, #374151);
  font-weight: 500;
}

/* Empty State */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-content {
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

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .task-detail-container {
    padding: 1rem;
  }

  .task-header {
    flex-direction: column;
    gap: 1rem;
  }

  .task-title {
    font-size: 1.5rem;
  }

  .task-main-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .task-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .comment-header {
    flex-direction: column;
    gap: 0.5rem;
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
</style>