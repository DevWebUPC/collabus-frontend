<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useApplicationStore } from '../../application/application.store.js';
import { useProjectsStore } from '../../application/projects.store.js';
import { useUserStore } from '../../../iam/application/user-store.js';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const applicationStore = useApplicationStore();
const projectStore = useProjectsStore();
const userStore = useUserStore();

// Props
const props = defineProps({
  id: {
    type: String,
    required: true
  }
});

// Reactive data
const application = ref({
  projectId: props.id,
  projectTitle: '',
  applicantId: null,
  applicantName: '',
  applicantEmail: '',
  applicantPortfolio: '',
  applicantPhone: '',
  roleId: null,
  roleName: '',
  cvFile: null,
  cvFileName: '',
  message: '',
  acceptedTerms: false,
  status: 'pending'
});

const isLoading = ref(false);
const errors = ref([]);
const project = ref(null);

// Computed properties - CORREGIDO para la estructura actual
const availableRoles = computed(() => {
  if (!project.value?.roles) return [];

  return project.value.roles.map(role => ({
    id: role.id,
    name: role.name,
    status: 'open',
    vacancies: 1,
    cards: role.cards || []
  }));
});



// Methods
const validateForm = () => {
  const errors = [];
  const app = application.value;

  if (!app.projectId) {
    errors.push('Project ID is required');
  }

  // REMOVER ESTA VALIDACIÓN - applicantId se asigna automáticamente
  // if (!app.applicantId) {
  //   errors.push('Applicant ID is required');
  // }

  if (!app.roleId) {
    errors.push('Role selection is required');
  }

  if (!app.applicantName?.trim()) {
    errors.push('Full name is required');
  }

  if (!app.applicantEmail?.trim()) {
    errors.push('Email is required');
  } else if (!isValidEmail(app.applicantEmail)) {
    errors.push('Valid email is required');
  }

  if (!app.cvFile) {
    errors.push('CV file is required');
  }

  if (!app.message?.trim()) {
    errors.push('Presentation message is required');
  }

  if (!app.acceptedTerms) {
    errors.push('You must accept the terms and conditions');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// CORREGIDO: Obtener nombre del rol
const getRoleName = (roleId) => {
  const role = availableRoles.value.find(r => r.id == roleId);
  return role?.name || '';
};

// CORREGIDO: Obtener vacantes (siempre 1 por defecto)
const getRoleVacancies = (roleId) => {
  const role = availableRoles.value.find(r => r.id == roleId);
  return role?.vacancies || 1;
};

const handleFileUpload = async (event) => {
  const file = event.files[0];
  console.log('File selected:', file);
  if (file) {
    if (file.type === 'application/pdf') {
      try {
        // Convertir archivo a base64
        const base64File = await convertFileToBase64(file);
        application.value.cvFile = base64File;
        application.value.cvFileName = file.name;
        errors.value = errors.value.filter(error => !error.includes('CV file'));
        console.log('CV file converted to base64');
      } catch (error) {
        console.error('Error converting file:', error);
        errors.value.push('Error al procesar el archivo PDF');
      }
    } else {
      errors.value.push('Solo se permiten archivos PDF');
    }
  }
};

const removeFile = () => {
  application.value.cvFile = null;
  application.value.cvFileName = '';
};

const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

const handleSubmit = async () => {
  // Validar que el usuario esté autenticado ANTES de validar el formulario
  const currentUser = userStore.currentUser;
  if (!currentUser?.id) {
    errors.value = ['You must be logged in to submit an application'];
    return;
  }

  // Asignar el applicantId ANTES de la validación
  application.value.applicantId = currentUser.id;
  application.value.applicantName = currentUser.fullName || currentUser.name || application.value.applicantName;
  application.value.applicantEmail = currentUser.email || application.value.applicantEmail;

  // Validate form
  const validation = validateForm();
  console.log('Validation result:', validation);
  console.log('Form data:', application.value);

  if (!validation.isValid) {
    errors.value = validation.errors;
    console.log('Validation errors:', errors.value);
    return;
  }

  isLoading.value = true;
  errors.value = [];

  try {
    application.value.projectTitle = project.value?.title;

    // Asignar el nombre del rol seleccionado
    const selectedRole = availableRoles.value.find(r => r.id == application.value.roleId);
    if (selectedRole) {
      application.value.roleName = selectedRole.name;
    }

    // Submit application using the store
    await applicationStore.submitApplication(application.value);

    console.log('Application submitted successfully');

    router.push({
      name: 'home',
      query: { applicationSuccess: true }
    });

  } catch (error) {
    console.error('Error submitting application:', error);
    errors.value.push(error.message || t('application.errors.submissionFailed'));
  } finally {
    isLoading.value = false;
  }
};

const handleCancel = () => {
  router.back();
};

// Load project data and pre-fill user data
// En el onMounted, verificar autenticación
onMounted(async () => {
  try {
    isLoading.value = true;

    // ✅ AGREGAR ESTA LÍNEA: Inicializar usuario desde localStorage
    userStore.initializeUser();

    // Verificar si el usuario está autenticado
    if (!userStore.currentUser?.id) {
      errors.value = ['Debes iniciar sesión para postular a un proyecto'];
      // Opcional: redirigir al login después de unos segundos
      setTimeout(() => {
        router.push({ name: 'login' });
      }, 2000);
      return;
    }

    // Cargar proyecto
    project.value = await projectStore.fetchProjectById(props.id);
    application.value.projectTitle = project.value.title;

    console.log('Proyecto cargado:', project.value);
    console.log('Roles del proyecto:', project.value.roles);

    // Pre-fill user data from authenticated user
    const currentUser = userStore.currentUser;
    if (currentUser) {
      application.value.applicantId = currentUser.id;
      application.value.applicantName = currentUser.fullName || currentUser.name || '';
      application.value.applicantEmail = currentUser.email || '';
      application.value.applicantPhone = currentUser.phone || '';
      application.value.applicantPortfolio = currentUser.portfolio || currentUser.linkedIn || '';
    }
  } catch (error) {
    console.error('Error loading project:', error);
    errors.value.push('Error loading project data');
  } finally {
    isLoading.value = false;
  }
});</script>

<template>
  <div class="project-application">
    <div class="application-header">
      <h1 class="application-title">
        {{ t('application.title') }}
      </h1>
      <p class="application-subtitle">
        {{ t('application.subtitle', { project: project?.title || 'Loading...' }) }}
      </p>
    </div>

    <!-- Loading State for Project -->
    <div v-if="!project && isLoading" class="loading-state">
      <div class="skeleton-form">
        <div class="skeleton-section" v-for="i in 4" :key="i">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-field"></div>
          <div class="skeleton-line skeleton-field"></div>
        </div>
      </div>
    </div>

    <div v-else-if="project" class="application-form">
      <!-- Personal Information Section -->
      <div class="form-section">
        <h2 class="section-title">{{ t('application.personalInfo') }}</h2>

        <div class="form-grid">
          <!-- Full Name -->
          <div class="field">
            <label for="fullName" class="field-label">
              {{ t('application.fullName') }} *
            </label>
            <pv-input-text
                id="fullName"
                v-model="application.applicantName"
                :placeholder="t('application.placeholders.fullName')"
                class="w-full"
                :class="{ 'p-invalid': errors.includes('Full name is required') }"
            />
          </div>

          <!-- Email -->
          <div class="field">
            <label for="email" class="field-label">
              {{ t('application.email') }} *
            </label>
            <pv-input-text
                id="email"
                v-model="application.applicantEmail"
                type="email"
                :placeholder="t('application.placeholders.email')"
                class="w-full"
                :class="{ 'p-invalid': errors.includes('Email is required') || errors.includes('Valid email is required') }"
            />
          </div>

          <!-- Portfolio/LinkedIn -->
          <div class="field">
            <label for="portfolio" class="field-label">
              {{ t('application.portfolio') }} ({{ t('common.optional') }})
            </label>
            <pv-input-text
                id="portfolio"
                v-model="application.applicantPortfolio"
                :placeholder="t('application.placeholders.portfolio')"
                class="w-full"
            />
          </div>

          <!-- Phone Number -->
          <div class="field">
            <label for="phone" class="field-label">
              {{ t('application.phone') }} ({{ t('common.optional') }})
            </label>
            <pv-input-text
                id="phone"
                v-model="application.applicantPhone"
                :placeholder="t('application.placeholders.phone')"
                class="w-full"
            />
          </div>
        </div>
      </div>

      <!-- Role Selection - CORREGIDO -->
      <div class="form-section">
        <h2 class="section-title">{{ t('application.roleSelection') }}</h2>

        <div class="field">
          <label for="role" class="field-label">
            {{ t('application.selectRole') }} *
          </label>
          <pv-dropdown
              id="role"
              v-model="application.roleId"
              :options="availableRoles"
              option-label="name"
              option-value="id"
              :placeholder="t('application.placeholders.selectRole')"
              class="w-full"
              :class="{ 'p-invalid': errors.includes('Role selection is required') }"
              :disabled="availableRoles.length === 0"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value" class="role-option">
                <span>{{ getRoleName(slotProps.value) }}</span>
                <!-- CORREGIDO: Mostrar vacantes solo si existen -->
                <small v-if="getRoleVacancies(slotProps.value) > 0" class="role-meta">
                  {{ t('application.vacancies', { count: getRoleVacancies(slotProps.value) }) }}
                </small>
              </div>
              <span v-else>
                {{ slotProps.placeholder }}
              </span>
            </template>
            <template #option="slotProps">
              <div class="role-option">
                <span>{{ slotProps.option.name }}</span>
                <!-- CORREGIDO: Mostrar vacantes solo si existen -->
                <small v-if="slotProps.option.vacancies > 0" class="role-meta">
                  {{ t('application.vacancies', { count: slotProps.option.vacancies }) }}
                </small>
              </div>
            </template>
          </pv-dropdown>
          <small v-if="availableRoles.length === 0" class="field-hint">
            {{ t('application.noRolesAvailable') }}
          </small>
          <small v-else class="field-hint">
            {{ availableRoles.length }} roles disponibles
          </small>
        </div>
      </div>

      <!-- CV Upload -->
      <div class="form-section">
        <h2 class="section-title">{{ t('application.cvUpload') }}</h2>

        <div class="field">
          <label class="field-label">
            {{ t('application.uploadCV') }} *
          </label>

          <div v-if="!application.cvFileName" class="file-upload-area">
            <pv-file-upload
                mode="basic"
                :choose-label="t('application.chooseFile')"
                accept=".pdf"
                :max-file-size="10000000"
                @select="handleFileUpload"
                :class="{ 'p-invalid': errors.includes('CV file is required') }"
            />
            <small class="file-hint">
              {{ t('application.fileHint') }}
            </small>
          </div>

          <div v-else class="file-preview">
            <div class="file-info">
              <i class="pi pi-file-pdf file-icon"></i>
              <span class="file-name">{{ application.cvFileName }}</span>
            </div>
            <pv-button
                icon="pi pi-times"
                class="p-button-text p-button-danger"
                @click="removeFile"
            />
          </div>
        </div>
      </div>

      <!-- Presentation Message -->
      <div class="form-section">
        <h2 class="section-title">{{ t('application.presentation') }}</h2>

        <div class="field">
          <label for="message" class="field-label">
            {{ t('application.message') }} *
          </label>
          <pv-textarea
              id="message"
              v-model="application.message"
              :placeholder="t('application.placeholders.message')"
              rows="5"
              class="w-full"
              :class="{ 'p-invalid': errors.includes('Presentation message is required') }"
          />
        </div>
      </div>

      <!-- Terms and Conditions -->
      <div class="form-section">
        <div class="field checkbox-field">
          <pv-checkbox
              id="terms"
              v-model="application.acceptedTerms"
              :binary="true"
              :class="{ 'p-invalid': errors.includes('You must accept the terms and conditions') }"
          />
          <label for="terms" class="checkbox-label">
            {{ t('application.acceptTerms') }}
          </label>
        </div>
      </div>

      <!-- Error Messages -->
      <div v-if="errors.length" class="error-messages">
        <pv-message severity="error" :closable="true" @close="errors = []">
          <ul>
            <li v-for="error in errors" :key="error">
              {{ error }}
            </li>
          </ul>
        </pv-message>
      </div>

      <!-- Action Buttons -->
      <div class="form-actions">
        <pv-button
            :label="t('common.cancel')"
            icon="pi pi-times"
            class="p-button-secondary"
            @click="handleCancel"
            :disabled="isLoading"
        />
        <pv-button
            :label="t('application.submit')"
            icon="pi pi-send"
            @click="handleSubmit"
            :loading="isLoading"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.project-application {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.application-header {
  text-align: center;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--color-gray-200);
}

.application-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-gray-900);
  margin: 0 0 1rem 0;
}

.application-subtitle {
  font-size: 1.1rem;
  color: var(--color-gray-600);
  margin: 0;
}

/* Loading State */
.loading-state {
  padding: 2rem;
}

.skeleton-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.skeleton-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-line {
  height: var(--space-3);
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg, var(--color-gray-200) 25%, var(--color-gray-100) 50%, var(--color-gray-200) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-title {
  width: 40%;
  height: 20px;
}

.skeleton-field {
  width: 100%;
  height: 40px;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Form Styles */
.form-section {
  margin-bottom: 2.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-gray-800);
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color-primary);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.field {
  margin-bottom: 1.5rem;
}

.field-label {
  display: block;
  font-weight: 600;
  color: var(--color-gray-700);
  margin-bottom: 0.5rem;
}

.field-hint {
  display: block;
  margin-top: 0.5rem;
  color: var(--color-gray-500);
  font-size: 0.875rem;
}

.checkbox-field {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.checkbox-label {
  font-weight: 500;
  color: var(--color-gray-700);
  margin: 0;
  cursor: pointer;
}

.file-upload-area {
  border: 2px dashed var(--color-gray-300);
  border-radius: var(--radius-lg);
  padding: 2rem;
  text-align: center;
  transition: border-color 0.2s ease;
}

.file-upload-area:hover {
  border-color: var(--color-primary);
}

.file-hint {
  display: block;
  margin-top: 0.5rem;
  color: var(--color-gray-500);
  font-size: 0.875rem;
}

.file-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--color-gray-50);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.file-icon {
  font-size: 1.5rem;
  color: var(--color-red-500);
}

.file-name {
  font-weight: 500;
  color: var(--color-gray-700);
}

.role-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.role-meta {
  color: var(--color-gray-500);
  font-size: 0.75rem;
}

.error-messages {
  margin: 2rem 0;
}

.error-messages ul {
  margin: 0;
  padding-left: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 2rem;
  border-top: 1px solid var(--color-gray-200);
}

/* Error State */
.error-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--color-gray-600);
}

.error-icon {
  font-size: 4rem;
  color: var(--color-red-400);
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-gray-700);
  margin: 0 0 0.5rem 0;
}

.error-message {
  font-size: 1rem;
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

/* Responsive Design */
@media (max-width: 768px) {
  .project-application {
    padding: 1rem;
    margin: 0.5rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .application-title {
    font-size: 1.5rem;
  }

  .application-subtitle {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .file-preview {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>