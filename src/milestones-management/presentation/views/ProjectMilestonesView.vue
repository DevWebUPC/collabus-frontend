<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRoute } from "vue-router";
import MilestoneCreateForm from "./MilestoneCreateForm.vue";
import MilestoneList from "../components/MilestoneList.component.vue";
import { useProjectDetailStore } from "../../../projects/application/project-detail.store.js";
import { useMilestonesStore } from "../../application/milestone-store.js";
import { useMilestoneTaskSubmissionStore } from "../../application/milestone-task-submission-store.js"; // ✅ AGREGAR

// ✅ AGREGAR: Store de submissions
const submissionStore = useMilestoneTaskSubmissionStore();

// Resto del código existente...
const route = useRoute();
const projectDetailStore = useProjectDetailStore();
const milestonesStore = useMilestonesStore();

const projectId = computed(() => {
  const id = route.params.projectId || route.params.id;
  console.log('🆔 Project ID from route:', id, 'Type:', typeof id);

  if (id) {
    return String(id);
  }

  console.error('❌ Project ID not found in route params:', route.params);
  return null;
});

// Estado de filtros
const selectedStatus = ref(null);
const selectedCollaborators = ref([]);
const showStatusDropdown = ref(false);
const showCollaboratorDropdown = ref(false);
const showCreateForm = ref(false);

// ✅ NUEVO: Función para verificar si todas las tareas tienen submissions
const checkIfAllTasksHaveSubmissions = (milestone) => {
  if (!milestone.milestoneTasks || milestone.milestoneTasks.length === 0) {
    return false;
  }

  return milestone.milestoneTasks.every(task => {
    const hasSubmission = submissionStore.hasSubmissionForMilestoneTask(task.id);
    console.log(`   - Tarea "${task.title}": ${hasSubmission ? 'TIENE' : 'NO TIENE'} submission`);
    return hasSubmission;
  });
};

// ✅ MODIFICAR: Determinar estado del hito considerando submissions
const determineMilestoneStatus = (milestone) => {
  // Si ya está completado en el store, mantenerlo
  if (milestone.status === 'completed' || milestone.progress === 100) {
    return 'completed';
  }

  // ✅ NUEVO: Verificar si debería estar completado basado en submissions
  const allTasksHaveSubmissions = checkIfAllTasksHaveSubmissions(milestone);
  if (allTasksHaveSubmissions) {
    console.log(`🎯 Hito "${milestone.title}" debería estar completado por submissions`);
    return 'completed';
  }

  // Si está retrasado (fecha vencida y no completado)
  if (milestone.dueDate) {
    const now = new Date();
    const dueDate = new Date(milestone.dueDate);
    if (dueDate < now) {
      return 'overdue';
    }
  }

  // Por defecto, pendiente
  return 'pending';
};

// ✅ MODIFICAR: Obtener hitos del store con estado actualizado
const filteredMilestones = computed(() => {
  if (!projectId.value) return [];

  let milestones = milestonesStore.getProjectMilestones(projectId.value);

  // ✅ ACTUALIZAR: Crear una copia con el estado actualizado basado en submissions
  const updatedMilestones = milestones.map(milestone => {
    const actualStatus = determineMilestoneStatus(milestone);

    // Si el estado calculado es diferente al almacenado, crear una copia actualizada
    if ((actualStatus === 'completed' && milestone.status !== 'completed') ||
        (actualStatus !== 'completed' && milestone.status === 'completed')) {

      return {
        ...milestone,
        status: actualStatus === 'completed' ? 'completed' : 'active',
        progress: actualStatus === 'completed' ? 100 : milestone.progress
      };
    }

    return milestone;
  });

  // Aplicar filtro por estado
  if (selectedStatus.value) {
    milestones = updatedMilestones.filter(milestone => {
      const status = determineMilestoneStatus(milestone);
      return status === selectedStatus.value;
    });
  } else {
    milestones = updatedMilestones;
  }

  // Aplicar filtro por múltiples colaboradores
  if (selectedCollaborators.value.length > 0) {
    milestones = milestones.filter(milestone => {
      return selectedCollaborators.value.every(selectedCollab => {
        return hasCollaboratorInMilestone(milestone, selectedCollab.id);
      });
    });
  }

  return milestones;
});

// Resto del código existente (getStatusText, uniqueCollaborators, etc.)...
const getStatusText = (status) => {
  const statusMap = {
    'pending': 'Pendiente',
    'completed': 'Completado',
    'overdue': 'Retrasado'
  };
  return statusMap[status] || status;
};

const uniqueCollaborators = computed(() => {
  if (!projectId.value) return [];

  const milestones = milestonesStore.getProjectMilestones(projectId.value);
  const collaborators = new Map();

  milestones.forEach(milestone => {
    if (milestone.milestoneTasks && Array.isArray(milestone.milestoneTasks)) {
      milestone.milestoneTasks.forEach(task => {
        if (task.assignedTo && task.assignedToName) {
          collaborators.set(task.assignedTo, {
            id: task.assignedTo,
            name: task.assignedToName,
            role: task.role || 'Colaborador'
          });
        }
      });
    }
  });

  return Array.from(collaborators.values());
});

const hasCollaboratorInMilestone = (milestone, collaboratorId) => {
  if (!milestone.milestoneTasks || !Array.isArray(milestone.milestoneTasks)) {
    return false;
  }

  return milestone.milestoneTasks.some(task =>
      task.assignedTo === collaboratorId
  );
};

const statusOptions = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'completed', label: 'Completado' },
  { value: 'overdue', label: 'Retrasado' }
];

const toggleStatusDropdown = () => {
  showStatusDropdown.value = !showStatusDropdown.value;
  showCollaboratorDropdown.value = false;
};

const toggleCollaboratorDropdown = () => {
  showCollaboratorDropdown.value = !showCollaboratorDropdown.value;
  showStatusDropdown.value = false;
};

const toggleCollaboratorSelection = (collaborator) => {
  const existingIndex = selectedCollaborators.value.findIndex(
      collab => collab.id === collaborator.id
  );

  if (existingIndex > -1) {
    selectedCollaborators.value.splice(existingIndex, 1);
  } else {
    selectedCollaborators.value.push(collaborator);
  }
};

const isCollaboratorSelected = (collaborator) => {
  return selectedCollaborators.value.some(
      collab => collab.id === collaborator.id
  );
};

const getCollaboratorsFilterText = () => {
  if (selectedCollaborators.value.length === 0) {
    return 'Por Colaborador';
  }

  if (selectedCollaborators.value.length === 1) {
    return selectedCollaborators.value[0].name;
  }

  return `${selectedCollaborators.value.length} colaboradores`;
};

const selectStatus = (status) => {
  selectedStatus.value = status;
  showStatusDropdown.value = false;
};

const clearFilters = () => {
  selectedStatus.value = null;
  selectedCollaborators.value = [];
};

const hasActiveFilters = computed(() => {
  return selectedStatus.value !== null || selectedCollaborators.value.length > 0;
});

const closeDropdowns = (event) => {
  if (!event.target.closest('.filter-item')) {
    showStatusDropdown.value = false;
    showCollaboratorDropdown.value = false;
  }
};

const onMilestoneCreated = async (nuevoHito) => {
  console.log('🎉 Hito creado exitosamente:', nuevoHito);
  showCreateForm.value = false;

  // ✅ NUEVO: Recargar los hitos del proyecto después de crear uno nuevo
  try {
    await milestonesStore.loadProjectMilestones(projectId.value);
    console.log('✅ Hitos recargados después de crear nuevo hito');
  } catch (error) {
    console.error('❌ Error recargando hitos:', error);
  }
};
// ✅ MODIFICAR: Cargar submissions al montar el componente
onMounted(async () => {
  console.log('📍 Route params in ProjectMilestonesView:', route.params);
  console.log('📍 Full route object:', route);
  document.addEventListener('click', closeDropdowns);

  // Cargar hitos del proyecto
  if (projectId.value) {
    try {
      await milestonesStore.loadProjectMilestones(projectId.value);

      // ✅ NUEVO: Cargar submissions para verificar estado de tareas
      await submissionStore.loadSubmissionsByProject(projectId.value);

      console.log('✅ Hitos y submissions cargados para el proyecto:', projectId.value);
    } catch (error) {
      console.error('❌ Error cargando hitos o submissions:', error);
    }
  }
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns);
});
</script>

<template>
  <div class="milestones-container">
    <!--Header de boton de crear-->
    <div class="milestones-header">
      <pv-button class="create-button"  @click="showCreateForm = true">
        + Crear
      </pv-button>
    </div>

    <div class="filters-container">
      <!-- Filtro por Colaborador - MODIFICADO para selección múltiple -->
      <div class="filter-item" @click="toggleCollaboratorDropdown">
        <span class="filter-text">
          {{ getCollaboratorsFilterText() }}
        </span>
        <span class="dropdown-arrow">▼</span>

        <!-- Dropdown de Colaboradores - MODIFICADO para selección múltiple -->
        <div v-if="showCollaboratorDropdown" class="dropdown-menu">
          <div
              class="dropdown-item"
              @click.stop="selectedCollaborators = []"
          >
            <span class="checkbox-item">
              <span class="checkbox" :class="{ checked: selectedCollaborators.length === 0 }"></span>
              Todos los colaboradores
            </span>
          </div>
          <div
              v-for="collaborator in uniqueCollaborators"
              :key="collaborator.id"
              class="dropdown-item"
              @click.stop="toggleCollaboratorSelection(collaborator)"
          >
            <span class="checkbox-item">
              <span class="checkbox" :class="{ checked: isCollaboratorSelected(collaborator) }"></span>
              {{ collaborator.name }}
            </span>
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
          class="clear-filters-btn"
          severity="secondary"
          label="Limpiar"
          @click="clearFilters"
      ></pv-button>
    </div>

    <!-- ✅ MODIFICADO: Pasar projectId y usar filteredMilestones -->
    <MilestoneList
        :projectId="String(projectId)"
        :milestones="filteredMilestones"
    />
  </div>

  <!-- Modal de creación de hito -->
  <pv-dialog
      v-model:visible="showCreateForm"
      modal
      :style="{ width: '70vw', maxWidth: '800px' }"
      header="Crear nuevo hito"
  >
    <!-- ✅ CORREGIR: Pasar projectId al formulario -->
    <MilestoneCreateForm
        :projectId="projectId"
        @cancel="showCreateForm = false"
        @submit="onMilestoneCreated"
    />
  </pv-dialog>
</template>

<style scoped>
.milestones-container {
  padding: 1.5rem;
  background: var(--color-white, #FFFFFF);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

.clear-filters-btn {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
}

.milestones-header {
  margin-bottom: 1.5rem;
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
  color: var(--color-gray-900, #6b7280);
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
  max-height: 300px;
  overflow-y: auto;
  margin-top: 0.25rem;
}

.dropdown-item {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: var(--color-gray-900, #374151);
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
}

.dropdown-item:hover {
  background: var(--color-gray-50, #f8f9fa);
}

.dropdown-item:last-child {
  border-bottom: none;
}

/* ✅ NUEVO: Estilos para checkboxes personalizados */
.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.checkbox {
  width: 16px;
  height: 16px;
  border: 2px solid #d1d5db;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.checkbox.checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.checkbox.checked::after {
  content: '✓';
  color: var(--color-white, #FFFFFF);
  font-size: 12px;
  font-weight: bold;
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