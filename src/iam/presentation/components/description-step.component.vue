<script setup>
import { ref, watch } from 'vue';

defineProps({
  modelValue: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'complete', 'prev']);

// Biografía con límite de caracteres
const bioText = ref('');


</script>

<template>
  <pv-card class="step-card">
    <template #title>
      <div class="step-header">
        <h1 class="main-title">Cuéntanos sobre ti</h1>
        <p class="subtitle">
          Comparte una breve descripción que muestre tu experiencia y lo que te apasiona
        </p>
      </div>
    </template>

    <template #content>
      <div class="step-content">
        <!-- Biografía -->
        <div class="form-group">
          <label for="bio" class="form-label">Tu Biografía</label>
          <pv-textarea
              id="bio"
              v-model="bioText"
              :rows="6"
              placeholder="Describe tu experiencia profesional, habilidades, proyectos destacados, intereses y lo que te apasiona..."
              class="w-full bio-textarea"
              :autoResize="true"
          />
          <div class="char-counter" :class="{
            'warning': bioText.length > 400,
            'error': bioText.length >= 500
          }">
            {{ bioText.length }}/500 caracteres
          </div>
          <p class="input-hint">
            Esta descripción será visible para otros usuarios en tu perfil
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
              @click="$emit('complete')"
              class="skip-button"
              label="Omitir"
              text
          />
          <pv-button
              @click="$emit('complete')"
              class="continue-button"
              label="Completar"
              :disabled="!bioText.trim()"
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
  min-height: 480px;
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

/* Form styles */
.form-group {
  margin-bottom: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: #374151;
  font-size: 1rem;
  text-align: center;
}

.input-hint {
  color: #6b7280;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  margin-bottom: 0;
  text-align: center;
  font-style: italic;
}

/* Textarea styles */
.bio-textarea {
  resize: vertical;
  min-height: 200px;
  flex: 1;
  border: 2px solid #e5e7eb !important;
  border-radius: 8px !important;
  padding: 1rem !important;
  font-size: 0.95rem !important;
  line-height: 1.5 !important;
}

.bio-textarea:focus {
  border-color: #6C63FF !important;
  box-shadow: 0 0 0 2px rgba(108, 99, 255, 0.1) !important;
}

/* Character counter */
.char-counter {
  text-align: right;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.char-counter.warning {
  color: #f59e0b;
  font-weight: 600;
}

.char-counter.error {
  color: #ef4444;
  font-weight: 600;
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
  padding: 0.6rem 1.5rem !important;
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
    min-height: 420px;
  }

  .main-title {
    font-size: 1.4rem;
  }

  .subtitle {
    font-size: 0.9rem;
  }

  .bio-textarea {
    min-height: 150px;
  }

  .card-footer {
    flex-direction: column;
    gap: 0.75rem;
  }

  .right-buttons {
    width: 100%;
    justify-content: space-between;
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

  .form-label {
    font-size: 0.95rem;
  }
}
</style>