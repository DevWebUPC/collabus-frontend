<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'next', 'prev']);

// Roles predefinidos
const predefinedRoles = ref([
  'Desarrollador Frontend',
  'Desarrollador Backend',
  'Diseñador UI/UX',
  'Project Manager',
  'Data Scientist',
  'DevOps Engineer',
  'Product Owner',
  'QA Tester',
  'Scrum Master',
  'Business Analyst',
  'Mobile Developer',
  'Full Stack Developer'
]);

// Inicializar con datos existentes
const selectedRole = ref(props.modelValue.selectedRole || '');
const customRole = ref(props.modelValue.customRole || '');

const selectRole = (role) => {
  selectedRole.value = role;
  customRole.value = '';
  updateModelValue();
};

const updateCustomRole = (role) => {
  customRole.value = role;
  selectedRole.value = '';
  updateModelValue();
};

const updateModelValue = () => {
  emit('update:modelValue', {
    selectedRole: selectedRole.value,
    customRole: customRole.value
  });
};

// Sincronizar cuando cambien los props
watch(() => props.modelValue, (newValue) => {
  if (newValue.selectedRole !== selectedRole.value) {
    selectedRole.value = newValue.selectedRole || '';
  }
  if (newValue.customRole !== customRole.value) {
    customRole.value = newValue.customRole || '';
  }
}, { deep: true });
</script>

<template>
  <pv-card class="step-card">
    <template #title>
      <div class="step-header">
        <h1 class="main-title">¿Cómo te gustaría Presentarte?</h1>
        <p class="subtitle">
          Los colaboradores suelen buscar personas con distintas habilidades y roles.
          ¿Qué rol te gustaría asumir?
        </p>
      </div>
    </template>

    <template #content>
      <div class="step-content">
        <!-- Roles predefinidos -->
        <div class="role-options">
          <div
              v-for="role in predefinedRoles"
              :key="role"
              :class="['role-card', { selected: modelValue.selectedRole === role }]"
              @click="selectRole(role)"
          >
            {{ role }}
          </div>
        </div>

        <!-- Separador -->
        <div class="separator">
          <span class="separator-text">o</span>
        </div>

        <!-- Rol personalizado -->
        <div class="custom-role-section">
          <label class="custom-role-label">Escribir tu rol</label>
          <pv-input-text
              v-model="modelValue.customRole"
              placeholder="Escribe tu rol personalizado..."
              class="custom-role-input"
              @input="updateCustomRole(modelValue.customRole)"
          />
        </div>

        <!-- Mensaje informativo -->
        <p class="info-message">
          Tu rol entre los otros datos ingresados los puedes editar en tu perfil
        </p>
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
        <pv-button
            @click="$emit('next')"
            class="continue-button"
            label="Guardar"
            :disabled="!modelValue.selectedRole && !modelValue.customRole"
        />
      </div>
    </template>
  </pv-card>
</template>

<style scoped>
.step-card {
  margin-bottom: 1rem;
  max-width: 600px;
  width: 100%;
  min-height: 520px;
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
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
  max-width: 400px;
  margin: 0 auto;
}

.step-content {
  padding: 1.5rem 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Roles predefinidos */
.role-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.role-card {
  padding: 1rem 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  font-size: 0.9rem;
  font-weight: 500;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  word-break: break-word;
}

.role-card:hover {
  border-color: #6C63FF;
  background-color: #f8f7ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 99, 255, 0.1);
}

.role-card.selected {
  border-color: #6C63FF;
  background-color: #6C63FF;
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(108, 99, 255, 0.2);
}

/* Separador */
.separator {
  position: relative;
  text-align: center;
  margin: 1.5rem 0;
}

.separator::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e5e7eb;
}

.separator-text {
  background: white;
  padding: 0 1rem;
  color: #6b7280;
  font-size: 0.9rem;
  position: relative;
  z-index: 1;
}

/* Rol personalizado */
.custom-role-section {
  margin-bottom: 1.5rem;
}

.custom-role-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

.custom-role-input {
  width: 100%;
}

/* Mensaje informativo */
.info-message {
  text-align: center;
  color: #6b7280;
  font-size: 0.85rem;
  font-style: italic;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}

/* Footer */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-top: 0.5rem;
}

.back-button {
  background: #ffffff !important;
  color: #6C63FF !important;
  border: 2px solid #6C63FF !important;
  padding: 0.6rem 1.5rem !important;
}

.continue-button {
  background: #FF7A30 !important;
  border: none !important;
  color: white !important;
  font-weight: 600 !important;
  padding: 0.6rem 1.5rem !important;
}

.continue-button:disabled {
  background: #9ca3af !important;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Responsive */
@media (max-width: 768px) {
  .step-card {
    margin: 0.5rem;
    max-width: 100%;
    min-height: 480px;
  }

  .main-title {
    font-size: 1.4rem;
  }

  .subtitle {
    font-size: 0.9rem;
  }

  .role-options {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .role-card {
    min-height: 50px;
    font-size: 0.85rem;
    padding: 0.75rem 0.5rem;
  }

  .card-footer {
    flex-direction: column;
    gap: 0.75rem;
  }

  .back-button,
  .continue-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .main-title {
    font-size: 1.25rem;
  }

  .step-content {
    padding: 1rem 0;
  }
}
</style>