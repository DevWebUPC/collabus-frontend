<script setup>
import { ref } from 'vue';

// Props
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Escribir etiqueta'
  },
  label: {
    type: String,
    default: 'Etiquetas'
  }
});

// Emits
const emit = defineEmits(['update:modelValue']);

// Local state
const newTag = ref('');

// Methods
const addTag = () => {
  const trimmedTag = newTag.value?.trim();
  if (trimmedTag && !props.modelValue.includes(trimmedTag)) {
    const updatedTags = [...(props.modelValue || []), trimmedTag];
    emit('update:modelValue', updatedTags);
    newTag.value = '';
  }
};

const removeTag = (index) => {
  const updatedTags = [...props.modelValue];
  updatedTags.splice(index, 1);
  emit('update:modelValue', updatedTags);
};
</script>

<template>
  <div class="tags-component">
    <label class="form-label">{{ label }}</label>
    <div class="tags-input-container">
      <pv-inputtext 
        v-model="newTag"
        :placeholder="placeholder"
        class="tags-input"
        @keyup.enter="addTag"
      />
      <pv-button 
        type="button"
        label="Añadir"
        @click="addTag"
        class="add-tag-btn"
        size="small"
        :disabled="!newTag?.trim()"
      />
    </div>
    <div class="tags-list" v-if="modelValue && modelValue.length > 0">
      <span 
        v-for="(tag, index) in modelValue" 
        :key="index"
        class="tag-item"
      >
        #{{ tag }}
        <button type="button" @click="removeTag(index)" class="remove-tag">×</button>
      </span>
    </div>
  </div>
</template>

<style scoped>
.tags-component {
  width: 100%;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #6C63FF;
  font-weight: 600;
  margin-bottom: 8px;
}

.tags-input-container {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.tags-input {
  flex: 1;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
}

.tags-input:focus {
  border-color: #6C63FF;
  outline: none;
}

.add-tag-btn {
  background: #6C63FF;
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.add-tag-btn:hover:not(:disabled) {
  background: #5B54FF;
}

.add-tag-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  background: #F3F4F6;
  color: #6C63FF;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.remove-tag {
  background: none;
  border: none;
  color: #EF4444;
  cursor: pointer;
  font-weight: bold;
  padding: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.remove-tag:hover {
  background: #FEE2E2;
}

/* Custom PrimeVue overrides */
:deep(.p-inputtext) {
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
}

:deep(.p-inputtext:focus) {
  border-color: #6C63FF;
  box-shadow: none;
}
</style>