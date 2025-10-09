<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ACADEMIC_LEVELS, DURATION_TYPES } from '../constants/projectForm.constants.js'

const { t } = useI18n()

// Props
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    validator: (value) => {
      return typeof value === 'object' && value !== null
    }
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Options data
const academicLevels = ref(ACADEMIC_LEVELS)
const durationTypes = ref(DURATION_TYPES)

// Local reactive state
const newSkill = ref('')

// Computed properties
const currentSkills = computed(() => props.modelValue.skills || [])

const isNewSkillValid = computed(() => {
  const trimmed = newSkill.value?.trim()
  return trimmed && !currentSkills.value.includes(trimmed)
})

// Helper function to emit model updates
const updateModel = (updates) => {
  emit('update:modelValue', {
    ...props.modelValue,
    ...updates
  })
}

// Skills management methods
const addSkill = () => {
  if (!isNewSkillValid.value) return
  
  const trimmedSkill = newSkill.value.trim()
  updateModel({
    skills: [...currentSkills.value, trimmedSkill]
  })
  newSkill.value = ''
}

const removeSkill = (index) => {
  if (index < 0 || index >= currentSkills.value.length) return
  
  const updatedSkills = currentSkills.value.filter((_, i) => i !== index)
  updateModel({ skills: updatedSkills })
}

// Form field update methods
const updateAcademicLevel = (value) => updateModel({ academicLevel: value })
const updateBenefits = (value) => updateModel({ benefits: value })
const updateDurationQuantity = (value) => {
  // Ensure the value is a valid number
  const numValue = value ? Number(value) : 1
  const validValue = Math.max(1, numValue)
  console.log('Duration quantity updated:', validValue)
  updateModel({ durationQuantity: validValue })
}
const updateDurationType = (value) => {
  console.log('Duration type updated:', value)
  updateModel({ durationType: value })
}
</script>

<template>
  <div class="details-step">
    <div class="form-grid">
      <!-- Nivel Académico (opcional) -->
      <div class="form-group">
        <label class="form-label">{{ $t('projects.create.academic-level') }}</label>
        <pv-dropdown 
          :model-value="modelValue.academicLevel"
          @update:model-value="updateAcademicLevel"
          :options="academicLevels"
          :placeholder="$t('projects.create.select-category')"
          class="w-full"
        />
      </div>

      <!-- Beneficios -->
      <div class="form-group benefits-section">
        <label class="form-label">{{ $t('projects.create.benefits') }}</label>
        <pv-textarea 
          :model-value="modelValue.benefits"
          @update:model-value="updateBenefits"
          :placeholder="$t('projects.create.benefits-placeholder')"
          rows="12"
          class="w-full"
        />
      </div>

      <!-- Habilidades -->
      <div class="form-group">
        <label class="form-label">{{ $t('projects.create.skills') }}</label>
        <div class="skills-container">
          <pv-inputtext 
            v-model="newSkill"
            :placeholder="$t('projects.create.skills-placeholder')"
            class="skills-input"
            @keyup.enter="addSkill"
          />
          <pv-button 
            type="button"
            :label="$t('projects.create.add')"
            @click="addSkill"
            class="add-btn"
            size="small"
            outlined
            :disabled="!isNewSkillValid"
          />
        </div>
        <!-- Skills display -->
        <div 
          v-if="currentSkills.length > 0" 
          class="skills-display"
        >
          <pv-chip 
            v-for="(skill, index) in currentSkills" 
            :key="`skill-${skill}-${index}`"
            :label="`#${skill}`"
            removable
            @remove="() => removeSkill(index)"
            class="skill-chip"
          />
        </div>
      </div>

      <!-- Duración -->
      <div class="form-group">
        <label class="form-label">{{ $t('projects.create.duration') }}</label>
        <div class="duration-container">
          <pv-input-number 
            :model-value="modelValue.durationQuantity || 1"
            @update:model-value="updateDurationQuantity"
            :min="1"
            :max="999"
            placeholder="Cantidad"
            class="duration-quantity"
          />
          <pv-dropdown 
            :model-value="modelValue.durationType || 'meses'"
            @update:model-value="updateDurationType"
            :options="durationTypes"
            optionLabel="label"
            optionValue="value"
            placeholder="Selecciona el tipo"
            class="duration-type"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.details-step {
  padding: 0;
  max-width: 800px;
  margin: 0 auto;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-label {
  display: block;
  font-size: 14px;
  color: #6C63FF;
  font-weight: 600;
  margin-bottom: 12px;
}

.benefits-section {
  grid-row: span 2;
}

.skills-container {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.skills-input {
  flex: 1;
}

.duration-container {
  display: flex;
  gap: 12px;
}

.duration-quantity {
  flex: 1;
}

.duration-type {
  flex: 2;
}

.add-btn {
  min-width: 80px;
  height: 40px;
}

.skills-display {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.skill-chip {
  background: #FEF3C7;
  color: #D97706;
}

/* PrimeVue component styling */
:deep(.p-inputtext),
:deep(.p-dropdown),
:deep(.p-inputnumber-input),
:deep(.p-textarea) {
  width: 100%;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  transition: all 0.2s ease;
}

:deep(.p-inputnumber) {
  width: 100%;
}

:deep(.p-inputnumber .p-inputnumber-button) {
  background: #F3F4F6;
  border: 1px solid #D1D5DB;
  color: #6B7280;
}

:deep(.p-inputnumber .p-inputnumber-button:hover) {
  background: #6C63FF;
  border-color: #6C63FF;
  color: white;
}

:deep(.p-inputtext:focus),
:deep(.p-dropdown:focus),
:deep(.p-inputnumber:focus-within),
:deep(.p-textarea:focus) {
  border-color: #6C63FF;
  box-shadow: 0 0 0 2px rgba(108, 99, 255, 0.1);
  outline: none;
}

:deep(.p-textarea) {
  resize: vertical;
  min-height: 280px;
  font-family: inherit;
}

:deep(.p-button.p-button-outlined) {
  border: 1px solid #6C63FF;
  color: #6C63FF;
  background: transparent;
}

:deep(.p-button.p-button-outlined:hover) {
  background: #6C63FF;
  color: white;
}

:deep(.p-button:disabled) {
  opacity: 0.6;
  cursor: not-allowed;
}

:deep(.p-chip) {
  background: #FEF3C7;
  color: #D97706;
  border: none;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
}

:deep(.p-chip .p-chip-remove-icon) {
  color: #EF4444;
  margin-left: 8px;
}

:deep(.p-dropdown-panel) {
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #E5E7EB;
}

:deep(.p-dropdown-item) {
  padding: 12px 16px;
  transition: background-color 0.2s ease;
}

:deep(.p-dropdown-item:hover) {
  background: #F8FAFC;
}

:deep(.p-dropdown-item.p-highlight) {
  background: #6C63FF;
  color: white;
}

/* Responsive design */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .benefits-section {
    grid-row: span 1;
  }
  
  .skills-container,
  .duration-container {
    flex-direction: column;
    gap: 8px;
  }
}
</style>