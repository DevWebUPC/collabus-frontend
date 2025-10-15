<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'next', 'prev']);

// Referencia al input file
const cvInput = ref(null);

// Inicializar con los datos existentes
const skills = ref([...props.modelValue.abilities]);
const experiences = ref([...props.modelValue.experiences]);
const cvFile = ref(props.modelValue.cv || null);
const cvFileName = ref(props.modelValue.cvFileName || '');

// Habilidades
const newSkill = ref('');

const addSkill = () => {
  if (newSkill.value.trim() && !skills.value.includes(newSkill.value.trim())) {
    skills.value.push(newSkill.value.trim());
    newSkill.value = '';
    updateModelValue();
  }
};

const removeSkill = (index) => {
  skills.value.splice(index, 1);
  updateModelValue();
};

// Experiencias
const newExperience = ref({
  position: '',
  company: '',
  duration: ''
});

const addExperience = () => {
  if (newExperience.value.position.trim() && newExperience.value.company.trim()) {
    experiences.value.push({ ...newExperience.value });
    newExperience.value = { position: '', company: '', duration: '' };
    updateModelValue();
  }
};

const removeExperience = (index) => {
  experiences.value.splice(index, 1);
  updateModelValue();
};

// CV - MEJORADO: Convertir a Base64
const onCvSelect = async (event) => {
  const file = event.target.files[0];
  if (file) {
    // Validar que sea PDF o DOC
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Por favor, selecciona un archivo PDF o DOC');
      event.target.value = '';
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo debe ser menor a 5MB');
      event.target.value = '';
      return;
    }

    try {
      // Convertir archivo a Base64
      const base64String = await fileToBase64(file);

      cvFile.value = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        data: base64String,
        uploadedAt: new Date().toISOString()
      };

      cvFileName.value = file.name;
      updateModelValue();
    } catch (error) {
      console.error('Error converting file to Base64:', error);
      alert('Error al procesar el archivo');
      event.target.value = '';
    }
  }
};

// Función para convertir File a Base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

// Función para abrir el selector de archivos
const openFileSelector = () => {
  cvInput.value?.click();
};

// Actualizar datos del modelo
const updateModelValue = () => {
  emit('update:modelValue', {
    abilities: [...skills.value],
    experiences: [...experiences.value],
    cv: cvFile.value,
    cvFileName: cvFileName.value
  });
};

// Sincronizar cuando cambien los props
watch(() => props.modelValue, (newValue) => {
  if (newValue.abilities) {
    skills.value = [...newValue.abilities];
  }
  if (newValue.experiences) {
    experiences.value = [...newValue.experiences];
  }
  if (newValue.cv) {
    cvFile.value = newValue.cv;
    cvFileName.value = newValue.cvFileName || '';
  }
}, { deep: true });
</script>

<template>
  <pv-card class="step-card">
    <template #title>
      <div class="step-header">
        <h1 class="main-title">Define tus Habilidades y Experiencias</h1>
        <p class="subtitle">
          Agrega tus principales competencias o sube tu CV para que otros usuarios te conozcan mejor
        </p>
      </div>
    </template>

    <template #content>
      <div class="step-content">
        <!-- Sección de Habilidades -->
        <div class="skills-section">
          <h3 class="section-title">Habilidades</h3>
          <div class="skills-input-group">
            <pv-input-text
                v-model="newSkill"
                placeholder="Escribe una Habilidad"
                class="skill-input"
                @keypress.enter="addSkill"
            />
            <pv-button
                @click="addSkill"
                class="add-skill-btn"
                label="+"
                severity="secondary"
            />
          </div>

          <!-- Lista de habilidades -->
          <div class="skills-list">
            <div
                v-for="(skill, index) in skills"
                :key="index"
                class="skill-tag"
            >
              {{ skill }}
              <span class="remove-skill" @click="removeSkill(index)">×</span>
            </div>
          </div>
        </div>

        <!-- Sección de Experiencia -->
        <div class="experience-section">
          <h3 class="section-title">Añadir Experiencia</h3>

          <div class="experience-form">
            <div class="form-row">
              <div class="form-group">
                <label>Cargo/Puesto</label>
                <pv-input-text
                    v-model="newExperience.position"
                    placeholder="Cargo/Puesto"
                    class="w-full"
                />
              </div>
              <div class="form-group">
                <label>Empresa/Institución</label>
                <pv-input-text
                    v-model="newExperience.company"
                    placeholder="Empresa/Institución"
                    class="w-full"
                />
              </div>
              <div class="form-group">
                <label>Tiempo</label>
                <pv-input-text
                    v-model="newExperience.duration"
                    placeholder="Ej: 2 años"
                    class="w-full"
                />
              </div>
            </div>

            <pv-button
                @click="addExperience"
                class="add-experience-btn"
                label="Añadir experiencia"
                severity="secondary"
                outlined
            />
          </div>

          <!-- Lista de experiencias -->
          <div class="experiences-list">
            <div
                v-for="(exp, index) in experiences"
                :key="index"
                class="experience-item"
            >
              <div class="experience-info">
                <strong>{{ exp.position }}</strong> en {{ exp.company }}
                <span v-if="exp.duration" class="experience-duration">• {{ exp.duration }}</span>
              </div>
              <span class="remove-experience" @click="removeExperience(index)">×</span>
            </div>
          </div>
        </div>

        <!-- Sección de CV - CORREGIDO -->
        <div class="cv-section">
          <h3 class="section-title">Subir CV</h3>
          <div class="cv-upload">
            <pv-button
                @click="openFileSelector"
                class="cv-upload-btn"
                :label="cvFile ? 'Cambiar archivo' : 'Seleccionar archivo'"
                severity="secondary"
                outlined
            />
            <span class="cv-file-name" v-if="cvFileName">
              📄 {{ cvFileName }} ({{ (cvFile?.fileSize / 1024 / 1024).toFixed(2) }} MB)
            </span>
            <input
                ref="cvInput"
                type="file"
                accept=".pdf,.doc,.docx"
                @change="onCvSelect"
                class="hidden-file-input"
            />
          </div>
          <p class="file-hint">
            Formatos aceptados: PDF, DOC, DOCX (máx. 5MB)
          </p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="card-footer">
        <pv-button
            @click="$emit('prev')"
            class="back-button"
            label="Atrás"
            outlined
        />
        <div class="right-buttons">
          <pv-button
              @click="$emit('next')"
              class="skip-button"
              label="Omitir →"
              text
          />
          <pv-button
              @click="$emit('next')"
              class="continue-button"
              label="Guardar"
          />
        </div>
      </div>
    </template>
  </pv-card>
</template>

<style scoped>
.step-card {
  margin-bottom: 1rem;
  max-width: 600px;
  width: 100%;
  min-height: 560px;
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

.subtitle {
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
}

.step-content {
  padding: 1.5rem 0;
  flex: 1;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

/* Estilos para Habilidades */
.skills-section {
  margin-bottom: 2rem;
}

.skills-input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.skill-input {
  flex: 1;
}

.add-skill-btn {
  min-width: 50px !important;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-tag {
  background: #e5e7eb;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.remove-skill {
  cursor: pointer;
  color: #6b7280;
  font-weight: bold;
  font-size: 1.1rem;
}

.remove-skill:hover {
  color: #ef4444;
}

/* Estilos para Experiencia */
.experience-section {
  margin-bottom: 2rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.add-experience-btn {
  width: 100%;
  margin-bottom: 1rem;
}

.experiences-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.experience-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
  border-left: 3px solid #6C63FF;
}

.experience-info {
  flex: 1;
}

.experience-duration {
  color: #6b7280;
  font-size: 0.85rem;
}

.remove-experience {
  cursor: pointer;
  color: #6b7280;
  font-weight: bold;
  font-size: 1.2rem;
  padding: 0.25rem;
}

.remove-experience:hover {
  color: #ef4444;
}

/* Estilos para CV */
.cv-section {
  margin-bottom: 1rem;
}

.cv-upload {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.cv-file-name {
  color: #6b7280;
  font-size: 0.85rem;
  font-style: italic;
}

.hidden-file-input {
  display: none;
}

/* Footer */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-top: 0.5rem;
}

.right-buttons {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.back-button {
  background: #ffffff !important;
  color: #6C63FF !important;
  border: 2px solid #6C63FF !important;
}

.skip-button {
  color: #6b7280 !important;
  text-decoration: none !important;
}

.continue-button {
  background: #FF7A30 !important;
  border: none !important;
  color: white !important;
  font-weight: 600 !important;
  padding: 0.6rem 1.5rem !important;
}

/* Responsive */
@media (max-width: 768px) {
  .step-card {
    margin: 0.5rem;
    max-width: 100%;
  }

  .main-title {
    font-size: 1.25rem;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .card-footer {
    flex-direction: column;
    gap: 0.75rem;
  }

  .right-buttons {
    width: 100%;
    justify-content: space-between;
  }
}
</style>