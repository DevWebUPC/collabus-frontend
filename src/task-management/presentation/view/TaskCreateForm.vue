<template>
  <div class="task-create-form">
    <!-- Header -->
    <div class="form-header">
      <h2>Crear nueva Tarea</h2>
    </div>

    <!-- Form Content -->
    <div class="form-content">
      <!-- Título y Fecha -->
      <div class="form-row">
        <div class="form-section">
          <label class="section-label">Título de la tarea</label>
          <pv-inputtext v-model="task.title" class="w-full" />
        </div>

        <div class="form-section">
          <label class="section-label">Fecha de Entrega</label>
          <pv-calendar v-model="task.dueDate" class="w-full" />
        </div>
      </div>

      <div class ="formr.section">
        <label class="section-label">Asignar a</label>
        <pv-dropdown
            v-model="task.assignedTo"
            :options="collaborators"
            option-label="name"
            option-value="id"
            placeholder="Seleccionar colaborador"
            class="w-full"
            :loading="loadingCollaborators"
        />
      </div>

      <!-- Descripción -->
      <div class="form-section">
        <label class="section-label">Descripción</label>
        <pv-textarea v-model="task.description" rows="4" class="w-full" />
      </div>

      <!-- Separador -->
      <div class="separator"></div>

      <!-- Checklist -->
      <div class="form-section">
        <div class="section-header">
          <label class="section-label">Checklist</label>
          <pv-button
              icon="pi pi-plus"
              label="Añadir Paso"
              text
              @click="addChecklistItem"
          />
        </div>
        <div v-for="(item, index) in task.checklist" :key="index" class="checklist-item">
          <pv-inputtext v-model="item.text" class="w-full" />
          <pv-button
              icon="pi pi-times"
              text
              severity="danger"
              @click="removeChecklistItem(index)"
          />
        </div>
      </div>

      <!-- Separador -->
      <div class="separator"></div>

      <!-- Herramientas Asignadas -->
      <div class="form-section">
        <div class="section-header">
          <label class="section-label">Herramientas Asignadas</label>
          <pv-button
              icon="pi pi-plus"
              label="Añadir Herramienta"
              text
              @click="addTool"
          />
        </div>
        <div v-for="(tool, index) in task.tools" :key="tool.id" class="tool-item">
          <pv-inputtext v-model="tool.name" class="w-full" placeholder="Nombre de la herramienta" />
          <pv-button
              icon="pi pi-times"
              text
              severity="danger"
              @click="removeTool(index)"
          />
        </div>
      </div>

      <!-- Separador -->
      <div class="separator"></div>

      <!-- Comentario -->
      <div class="form-section">
        <label class="section-label">Comentario</label>
        <pv-textarea
            v-model="task.comment"
            rows="3"
            placeholder="Deja un comentario a tu colaborador"
            class="w-full"
        />
      </div>

      <!-- Separador -->
      <div class="separator"></div>

      <!-- Archivos Adjuntos -->
      <div class="form-section">
        <label class="section-label">Añadir Archivos Adjuntos</label>
        <div class="attachment-buttons">
          <pv-button
              icon="pi pi-paperclip"
              label="Añadir archivos"
              @click="showFileModal = true"
              class="attachment-btn"
          />
          <pv-button
              icon="pi pi-link"
              label="Añadir enlaces"
              @click="showLinkModal = true"
              class="attachment-btn"
          />
        </div>

        <!-- Lista de archivos adjuntos -->
        <div v-if="task.attachments.length > 0" class="attachments-list">
          <div v-for="attachment in task.attachments" :key="attachment.id" class="attachment-item">
            <i :class="attachment.icon"></i>
            <span>{{ attachment.name }}</span>
            <pv-button icon="pi pi-times" text severity="danger" @click="removeAttachment(attachment.id)" />
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="form-actions">
      <pv-button label="Cancelar" text @click="$emit('cancel')" />
      <pv-button label="Crear Tarea" @click="createTask" :disabled="!isFormValid" />
    </div>

    <!-- Modales -->
    <AddFileModal
        v-model:visible="showFileModal"
        @files-added="handleFilesAdded"
    />
    <AddLinkModal
        v-model:visible="showLinkModal"
        @link-added="handleLinkAdded"
    />
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useProjectDetailStore } from '../../../projects/application/project-detail.store.js'
import { useTaskStore } from '../../application/task-store.js'
import AddFileModal from '../components/AddFileModal.component.vue'
import AddLinkModalComponent from '../components/AddLinkModal.component.vue'

export default {
  name: 'TaskCreateForm',
  components: {
    AddFileModal,
    AddLinkModal: AddLinkModalComponent
  },
  emits: ['cancel', 'created'],
  setup(props, { emit }) {
    const projectDetailStore = useProjectDetailStore()
    const taskStore = useTaskStore()

    const showFileModal = ref(false)
    const showLinkModal = ref(false)
    const loadingCollaborators = ref(false)

    const task = ref({
      title: '',
      dueDate: null,
      description: '',
      assignedTo: null, // NUEVO: ID del colaborador seleccionado
      checklist: [],
      tools: [],
      comment: '',
      attachments: []
    })

    const collaborators = ref([])

    // Computed para validar el formulario
    const isFormValid = computed(() => {
      return task.value.title.trim() !== '' &&
          task.value.assignedTo !== null &&
          task.value.dueDate !== null
    })

    // Cargar colaboradores del proyecto
    const loadCollaborators = async () => {
      try {
        loadingCollaborators.value = true
        // Usar los colaboradores del store del proyecto
        if (projectDetailStore.project?.collaborators) {
          collaborators.value = projectDetailStore.project.collaborators.map(collab => ({
            id: collab.applicantId,
            name: collab.name,
            role: collab.role
          }))
          console.log('👥 Colaboradores cargados:', collaborators.value)
        }
      } catch (error) {
        console.error('Error cargando colaboradores:', error)
      } finally {
        loadingCollaborators.value = false
      }
    }

    const createTask = async () => {
      try {
        console.log('📝 Creando tarea:', task.value);

        // Obtener información del colaborador seleccionado
        const selectedCollaborator = collaborators.value.find(c => c.id === task.value.assignedTo);

        if (!selectedCollaborator) {
          console.error('❌ No se encontró el colaborador seleccionado');
          return;
        }

        // Preparar datos para la tarea
        const taskData = {
          title: task.value.title,
          description: task.value.description,
          dueDate: task.value.dueDate,
          assignedTo: task.value.assignedTo,
          assignedToName: selectedCollaborator.name,
          role: selectedCollaborator.role,
          checklist: task.value.checklist,
          tools: task.value.tools,
          comment: task.value.comment,
          attachments: task.value.attachments,
          projectId: projectDetailStore.project.id,
          createdBy: localStorage.getItem('userId') || '1'
        }

        console.log('🚀 Enviando tarea a store:', taskData);

        // Usar el store de tareas para crear la tarea
        const newTask = await taskStore.createTask(taskData);

        console.log('✅ Tarea creada exitosamente:', newTask);
        emit('created', newTask);

      } catch (error) {
        console.error('❌ Error creando tarea:', error);
      }
    }

    // Métodos existentes sin cambios
    const addChecklistItem = () => {
      task.value.checklist.push({
        id: Date.now(),
        text: '',
        completed: false
      })
    }

    const removeChecklistItem = (index) => {
      task.value.checklist.splice(index, 1)
    }

    const addTool = () => {
      task.value.tools.push({
        id: Date.now(),
        name: '',
        checked: false
      })
    }

    const removeTool = (index) => {
      task.value.tools.splice(index, 1)
    }

    const handleFilesAdded = (files) => {
      files.forEach(file => {
        task.value.attachments.push({
          id: Date.now() + Math.random(),
          name: file.name,
          type: 'file',
          icon: 'pi pi-file'
        })
      })
    }

    const handleLinkAdded = (linkData) => {
      task.value.attachments.push({
        id: Date.now() + Math.random(),
        name: linkData.url,
        type: 'link',
        icon: 'pi pi-link'
      })
    }

    const removeAttachment = (id) => {
      const index = task.value.attachments.findIndex(att => att.id === id)
      if (index !== -1) {
        task.value.attachments.splice(index, 1)
      }
    }

    // Cargar colaboradores cuando el componente se monta
    onMounted(() => {
      loadCollaborators()
    })

    return {
      showFileModal,
      showLinkModal,
      task,
      collaborators,
      loadingCollaborators,
      isFormValid,
      createTask,
      addChecklistItem,
      removeChecklistItem,
      addTool,
      removeTool,
      handleFilesAdded,
      handleLinkAdded,
      removeAttachment
    }
  }
}
</script>

<style scoped>
.task-create-form {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.form-header {
  margin-bottom: 2rem;
}

.form-header h2 {
  color: var(--color-primary);
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-label {
  font-weight: 600;
  color: var(--color-gray-800);
  font-size: 0.9rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.separator {
  height: 1px;
  background: #e5e7eb;
  margin: 0.5rem 0;
}

.checklist-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.tool-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tool-completed {
  text-decoration: line-through;
  color: var(--color-gray-500);
}

.attachment-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.attachment-btn {
  flex: 1;
  min-width: 150px;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.attachment-item i {
  color: var(--color-primary);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

/* Responsive */
@media (max-width: 768px) {
  .task-create-form {
    padding: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .attachment-buttons {
    flex-direction: column;
  }

  .attachment-btn {
    min-width: auto;
  }
}
</style>