<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useProjectCreateStore } from '../../application/project-create.store.js'

const { t } = useI18n()

// Use the project creation store
const store = useProjectCreateStore()
const { searchAreas } = store

// Local reactive state for inputs
const newTag = ref('')
const newArea = ref('')

// Initialize filtered areas
const filteredAreas = ref([])

// Computed properties
const currentAreas = computed(() => store.basicInfoData.areas || [])
const currentTags = computed(() => store.basicInfoData.tags || [])

const isNewAreaValid = computed(() => {
  const trimmed = newArea.value?.trim()
  return trimmed && !currentAreas.value.includes(trimmed)
})

const isNewTagValid = computed(() => {
  const trimmed = newTag.value?.trim()
  return trimmed && !currentTags.value.includes(trimmed)
})

// Area autocomplete methods
const handleAreaSearch = (event) => {
  const query = event.query?.toLowerCase().trim() || ''
  filteredAreas.value = searchAreas(query)
}

const handleDropdownClick = () => {
  // Show all areas when dropdown is clicked
  filteredAreas.value = searchAreas('')
}

// Area management methods
const addArea = () => {
  if (!isNewAreaValid.value) return
  
  const trimmedArea = newArea.value.trim()
  store.basicInfoData.areas = [...currentAreas.value, trimmedArea]
  newArea.value = ''
}

const removeArea = (index) => {
  if (index < 0 || index >= currentAreas.value.length) return
  
  store.basicInfoData.areas = currentAreas.value.filter((_, i) => i !== index)
}

// Tag management methods
const addTag = () => {
  if (!isNewTagValid.value) return
  
  const trimmedTag = newTag.value.trim()
  store.basicInfoData.tags = [...currentTags.value, trimmedTag]
  newTag.value = ''
}

const removeTag = (index) => {
  if (index < 0 || index >= currentTags.value.length) return
  
  store.basicInfoData.tags = currentTags.value.filter((_, i) => i !== index)
}

// Form field update methods
const updateProjectName = (value) => { store.basicInfoData.projectName = value }
const updateSummary = (value) => { store.basicInfoData.summary = value }
</script>

<template>
  <div class="basic-info-step">
    <div class="form-grid">
      <!-- Nombre del Proyecto -->
      <div class="form-group">
        <label class="form-label">{{ $t('projects.create.project-name') }}</label>
        <pv-inputtext 
          :model-value="store.basicInfoData.projectName"
          @update:model-value="updateProjectName"
          :placeholder="$t('projects.create.project-name-placeholder')"
          class="w-full"
        />
      </div>

      <!-- Resumen -->
      <div class="form-group summary-section">
        <label class="form-label">{{ $t('projects.create.summary') }}</label>
        <pv-textarea 
          :model-value="store.basicInfoData.summary"
          @update:model-value="updateSummary"
          :placeholder="$t('projects.create.summary-placeholder')"
          :rows="5"
          class="w-full"
        />
      </div>

      <!-- Área -->
      <div class="form-group">
        <label class="form-label">{{ $t('projects.create.area') }}</label>
        <div class="area-container">
          <pv-autocomplete 
            v-model="newArea"
            :suggestions="filteredAreas"
            @complete="handleAreaSearch"
            @dropdown-click="handleDropdownClick"
            :placeholder="$t('projects.create.area-placeholder')"
            class="area-input"
            @keyup.enter="addArea"
            dropdown
            :force-selection="false"
            complete-on-focus
            :min-length="0"
            auto-highlight="false"
          />
          <pv-button 
            type="button"
            :label="$t('projects.create.add')"
            @click="addArea"
            class="add-btn"
            size="small"
            outlined
            :disabled="!isNewAreaValid"
          />
        </div>
        <!-- Areas display -->
        <div 
          v-if="currentAreas.length > 0" 
          class="areas-display"
        >
          <pv-chip 
            v-for="(area, index) in currentAreas" 
            :key="`area-${area}-${index}`"
            :label="area"
            removable
            @remove="() => removeArea(index)"
            class="area-chip"
          />
        </div>
      </div>

      <!-- Etiquetas -->
      <div class="form-group">
        <label class="form-label">{{ $t('projects.create.tags') }}</label>
        <div class="tags-container">
          <pv-inputtext 
            v-model="newTag"
            :placeholder="$t('projects.create.tags-placeholder')"
            class="tags-input"
            @keyup.enter="addTag"
          />
          <pv-button 
            type="button"
            :label="$t('projects.create.add')"
            @click="addTag"
            class="add-btn"
            size="small"
            outlined
            :disabled="!isNewTagValid"
          />
        </div>
        <!-- Tags display -->
        <div 
          v-if="currentTags.length > 0" 
          class="tags-display"
        >
          <pv-chip 
            v-for="(tag, index) in currentTags" 
            :key="`tag-${tag}-${index}`"
            :label="`#${tag}`"
            removable
            @remove="() => removeTag(index)"
            class="tag-chip"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.basic-info-step {
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

.summary-section {
  grid-row: span 2;
}

.area-container {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  margin-bottom: 12px;
}

.area-input {
  flex: 1;
}

.areas-display {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.area-chip {
  background: #E0F2FE;
  color: #0891B2;
}

.tags-container {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.tags-input {
  flex: 1;
}

.add-btn {
  min-width: 80px;
  height: 40px;
}

.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.tag-chip {
  background: #F3F4F6;
  color: #6C63FF;
}

/* PrimeVue component styling */
:deep(.p-inputtext),
:deep(.p-dropdown),
:deep(.p-textarea),
:deep(.p-autocomplete-input) {
  width: 100%;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  transition: all 0.2s ease;
}

:deep(.p-inputtext:focus),
:deep(.p-dropdown:focus),
:deep(.p-textarea:focus),
:deep(.p-autocomplete:focus-within) {
  border-color: #6C63FF;
  box-shadow: 0 0 0 2px rgba(108, 99, 255, 0.1);
  outline: none;
}

/* AutoComplete specific styles */
:deep(.p-autocomplete) {
  width: 100%;
  position: relative;
  display: flex;
}

:deep(.p-autocomplete .p-autocomplete-input) {
  width: 100%;
  border-radius: 8px 0 0 8px;
  border-right: none;
}

:deep(.p-autocomplete .p-autocomplete-dropdown) {
  width: 40px;
  height: auto;
  border: 1px solid #D1D5DB;
  border-left: none;
  border-radius: 0 8px 8px 0;
  background: #F9FAFB;
  color: #6B7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  min-height: 44px;
}

:deep(.p-autocomplete .p-autocomplete-dropdown:hover) {
  background: #F3F4F6;
  color: #6C63FF;
}

:deep(.p-autocomplete.p-autocomplete-dd .p-autocomplete-input) {
  border-radius: 8px 0 0 8px;
}

:deep(.p-autocomplete-panel) {
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #E5E7EB;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
}

:deep(.p-autocomplete-items) {
  padding: 4px 0;
}

:deep(.p-autocomplete-item) {
  padding: 12px 16px;
  border-bottom: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

:deep(.p-autocomplete-item:hover) {
  background: #F8FAFC;
}

:deep(.p-autocomplete-item.p-highlight) {
  background: #6C63FF;
  color: white;
}

:deep(.p-autocomplete-item:last-child) {
  border-bottom: none;
}

/* Fix for dropdown positioning */
:deep(.p-autocomplete.p-autocomplete-dd .p-autocomplete-input) {
  border-radius: 8px 0 0 8px;
}

:deep(.p-textarea) {
  resize: vertical;
  min-height: 200px;
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
  background: #F3F4F6;
  color: #6C63FF;
  border: none;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
}

:deep(.p-chip .p-chip-remove-icon) {
  color: #EF4444;
  margin-left: 8px;
}

/* Responsive design */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .summary-section {
    grid-row: span 1;
  }
  
  .area-container,
  .tags-container {
    flex-direction: column;
    gap: 8px;
  }
}
</style>