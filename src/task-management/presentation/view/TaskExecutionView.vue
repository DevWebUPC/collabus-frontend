<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTaskSubmissionStore } from '../../application/task-submission-store.js';
import { useUserStore } from '../../../iam/application/user-store.js';
import { useTaskStore } from '../../application/task-store.js';
import { useProjectDetailStore } from "../../../projects/application/project-detail.store.js";

const route = useRoute();
const router = useRouter();
const taskSubmissionStore = useTaskSubmissionStore();
const userStore = useUserStore();
const taskStore = useTaskStore();

const task = ref(null);
const links = ref(['']);
const attachments = ref([]);
const notes = ref('');
const loading = ref(false);

// ✅ VERIFICAR AUTENTICACIÓN AL INICIAR
const checkAuthentication = () => {
  userStore.initializeUser();

  if (!userStore.isAuthenticated) {
    console.warn('⚠️ Usuario no autenticado, redirigiendo...');
    router.push('/login');
    return false;
  }

  console.log('✅ Usuario autenticado:', userStore.currentUser);
  return true;
};

// Obtener checklist real de la tarea
const checklistItems = computed(() => {
  if (!task.value || !task.value.checklist) return [];
  return task.value.checklist.map(item => ({
    id: item.id,
    text: item.text,
    completed: item.completed || false
  }));
});

// ✅ FUNCIÓN MEJORADA PARA OBTENER COLLABORATOR ID
const getCollaboratorId = () => {
  if (!userStore.isAuthenticated) {
    console.error('❌ Usuario no autenticado en getCollaboratorId');
    return null;
  }

  const user = userStore.currentUser;
  console.log('🔍 Datos del usuario:', user);

  if (user?.id) return user.id;
  if (user?.userId) return user.userId;
  if (user?._id) return user._id;

  console.error('❌ No se pudo obtener collaboratorId del usuario:', user);
  return null;
};

// ✅ FUNCIÓN MEJORADA PARA MANEJAR CHECKLIST
const toggleChecklistItem = async (itemId) => {
  try {
    loading.value = true;

    if (!checkAuthentication()) return;

    const itemToUpdate = checklistItems.value.find(item => item.id === itemId);
    if (!itemToUpdate) {
      throw new Error('Checklist item not found');
    }

    // Crear checklist actualizada
    const updatedChecklist = checklistItems.value.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    console.log('🔄 Updating checklist:', updatedChecklist);

    await taskStore.updateTaskChecklist(
        route.params.projectId,
        task.value.id,
        updatedChecklist
    );

    // ✅ ACTUALIZAR PROGRESO AUTOMÁTICAMENTE
    await updateProgressAutomatically();

    console.log('✅ Checklist updated successfully');
  } catch (error) {
    console.error('❌ Error updating checklist:', error);
    alert('Error al actualizar la checklist: ' + error.message);
  } finally {
    loading.value = false;
  }
};

// ✅ NUEVA FUNCIÓN: ACTUALIZAR PROGRESO AUTOMÁTICAMENTE
const updateProgressAutomatically = async () => {
  try {
    const completedItems = checklistItems.value.filter(item => item.completed).length;
    const totalItems = checklistItems.value.length;
    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    console.log('🔄 Actualizando progreso automáticamente:', progress);

    await taskStore.updateTaskProgress(
        route.params.projectId,
        task.value.id,
        progress
    );

    // Recargar la tarea para obtener datos actualizados
    await loadTask();
  } catch (error) {
    console.error('❌ Error al actualizar progreso automático:', error);
  }
};

// ✅ NUEVA FUNCIÓN: CARGAR DATOS GUARDADOS PREVIAMENTE
const loadSavedSubmission = async () => {
  try {
    const taskId = route.params.taskId;
    const collaboratorId = getCollaboratorId();

    if (!collaboratorId) return;

    console.log('🔍 Buscando submission guardada para task:', taskId);

    // Cargar submissions de esta tarea
    await taskSubmissionStore.loadSubmissionsByTask(taskId);

    // Buscar submission existente
    const existingSubmission = taskSubmissionStore.getSubmissionByTaskAndCollaborator(taskId, collaboratorId);

    if (existingSubmission) {
      console.log('📦 Submission encontrada:', existingSubmission);

      // ✅ CARGAR DATOS GUARDADOS EN EL FORMULARIO
      if (existingSubmission.links && existingSubmission.links.length > 0) {
        links.value = [...existingSubmission.links];
      } else {
        links.value = [''];
      }

      if (existingSubmission.attachments && existingSubmission.attachments.length > 0) {
        attachments.value = [...existingSubmission.attachments];
      }

      if (existingSubmission.notes) {
        notes.value = existingSubmission.notes;
      }

      // ✅ MARCAR OPCIONES DE ENTREGA SI HAY DATOS
      if (existingSubmission.links && existingSubmission.links.length > 0) {
        deliveryOptions.value[1].completed = true;
      }

      if (existingSubmission.attachments && existingSubmission.attachments.length > 0) {
        deliveryOptions.value[0].completed = true;
      }

      console.log('✅ Datos guardados cargados en el formulario');
    } else {
      console.log('📭 No se encontró submission guardada');
    }
  } catch (error) {
    console.error('❌ Error al cargar submission guardada:', error);
  }
};

// Archivos a entregar
const deliveryOptions = ref([
  { id: 1, type: 'file', label: 'Subir archivo', completed: false },
  { id: 2, type: 'link', label: 'Añadir enlace', completed: false }
]);

// Agregar o quitar enlaces
const addLink = () => {
  links.value.push('');
};

const removeLink = (index) => {
  if (links.value.length > 1) {
    links.value.splice(index, 1);
  } else {
    links.value[index] = '';
  }
};

// Manejar archivos
const handleFileUpload = (event) => {
  const files = Array.from(event.files);
  files.forEach(file => {
    attachments.value.push({
      id: Date.now().toString(),
      name: file.name,
      type: file.type,
      file: file,
      url: URL.createObjectURL(file),
      size: file.size // ✅ AGREGAR TAMAÑO REAL DEL ARCHIVO
    });
  });
};

const removeAttachment = (index) => {
  attachments.value.splice(index, 1);
};

// ✅ FUNCIÓN MEJORADA PARA VOLVER
const goBack = () => {
  router.go(-1);
};

// Marcar como completado
const submitTask = async () => {
  const collaboratorId = getCollaboratorId();
  if (!collaboratorId) {
    alert('Usuario no autenticado. Por favor, inicie sesión nuevamente.');
    router.push('/login');
    return;
  }

  // Filtrar enlaces vacíos
  const nonEmptyLinks = links.value.filter(link => link.trim() !== '');

  if (nonEmptyLinks.length === 0 && attachments.value.length === 0) {
    alert('Debe agregar al menos un enlace o archivo');
    return;
  }

  const taskId = parseInt(route.params.taskId);
  const projectId = parseInt(route.params.projectId);

  // ✅ PREPARAR DATOS CON TAMAÑOS VÁLIDOS
  const submissionData = {
    taskId: taskId,
    collaboratorId: parseInt(collaboratorId),
    collaboratorName: userStore.currentUser?.fullName || 'Colaborador', // ✅ USAR fullName
    notes: notes.value || '',
    links: nonEmptyLinks.map(link => ({
      url: link,
      description: ''
    })),
    attachments: attachments.value.map(att => ({
      name: att.name || 'archivo',
      type: att.type || 'file',
      url: att.url || '',
      size: att.size > 0 ? att.size : 1024 // ✅ SI ES 0, USAR VALOR POR DEFECTO
    }))
  };

  console.log('📤 Datos a enviar al backend:', JSON.stringify(submissionData, null, 2));

  try {
    loading.value = true;

    console.log('🔄 Enviando submission para tarea:', taskId);

    // ✅ PRIMERO crear el submission
    await taskSubmissionStore.createSubmission(submissionData);

    // ✅ LUEGO marcar la tarea como completada
    console.log('🔄 Marcando tarea como completada:', { projectId, taskId });

    await taskStore.updateTaskStatus(
        projectId,
        taskId,
        'completed'
    );

    console.log('✅ Tarea marcada como completada correctamente');

    alert('Tarea enviada y marcada como completada correctamente');

    // ✅ REDIRIGIR a la vista anterior
    router.go(-1);

  } catch (error) {
    console.error('❌ Error al enviar la tarea:', error);

    if (error.response) {
      console.error('📋 Detalles del error:', error.response.data);
      alert(`Error al enviar la tarea: ${error.response.data.message || error.response.data}`);
    } else {
      alert('Error al enviar la tarea: ' + error.message);
    }
  } finally {
    loading.value = false;
  }
};// Cargar tarea real
const loadTask = async () => {
  try {
    loading.value = true;
    const projectId = route.params.projectId;
    const taskId = route.params.taskId;

    console.log(`🔍 Loading task ${taskId} from project ${projectId}`);

    if (!checkAuthentication()) return;

    console.log('🔄 Llamando a taskStore.loadTask...');
    await taskStore.loadTask(projectId, taskId);

    console.log('📋 taskStore.currentTask:', taskStore.currentTask);
    task.value = taskStore.currentTask;

    if (!task.value) {
      console.error('❌ Task not found in store');
      throw new Error('Task not found');
    }

    // ✅ CARGAR DATOS GUARDADOS DESPUÉS DE CARGAR LA TAREA
    await loadSavedSubmission();

    console.log('✅ Task loaded successfully:', task.value);
  } catch (error) {
    console.error('❌ Error loading task:', error);
    alert('Error al cargar la tarea: ' + error.message);
    router.back();
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  console.log('🚀 TaskExecutionView mounted');

  if (!checkAuthentication()) {
    return;
  }

  loadTask();
});
</script>

<template>
  <div class="task-execution-view">
    <!-- Header con botón volver -->
    <div class="header-section">
      <pv-button
          icon="pi pi-arrow-left"
          @click="goBack"
          text
          rounded
          severity="secondary"
          class="back-button"
      />
      <h1>Ejecución de Tarea</h1>
    </div>

    <!-- Información principal de la tarea -->
    <pv-card class="task-card">
      <template #title>
        <div class="task-title-section">
          <span class="task-title">{{ task?.title }}</span>
          <pv-tag
              :value="task?.status"
              :severity="task?.status === 'completed' ? 'success' : 'warning'"
              class="status-tag"
          />
        </div>
      </template>

      <template #content>
        <div class="task-content">
          <div class="task-description-section">
            <h3>Descripción</h3>
            <p class="task-description">{{ task?.description }}</p>
          </div>

          <!-- Fecha de Vencimiento -->
          <div class="due-date-section">
            <pv-chip
                icon="pi pi-calendar"
                :label="task?.dueDate ? new Date(task.dueDate).toLocaleDateString('es-ES') : 'Sin fecha'"
                :class="{'overdue': task?.dueDate && new Date(task.dueDate) < new Date()}"
            />
            <span class="due-date-text">
              Fecha de Vencimiento
            </span>
          </div>
        </div>
      </template>
    </pv-card>

    <!-- Checklist Real de la Tarea -->
    <pv-card v-if="checklistItems.length > 0" class="checklist-card">
      <template #title>
        <h2>Checklist de la Tarea</h2>
      </template>

      <template #content>
        <div class="checklist">
          <div
              v-for="item in checklistItems"
              :key="item.id"
              class="checklist-item"
          >

            <span
                class="checklist-text"
                :class="{ 'completed': item.completed }"
            >
              - {{ item.text }}
            </span>
          </div>
        </div>
      </template>
    </pv-card>

    <!-- Entrega de Resultados -->
    <pv-card class="delivery-card">
      <template #title>
        <h2>Entrega de Resultados</h2>
      </template>

      <template #content>
        <div class="delivery-options">
          <div
              v-for="option in deliveryOptions"
              :key="option.id"
              class="delivery-option"
          >
            <pv-checkbox
                v-model="option.completed"
                :binary="true"
                class="delivery-checkbox"
            />
            <label class="delivery-label">{{ option.label }}</label>
          </div>
        </div>

        <!-- Sección de enlaces -->
        <div v-if="deliveryOptions[1].completed" class="links-section">
          <h3>Enlaces de Entrega</h3>
          <div v-for="(link, index) in links" :key="index" class="link-input-group">
            <pv-inputtext
                v-model="links[index]"
                placeholder="https://example.com"
                class="link-input"
            />
            <pv-button
                icon="pi pi-times"
                @click="removeLink(index)"
                text
                rounded
                severity="danger"
                class="remove-link-btn"
            />
          </div>
          <pv-button
              icon="pi pi-plus"
              label="Agregar Enlace"
              @click="addLink"
              text
              class="add-link-btn"
          />
        </div>

        <!-- Sección de archivos -->
        <div v-if="deliveryOptions[0].completed" class="files-section">
          <h3>Archivos Adjuntos</h3>
          <pv-file-upload
              mode="basic"
              chooseLabel="Seleccionar archivos"
              :multiple="true"
              :auto="true"
              @select="handleFileUpload"
              class="file-upload"
          />
          <div v-for="(attachment, index) in attachments" :key="attachment.id" class="attachment-item">
            <div class="attachment-info">
              <i class="pi pi-file mr-2"></i>
              <span>{{ attachment.name }}</span>
            </div>
            <pv-button
                icon="pi pi-times"
                @click="removeAttachment(index)"
                text
                rounded
                severity="danger"
                class="remove-attachment-btn"
            />
          </div>
        </div>
      </template>
    </pv-card>

    <!-- Notas del Colaborador -->
    <pv-card class="notes-card">
      <template #title>
        <h2>Notas de Colaborador</h2>
      </template>

      <template #content>
        <pv-textarea
            v-model="notes"
            placeholder="Escribe aquí tu avance relacionado a la tarea, comentarios o cualquier información relevante..."
            rows="5"
            class="notes-textarea"
            autoResize
        />
      </template>
    </pv-card>

    <!-- Botones de acción -->
    <div class="action-buttons">
      <div class="task-actions">
        <pv-button
            label="Marcar como Completado"
            icon="pi pi-check"
            @click="submitTask"
            :disabled="loading"
            severity="success"
            class="submit-btn"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.task-execution-view {
  padding: 1rem;
  max-width: 900px;
  margin: 0 auto;
  background: #f8f9fa;
  min-height: 100vh;
}

/* Header Section */
.header-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.header-section h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.8rem;
}

.back-button {
  color: #6c757d;
}

/* Cards */
:deep(.p-card) {
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

:deep(.p-card-title) {
  color: #2c3e50;
  font-size: 1.2rem;
}

/* Task Card */
.task-title-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #2c3e50;
}

.status-tag {
  font-weight: 600;
}

.task-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.task-description-section h3 {
  margin: 0 0 0.5rem 0;
  color: #495057;
  font-size: 1rem;
}

.task-description {
  color: #6c757d;
  line-height: 1.5;
  margin: 0;
}

.due-date-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #3b82f6;
}

.due-date-text {
  color: #6c757d;
  font-size: 0.9rem;
}

.overdue {
  background: #fee2e2 !important;
  color: #dc2626 !important;
}

/* Progress Section */
.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-header h3 {
  margin: 0;
  color: #495057;
  font-size: 1rem;
}

.progress-text {
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
}

:deep(.progress-bar .p-progressbar-value) {
  background: #3b82f6;
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
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.checklist-item:hover {
  background: #f8f9fa;
}

.checklist-text {
  flex: 1;
  color: #495057;
}

.checklist-text.completed {
  text-decoration: line-through;
  color: #6c757d;
}

/* Delivery Options */
.delivery-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.delivery-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.delivery-label {
  color: #495057;
  font-weight: 500;
}

/* Links Section */
.links-section {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.links-section h3 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1rem;
}

.link-input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.link-input {
  flex: 1;
}

.add-link-btn {
  margin-top: 0.5rem;
}

/* Files Section */
.files-section {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.files-section h3 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1rem;
}

.file-upload {
  margin-bottom: 1rem;
}

.attachment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

.attachment-info {
  display: flex;
  align-items: center;
  color: #495057;
}

/* Notes */
.notes-textarea {
  width: 100%;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.task-actions {
  display: flex;
  gap: 0.75rem;
  width: 100%;
  justify-content: flex-end;
}

/* Responsive */
@media (max-width: 768px) {
  .task-execution-view {
    padding: 0.5rem;
  }

  .header-section h1 {
    font-size: 1.4rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 1rem;
  }

  .task-actions {
    width: 100%;
    flex-direction: column;
  }

  .task-actions .p-button {
    width: 100%;
  }

  .back-action-btn {
    width: 100%;
  }
}

/* Loading States */
:deep(.p-button:disabled) {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Animations */
.checklist-item {
  transition: all 0.2s ease;
}

.attachment-item {
  transition: all 0.2s ease;
}

.attachment-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>