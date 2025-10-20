<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import MilestoneCreateForm from "./MilestoneCreateForm.vue";

const selectedStatus = ref(null);
const selectedCollaborator = ref(null);
const showStatusDropdown = ref(false);
const showCollaboratorDropdown = ref(false);
const showCreateForm = ref(false)

const getStatusText = (status) => {
  const statusMap = {
    'pending': 'Pendiente',
    'completed': 'Completado',
    'retrasado': 'Retrasado'
  };
  return statusMap[status] || status;
};

// Opciones de estado
const statusOptions = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'completed', label: 'Completado' },
  { value: 'retrasado', label: 'Retrasado' }
];


// Métodos para manejar los dropdowns
const toggleStatusDropdown = () => {
  showStatusDropdown.value = !showStatusDropdown.value;
  showCollaboratorDropdown.value = false;
};

const toggleCollaboratorDropdown = () => {
  showCollaboratorDropdown.value = !showCollaboratorDropdown.value;
  showStatusDropdown.value = false;
};

const selectStatus = (status) => {
  selectedStatus.value = status;
  showStatusDropdown.value = false;
};

const selectCollaborator = (collaborator) => {
  selectedCollaborator.value = collaborator;
  showCollaboratorDropdown.value = false;
};

const clearFilters = () => {
  selectedStatus.value = null;
  selectedCollaborator.value = null;
};

// Verificar si hay filtros activos
const hasActiveFilters = ref(false);

// Cerrar dropdowns al hacer clic fuera
const closeDropdowns = (event) => {
  if (!event.target.closest('.filter-item')) {
    showStatusDropdown.value = false;
    showCollaboratorDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeDropdowns);
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
          v-if="selectedStatus || selectedCollaborator"
          class="clear-filters-btn"
          severity="secondary"
          label="Limpiar"
          @click="clearFilters"
      ></pv-button>
    </div>
  </div>

  <!-- Modal de creación de hito -->
  <pv-dialog
    v-model:visible="showCreateForm"
    modal
    :style="{ width: '70vw', maxWidth: '800px' }"
    header="Crear nuevo hito"
  >
    <MilestoneCreateForm
        @cancel="showCreateForm = false"

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
  max-height: 200px;
  overflow-y: auto;
  margin-top: 0.25rem;
}

.dropdown-item {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
}

.dropdown-item:hover {
  background: #f8f9fa;
}

.dropdown-item:last-child {
  border-bottom: none;
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