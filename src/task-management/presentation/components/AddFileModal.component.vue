<template>
  <pv-dialog
      :visible="visible"
      @update:visible="$emit('update:visible', $event)"
      modal
      header="Añadir archivos"
      :style="{ width: '500px' }"
  >
    <div class="file-modal-content">
      <div class="upload-area">
        <i class="pi pi-cloud-upload text-4xl text-primary"></i>
        <p>Arrastra tus archivos aquí o</p>
        <pv-button label="Seleccionar archivos" @click="selectFiles" />
        <input
            type="file"
            ref="fileInput"
            multiple
            @change="handleFileSelect"
            style="display: none"
        />
      </div>

      <!-- Lista de archivos seleccionados -->
      <div v-if="selectedFiles.length > 0" class="files-list">
        <h4>Archivos seleccionados:</h4>
        <div v-for="file in selectedFiles" :key="file.name" class="file-item">
          <i class="pi pi-file"></i>
          <span class="file-name">{{ file.name }}</span>
          <span class="file-size">({{ formatFileSize(file.size) }})</span>
          <pv-button
              icon="pi pi-times"
              text
              severity="danger"
              @click="removeFile(file)"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <pv-button
          label="Cancelar"
          text
          @click="closeModal"
      />
      <pv-button
          label="Añadir archivos"
          @click="addFiles"
          :disabled="selectedFiles.length === 0"
      />
    </template>
  </pv-dialog>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'AddFileModal',
  props: {
    visible: Boolean
  },
  emits: ['update:visible', 'files-added'],
  setup(props, { emit }) {
    const fileInput = ref(null)
    const selectedFiles = ref([])

    const selectFiles = () => {
      fileInput.value?.click()
    }

    const handleFileSelect = (event) => {
      const files = Array.from(event.target.files)
      selectedFiles.value = files
    }

    const removeFile = (fileToRemove) => {
      selectedFiles.value = selectedFiles.value.filter(file => file !== fileToRemove)
    }

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const addFiles = () => {
      emit('files-added', selectedFiles.value)
      closeModal()
    }

    const closeModal = () => {
      selectedFiles.value = []
      emit('update:visible', false)
    }

    return {
      fileInput,
      selectedFiles,
      selectFiles,
      handleFileSelect,
      removeFile,
      formatFileSize,
      addFiles,
      closeModal
    }
  }
}
</script>

<style scoped>
.upload-area {
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  margin-bottom: 1.5rem;
  background: #fafafa;
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: var(--color-primary);
  background: #f0f8ff;
}

.upload-area p {
  margin: 1rem 0;
  color: var(--color-gray-600);
}

.files-list {
  margin-top: 1.5rem;
}

.files-list h4 {
  margin-bottom: 1rem;
  color: var(--color-gray-800);
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

.file-name {
  flex: 1;
  font-weight: 500;
}

.file-size {
  color: var(--color-gray-500);
  font-size: 0.875rem;
}
</style>