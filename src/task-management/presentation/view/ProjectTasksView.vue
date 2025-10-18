<template>
  <div class="tasks-container">
    <!-- Header con botón Crear -->
    <div class="tasks-header">
      <pv-button class="create-button" @click="showCreateForm = true">
        + Crear
      </pv-button>
    </div>

    <!-- Filtros -->
    <div class="filters-container">
      <div class="filter-item">
        <span class="filter-text">Por Colaborador</span>
        <span class="dropdown-arrow">▼</span>
      </div>
      <div class="filter-item">
        <span class="filter-text">Por Estado</span>
        <span class="dropdown-arrow">▼</span>
      </div>
      <div class="filter-item">
        <span class="filter-text">Buscar</span>
      </div>
    </div>

    <!-- Componente TaskList -->
    <TaskList
        :tasks="projectTasks"
        @view="viewTask"
        @delete="deleteTask"
        @updateDate="updateDueDate"
        @create="showCreateForm = true"
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
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useProjectDetailStore } from '../../../projects/application/project-detail.store.js'
import { useTaskStore } from '../../application/task-store.js'
import TaskCreateForm from './TaskCreateForm.vue'
import TaskList from '../components/TaskList.component.vue'

export default {
  name: 'ProjectTasksView',
  components: {
    TaskCreateForm,
    TaskList
  },
  setup() {
    const showCreateForm = ref(false)
    const projectDetailStore = useProjectDetailStore()
    const taskStore = useTaskStore()

    const projectTasks = computed(() => {
      if (!projectDetailStore.project?.id) return []
      return taskStore.getProjectTasks(projectDetailStore.project.id)
    })

    onMounted(async () => {
      if (projectDetailStore.project?.id) {
        await taskStore.loadProjectTasks(projectDetailStore.project.id)
      }
    })

    const viewTask = (task) => {
      console.log('Ver tarea:', task)
      // Aquí puedes implementar la lógica para ver la tarea
    }

    const deleteTask = async (task) => {
      if (confirm(`¿Eliminar "${task.title}"?`)) {
        await taskStore.deleteTask(projectDetailStore.project.id, task.id)
      }
    }

    const updateDueDate = (task) => {
      console.log('Actualizar fecha para:', task)
      // Aquí puedes implementar la lógica para actualizar fecha
    }

    const handleTaskCreated = async () => {
      showCreateForm.value = false
      if (projectDetailStore.project?.id) {
        await taskStore.loadProjectTasks(projectDetailStore.project.id)
      }
    }

    return {
      showCreateForm,
      projectTasks,
      viewTask,
      deleteTask,
      updateDueDate,
      handleTaskCreated
    }
  }
}
</script>

<style scoped>
.tasks-container {
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tasks-header {
  margin-bottom: 1.5rem;
}

.create-button {
  background: var(--color-primary);
  color: white;
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
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
}

.filter-text {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}

.dropdown-arrow {
  font-size: 0.75rem;
  color: #6b7280;
}
</style>