<!-- ProjectTasksView.vue (MODIFICADO) -->
<template>
  <div class="tasks-container">
    <!-- Header con botón Crear -->
    <div class="tasks-header">
      <pv-button class="create-button" @click="showCreateForm = true">
        + Crear
      </pv-button>
    </div>

    <!-- Filtros Mejorados -->
    <div class="filters-container">
      <!-- Filtro por Colaborador -->
      <div class="filter-item" @click="toggleCollaboratorDropdown">
        <span class="filter-text">
          {{ selectedCollaborator ? selectedCollaborator.name : 'Por Colaborador' }}
        </span>
        <span class="dropdown-arrow">▼</span>

        <!-- Dropdown de Colaboradores -->
        <div v-if="showCollaboratorDropdown" class="dropdown-menu">
          <div
              class="dropdown-item"
              @click="selectCollaborator(null)"
          >
            Todos los colaboradores
          </div>
          <div
              v-for="collaborator in uniqueCollaborators"
              :key="collaborator.id"
              class="dropdown-item"
              @click="selectCollaborator(collaborator)"
          >
            {{ collaborator.name }}
          </div>
        </div>
      </div>

      <!-- Filtro por Estado -->
      <div class="filter-item" @click="toggleStatusDropdown">
        <span class="filter-text">
          {{ selectedStatus ? getStatusText(selectedStatus) : 'Por Estado' }}
        </span>
        <span class="dropdown-arrow">▼</span>

        <!-- Dropdown de Estados -->
        <div v-if="showStatusDropdown" class="dropdown-menu">
          <div
              class="dropdown-item"
              @click="selectStatus(null)"
          >
            Todos los estados
          </div>
          <div
              v-for="status in statusOptions"
              :key="status.value"
              class="dropdown-item"
              @click="selectStatus(status.value)"
          >
            {{ status.label }}
          </div>
        </div>
      </div>

      <!-- Botón Limpiar Filtros -->
      <pv-button
          v-if="hasActiveFilters"
          label="Limpiar"
          text
          severity="secondary"
          @click="clearFilters"
          class="clear-filters-btn"
      />
    </div>

    <!-- Componente TaskList con tareas filtradas -->
    <TaskList
        :tasks="filteredTasks"
        :submissions="submissions"
        @view="viewTask"
        @delete="handleShowDeleteModal"
        @updateDate="handleShowUpdateDateModal"
        @create="showCreateForm = true"
        @view-submission="handleViewSubmission"
    />

    <!-- Modal de creación de tareas -->
    <pv-dialog
        v-model:visible="showCreateForm"
        modal
        :style="{ width: '70vw', maxWidth: '800px' }"
        header="Crear Nueva Tarea"
    >
      <TaskCreateForm
          @cancel="showCreateForm = false"
          @created="handleTaskCreated"
      />
    </pv-dialog>

    <!-- Modal de confirmación para eliminar tarea -->
    <ModalDecision
        v-model:visible="showDeleteModal"
        title="Eliminar Tarea"
        :message="deleteMessage"
        icon="danger"
        cancel-text="Cancelar"
        confirm-text="Eliminar"
        confirm-severity="danger"
        @cancel="cancelDelete"
        @confirm="confirmDelete"
    />

    <!-- Modal para actualizar fecha de entrega -->
    <UpdateDueDateModal
        v-model:visible="showUpdateDateModal"
        :task="selectedTask"
        @date-updated="handleDateUpdate"
    />
  </div>
</template>

<script>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectDetailStore } from '../../../projects/application/project-detail.store.js'
import { useTaskStore } from '../../application/task-store.js'
import { useTaskSubmissionStore } from '../../application/task-submission-store.js'
import TaskCreateForm from './TaskCreateForm.vue'
import TaskList from '../components/TaskList.component.vue'
import ModalDecision from '../components/ModalDecision.component.vue'
import UpdateDueDateModal from '../components/UpdateDueDateModal.component.vue'

export default {
  name: 'ProjectTasksView',
  components: {
    TaskCreateForm,
    TaskList,
    ModalDecision,
    UpdateDueDateModal
  },
  setup() {
    const showCreateForm = ref(false)
    const showDeleteModal = ref(false)
    const showUpdateDateModal = ref(false)
    const projectDetailStore = useProjectDetailStore()
    const taskStore = useTaskStore()
    const taskSubmissionStore = useTaskSubmissionStore()
    const route = useRoute()
    const router = useRouter()

    // Estado de los filtros
    const showCollaboratorDropdown = ref(false)
    const showStatusDropdown = ref(false)
    const selectedCollaborator = ref(null)
    const selectedStatus = ref(null)
    const selectedTask = ref(null)

    // Obtener todas las submissions del proyecto
    const submissions = computed(() => {
      return taskSubmissionStore.submissions || []
    })

    const projectTasks = computed(() => {
      if (!projectDetailStore.project?.id) return []

      // ✅ OBTENER SIEMPRE DIRECTAMENTE DEL STORE
      const tasks = taskStore.getProjectTasks(projectDetailStore.project.id)

      console.log('📋 Tareas en computed:', tasks.length, tasks)
      console.log('📦 Submissions disponibles:', submissions.value)

      return tasks
    })

    // Mensaje para eliminar tarea
    const deleteMessage = computed(() => {
      if (!selectedTask.value) return ''
      return `¿Estás seguro de que quieres eliminar la tarea "${selectedTask.value.title}"? Esta acción no se puede deshacer.`
    })

    // Obtener colaboradores únicos del proyecto
    const uniqueCollaborators = computed(() => {
      const collaborators = new Map()

      projectTasks.value.forEach(task => {
        if (task.assignedTo && task.assignedToName) {
          collaborators.set(task.assignedTo, {
            id: task.assignedTo,
            name: task.assignedToName,
            role: task.role
          })
        }
      })

      return Array.from(collaborators.values())
    })

    // Opciones de estado
    const statusOptions = ref([
      { value: 'pending', label: 'Pendiente' },
      { value: 'completed', label: 'Completado' },
      { value: 'retrasado', label: 'Retrasado' }
    ])

    // Tareas filtradas
    const filteredTasks = computed(() => {
      let filtered = projectTasks.value

      // Filtro por colaborador
      if (selectedCollaborator.value) {
        filtered = filtered.filter(task =>
            task.assignedTo === selectedCollaborator.value.id
        )
      }

      // Filtro por estado
      if (selectedStatus.value) {
        filtered = filtered.filter(task => {
          const actualStatus = getActualStatus(task);
          return actualStatus === selectedStatus.value;
        })
      }

      return filtered
    })

    const getActualStatus = (task) => {
      if (task.status === 'completed') return 'completed';

      const dueDate = new Date(task.dueDate);
      const today = new Date();

      if (dueDate < today) {
        return 'retrasado';
      }

      return task.status;
    }

    // Verificar si hay filtros activos
    const hasActiveFilters = computed(() => {
      return selectedCollaborator.value !== null ||
          selectedStatus.value !== null
    })

    // Métodos de los filtros
    const toggleCollaboratorDropdown = () => {
      showCollaboratorDropdown.value = !showCollaboratorDropdown.value
      showStatusDropdown.value = false
    }

    const toggleStatusDropdown = () => {
      showStatusDropdown.value = !showStatusDropdown.value
      showCollaboratorDropdown.value = false
    }

    const selectCollaborator = (collaborator) => {
      selectedCollaborator.value = collaborator
      showCollaboratorDropdown.value = false
    }

    const selectStatus = (status) => {
      selectedStatus.value = status
      showStatusDropdown.value = false
    }

    const clearFilters = () => {
      selectedCollaborator.value = null
      selectedStatus.value = null
    }

    const getStatusText = (status) => {
      const statusMap = {
        'pending': 'Pendiente',
        'in_progress': 'En Progreso',
        'completed': 'Completado',
        'retrasado': 'Retrasado'
      }
      return statusMap[status] || status
    }

    // Métodos para manejar modales
    const handleShowDeleteModal = (task) => {
      selectedTask.value = task
      showDeleteModal.value = true
    }

    const handleShowUpdateDateModal = (task) => {
      selectedTask.value = task
      showUpdateDateModal.value = true
    }

    const cancelDelete = () => {
      selectedTask.value = null
      showDeleteModal.value = false
    }

    const confirmDelete = async () => {
      if (selectedTask.value) {
        try {
          await taskStore.deleteTask(projectDetailStore.project.id, selectedTask.value.id)

          // ✅ FORZAR ACTUALIZACIÓN DEL COMPUTED
          await nextTick()

          // ✅ RECARGAR LAS TAREAS PARA SINCRONIZAR
          if (projectDetailStore.project?.id) {
            await taskStore.loadProjectTasks(projectDetailStore.project.id)
          }

          selectedTask.value = null
          showDeleteModal.value = false

          console.log('✅ Tarea eliminada y vista actualizada')
        } catch (error) {
          console.error('❌ Error eliminando tarea:', error)
        }
      }
    }

    const handleDateUpdate = async (updateData) => {
      try {
        console.log('📅 Actualizando fecha de tarea:', updateData);

        const updatedBy = localStorage.getItem('userId') || '1';

        // ✅ Asegurar que la fecha sea un objeto Date válido
        const dueDate = new Date(updateData.newDueDate);

        if (isNaN(dueDate.getTime())) {
          throw new Error('Fecha inválida');
        }

        await taskStore.updateTaskDueDate(
            projectDetailStore.project.id,
            updateData.taskId,
            dueDate,  // Pasar el objeto Date
            updatedBy
        );

        // Recargar tareas
        if (projectDetailStore.project?.id) {
          await taskStore.loadProjectTasks(projectDetailStore.project.id);
        }

        showUpdateDateModal.value = false;
        selectedTask.value = null;

        console.log('✅ Fecha actualizada correctamente');
      } catch (error) {
        console.error('❌ Error actualizando fecha:', error);
        // Mostrar mensaje de error al usuario
      }
    }

    // Manejar la visualización de submission
    const handleViewSubmission = (task) => {
      console.log('👀 Ver submission de tarea:', task)
      router.push(`/projects/${projectDetailStore.project.id}/tasks/${task.id}/submission`)
    }

    // Cerrar dropdowns al hacer clic fuera
    const closeDropdowns = (event) => {
      if (!event.target.closest('.filter-item')) {
        showCollaboratorDropdown.value = false
        showStatusDropdown.value = false
      }
    }

    onMounted(async () => {
      if (projectDetailStore.project?.id) {
        await taskStore.loadProjectTasks(projectDetailStore.project.id)

        // ✅ CORREGIDO: Limpiar submissions antes de cargar nuevas
        taskSubmissionStore.submissions = [];

        try {
          console.log('🔄 Cargando submissions para todas las tareas del proyecto...')
          const tasks = taskStore.getProjectTasks(projectDetailStore.project.id)
          console.log(`📋 Cargando submissions para ${tasks.length} tareas`)

          // Cargar submissions para cada tarea
          for (const task of tasks) {
            try {
              // ✅ FORZAR recarga limpia para cada tarea
              await taskSubmissionStore.loadSubmissionsByTask(task.id)
              console.log(`✅ Submissions cargadas para tarea ${task.id}`)
            } catch (error) {
              console.error(`❌ Error cargando submissions para tarea ${task.id}:`, error)
            }
          }

          console.log('✅ Todas las submissions cargadas:', taskSubmissionStore.submissions)
        } catch (error) {
          console.error('❌ Error general cargando submissions:', error)
        }
      }

      document.addEventListener('click', closeDropdowns)
    })

    const viewTask = (task) => {
      console.log('Ver tarea:', task)
      // Aquí puedes implementar la lógica para ver la tarea
    }

    const handleTaskCreated = async () => {
      showCreateForm.value = false
      if (projectDetailStore.project?.id) {
        await taskStore.loadProjectTasks(projectDetailStore.project.id)
      }
    }

    return {
      showCreateForm,
      showDeleteModal,
      showUpdateDateModal,
      projectTasks,
      filteredTasks,
      submissions,
      viewTask,
      handleTaskCreated,
      showCollaboratorDropdown,
      showStatusDropdown,
      selectedCollaborator,
      selectedStatus,
      uniqueCollaborators,
      statusOptions,
      hasActiveFilters,
      selectedTask,
      deleteMessage,
      toggleCollaboratorDropdown,
      toggleStatusDropdown,
      selectCollaborator,
      selectStatus,
      clearFilters,
      getStatusText,
      handleShowDeleteModal,
      handleShowUpdateDateModal,
      cancelDelete,
      confirmDelete,
      handleDateUpdate,
      handleViewSubmission
    }
  }
}
</script>

<style scoped>
/* Los estilos permanecen iguales */
.tasks-container {
  padding: 1.5rem;
  background: var(--color-white, #FFFFFF);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

.tasks-header {
  margin-bottom: 1.5rem;
}

.create-button {
  background: var(--color-primary);
  color: var(--color-white, #FFFFFF);
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.9rem;
}

.filters-container {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--color-gray-50, #f8f9fa);
  border-radius: 6px;
  border: 1px solid var(--color-gray-300, #e5e7eb);
  cursor: pointer;
  position: relative;
  min-width: 160px;
}

.filter-text {
  font-size: 0.875rem;
  color: var(--color-gray-900, #374151);
  font-weight: 500;
  flex: 1;
}

.dropdown-arrow {
  font-size: 0.75rem;
  color: #6b7280;
}

/* Dropdown Styles */
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-white, #FFFFFF);
  border: 1px solid var(--color-gray-300, #e5e7eb);
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 0.25rem;
}

.dropdown-item {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: var(--color-gray-900, #374151);
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
}

.dropdown-item:hover {
  background: var(--color-gray-50, #f8f9fa);
}

.dropdown-item:last-child {
  border-bottom: none;
}

/* Clear Filters Button */
.clear-filters-btn {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .filters-container {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-item {
    min-width: auto;
  }
}
</style>