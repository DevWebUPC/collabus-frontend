<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMilestonesStore } from '../../application/milestone-store.js';
import { useUserStore } from '../../../iam/application/user-store.js';
import { useMilestoneTaskSubmissionStore } from '../../application/milestone-task-submission-store.js';

const route = useRoute();
const router = useRouter();
const milestonesStore = useMilestonesStore();
const userStore = useUserStore();
const submissionStore = useMilestoneTaskSubmissionStore();

// Estado reactivo

const loading = ref(false);
const submitting = ref(false);
const milestone = ref(null);
const task = ref(null);
const submissionData = ref({
  files: [],
  links: [],
  notes: '',
  newLink: ''
});

// Obtener IDs de los parámetros
const projectId = computed(() => route.params.projectId);
const milestoneId = computed(() => route.query.milestone);
const taskId = computed(() => route.query.task);

// Computed: Obtener el ID normalizado del usuario
const normalizedUserId = computed(() => {
  const userId = userStore.currentUser?.id || localStorage.getItem("userId");
  return userId ? String(userId) : null;
});
const updateTaskStatus = async () => {
  try {
    console.log('🔄 Actualizando estado de la tarea a completado...');

    await milestonesStore.updateMilestoneTask(
        projectId.value,
        milestoneId.value,
        task.value.id,
        {
          status: 'completed',
          progress: 100,
          completedAt: new Date().toISOString()
        }
    );

    console.log('✅ Estado de la tarea actualizado a completado');
  } catch (error) {
    console.error('❌ Error actualizando estado de la tarea:', error);
    throw error;
  }
};

// Cargar datos del hito y tarea
const loadTaskData = async () => {
  try {
    loading.value = true;

    // Cargar el milestone específico
    await milestonesStore.loadMilestone(projectId.value, milestoneId.value);
    milestone.value = milestonesStore.currentMilestone;

    console.log('🔍 Buscando tarea:', {
      milestoneId: milestoneId.value,
      taskId: taskId.value,
      milestoneTasks: milestone.value?.milestoneTasks,
      normalizedTaskId: taskId.value ? String(taskId.value) : null
    });

    // Encontrar la tarea específica - CON NORMALIZACIÓN DE IDs
    if (milestone.value?.milestoneTasks) {
      const normalizedSearchId = taskId.value ? String(taskId.value) : null;

      task.value = milestone.value.milestoneTasks.find(t => {
        const normalizedTaskId = t.id ? String(t.id) : null;
        return normalizedTaskId === normalizedSearchId;
      });

      console.log('✅ Tarea encontrada:', task.value);

      // Verificar si el usuario está asignado a esta tarea
      if (task.value) {
        const taskUserId = task.value.assignedTo ? String(task.value.assignedTo) : null;
        const hasAccess = taskUserId === normalizedUserId.value;

        console.log('🔐 Verificación de acceso:', {
          taskUserId,
          normalizedUserId: normalizedUserId.value,
          hasAccess
        });

        if (!hasAccess) {
          console.warn('⚠️ Usuario no tiene acceso a esta tarea');
          task.value = null;
        }
      }
    }

  } catch (error) {
    console.error('❌ Error cargando tarea:', error);
  } finally {
    loading.value = false;
  }
};

// Manejar subida de archivos
const handleFileUpload = (event) => {
  const files = Array.from(event.target.files);
  submissionData.value.files = [...submissionData.value.files, ...files];
};

// Añadir enlace
const addLink = () => {
  if (submissionData.value.newLink && submissionData.value.newLink.trim()) {
    submissionData.value.links.push(submissionData.value.newLink.trim());
    submissionData.value.newLink = '';
  }
};

// Remover archivo
const removeFile = (index) => {
  submissionData.value.files.splice(index, 1);
};

// Remover enlace
const removeLink = (index) => {
  submissionData.value.links.splice(index, 1);
};

// Enviar la tarea
// Enviar la tarea
const submitTask = async () => {
  try {
    submitting.value = true;

    console.log('🚀 Iniciando envío de tarea...', {
      projectId: projectId.value,
      milestoneId: milestoneId.value,
      taskId: task.value?.id,
      collaboratorId: normalizedUserId.value,
      submissionData: submissionData.value
    });

    // Validaciones
    if (submissionData.value.files.length === 0 && submissionData.value.links.length === 0) {
      alert('❌ Debes agregar al menos un archivo o enlace para enviar la tarea');
      return;
    }

    // ✅ DEBUG: Verificar que todos los IDs estén presentes
    console.log('🔍 IDs para la submission:', {
      taskId: task.value.id,
      collaboratorId: normalizedUserId.value,
      milestoneId: milestoneId.value,
      projectId: projectId.value
    });

    // Crear la submission
    const submission = await submissionStore.createSubmissionFromForm(
        submissionData.value,
        task.value.id,
        normalizedUserId.value,
        milestoneId.value,
        projectId.value
    );

    console.log('✅ Submission creada exitosamente:', submission);

    // ✅ ACTUALIZAR: Marcar la tarea como completada
    await updateTaskStatus();

    // Mostrar mensaje de éxito
    alert('✅ Tarea enviada y marcada como completada exitosamente');

    // Redirigir de vuelta a la vista de tareas
    router.push({
      name: 'milestone-tasks',
      params: { projectId: projectId.value },
      query: { milestone: milestoneId.value }
    });

  } catch (error) {
    console.error('❌ Error completo en submitTask:', error);
    alert(`❌ Error al enviar la tarea: ${error.message}`);
  } finally {
    submitting.value = false;
  }
};

// Volver a la vista anterior
const goBack = () => {
  router.go(-1);
};

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

// Inicializar componente
onMounted(async () => {
  console.log('🔄 Inicializando MilestoneTaskSubmitView', {
    projectId: projectId.value,
    milestoneId: milestoneId.value,
    taskId: taskId.value,
    routeQuery: route.query
  });

  await loadTaskData();
});
</script>

<template>
  <div class="milestone-task-submit-view">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="back-navigation">
          <pv-button
              icon="pi pi-arrow-left"
              class="p-button-text p-button-secondary"
              @click="goBack"
              label="Volver a las tareas"
          />
        </div>

        <div class="header-main">
          <h1 class="page-title">
            <i class="pi pi-send mr-2"></i>
            Enviar Tarea
          </h1>
          <p class="page-subtitle" v-if="task">
            Tarea: <strong>{{ task.title }}</strong>
          </p>
        </div>

        <div class="header-actions"></div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <pv-progress-spinner />
      <span>Cargando tarea...</span>
    </div>

    <!-- Contenido Principal -->
    <div v-else-if="task" class="task-submit-content">
      <!-- Información de la Tarea -->
      <div class="task-info-card">
        <h2 class="task-info-title">Información de la Tarea</h2>
        <div class="task-info-content">
          <div class="task-info-row">
            <label>Título:</label>
            <span>{{ task.title }}</span>
          </div>
          <div class="task-info-row" v-if="task.description">
            <label>Descripción:</label>
            <span>{{ task.description }}</span>
          </div>
          <div class="task-info-row" v-if="task.dueDate">
            <label>Fecha de Vencimiento:</label>
            <span>{{ formatDate(task.dueDate) }} ({{ getDaysRemaining(task.dueDate) }} días restantes)</span>
          </div>
        </div>
      </div>

      <!-- Checklist -->
      <div class="checklist-section" v-if="task.checklist && task.checklist.length > 0">
        <h2 class="section-title">Checklist</h2>
        <div class="checklist-items">
          <div
              v-for="(item, index) in task.checklist"
              :key="index"
              class="checklist-item"
          >
            <pv-checkbox
                v-model="item.completed"
                :binary="true"
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

      <!-- Archivos Adjuntos de la Tarea -->
      <div class="task-attachments-section" v-if="task.attachments && task.attachments.length > 0">
        <h2 class="section-title">Archivos Adjuntos de la Tarea</h2>
        <div class="attachments-list">
          <div
              v-for="(attachment, index) in task.attachments"
              :key="index"
              class="attachment-item"
          >
            <i :class="attachment.icon || 'pi pi-file'"></i>
            <span class="attachment-name">{{ attachment.name }}</span>
            <pv-button
                icon="pi pi-download"
                class="p-button-text p-button-secondary"
                @click="() => window.open(attachment.url, '_blank')"
            />
          </div>
        </div>
      </div>

      <!-- Formulario de Entrega -->
      <div class="submission-form">
        <h2 class="section-title">Entrega de la Tarea</h2>

        <!-- Archivos de entrega -->
        <div class="form-section">
          <label class="form-label">Subir archivos</label>
          <div class="file-upload-area">
            <input
                type="file"
                multiple
                @change="handleFileUpload"
                class="file-input"
                id="fileUpload"
            />
            <label for="fileUpload" class="file-upload-label">
              <i class="pi pi-cloud-upload"></i>
              <span>Seleccionar archivos</span>
            </label>
          </div>
          <div class="file-list" v-if="submissionData.files.length > 0">
            <div
                v-for="(file, index) in submissionData.files"
                :key="index"
                class="file-item"
            >
              <i class="pi pi-file"></i>
              <span class="file-name">{{ file.name }}</span>
              <pv-button
                  icon="pi pi-times"
                  class="p-button-text p-button-danger"
                  @click="removeFile(index)"
              />
            </div>
          </div>
        </div>

        <!-- Enlaces de entrega -->
        <div class="form-section">
          <label class="form-label">Añadir enlaces</label>
          <div class="link-input-group">
            <pv-input-text
                v-model="submissionData.newLink"
                placeholder="https://example.com"
                @keypress.enter="addLink"
            />
            <pv-button
                label="Añadir"
                icon="pi pi-plus"
                class="p-button-outlined"
                @click="addLink"
            />
          </div>
          <div class="link-list" v-if="submissionData.links.length > 0">
            <div
                v-for="(link, index) in submissionData.links"
                :key="index"
                class="link-item"
            >
              <i class="pi pi-link"></i>
              <span class="link-url">{{ link }}</span>
              <pv-button
                  icon="pi pi-times"
                  class="p-button-text p-button-danger"
                  @click="removeLink(index)"
              />
            </div>
          </div>
        </div>

        <!-- Notas del colaborador -->
        <div class="form-section">
          <label class="form-label">Notas del colaborador</label>
          <pv-textarea
              v-model="submissionData.notes"
              rows="5"
              placeholder="Escribe respecto a tu avance..."
              class="notes-textarea"
          />
        </div>

        <!-- Botones de acción -->
        <div class="form-actions">
          <pv-button
              label="Enviar"
              icon="pi pi-send"
              class="p-button-primary"
              @click="submitTask"
              :loading="submitting"
              :disabled="submitting"
          />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-content">
        <i class="pi pi-exclamation-circle empty-icon"></i>
        <h3>Tarea no encontrada</h3>
        <p>La tarea que buscas no existe o no tienes acceso a ella.</p>
        <pv-button
            label="Volver a las tareas"
            @click="goBack"
            class="p-button-primary"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.milestone-task-submit-view {
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

/* Contenido Principal */
.task-submit-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Tarjeta de información de la tarea */
.task-info-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.task-info-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-gray-800);
  margin: 0 0 1rem 0;
}

.task-info-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.task-info-row {
  display: flex;
  align-items: flex-start;
}

.task-info-row label {
  font-weight: 600;
  color: var(--color-gray-700);
  min-width: 180px;
}

.task-info-row span {
  color: var(--color-gray-600);
  flex: 1;
}

/* Secciones */
.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-gray-800);
  margin: 0 0 1rem 0;
}

.checklist-section,
.task-attachments-section,
.submission-form {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

/* Checklist */
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
  border-radius: 6px;
  background: #f8fafc;
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

/* Archivos adjuntos */
.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 6px;
  background: #f8fafc;
}

.attachment-name {
  font-size: 0.875rem;
  color: var(--color-gray-700);
  flex: 1;
}

/* Formulario */
.form-section {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 600;
  color: var(--color-gray-700);
  margin-bottom: 0.5rem;
}

/* Subida de archivos */
.file-input {
  display: none;
}

.file-upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  transition: border-color 0.2s;
  cursor: pointer;
}

.file-upload-area:hover {
  border-color: #3b82f6;
}

.file-upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  cursor: pointer;
}

.file-upload-label i {
  font-size: 2rem;
  color: #9ca3af;
}

.file-list,
.link-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.file-item,
.link-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 6px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
}

.file-name,
.link-url {
  font-size: 0.875rem;
  color: var(--color-gray-700);
  flex: 1;
  word-break: break-all;
}

.link-input-group {
  display: flex;
  gap: 0.5rem;
}

.notes-textarea {
  width: 100%;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
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
    order: -1;
  }

  .header-actions {
    display: none;
  }

  .task-submit-content {
    padding: 1rem;
  }

  .task-info-row {
    flex-direction: column;
    gap: 0.25rem;
  }

  .task-info-row label {
    min-width: auto;
  }

  .form-actions {
    flex-direction: column;
  }

  .link-input-group {
    flex-direction: column;
  }
}
</style>