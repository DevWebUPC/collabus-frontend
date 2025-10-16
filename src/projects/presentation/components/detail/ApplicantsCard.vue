<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useApplicationStore } from '../../../application/application.store.js';
import {useProjectDetailStore} from "../../../application/project-detail.store.js";

const applicationStore = useApplicationStore();
const projectDetailStore = useProjectDetailStore();

// Estados
const isLoading = ref(false);

// Roles disponibles para el filtro
const availableRoles = ref([
  'Todos los roles'
]);

const selectedRole = ref('Todos los roles');

// Cargar aplicaciones cuando el componente se monta
onMounted(async () => {
  console.log('🚀 ApplicantsCard mounted');
  await loadProjectApplications();
  loadAvailableRoles();
});

// Watch para recargar cuando cambie el proyecto
watch(
    () => projectDetailStore.project?.id,
    async (newProjectId) => {
      if (newProjectId) {
        console.log('🔄 Project changed, reloading applications:', newProjectId);
        await loadProjectApplications();
        loadAvailableRoles();
      }
    }
);

const loadProjectApplications = async () => {
  if (!projectDetailStore.project?.id) {
    console.log('❌ No project ID available');
    return;
  }

  try {
    isLoading.value = true;
    const projectId = projectDetailStore.project.id;
    console.log('🔄 Loading applications for project:', projectId);

    await applicationStore.fetchProjectApplications(projectId);

    // ✅ CORREGIDO: Recargar detalles del proyecto para actualizar notificaciones
    await reloadProjectDetail();

    // Debug: ver qué aplicaciones se cargaron
    const loadedApps = applicationStore.projectApplications(projectId);
    console.log('📋 Loaded applications:', loadedApps);

  } catch (error) {
    console.error('❌ Error loading applications:', error);
  } finally {
    isLoading.value = false;
  }
};

const reloadProjectDetail = async () => {
  if (projectDetailStore.project?.id) {
    try {
      console.log('🔄 Recargando detalles del proyecto...');
      await projectDetailStore.fetchProject(projectDetailStore.project.id);
    } catch (error) {
      console.error('Error recargando proyecto:', error);
    }
  }
};

const loadAvailableRoles = () => {
  if (!projectDetailStore.project?.roles) {
    console.log('❌ No roles found in project');
    return;
  }

  console.log('🎭 Project roles:', projectDetailStore.project.roles);

  availableRoles.value = ['Todos los roles'];
  projectDetailStore.project.roles.forEach(role => {
    if (role.name && !availableRoles.value.includes(role.name)) {
      availableRoles.value.push(role.name);
    }
  });

  console.log('📋 Available roles for filter:', availableRoles.value);
};

// Computed: Aplicaciones filtradas - CORREGIDO
const filteredApplicants = computed(() => {
  if (!projectDetailStore.project?.id) {
    console.log('❌ No project ID for filtering');
    return [];
  }

  const projectApps = applicationStore.projectApplications(projectDetailStore.project.id);
  console.log('🔍 Filtering applications:', projectApps);
  console.log('🎯 Selected role:', selectedRole.value);

  if (selectedRole.value === 'Todos los roles') {
    return projectApps;
  }

  const filtered = projectApps.filter(application => {
    // CORREGIDO: Comparar convirtiendo ambos a string o ambos a número
    const role = projectDetailStore.project?.roles.find(r =>
        String(r.id) === String(application.roleId)
    );
    console.log(`🔍 Application ${application.id} role:`, role?.name);
    return role?.name === selectedRole.value;
  });

  console.log('✅ Filtered result:', filtered);
  return filtered;
});

// Computed: Datos formateados para la tabla
const applicantsData = computed(() => {
  const data = filteredApplicants.value.map(application => {
    // CORREGIDO: Buscar el rol convirtiendo tipos
    const role = projectDetailStore.project?.roles.find(r =>
        String(r.id) === String(application.roleId)
    );
    const roleName = role?.name || 'Rol no encontrado';

    return {
      id: application.id,
      // CORREGIDO: Usar applicantName directamente de la aplicación
      name: application.applicantName || 'Nombre no disponible',
      role: roleName,
      date: formatApplicationDate(application.createdAt || application.appliedAt),
      // QUITADO: avatar: getInitials(application.applicantName), // Eliminamos el avatar
      application: application
    };
  });

  console.log('📊 Applicants data for table:', data);
  return data;
});



const formatApplicationDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return 'Fecha inválida';
  }
};

// En ApplicantsCard.vue - agregar método temporal para testing
const testNotification = async () => {
  try {
    console.log('🧪 Probando notificación...');

    const testNotification = {
      id: `test_${Date.now()}`,
      type: 'new_application',
      title: 'Notificación de prueba 🎯',
      message: 'Esta es una notificación de prueba',
      date: new Date().toISOString(),
      read: false,
      applicationId: 'test',
      applicantName: 'Usuario de Prueba',
      applicantEmail: 'test@example.com',
      roleId: '1',
      projectId: projectDetailStore.project?.id
    };

    const { useProjectsStore } = await import('../../../application/projects.store.js');
    const projectsStore = useProjectsStore();

    await projectsStore.addNotification(projectDetailStore.project.id, testNotification);
    console.log('✅ Notificación de prueba creada');

    // Recargar
    await reloadProjectDetail();

  } catch (error) {
    console.error('❌ Error en prueba:', error);
  }
};

</script>

<template>
  <div class="applicants-card">
    <!-- Header -->
    <div class="card-header">
      <h2 class="card-title">Postulantes al proyecto</h2>
      <div class="header-actions">
        <pv-button
            label="Test Notif"
            severity="secondary"
            @click="testNotification"
            class="test-btn"
        />
        <!-- Filtro de roles -->
        <div class="role-filter">
          <label for="role-select" class="filter-label">Filtrar por puesto</label>
          <pv-dropdown
              id="role-select"
              v-model="selectedRole"
              :options="availableRoles"
              placeholder="Selecciona puesto"
              class="role-dropdown"
              :disabled="isLoading"
          />
        </div>

        <!-- Botón recargar -->
        <pv-button
            icon="pi pi-refresh"
            text
            @click="loadProjectApplications"
            :loading="isLoading"
            class="reload-btn"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <pv-progress-spinner />
      <span>Cargando postulantes...</span>
    </div>

    <!-- Tabla de postulantes -->
    <div v-else class="applicants-table">
      <div class="table-header">
        <div class="table-col postulante">Postulantes</div>
        <div class="table-col rol">Rol Propuesto</div>
        <div class="table-col fecha">Fecha</div>
        <div class="table-col acciones">Acciones</div>
      </div>

      <div class="table-body">
        <div
            v-for="applicant in applicantsData"
            :key="applicant.id"
            class="table-row"
        >
          <!-- Columna Postulante -->
          <div class="table-col postulante">
            <div class="applicant-info">
              <div class="applicant-details">
                <span class="applicant-name">{{ applicant.name }}</span>
              </div>
            </div>
          </div>

          <!-- Columna Rol -->
          <div class="table-col rol">
            <span class="role-badge">{{ applicant.role }}</span>
          </div>

          <!-- Columna Fecha -->
          <div class="table-col fecha">
            {{ applicant.date }}
          </div>

          <!-- Columna Acciones -->
          <div class="table-col acciones">
            <div class="action-buttons">
              <pv-button
                  label="Rechazar"
                  severity="secondary"
                  size="small"
                  class="reject-btn"
                  :disabled="applicant.application.status !== 'pending'"
              />
              <pv-button
                  label="Ver"
                  severity="secondary"
                  size="small"
                  class="view-btn"
              />
              <pv-button
                  label="Aceptar"
                  severity="primary"
                  size="small"
                  class="accept-btn"
                  :disabled="applicant.application.status !== 'pending'"
              />
            </div>

            <!-- Estado actual -->
            <div v-if="applicant.application.status !== 'pending'" class="application-status">
              <span :class="['status-badge', applicant.application.status]">
                {{ applicant.application.status === 'accepted' ? 'Aceptado' :
                  applicant.application.status === 'rejected' ? 'Rechazado' :
                      'Pendiente' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensaje si no hay postulantes -->
    <div v-if="!isLoading && applicantsData.length === 0" class="empty-state">
      <i class="pi pi-users empty-icon"></i>
      <p>No hay postulantes para el rol seleccionado</p>
      <small>Los postulantes aparecerán aquí cuando envíen sus aplicaciones</small>
    </div>

  </div>
</template>

<style scoped>
.applicants-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-gray-800);
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.role-filter {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.875rem;
  color: var(--color-gray-600);
  font-weight: 500;
}

.role-dropdown {
  min-width: 200px;
}

.reload-btn {
  color: var(--color-primary);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
  color: var(--color-gray-600);
}

/* Estilos de la tabla */
.applicants-table {
  border: 1px solid var(--color-gray-200);
  border-radius: 8px;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 2fr;
  background: var(--color-gray-50);
  border-bottom: 1px solid var(--color-gray-200);
  padding: 1rem 1.5rem;
  font-weight: 600;
  color: var(--color-gray-700);
  font-size: 0.875rem;
}

.table-body {
  background: white;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 2fr;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-gray-100);
  align-items: center;
}

.table-row:last-child {
  border-bottom: none;
}

.table-col {
  display: flex;
  align-items: center;
}

/* Estilos específicos por columna */
.postulante .applicant-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.applicant-details {
  display: flex;
  flex-direction: column;
}

.applicant-name {
  font-weight: 500;
  color: var(--color-gray-800);
}

.applicant-email {
  font-size: 0.75rem;
  color: var(--color-gray-500);
  margin-top: 0.25rem;
}

.rol .role-badge {
  background: var(--color-primary-50);
  color: var(--color-primary);
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.fecha {
  color: var(--color-gray-600);
  font-size: 0.875rem;
}

.acciones {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.application-status {
  display: flex;
  justify-content: center;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.accepted {
  background: var(--color-green-50);
  color: var(--color-green-600);
  border: 1px solid var(--color-green-200);
}

.status-badge.rejected {
  background: var(--color-red-50);
  color: var(--color-red-600);
  border: 1px solid var(--color-red-200);
}

.status-badge.pending {
  background: var(--color-yellow-50);
  color: var(--color-yellow-600);
  border: 1px solid var(--color-yellow-200);
}

/* Estilos de botones */
:deep(.reject-btn.p-button) {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
  border: 1px solid var(--color-gray-300);
  border-radius: 6px;
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}

:deep(.reject-btn.p-button:hover:not(:disabled)) {
  background: var(--color-gray-200);
  border-color: var(--color-gray-400);
}

:deep(.view-btn.p-button) {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: 6px;
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}

:deep(.view-btn.p-button:hover) {
  background: var(--color-primary-50);
}

:deep(.accept-btn.p-button) {
  background: var(--color-primary);
  color: white;
  border: 1px solid var(--color-primary);
  border-radius: 6px;
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
}

:deep(.accept-btn.p-button:hover:not(:disabled)) {
  background: var(--color-primary-600);
  border-color: var(--color-primary-600);
}

/* Estado vacío */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--color-gray-500);
}

.empty-icon {
  font-size: 3rem;
  color: var(--color-gray-300);
  margin-bottom: 1rem;
}

.empty-state p {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.empty-state small {
  font-size: 0.875rem;
  color: var(--color-gray-400);
}

/* Responsive */
@media (max-width: 1024px) {
  .table-header,
  .table-row {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .acciones {
    grid-column: span 2;
  }

  .action-buttons {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
  }

  .role-filter {
    width: 100%;
  }

  .role-dropdown {
    min-width: 100%;
  }

  .table-header {
    display: none;
  }

  .table-row {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
    border: 1px solid var(--color-gray-200);
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .table-col {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .table-col::before {
    content: attr(data-label);
    font-weight: 600;
    color: var(--color-gray-600);
    font-size: 0.875rem;
  }

  .postulante::before { content: "Postulante"; }
  .rol::before { content: "Rol"; }
  .fecha::before { content: "Fecha"; }
  .acciones::before { content: "Acciones"; }

  .acciones .action-buttons {
    width: 100%;
    justify-content: center;
  }

  .applicant-info {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
}
</style>