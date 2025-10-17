<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useApplicationStore } from '../../application/application.store.js';
import { useProjectDetailStore } from '../../application/project-detail.store.js';

const route = useRoute();
const router = useRouter();
const applicationStore = useApplicationStore();
const projectDetailStore = useProjectDetailStore();

const application = ref(null);
const isLoading = ref(false);

// Computed para obtener el nombre del rol
const roleName = computed(() => {
  if (!application.value || !projectDetailStore.project?.roles) return '';

  const role = projectDetailStore.project.roles.find(
      r => String(r.id) === String(application.value.roleId)
  );
  return role?.name || 'Rol no encontrado';
});

onMounted(async () => {
  const applicationId = route.params.applicationId;
  if (!applicationId) {
    router.push({ name: 'projects' });
    return;
  }

  try {
    isLoading.value = true;

    // Cargar la aplicación específica
    application.value = await applicationStore.fetchApplication(applicationId);

    // Cargar el proyecto para obtener información de roles
    if (application.value.projectId) {
      await projectDetailStore.fetchProjectById(application.value.projectId);
    }

  } catch (error) {
    console.error('Error loading application:', error);
  } finally {
    isLoading.value = false;
  }
});

const downloadCV = () => {
  if (application.value.cvFile) {
    // Crear un enlace temporal para descargar el CV
    const link = document.createElement('a');
    link.href = application.value.cvFile;
    link.download = application.value.cvFileName || 'CV.pdf';
    link.click();
  }
};

const goBack = () => {
  router.back();
};

const getStatusText = (status) => {
  const statusMap = {
    'pending': 'Pendiente',
    'accepted': 'Aceptado',
    'rejected': 'Rechazado'
  };
  return statusMap[status] || status;
};

const getStatusClass = (status) => {
  const classMap = {
    'pending': 'status-pending',
    'accepted': 'status-accepted',
    'rejected': 'status-rejected'
  };
  return classMap[status] || '';
};
</script>

<template>
  <div class="project-applicant">
    <!-- Header -->
    <div class="page-header">
      <pv-button
          icon="pi pi-arrow-left"
          text
          @click="goBack"
          class="back-btn"
      />
      <h1 class="page-title">Detalles de la Postulación</h1>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <pv-progress-spinner />
      <span>Cargando información del postulante...</span>
    </div>

    <!-- Application Details -->
    <div v-else-if="application" class="applicant-details">
      <!-- Información Personal -->
      <div class="detail-section">
        <h2 class="section-title">Información Personal</h2>
        <div class="detail-grid">
          <div class="detail-item">
            <label>Nombre completo:</label>
            <span>{{ application.applicantName }}</span>
          </div>
          <div class="detail-item">
            <label>Email:</label>
            <span>{{ application.applicantEmail }}</span>
          </div>
          <div class="detail-item">
            <label>Portfolio:</label>
            <span v-if="application.applicantPortfolio">
    <a :href="application.applicantPortfolio" target="_blank" class="portfolio-link">
      {{ application.applicantPortfolio }}
    </a>
  </span>
            <span v-else class="no-info">No proporcionado</span>
          </div>
          <div class="detail-item">
            <label>Teléfono:</label>
            <span v-if="application.applicantPhone">{{ application.applicantPhone }}</span>
            <span v-else class="no-info">No proporcionado</span>
          </div>
        </div>
      </div>

      <!-- Información de la Postulación -->
      <div class="detail-section">
        <h2 class="section-title">Información de la Postulación</h2>
        <div class="detail-grid">
          <div class="detail-item">
            <label>Rol postulado:</label>
            <span class="role-name">{{ roleName }}</span>
          </div>
          <div class="detail-item">
            <label>Estado:</label>
            <span :class="['status-badge', getStatusClass(application.status)]">
              {{ getStatusText(application.status) }}
            </span>
          </div>
          <div class="detail-item">
            <label>Fecha de postulación:</label>
            <span>{{ new Date(application.createdAt).toLocaleDateString('es-ES') }}</span>
          </div>
        </div>
      </div>

      <!-- Mensaje de Presentación -->
      <div class="detail-section">
        <h2 class="section-title">Mensaje de Presentación</h2>
        <div class="message-content">
          {{ application.message }}
        </div>
      </div>

      <!-- Curriculum Vitae -->
      <div class="detail-section">
        <h2 class="section-title">Curriculum Vitae</h2>
        <div class="cv-section">
          <div v-if="application.cvFileName" class="cv-info">
            <i class="pi pi-file-pdf file-icon"></i>
            <div class="file-details">
              <span class="file-name">{{ application.cvFileName }}</span>
              <small class="file-size">Archivo PDF</small>
            </div>
            <pv-button
                label="Descargar CV"
                icon="pi pi-download"
                @click="downloadCV"
                :disabled="!application.cvFile"
            />
          </div>
          <div v-else class="no-cv">
            <i class="pi pi-file-excel no-cv-icon"></i>
            <span>No se ha subido ningún CV</span>
          </div>
        </div>
      </div>

    </div>

    <!-- Error State -->
    <div v-else class="error-state">
      <i class="pi pi-exclamation-triangle error-icon"></i>
      <h3>No se pudo cargar la información del postulante</h3>
      <p>La postulación solicitada no existe o no se pudo cargar.</p>
      <pv-button
          label="Volver a los proyectos"
          @click="goBack"
          class="error-back-btn"
      />
    </div>
  </div>
</template>

<style scoped>
.project-applicant {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.back-btn {
  color: var(--color-primary);
  margin-right: 1rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-gray-800);
  margin: 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  gap: 1rem;
  color: var(--color-gray-600);
}

/* Detail Sections */
.applicant-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-gray-800);
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color-primary);
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item label {
  font-weight: 600;
  color: var(--color-gray-700);
  font-size: 0.875rem;
}

.detail-item span {
  color: var(--color-gray-600);
}

.portfolio-link {
  color: var(--color-primary);
  text-decoration: none;
  word-break: break-all;
}

.portfolio-link:hover {
  text-decoration: underline;
}

.no-info {
  color: var(--color-gray-400);
  font-style: italic;
}

.role-name {
  font-weight: 500;
  color: var(--color-primary);
}

/* Status Badge */
.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-pending {
  background: var(--color-yellow-50);
  color: var(--color-yellow-600);
  border: 1px solid var(--color-yellow-200);
}

.status-accepted {
  background: var(--color-green-50);
  color: var(--color-green-600);
  border: 1px solid var(--color-green-200);
}

.status-rejected {
  background: var(--color-red-50);
  color: var(--color-red-600);
  border: 1px solid var(--color-red-200);
}

/* Message Content */
.message-content {
  background: var(--color-gray-50);
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid var(--color-primary);
  white-space: pre-wrap;
  line-height: 1.6;
  color: var(--color-gray-700);
}

/* CV Section */
.cv-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cv-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-gray-50);
  border-radius: 8px;
  border: 1px solid var(--color-gray-200);
}

.file-icon {
  font-size: 2rem;
  color: var(--color-red-500);
}

.file-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.file-name {
  font-weight: 500;
  color: var(--color-gray-700);
}

.file-size {
  color: var(--color-gray-500);
  font-size: 0.75rem;
}

.no-cv {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem;
  background: var(--color-gray-50);
  border-radius: 8px;
  border: 2px dashed var(--color-gray-300);
  color: var(--color-gray-500);
  text-align: center;
  justify-content: center;
}

.no-cv-icon {
  font-size: 1.5rem;
}

/* Action Section */
.action-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-actions {
  display: flex;
  gap: 1rem;
}

:deep(.reject-btn.p-button) {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
  border: 1px solid var(--color-gray-300);
}

:deep(.reject-btn.p-button:hover) {
  background: var(--color-gray-200);
  border-color: var(--color-gray-400);
}

:deep(.accept-btn.p-button) {
  background: var(--color-primary);
  color: white;
  border: 1px solid var(--color-primary);
}

:deep(.accept-btn.p-button:hover) {
  background: var(--color-primary-600);
  border-color: var(--color-primary-600);
}

/* Error State */
.error-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.error-icon {
  font-size: 4rem;
  color: var(--color-red-400);
  margin-bottom: 1rem;
}

.error-state h3 {
  color: var(--color-gray-700);
  margin: 0 0 1rem 0;
}

.error-state p {
  color: var(--color-gray-500);
  margin: 0 0 2rem 0;
}

/* Responsive */
@media (max-width: 768px) {
  .project-applicant {
    padding: 1rem;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .action-section {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .status-actions {
    justify-content: center;
  }

  .cv-info {
    flex-direction: column;
    text-align: center;
  }

  .file-details {
    align-items: center;
  }
}

@media (max-width: 480px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .back-btn {
    align-self: flex-start;
  }
}
</style>
