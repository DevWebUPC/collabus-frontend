<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTaskSubmissionStore } from '../../application/task-submission-store.js';
import { useTaskStore } from '../../application/task-store.js';
import { useProjectDetailStore } from '../../../projects/application/project-detail.store.js';

const route = useRoute();
const router = useRouter();
const taskSubmissionStore = useTaskSubmissionStore();
const taskStore = useTaskStore();
const projectDetailStore = useProjectDetailStore();

const submission = ref(null);
const task = ref(null);
const loading = ref(false);

// Cargar la submission y la tarea
const loadSubmissionData = async () => {
  try {
    loading.value = true;
    const taskId = route.params.taskId;
    const projectId = route.params.projectId;

    console.log('🔄 Cargando submission para tarea:', taskId);

    // ✅ PRIMERO: Limpiar el estado anterior
    taskSubmissionStore.currentSubmission = null;

    // ✅ Cargar submissions de la tarea específica
    await taskSubmissionStore.loadSubmissionsByTask(taskId);

    // ✅ USAR EL NUEVO MÉTODO para obtener la submission correcta
    submission.value = taskSubmissionStore.getSubmissionByTaskId(taskId);

    console.log('✅ Submission encontrada:', submission.value);

    // Si no hay submission, buscar por el método alternativo
    if (!submission.value && taskSubmissionStore.submissions.length > 0) {
      submission.value = taskSubmissionStore.submissions.find(
          sub => sub.taskId === taskId.toString()
      );
    }

    // Cargar detalles de la tarea
    await taskStore.loadTask(projectId, taskId);
    task.value = taskStore.currentTask;
    console.log('✅ Tarea cargada:', task.value);

  } catch (error) {
    console.error('❌ Error cargando submission:', error);
    alert('Error al cargar la entrega de la tarea');
  } finally {
    loading.value = false;
  }
};

watch(
    () => route.params.taskId,
    async (newTaskId, oldTaskId) => {
      if (newTaskId && newTaskId !== oldTaskId) {
        await loadSubmissionData();
      }
    }
);
// Obtener información del colaborador
const collaboratorInfo = computed(() => {
  if (!task.value || !submission.value) return null;

  const collaborator = projectDetailStore.project?.collaborators?.find(
      collab => collab.applicantId === submission.value.collaboratorId
  );

  return collaborator || { name: 'Colaborador' };
});


// Formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return 'No especificada';
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Verificar si es emprendedor (dueño del proyecto)
const isProjectOwner = computed(() => {
  return projectDetailStore.isOwned;
});

// Aprovar la entrega
const approveSubmission = async () => {
  try {
    loading.value = true;

    // Aquí podrías implementar lógica adicional como:
    // - Añadir puntos al colaborador
    // - Marcar como revisado
    // - Notificar al colaborador

    alert('✅ Entrega aprobada correctamente');
    router.back();

  } catch (error) {
    console.error('❌ Error aprobando submission:', error);
    alert('Error al aprobar la entrega');
  } finally {
    loading.value = false;
  }
};

// Solicitar revisiones
const requestRevisions = async () => {
  const notes = prompt('¿Qué revisiones necesita el colaborador?');
  if (notes) {
    try {
      loading.value = true;
      // Aquí implementarías la lógica para solicitar revisiones
      alert('📝 Revisiones solicitadas al colaborador');
      router.back();
    } catch (error) {
      console.error('❌ Error solicitando revisiones:', error);
      alert('Error al solicitar revisiones');
    } finally {
      loading.value = false;
    }
  }
};

onMounted(async () => {
  await loadSubmissionData();
});
</script>

<template>
  <div class="task-submission-view">
    <!-- Header -->
    <div class="submission-header">
      <pv-button
          icon="pi pi-arrow-left"
          text
          @click="router.back()"
          class="back-btn"
      />
      <h1>Revisión de Entrega</h1>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <pv-progress-spinner />
      <span>Cargando entrega...</span>
    </div>

    <!-- Content -->
    <div v-else-if="submission && task" class="submission-content">

      <!-- Información General -->
      <div class="info-section">
        <h2>{{ task.title }}</h2>
        <p class="task-description">{{ task.description }}</p>

        <div class="info-grid">
          <div class="info-item">
            <strong>Colaborador:</strong>
            <span>{{ collaboratorInfo?.name || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <strong>Fecha de entrega:</strong>
            <span>{{ formatDate(submission.submittedAt) }}</span>
          </div>
          <div class="info-item">
            <strong>Estado:</strong>
            <span class="status-badge submitted">Entregado</span>
          </div>
        </div>
      </div>

      <!-- Notas del Colaborador -->
      <div v-if="submission.notes" class="notes-section">
        <h3>Notas del Colaborador</h3>
        <div class="notes-content">
          {{ submission.notes }}
        </div>
      </div>

      <!-- Enlaces -->
      <div v-if="submission.links && submission.links.length > 0" class="links-section">
        <h3>Enlaces de Entrega</h3>
        <div class="links-list">
          <div
              v-for="(link, index) in submission.links"
              :key="index"
              class="link-item"
          >
            <i class="pi pi-link"></i>
            <a :href="link.url" target="_blank" rel="noopener noreferrer">
              {{ link.url }}
            </a>
          </div>
        </div>
      </div>

      <!-- Archivos Adjuntos -->
      <div v-if="submission.attachments && submission.attachments.length > 0" class="attachments-section">
        <h3>Archivos Adjuntos</h3>
        <div class="attachments-list">
          <div
              v-for="attachment in submission.attachments"
              :key="attachment.id"
              class="attachment-item"
          >
            <i class="pi pi-file"></i>
            <span class="file-name">{{ attachment.name }}</span>
            <pv-button
                v-if="attachment.url"
                icon="pi pi-download"
                text
                @click="window.open(attachment.url, '_blank')"
                class="download-btn"
            />
          </div>
        </div>
      </div>

      <!-- Checklist de la Tarea (para referencia) -->
      <div v-if="task.checklist && task.checklist.length > 0" class="checklist-section">
        <h3>Checklist de la Tarea</h3>
        <div class="checklist">
          <div
              v-for="item in task.checklist"
              :key="item.id"
              class="checklist-item"
              :class="{ completed: item.completed }"
          >
            <i
                class="pi"
                :class="item.completed ? 'pi-check-circle' : 'pi-circle'"
            ></i>
            <span>{{ item.text }}</span>
          </div>
        </div>
      </div>

      <!-- Acciones para el Emprendedor -->
      <div v-if="isProjectOwner" class="actions-section">
        <h3>Acciones</h3>
        <div class="action-buttons">
          <pv-button
              label="Aprobar Entrega"
              icon="pi pi-check"
              severity="success"
              @click="approveSubmission"
              class="approve-btn"
          />
          <pv-button
              label="Solicitar Revisiones"
              icon="pi pi-refresh"
              severity="warning"
              @click="requestRevisions"
              class="revisions-btn"
          />
        </div>
      </div>

    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <i class="pi pi-inbox empty-icon"></i>
      <h3>No se encontró la entrega</h3>
      <p>La entrega de esta tarea no está disponible o no existe.</p>
      <pv-button
          label="Volver"
          @click="router.back()"
          class="back-button"
      />
    </div>
  </div>
</template>

<style scoped>
.task-submission-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.submission-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.submission-header h1 {
  margin: 0;
  color: var(--color-gray-800);
}

.back-btn {
  color: var(--color-primary);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
  color: var(--color-gray-600);
}

/* Content Sections */
.submission-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-section,
.notes-section,
.links-section,
.attachments-section,
.checklist-section,
.actions-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-section h2 {
  margin: 0 0 0.5rem 0;
  color: var(--color-gray-800);
}

.task-description {
  color: var(--color-gray-600);
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item strong {
  color: var(--color-gray-700);
  font-size: 0.875rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.submitted {
  background: #d1fae5;
  color: #059669;
}

/* Notes */
.notes-content {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid var(--color-primary);
  line-height: 1.5;
  color: var(--color-gray-700);
}

/* Links */
.links-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.link-item a {
  color: var(--color-primary);
  text-decoration: none;
  word-break: break-all;
}

.link-item a:hover {
  text-decoration: underline;
}

/* Attachments */
.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.file-name {
  flex: 1;
  color: var(--color-gray-700);
}

.download-btn {
  color: var(--color-primary);
}

/* Checklist */
.checklist {
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
}

.checklist-item.completed {
  background: #f0fdf4;
  color: #059669;
}

.checklist-item:not(.completed) {
  color: var(--color-gray-600);
}

/* Actions */
.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

:deep(.approve-btn.p-button) {
  background: var(--color-green-500);
  color: white;
  border: 1px solid var(--color-green-500);
}

:deep(.revisions-btn.p-button) {
  background: var(--color-orange-500);
  color: white;
  border: 1px solid var(--color-orange-500);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 4rem;
  color: var(--color-gray-300);
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  color: var(--color-gray-700);
  margin: 0 0 1rem 0;
}

.empty-state p {
  color: var(--color-gray-500);
  margin: 0 0 2rem 0;
}

/* Responsive */
@media (max-width: 768px) {
  .task-submission-view {
    padding: 0.5rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .p-button {
    width: 100%;
  }
}
</style>