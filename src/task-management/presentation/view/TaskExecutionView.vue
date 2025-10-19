<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTaskSubmissionStore } from '../../application/task-submission-store.js';
import { useUserStore } from '../../../iam/application/user-store.js'; // ← VERIFICA ESTA RUTA
import { useTaskStore } from '../../application/task-store.js';
import {useProjectDetailStore} from "../../../projects/application/project-detail.store.js";

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
  userStore.initializeUser(); // Asegurar que el usuario se cargue

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

// Obtener herramientas de la tarea
const taskTools = computed(() => {
  if (!task.value || !task.value.tools) return [];
  return task.value.tools.map(tool => ({
    id: tool.id,
    name: tool.name,
    checked: tool.checked || false
  }));
});

// ✅ FUNCIÓN MEJORADA PARA OBTENER COLLABORATOR ID
const getCollaboratorId = () => {
  // Verificar autenticación primero
  if (!userStore.isAuthenticated) {
    console.error('❌ Usuario no autenticado en getCollaboratorId');
    return null;
  }

  // Intentar diferentes formas de obtener el ID
  const user = userStore.currentUser;
  console.log('🔍 Datos del usuario:', user);

  if (user?.id) return user.id;
  if (user?.userId) return user.userId;
  if (user?._id) return user._id;

  console.error('❌ No se pudo obtener collaboratorId del usuario:', user);
  return null;
};

// Manejar checklist real
const toggleChecklistItem = async (itemId) => {
  try {
    loading.value = true;

    // Verificar autenticación
    if (!checkAuthentication()) return;

    // Encontrar el item específico
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

    // Recargar la tarea para obtener los datos actualizados
    await loadTask();

    console.log('✅ Checklist updated successfully');
  } catch (error) {
    console.error('❌ Error updating checklist:', error);
    alert('Error al actualizar la checklist: ' + error.message);
  } finally {
    loading.value = false;
  }
};

// Manejar herramientas de la tarea
const toggleTaskTool = async (toolId) => {
  try {
    // Verificar autenticación
    if (!checkAuthentication()) return;

    const updatedTools = taskTools.value.map(tool =>
        tool.id === toolId ? { ...tool, checked: !tool.checked } : tool
    );

    await taskStore.updateTask(
        route.params.projectId,
        task.value.id,
        { tools: updatedTools }
    );

    await loadTask();
  } catch (error) {
    console.error('Error updating tools:', error);
    alert('Error al actualizar las herramientas');
  }
};

// Archivos a entregar (basado en la tarea real)
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
  const files = Array.from(event.target.files);
  files.forEach(file => {
    attachments.value.push({
      id: Date.now().toString(),
      name: file.name,
      type: file.type,
      file: file,
      url: URL.createObjectURL(file)
    });
  });
};

const removeAttachment = (index) => {
  attachments.value.splice(index, 1);
};

// Guardar progreso
const saveProgress = async () => {
  const collaboratorId = getCollaboratorId();
  if (!collaboratorId) {
    alert('Usuario no autenticado. Por favor, inicie sesión nuevamente.');
    router.push('/login');
    return;
  }

  try {
    loading.value = true;

    // ✅ FIX: Usar taskId de la ruta
    const taskId = route.params.taskId;

    // Actualizar progreso basado en checklist completada
    const completedItems = checklistItems.value.filter(item => item.completed).length;
    const totalItems = checklistItems.value.length;
    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    console.log('🔄 Guardando progreso:', { taskId, progress });

    await taskStore.updateTaskProgress(
        route.params.projectId,
        taskId, progress);

    alert('Progreso guardado correctamente');
  } catch (error) {
    console.error('❌ Error al guardar progreso:', error);
    alert('Error al guardar el progreso: ' + error.message);
  } finally {
    loading.value = false;
  }
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

  const taskId = route.params.taskId;
  const projectId = route.params.projectId;

  const submissionData = {
    taskId: taskId,
    collaboratorId: collaboratorId,
    links: nonEmptyLinks,
    attachments: attachments.value.map(att => ({
      name: att.name,
      type: att.type,
      url: att.url
    })),
    notes: notes.value,
    submittedAt: new Date()
  };

  try {
    loading.value = true;

    console.log('🔄 Enviando submission para tarea:', taskId);

    // ✅ PRIMERO crear el submission
    await taskSubmissionStore.createSubmission(submissionData);

    // ✅ LUEGO marcar la tarea como completada
    console.log('🔄 Marcando tarea como completada:', { projectId, taskId });

    // ✅ ACTUALIZACIÓN CRÍTICA: Forzar la actualización del estado
    await taskStore.updateTaskStatus(
        projectId,
        taskId,
        'completed',
        100
    );

    // ✅ RECARGAR el proyecto completo para sincronizar
    const projectDetailStore = useProjectDetailStore();
    await projectDetailStore.loadProjectDetail(projectId);

    console.log('✅ Tarea marcada como completada correctamente');

    alert('Tarea enviada y marcada como completada correctamente');

    // ✅ REDIRIGIR a la vista de tareas para ver el cambio
    router.go(-1);


  } catch (error) {
    console.error('❌ Error al enviar la tarea:', error);
    alert('Error al enviar la tarea: ' + error.message);
  } finally {
    loading.value = false;
  }
};
// Cargar tarea real
const loadTask = async () => {
  try {
    loading.value = true;
    const projectId = route.params.projectId;
    const taskId = route.params.taskId;

    console.log(`🔍 Loading task ${taskId} from project ${projectId}`);

    // Verificar autenticación antes de cargar
    if (!checkAuthentication()) return;

    console.log('🔄 Llamando a taskStore.loadTask...');
    await taskStore.loadTask(projectId, taskId);

    console.log('📋 taskStore.currentTask:', taskStore.currentTask);
    task.value = taskStore.currentTask;

    if (!task.value) {
      console.error('❌ Task not found in store');
      throw new Error('Task not found');
    }

    console.log('✅ Task loaded successfully:', task.value);
    console.log('📋 Checklist items:', checklistItems.value);
    console.log('🔧 Task tools:', taskTools.value);
  } catch (error) {
    console.error('❌ Error loading task:', error);
    alert('Error al cargar la tarea: ' + error.message);
    router.back(); // Volver atrás si hay error
  } finally {
    loading.value = false;
  }
};
onMounted(() => {
  console.log('🚀 TaskExecutionView mounted');

  // Inicializar y verificar autenticación
  if (!checkAuthentication()) {
    return;
  }

  loadTask();
});
</script>

<template>
  <div class="task-execution-view">
    <h1>{{ task?.title }}</h1>
    <p class="task-description">{{ task?.description }}</p>

    <!-- Fecha de Vencimiento -->
    <div class="due-date-section">
      <strong>Fecha de Vencimiento:</strong> {{ task?.dueDate ? new Date(task.dueDate).toLocaleDateString('es-ES') : 'Sin fecha' }}
    </div>

    <!-- Checklist Real de la Tarea -->
    <div class="form-section" v-if="checklistItems.length > 0">
      <h2>Checklist de la Tarea</h2>
      <div class="checklist">
        <div
            v-for="item in checklistItems"
            :key="item.id"
            class="checklist-item"
        >
          <input
              type="checkbox"
              :id="'checklist-' + item.id"
              :checked="item.completed"
              @change="toggleChecklistItem(item.id)"
          />
          <label :for="'checklist-' + item.id">{{ item.text }}</label>
        </div>
      </div>
      <div class="progress-info">
        Progreso: {{ checklistItems.filter(item => item.completed).length }} de {{ checklistItems.length }} completados
      </div>
    </div>


    <!-- Archivos a entregar -->
    <div class="form-section">
      <h2>Entrega de Resultados</h2>
      <div class="delivery-options">
        <div
            v-for="option in deliveryOptions"
            :key="option.id"
            class="delivery-option"
        >
          <input
              type="checkbox"
              :id="'option-' + option.id"
              :checked="option.completed"
              @change="option.completed = !option.completed"
          />
          <label :for="'option-' + option.id">{{ option.label }}</label>
        </div>
      </div>

      <!-- Sección de enlaces -->
      <div v-if="deliveryOptions[1].completed" class="links-section">
        <h3>Enlaces de Entrega</h3>
        <div v-for="(link, index) in links" :key="index" class="link-input">
          <input type="url" v-model="links[index]" placeholder="https://example.com">
          <button @click="removeLink(index)" type="button" class="remove-btn">Eliminar</button>
        </div>
        <button @click="addLink" type="button" class="add-btn">Agregar Enlace</button>
      </div>

      <!-- Sección de archivos -->
      <div v-if="deliveryOptions[0].completed" class="files-section">
        <h3>Archivos Adjuntos</h3>
        <input type="file" multiple @change="handleFileUpload" class="file-input">
        <div v-for="(attachment, index) in attachments" :key="attachment.id" class="attachment-item">
          <span>{{ attachment.name }}</span>
          <button @click="removeAttachment(index)" type="button" class="remove-btn">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- Notas del Colaborador -->
    <div class="form-section">
      <h2>Notas de Colaborador</h2>
      <textarea
          v-model="notes"
          placeholder="Escribe aquí tu avance relacionado a la tarea"
          class="notes-textarea"
      ></textarea>
    </div>

    <!-- Botones de acción -->
    <div class="action-buttons">
      <button @click="saveProgress" :disabled="loading" class="save-btn">
        Guardar Progreso
      </button>
      <button @click="submitTask" :disabled="loading" class="submit-btn">
        Marcar como completado
      </button>
    </div>
  </div>
</template>

<style scoped>
.task-execution-view {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.task-description {
  color: #666;
  margin-bottom: 20px;
}

.due-date-section {
  background: #f5f5f5;
  padding: 10px 15px;
  border-radius: 6px;
  margin-bottom: 20px;
  border-left: 4px solid #3b82f6;
}

.form-section {
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-section h2 {
  margin-bottom: 15px;
  color: #333;
  font-size: 1.2rem;
}

/* Checklist */
.checklist {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.checklist-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

.progress-info {
  padding: 10px;
  background: #e8f5e8;
  border-radius: 4px;
  font-weight: 500;
  color: #2e7d32;
}

/* Tools */
.tools-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tool-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Delivery Options */
.delivery-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.delivery-option {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Links Section */
.links-section,
.files-section {
  margin-top: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.link-input,
.attachment-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.link-input input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* Notes */
.notes-textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  resize: vertical;
  font-family: inherit;
}

/* Buttons */
.action-buttons {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.save-btn,
.submit-btn,
.add-btn,
.remove-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.save-btn {
  background: #6c757d;
  color: white;
}

.submit-btn {
  background: #28a745;
  color: white;
}

.add-btn {
  background: #007bff;
  color: white;
  padding: 8px 16px;
  font-size: 0.9rem;
}

.remove-btn {
  background: #dc3545;
  color: white;
  padding: 6px 12px;
  font-size: 0.8rem;
}

.save-btn:hover,
.submit-btn:hover,
.add-btn:hover,
.remove-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.save-btn:disabled,
.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.file-input {
  margin-bottom: 15px;
}

.attachment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .task-execution-view {
    padding: 15px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .save-btn,
  .submit-btn {
    width: 100%;
  }
}
</style>