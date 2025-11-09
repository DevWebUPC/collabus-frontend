<script setup>
import { onMounted, computed } from 'vue'; // Añade computed
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import ProjectStepper from '../components/ProjectStepper.vue';
import ProjectBasicInfoStep from '../components/ProjectBasicInfoStep.vue';
import ProjectDetailsStep from '../components/ProjectDetailsStep.vue';
import ProjectRolesStep from '../components/ProjectRolesStep.vue';
import { useProjectCreateStore } from '../../application/project-create.store.js';

const { t } = useI18n();
const router = useRouter();
const store = useProjectCreateStore();

const {
  nextStep,
  prevStep,
  loadAllOptions,
  submitProject,
} = store;

// Load initial data
onMounted(async () => {
  await loadAllOptions();
});

// Navigation methods
const navigateBack = () => {
  router.push('/projects');
};

const handleSubmit = async () => {
  const newProject = await submitProject();

  if (newProject) {
    router.push('/projects');
  }
};

// Debug helper para ver el estado
const debugState = () => {
  console.log('Current Step:', store.currentStep);
  console.log('Is Step Valid:', store.isStepValid);
  console.log('Can Go Next:', store.canGoNext);
  console.log('Basic Info Data:', store.basicInfoData);
  console.log('Details Data:', store.detailsData);
  console.log('Roles Data:', store.rolesData);
};
</script>

<template>
  <div class="project-create-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">{{ $t('projects.create.title') }}</h1>
        <!-- Botón de debug temporal -->
        <pv-button
            @click="debugState"
            severity="secondary"
            size="small"
            style="margin-left: 1rem;"
        >
          Debug
        </pv-button>
      </div>
    </div>

    <!-- Progress Steps -->
    <div class="steps-container">
      <ProjectStepper
          :current-step="store.currentStep"
          :total-steps="store.totalSteps"
          :step-labels="store.stepLabels"
      />
    </div>

    <!-- Main Content -->
    <div class="create-form-container">
      <div class="form-card">
        <!-- Error Messages -->
        <div v-if="store.errors.length > 0" class="error-messages">
          <pv-message
              v-for="(error, index) in store.errors"
              :key="index"
              severity="error"
              :closable="false"
              class="error-message"
          >
            {{ error }}
          </pv-message>
        </div>

        <!-- Mensajes de validación del paso actual -->
        <div v-if="!store.isStepValid && store.currentStep === 0" class="validation-message">
          <pv-message severity="warn" :closable="false">
            Completa toda la información básica del proyecto para continuar
          </pv-message>
        </div>

        <div v-if="!store.isStepValid && store.currentStep === 1" class="validation-message">
          <pv-message severity="warn" :closable="false">
            Completa los detalles del proyecto para continuar
          </pv-message>
        </div>

        <!-- Step 1: Project Basic Information -->
        <ProjectBasicInfoStep
            v-if="store.currentStep === 0"
            v-model="store.basicInfoData"
        />

        <!-- Step 2: Additional Details -->
        <ProjectDetailsStep
            v-if="store.currentStep === 1"
            v-model="store.detailsData"
        />

        <!-- Step 3: Define Roles -->
        <ProjectRolesStep
            v-if="store.currentStep === 2"
            v-model="store.rolesData"
        />

        <!-- Navigation Buttons -->
        <div class="form-actions">
          <pv-button
              v-if="store.canGoBack"
              :label="$t('projects.create.back')"
              severity="secondary"
              outlined
              @click="prevStep"
              class="back-btn"
          />
          <pv-button
              v-else
              :label="$t('projects.create.cancel')"
              severity="secondary"
              outlined
              @click="navigateBack"
              class="cancel-btn"
          />

          <pv-button
              v-if="!store.isLastStep"
              :label="$t('projects.create.next')"
              @click="nextStep"
              :disabled="!store.isStepValid || store.submitting"
              class="next-btn"
              size="large"
          />
          <pv-button
              v-else
              :label="$t('projects.create.publish')"
              @click="handleSubmit"
              :loading="store.submitting"
              :disabled="store.submitting || !store.isStepValid"
              class="publish-btn"
              size="large"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.project-create-container {
  min-height: 100vh;
  background: var(--color-gray-300, #f8fafc);
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-primary);
  margin: 0;
}

/* Steps Indicator */
.steps-container {
  max-width: 800px;
  margin: 0 auto 2rem;
}

.steps-indicator {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.step-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-gray-300, #e5e7eb);
  transition: all 0.3s ease;
}

.step-dot.active {
  background: var(--color-primary);
  transform: scale(1.2);
}

.step-dot.completed {
  background: #22c55e;
}

/* Form Container */
.create-form-container {
  max-width: 800px;
  margin: 0 auto;
}

/* Error Messages */
.error-messages {
  margin-bottom: 1.5rem;
}

.error-message {
  margin-bottom: 0.5rem;
}

.form-card {
  background: var(--color-white, #FFFFFF);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 2rem;
}

.step-content {
  min-height: 500px;
}

.step-header {
  margin-bottom: 2rem;
}

.step-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-gray-900, #374151);
  margin: 0;
}

/* Form Elements */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 600;
  color: var(--color-gray-900, #374151);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  border: 2px solid var(--color-gray-300, #e5e7eb);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.1);
}

/* Step 1 Specific Styles */
.form-grid-step1 {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.benefits-section .benefits-textarea {
  min-height: 150px;
  resize: vertical;
}

.skills-input-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.skills-input {
  flex: 1;
}

.add-skill-btn {
  background: var(--color-primary);
  border: none;
  color: var(--color-white, #FFFFFF);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  flex-shrink: 0;
}

.add-skill-btn:hover:not(:disabled) {
  background: #5B54FF;
}

.add-skill-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.skills-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-tag {
  background: #f1f5f9;
  color: var(--color-primary);
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.remove-tag {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-weight: bold;
  padding: 0;
  margin-left: 0.25rem;
}

.duration-container {
  display: flex;
  gap: 1rem;
}

.duration-quantity {
  flex: 1;
}

.duration-type {
  flex: 2;
}

/* Step 2 Specific Styles */
.roles-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.role-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 2px solid #f1f5f9;
  border-radius: 12px;
  background: #fafbfc;
}

.role-input-container {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.role-input {
  flex: 1;
}

.remove-role-btn {
  color: #ef4444;
}

.role-cards {
  margin: 1.5rem 0;
}

.role-card {
  background: var(--color-white, #FFFFFF);
  border: 2px solid var(--color-gray-300, #e5e7eb);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.card-header {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 1rem;
}

.card-title-input {
  flex: 1;
}

.remove-card-btn {
  color: #ef4444;
}

.card-items {
  margin-bottom: 1rem;
}

.card-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.item-label {
  font-weight: 500;
  color: #6b7280;
  min-width: 50px;
}

.item-input {
  flex: 1;
}

.remove-item-btn {
  color: #ef4444;
}

.add-item-btn,
.add-card-btn,
.add-role-btn {
  background: none;
  border: 2px solid var(--color-primary);
  color: var(--color-primary);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
}

.add-item-btn:hover,
.add-card-btn:hover,
.add-role-btn:hover {
  background: var(--color-primary);
  color: var(--color-white, #FFFFFF);
}

.add-role-btn {
  background: var(--color-primary);
  color: var(--color-white, #FFFFFF);
  margin-top: 1rem;
}

/* Step 3 Specific Styles */
.form-grid-step3 {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.summary-section .summary-textarea {
  min-height: 150px;
  resize: vertical;
}

.area-input-container {
  display: flex;
  gap: 0.75rem;
}

.area-input {
  flex: 1;
}

.add-area-btn {
  background: var(--color-primary);
  border: none;
  color: var(--color-white, #FFFFFF);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
}

.tags-input-container {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.tags-input {
  flex: 1;
}

.add-tag-btn {
  background: var(--color-primary);
  border: none;
  color: var(--color-white, #FFFFFF);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-item {
  background: #f1f5f9;
  color: var(--color-primary);
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
}

.cancel-btn,
.back-btn {
  padding: 12px 24px;
  font-weight: 500;
  border-radius: 24px;
  border: 1px solid #D1D5DB;
  color: #6B7280;
  background: var(--color-white, #FFFFFF);
  font-size: 14px;
}

.cancel-btn:hover,
.back-btn:hover {
  border-color: #9CA3AF;
  background: #F9FAFB;
}

.next-btn,
.publish-btn {
  padding: 12px 32px;
  font-weight: 500;
  border-radius: 24px;
  background: var(--color-primary);
  border: none;
  color: var(--color-white, #FFFFFF);
  font-size: 14px;
  min-width: 120px;
}

.next-btn:hover:not(:disabled),
.publish-btn:hover:not(:disabled) {
  background: #5B54FF;
}

.next-btn:disabled,
.publish-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #9CA3AF;
}

/* Custom PrimeVue overrides */
:deep(.p-inputtext),
:deep(.p-dropdown),
:deep(.p-inputnumber-input) {
  border: 2px solid var(--color-gray-300, #e5e7eb);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  transition: all 0.2s ease;
}

:deep(.p-inputtext:focus),
:deep(.p-dropdown:focus),
:deep(.p-inputnumber:focus-within) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.1);
}

:deep(.p-dropdown-panel) {
  border-radius: 8px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

:deep(.p-textarea) {
  border: 2px solid var(--color-gray-300, #e5e7eb);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  transition: all 0.2s ease;
  font-family: inherit;
  resize: vertical;
}

:deep(.p-textarea:focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(108, 99, 255, 0.1);
}

/* Button styling */
:deep(.p-button) {
  border-radius: 24px;
  font-weight: 500;
  font-size: 14px;
  padding: 12px 24px;
  transition: all 0.2s ease;
}

:deep(.p-button.p-button-outlined) {
  border: 1px solid #D1D5DB;
  color: #6B7280;
  background: var(--color-white, #FFFFFF);
}

:deep(.p-button.p-button-outlined:hover) {
  border-color: #9CA3AF;
  background: #F9FAFB;
  color: #6B7280;
}

:deep(.p-button:not(.p-button-outlined)) {
  background: var(--color-primary);
  border: none;
  color: var(--color-white, #FFFFFF);
}

:deep(.p-button:not(.p-button-outlined):hover:not(:disabled)) {
  background: #5B54FF;
}

:deep(.p-button:disabled) {
  opacity: 0.6;
  background: #9CA3AF;
}

/* Responsive Design */
@media (max-width: 768px) {
  .project-create-container {
    padding: 1rem;
  }

  .form-card {
    padding: 1.5rem;
  }

  .form-grid-step1,
  .form-grid-step3 {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .skills-input-container,
  .area-input-container,
  .tags-input-container {
    flex-direction: column;
  }

  .duration-container {
    flex-direction: column;
  }

  .role-input-container,
  .card-header {
    flex-direction: column;
    align-items: stretch;
  }

  .card-item {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .form-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .project-create-container {
    padding: 0.5rem;
  }

  .form-card {
    padding: 1rem;
    border-radius: 12px;
  }

  .step-content {
    min-height: 400px;
  }
}
</style>