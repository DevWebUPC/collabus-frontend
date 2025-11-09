<script setup>
import { ref } from 'vue';
import { useMilestonesStore } from '../../application/milestone-store.js';

const props = defineProps({
  milestone: {
    type: Object,
    required: true
  },
  projectId: {
    type: [String, Number],
    required: true
  },
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:visible', 'deleted', 'cancel']);

const milestonesStore = useMilestonesStore();
const loading = ref(false);
const error = ref(null);
const confirmationText = ref('');

const handleDelete = async () => {
  if (confirmationText.value !== 'ELIMINAR') {
    error.value = 'Por favor escribe "ELIMINAR" para confirmar';
    return;
  }

  try {
    loading.value = true;
    error.value = null;

    await milestonesStore.deleteMilestone(
        props.projectId,
        props.milestone.id
    );

    emit('deleted', {
      milestoneId: props.milestone.id,
      milestoneTitle: props.milestone.title
    });
    emit('update:visible', false);

  } catch (err) {
    console.error('❌ Error eliminando hito:', err);
    error.value = 'Error al eliminar el hito: ' + (err.message || 'Error desconocido');
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  confirmationText.value = '';
  error.value = null;
  emit('cancel');
  emit('update:visible', false);
};

const handleClose = () => {
  confirmationText.value = '';
  error.value = null;
  emit('update:visible', false);
};
</script>

<template>
  <pv-dialog
      :visible="visible"
      modal
      :style="{ width: '90vw', maxWidth: '500px' }"
      header="Eliminar Hito"
      @update:visible="handleClose"
  >
    <div class="delete-modal">
      <!-- Advertencia -->
      <div class="warning-section">
        <div class="warning-icon">
          <i class="pi pi-exclamation-triangle"></i>
        </div>
        <div class="warning-content">
          <h4>¿Estás seguro de eliminar este hito?</h4>
          <p>Esta acción no se puede deshacer. Se eliminarán todas las tareas asociadas a este hito.</p>
        </div>
      </div>

      <!-- Información del hito -->
      <div class="milestone-details">
        <div class="detail-item">
          <strong>Hito:</strong> {{ milestone.title }}
        </div>
        <div class="detail-item">
          <strong>Tareas:</strong> {{ milestone.milestoneTasks ? milestone.milestoneTasks.length : 0 }} tareas
        </div>
        <div v-if="milestone.dueDate" class="detail-item">
          <strong>Vence:</strong> {{ new Date(milestone.dueDate).toLocaleDateString('es-ES') }}
        </div>
      </div>

      <!-- Mensaje de error -->
      <div v-if="error" class="error-message">
        <i class="pi pi-exclamation-circle"></i>
        {{ error }}
      </div>

      <!-- Confirmación -->
      <div class="confirmation-section">
        <label for="confirmationText">
          Escribe <strong>ELIMINAR</strong> para confirmar:
        </label>
        <pv-input-text
            id="confirmationText"
            v-model="confirmationText"
            placeholder="ELIMINAR"
            class="w-full"
            :class="{ 'p-invalid': error && confirmationText !== 'ELIMINAR' }"
        />
      </div>

      <!-- Acciones -->
      <div class="modal-actions">
        <pv-button
            label="Cancelar"
            severity="secondary"
            @click="handleCancel"
            :disabled="loading"
        />
        <pv-button
            label="Eliminar Hito"
            severity="danger"
            @click="handleDelete"
            :loading="loading"
            :disabled="confirmationText !== 'ELIMINAR'"
        />
      </div>
    </div>
  </pv-dialog>
</template>

<style scoped>
.delete-modal {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.warning-section {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #fef3c7;
  border-radius: 6px;
  border: 1px solid #fde68a;
}

.warning-icon {
  color: #d97706;
  font-size: 1.5rem;
}

.warning-content h4 {
  margin: 0 0 0.5rem 0;
  color: #92400e;
  font-size: 1rem;
}

.warning-content p {
  margin: 0;
  color: #92400e;
  font-size: 0.875rem;
  line-height: 1.4;
}

.milestone-details {
  padding: 1rem;
  background: var(--color-gray-50, #f8f9fa);
  border-radius: 6px;
  border: 1px solid var(--color-gray-300, #e5e7eb);
}

.detail-item {
  margin-bottom: 0.5rem;
  color: var(--color-gray-900, #374151);
  font-size: 0.9rem;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-item strong {
  color: #2c3e50;
}

.confirmation-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.confirmation-section label {
  font-weight: 600;
  color: var(--color-gray-900, #374151);
  font-size: 0.9rem;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 6px;
  border: 1px solid #fecaca;
  font-size: 0.875rem;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid var(--color-gray-300, #e5e7eb);
}

:deep(.p-button) {
  min-width: 120px;
}

:deep(.p-inputtext.p-invalid) {
  border-color: #e24c4c;
}
</style>