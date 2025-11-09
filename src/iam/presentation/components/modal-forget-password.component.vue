<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n';

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible', 'submit'])

const recoveryEmail = ref('')
const emailError = ref('')
const { t } = useI18n();


const handleSubmit = () => {
  // Validar email
  if (!recoveryEmail.value) {
    emailError.value = t('auth.forgotPasswordModal.emailRequired')
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recoveryEmail.value)) {
    emailError.value = t('auth.forgotPasswordModal.emailInvalid')
    return
  }

  emailError.value = ''
  emit('submit', recoveryEmail.value)
  emit('update:visible', false)
  recoveryEmail.value = ''
}

// Limpiar error cuando el usuario empiece a escribir
watch(recoveryEmail, () => {
  if (emailError.value) {
    emailError.value = ''
  }
})
</script>

<template>
  <pv-dialog
      :visible="visible"
      modal
      :style="{ width: '25rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
      @update:visible="$emit('update:visible', $event)"

  >
    <template #header>
      <div class="modal-header">
        <h2 class="modal-title">{{ $t('auth.forgotPasswordModal.title') }}</h2>
      </div>
    </template>

    <div class="forgot-password-content">
      <p class="instruction-text">
        {{ $t('auth.forgotPasswordModal.instruction') }}
      </p>

      <div class="field">
        <pv-input-text
            id="recoveryEmail"
            v-model="recoveryEmail"
            type="email"
            :placeholder="$t('auth.forgotPasswordModal.emailPlaceholder')"
            class="w-full email-input"
            :class="{ 'p-invalid': emailError }"
        />
        <small v-if="emailError" class="p-error">{{ emailError }}</small>
      </div>
    </div>

    <template #footer>
      <div class="footer-buttons">
        <pv-button
            :label="$t('auth.forgotPasswordModal.send')"
            @click="handleSubmit"
            :disabled="!recoveryEmail"
            class="send-button"
        />
      </div>
    </template>
  </pv-dialog>
</template>


<style scoped>
.forgot-password-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0 1rem;
}

.instruction-text {
  color: var(--color-gray-900, #374151);
  margin: 0;
  line-height: 1.5;
  font-size: 1rem;
  text-align: center;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.email-input {
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}

.email-input:focus {
  outline: none;
  border-color: #3f51b5;
  box-shadow: 0 0 0 2px rgba(63, 81, 181, 0.1);
}

.footer-buttons {
  display: flex;
  justify-content: center;
  width: 100%;
}

.send-button {
  background-color: #FF7A30;
  border: none;
  color: var(--color-white, #FFFFFF);
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 0.375rem;
  transition: background-color 0.3s;
  min-width: 120px;
}

.send-button:hover:not(:disabled) {
  background-color: #303f9f;
}

.send-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

/* Estilos para el header personalizado */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-gray-300, #e5e7eb);
  position: relative;
}

.modal-title {
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
  text-align: center;
}

/* Estilos para PrimeVue components */
:deep(.p-dialog-header) {
  padding: 0;
}

:deep(.p-dialog-content) {
  padding: 1.5rem 0;
}

:deep(.p-dialog-footer) {
  padding: 1rem 0 0 0;
  border-top: none;
}

:deep(.p-dialog) {
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

:deep(.p-inputtext) {
  width: 100%;
}

:deep(.p-error) {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

:deep(.p-invalid) {
  border-color: #dc2626 !important;
}

:deep(.p-invalid:focus) {
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.1) !important;
}
</style>