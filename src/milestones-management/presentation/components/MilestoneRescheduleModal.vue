<script setup>
import { ref, computed, watch } from 'vue';
import { useMilestonesStore } from '../../application/milestone-store.js';

const props = defineProps({
  milestone: {
    type: Object,
    default: null
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

const emit = defineEmits(['update:visible', 'rescheduled', 'cancel']);

const milestonesStore = useMilestonesStore();
const loading = ref(false);
const error = ref(null);
const newDueDate = ref(null);

// ✅ CORRECCIÓN: Usar computed para manejar el milestone de forma segura
const currentMilestone = computed(() => props.milestone || {});

// ✅ CORRECCIÓN: Inicializar newDueDate cuando el milestone esté disponible
watch(() => props.milestone, (newMilestone) => {
  if (newMilestone && newMilestone.dueDate) {
    newDueDate.value = new Date(newMilestone.dueDate);
  } else {
    newDueDate.value = null;
  }
}, { immediate: true });

// ✅ CORRECCIÓN: Validar que el milestone esté disponible
const handleReschedule = async () => {
  if (!currentMilestone.value.id) {
    error.value = 'No se puede reprogramar: hito no disponible';
    return;
  }

  if (!newDueDate.value) {
    error.value = 'Por favor selecciona una nueva fecha';
    return;
  }

  const newDate = new Date(newDueDate.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (newDate < today) {
    error.value = 'La nueva fecha no puede ser anterior a hoy';
    return;
  }

  try {
    loading.value = true;
    error.value = null;

    await milestonesStore.updateMilestone(
        props.projectId,
        currentMilestone.value.id,
        {
          dueDate: newDate.toISOString(),
          updatedAt: new Date().toISOString()
        }
    );

    emit('rescheduled', {
      milestoneId: currentMilestone.value.id,
      milestoneTitle: currentMilestone.value.title,
      oldDueDate: currentMilestone.value.dueDate,
      newDueDate: newDate.toISOString()
    });

    emit('update:visible', false);

  } catch (err) {
    console.error('❌ Error reprogramando hito:', err);
    error.value = 'Error al reprogramar el hito: ' + (err.message || 'Error desconocido');
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  newDueDate.value = null;
  error.value = null;
  emit('cancel');
  emit('update:visible', false);
};

const handleClose = () => {
  newDueDate.value = null;
  error.value = null;
  emit('update:visible', false);
};

// ✅ CORRECCIÓN: Formatear fecha de forma segura
const formatDate = (dateString) => {
  if (!dateString) return 'Sin fecha definida';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  } catch {
    return 'Fecha inválida';
  }
};
</script>

<template>
  <pv-dialog
      :visible="visible"
      modal
      :style="{ width: '90vw', maxWidth: '500px' }"
      header="Reprogramar Hito"
      @update:visible="handleClose"
  >
    <div class="reschedule-modal" v-if="currentMilestone.id">
      <!-- Información del hito -->
      <div class="milestone-info">
        <h4>{{ currentMilestone.title }}</h4>
        <div class="current-date">
          <strong>Fecha actual de vencimiento:</strong>
          {{ formatDate(currentMilestone.dueDate) }}
        </div>
      </div>

      <!-- Selección de nueva fecha -->
      <div class="date-selection">
        <label for="newDueDate">
          <strong>Nueva fecha de vencimiento:</strong>
        </label>
        <!-- ✅ CORRECCIÓN: Usar pv-calendar en lugar de input type="date" -->
        <pv-calendar
            id="newDueDate"
            v-model="newDueDate"
            :minDate="new Date()"
            dateFormat="dd/mm/yy"
            showIcon
            iconDisplay="input"
            :class="{ 'p-invalid': error && !newDueDate }"
            placeholder="Selecciona una fecha"
        />
      </div>

      <!-- Mensaje de error -->
      <div v-if="error" class="error-message">
        <i class="pi pi-exclamation-circle"></i>
        {{ error }}
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
            label="Reprogramar"
            severity="warning"
            @click="handleReschedule"
            :loading="loading"
            :disabled="!newDueDate"
        />
      </div>
    </div>

    <!-- ✅ CORRECCIÓN: Estado cuando no hay milestone -->
    <div v-else class="no-milestone">
      <div class="error-icon">⚠️</div>
      <h4>Hito no disponible</h4>
      <p>No se puede reprogramar el hito en este momento.</p>
      <pv-button
          label="Cerrar"
          @click="handleClose"
      />
    </div>
  </pv-dialog>
</template>

<style scoped>
.reschedule-modal {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.milestone-info {
  padding: 1rem;
  background: var(--color-gray-50, #f8f9fa);
  border-radius: 6px;
  border: 1px solid var(--color-gray-300, #e5e7eb);
}

.milestone-info h4 {
  margin: 0 0 0.5rem 0;
  color: var(--color-gray-900, #374151);
  font-size: 1.125rem;
}

.current-date {
  color: var(--color-gray-900, #6b7280);
  font-size: 0.9rem;
}

.date-selection {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.date-selection label {
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

.no-milestone {
  text-align: center;
  padding: 2rem;
  color: var(--color-gray-900, #6b7280);
}

.no-milestone .error-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.no-milestone h4 {
  margin: 0 0 0.5rem 0;
  color: var(--color-gray-900, #374151);
}

.no-milestone p {
  margin: 0 0 1rem 0;
}

:deep(.p-button) {
  min-width: 120px;
}

/* ✅ CORRECCIÓN: Estilos específicos para el pv-calendar */
:deep(.p-calendar) {
  width: 100%;
}

:deep(.p-calendar .p-inputtext) {
  width: 100%;
}
</style>