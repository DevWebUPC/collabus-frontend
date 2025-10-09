<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Escribe las habilidades'
  },
  label: {
    type: String,
    default: 'Habilidades'
  },
  chipClass: {
    type: String,
    default: 'skill-chip'
  },
  maxSkills: {
    type: Number,
    default: 20
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Local state
const newSkill = ref('')

// Computed properties
const currentSkills = computed(() => props.modelValue || [])

const isNewSkillValid = computed(() => {
  const trimmed = newSkill.value?.trim()
  return trimmed && 
         !currentSkills.value.includes(trimmed) && 
         currentSkills.value.length < props.maxSkills
})

// Methods
const addSkill = () => {
  if (!isNewSkillValid.value) return
  
  const trimmedSkill = newSkill.value.trim()
  emit('update:modelValue', [...currentSkills.value, trimmedSkill])
  newSkill.value = ''
}

const removeSkill = (index) => {
  if (index < 0 || index >= currentSkills.value.length) return
  
  const updatedSkills = currentSkills.value.filter((_, i) => i !== index)
  emit('update:modelValue', updatedSkills)
}
</script>

<template>
  <div class="skills-component">
    <label v-if="label" class="form-label">{{ label }}</label>
    <div class="skills-container">
      <pv-inputtext 
        v-model="newSkill"
        :placeholder="placeholder"
        class="skills-input"
        @keyup.enter="addSkill"
      />
      <pv-button 
        type="button"
        label="Añadir"
        @click="addSkill"
        class="add-btn"
        size="small"
        outlined
        :disabled="!isNewSkillValid"
      />
    </div>
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
        :class="chipClass"
      />
    </div>
  </div>
</template>

<style scoped>
.skills-component {
  width: 100%;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #6C63FF;
  font-weight: 600;
  margin-bottom: 12px;
}

.skills-container {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.skills-input {
  flex: 1;
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
</style>