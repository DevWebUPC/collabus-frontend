<script setup>
import { ref } from 'vue';

defineProps({
  modelValue: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'next']);



// Para manejar la subida de archivos
const fileInput = ref();
const hasImage = ref(false);
const currentImage = ref('');

const onFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona un archivo de imagen');
      return;
    }

    // Validar tamaño (1MB)
    if (file.size > 1000000) {
      alert('La imagen debe ser menor a 1MB');
      return;
    }


    // Mostrar vista previa
    const reader = new FileReader();
    reader.onload = (e) => {
      currentImage.value = e.target.result;
      hasImage.value = true;
    };
    reader.readAsDataURL(file);
  }
};

const chooseFile = () => {
  fileInput.value?.click();
};


</script>

<template>
  <pv-card class="step-card">
    <template #title>
      <div class="step-header">
        <h1 class="main-title">Configura tu Perfil</h1>
      </div>
    </template>

    <template #content>
      <div class="step-content">
        <div class="avatar-section">
          <div class="avatar-upload">
            <div class="avatar-container">
              <div
                  class="avatar-placeholder"
                  :style="hasImage ? { backgroundImage: `url(${currentImage})` } : {}"
                  @click="chooseFile"
              >
                <div v-if="!hasImage" class="avatar-empty-state">
                  <!-- SVG icono de añadir foto -->
                  <svg class="add-photo-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9C3 7.89543 3.89543 7 5 7H5.92963C6.59834 7 7.2228 6.6658 7.59373 6.1094L8.40627 4.8906C8.7772 4.3342 9.40166 4 10.0704 4H13.9296C14.5983 4 15.2228 4.3342 15.5937 4.8906L16.4063 6.1094C16.7772 6.6658 17.4017 7 18.0704 7H19C20.1046 7 21 7.89543 21 9V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V9Z" stroke="white" stroke-width="2"/>
                    <circle cx="12" cy="13" r="3" stroke="white" stroke-width="2"/>
                    <path d="M8 8H8.01" stroke="white" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </div>
                <div v-if="hasImage" class="avatar-overlay">
                  <span class="change-text">Cambiar</span>
                </div>
              </div>

            </div>

            <p class="avatar-hint">
              {{ hasImage ? 'Haz clic para cambiar la foto' : 'Añade una foto para tu perfil' }}
            </p>

            <!-- Input file oculto -->
            <input
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="onFileSelect"
                class="hidden-file-input"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="username">Nombre de Perfil</label>
          <pv-input-text
              id="username"
              v-model="modelValue.username"
              placeholder="Tu nombre de usuario"
              class="w-full"
          />
        </div>
      </div>
    </template>

    <template #footer>
      <div class="card-footer">
        <pv-button
            @click="$emit('next')"
            class="continue-button w-full"
            label="Guardar"
        />
      </div>
    </template>
  </pv-card>
</template>

<style scoped>
.step-card {
  margin-bottom: 1rem;
  max-width: 500px;
  width: 100%;
  min-height: 460px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.step-header {
  text-align: center;
  margin-bottom: 0.5rem;
}

.main-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #6C63FF;
  margin-bottom: 0.25rem;
}

.step-content {
  padding: 2rem 0;
  flex: 1;
}

.avatar-section {
  text-align: center;
  margin-bottom: 1.5rem;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  position: relative;
}

.avatar-container {
  position: relative;
  display: inline-block;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #6C63FF;
  border: 2px dashed #6C63FF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-size: cover;
  background-position: center;
  overflow: hidden;
  position: relative;
}

.avatar-placeholder:hover {
  background-color: #5a52d5;
  border-color: #5a52d5;
  transform: scale(1.05);
}

.avatar-empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avatar-placeholder:hover .avatar-overlay {
  opacity: 1;
}

.change-text {
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
}

.avatar-hint {
  color: #6b7280;
  font-size: 0.8rem;
  margin: 0;
}

/* Ocultar el input file */
.hidden-file-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.375rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 0.5rem;
}

.continue-button {
  background: #FF7A30 !important;
  border: none !important;
  color: white !important;
  font-weight: 600 !important;
  padding: 0.6rem 1.5rem !important;
  font-size: 0.9rem !important;
}

/* Asegurar que el card no sea demasiado alto en móviles */
@media (max-width: 768px) {
  .step-card {
    margin: 0.5rem;
    max-width: 100%;
  }

  .main-title {
    font-size: 1.25rem;
  }

  .avatar-placeholder {
    width: 70px;
    height: 70px;
  }

  .add-photo-icon {
    width: 28px;
    height: 28px;
  }

  .remove-image-btn {
    width: 22px;
    height: 22px;
    top: -4px;
    right: -4px;
  }
}
</style>