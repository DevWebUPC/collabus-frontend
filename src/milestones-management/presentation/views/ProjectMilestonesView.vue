<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRoute } from "vue-router";
import MilestoneCreateForm from "./MilestoneCreateForm.vue";
import MilestoneList from "../components/MilestoneList.component.vue";
import { useProjectDetailStore } from "../../../projects/application/project-detail.store.js";
import { useMilestonesStore } from "../../application/milestone-store.js";

// ✅ AGREGAR: Obtener la ruta y stores
const route = useRoute();
const projectDetailStore = useProjectDetailStore();
const milestonesStore = useMilestonesStore();

// ✅ CORREGIR: Obtener projectId de la ruta
const projectId = computed(() => {
  const id = route.params.projectId || route.params.id;
  console.log('🆔 Project ID from route:', id, 'Type:', typeof id);

  // Convertir a string para consistencia
  if (id) {
    return String(id);
  }

  console.error('❌ Project ID not found in route params:', route.params);
  return null;
});

// Estado de filtros
const selectedStatus = ref(null);
const selectedCollaborators = ref([]); // ✅ CAMBIO: Ahora es un array para múltiples colaboradores
const showStatusDropdown = ref(false);
const showCollaboratorDropdown = ref(false);
const showCreateForm = ref(false);

// ✅ AGREGAR: Función para manejar cuando se crea un hito
const onMilestoneCreated = (nuevoHito) => {
  console.log('🎉 Hito creado exitosamente:', nuevoHito);
  showCreateForm.value = false;
};

// Obtener hitos del store con filtros aplicados
const filteredMilestones = computed(() => {
  if (!projectId.value) return [];

  let milestones = milestonesStore.getProjectMilestones(projectId.value);

  // Aplicar filtro por estado
  if (selectedStatus.value) {
    milestones = milestones.filter(milestone => {
      const status = determineMilestoneStatus(milestone);
      return status === selectedStatus.value;
    });
  }

  // ✅ NUEVO: Aplicar filtro por múltiples colaboradores
  if (selectedCollaborators.value.length > 0) {
    milestones = milestones.filter(milestone => {
      // Verificar si el hito tiene TODOS los colaboradores seleccionados
      return selectedCollaborators.value.every(selectedCollab => {
        return hasCollaboratorInMilestone(milestone, selectedCollab.id);
      });
    });
  }

  return milestones;
});

// ✅ NUEVO: Verificar si un colaborador participa en un hito
const hasCollaboratorInMilestone = (milestone, collaboratorId) => {
  if (!milestone.milestoneTasks || !Array.isArray(milestone.milestoneTasks)) {
    return false;
  }

  return milestone.milestoneTasks.some(task =>
      task.assignedTo === collaboratorId
  );
};

// ✅ NUEVO: Obtener colaboradores únicos de todos los hitos
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

// ✅ NUEVO: Determinar estado del hito (similar a MilestoneList.component.vue)
const determineMilestoneStatus = (milestone) => {
  // Si está completado, retornar completado
  if (milestone.status === 'completed' || milestone.progress === 100) {
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

const getStatusText = (status) => {
  const statusMap = {
    'pending': 'Pendiente',
    'completed': 'Completado',
    'overdue': 'Retrasado'
  };
  return statusMap[status] || status;
};

// Resto del código existente...
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

// ✅ MODIFICADO: Manejar selección múltiple de colaboradores
const toggleCollaboratorSelection = (collaborator) => {
  const existingIndex = selectedCollaborators.value.findIndex(
      collab => collab.id === collaborator.id
  );

  if (existingIndex > -1) {
    // Remover si ya está seleccionado
    selectedCollaborators.value.splice(existingIndex, 1);
  } else {
    // Agregar si no está seleccionado
    selectedCollaborators.value.push(collaborator);
  }
};

// ✅ NUEVO: Verificar si un colaborador está seleccionado
const isCollaboratorSelected = (collaborator) => {
  return selectedCollaborators.value.some(
      collab => collab.id === collaborator.id
  );
};

// ✅ NUEVO: Obtener texto para el filtro de colaboradores
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

// ✅ NUEVO: Cargar hitos al montar el componente
onMounted(async () => {
  console.log('📍 Route params in ProjectMilestonesView:', route.params);
  console.log('📍 Full route object:', route);
  document.addEventListener('click', closeDropdowns);

  // Cargar hitos del proyecto
  if (projectId.value) {
    try {
      await milestonesStore.loadProjectMilestones(projectId.value);
      console.log('✅ Hitos cargados para el proyecto:', projectId.value);
    } catch (error) {
      console.error('❌ Error cargando hitos:', error);
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
  background: white;
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
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  position: relative;
  min-width: 160px;
}

.filter-text {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
  flex: 1;
}

.dropdown-arrow {
  font-size: 0.75rem;
  color: #6b7280;
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

/* Dropdown Styles */
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
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
  color: #374151;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
}

.dropdown-item:hover {
  background: #f8f9fa;
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
  color: white;
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