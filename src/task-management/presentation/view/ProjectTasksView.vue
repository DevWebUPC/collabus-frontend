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

    <!-- Encabezados de la tabla -->
    <div class="table-headers">
      <div class="header-col colaborador">Colaborador</div>
      <div class="header-col tarea">Tarea</div>
      <div class="header-col vencimiento">Vencimiento</div>
      <div class="header-col estado">Estado</div>
    </div>

    <!-- Línea separadora -->
    <div class="separator"></div>

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
import { ref, onMounted } from 'vue'
import { useProjectDetailStore } from '../../../projects/application/project-detail.store.js'
import TaskCreateForm from './TaskCreateForm.vue'

export default {
  name: 'ProjectTasksView',
  components: {
    TaskCreateForm
  },
  setup() {
    const showCreateForm = ref(false)
    const projectDetailStore = useProjectDetailStore()

    const handleTaskCreated = async (taskData) => {
      console.log('✅ Tarea creada exitosamente:', taskData)
      showCreateForm.value = false

      // Recargar las tareas del proyecto
      if (projectDetailStore.project?.id) {
        // Aquí podrías recargar la lista de tareas si es necesario
        console.log('🔄 Tarea agregada al proyecto')
      }
    }

    // Verificar si hay colaboradores al cargar
    onMounted(() => {
      console.log('👥 Colaboradores disponibles:', projectDetailStore.project?.collaborators)
    })

    return {
      showCreateForm,
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

.table-headers {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr;
  gap: 1rem;
  padding: 0.75rem 0;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

.header-col {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  text-align: left;
  padding: 0 1rem;
}

.header-col.colaborador {
  grid-column: 1;
}

.header-col.tarea {
  grid-column: 2;
}

.header-col.vencimiento {
  grid-column: 3;
}

.header-col.estado {
  grid-column: 4;
}

.separator {
  height: 1px;
  background: #e5e7eb;
  margin: 0.5rem 0;
}

/* Responsive */
@media (max-width: 768px) {
  .tasks-container {
    padding: 1rem;
  }

  .filters-container {
    flex-direction: column;
    gap: 0.75rem;
  }

  .filter-item {
    width: 100%;
    justify-content: space-between;
  }

  .table-headers {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 1rem;
  }

  .header-col {
    padding: 0.25rem 0;
  }
}
</style>