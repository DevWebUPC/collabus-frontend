<!-- UpdateDueDateModal.component.vue -->
<template>
  <pv-dialog
      :visible="visible"
      @update:visible="$emit('update:visible', $event)"
      modal
      header="Cambiar Fecha de Entrega"
      :style="{ width: '400px' }"
  >
    <div class="modal-content">
      <div class="form-section">
        <label class="section-label">Tarea</label>
        <p class="task-title">{{ task?.title }}</p>
      </div>

      <div class="form-section">
        <label class="section-label">Colaborador</label>
        <p class="collaborator-info">{{ task?.assignedToName}}</p>
      </div>

      <div class="form-section">
        <label class="section-label">Nueva Fecha de Entrega</label>
        <pv-calendar
            v-model="newDueDate"
            class="w-full"
            :min-date="minDate"
            date-format="dd/mm/yy"
        />
      </div>

      <div v-if="task?.dueDate" class="current-date">
        <span class="current-date-label">Fecha actual:</span>
        <span class="current-date-value">{{ formatDate(task.dueDate) }}</span>
      </div>
    </div>

    <template #footer>
      <div class="modal-actions">
        <pv-button
            label="Cancelar"
            text
            @click="closeModal"
            class="cancel-btn"
        />
        <pv-button
            label="Actualizar Fecha"
            :disabled="!newDueDate"
            @click="updateDate"
            class="confirm-btn"
        />
      </div>
    </template>
  </pv-dialog>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'UpdateDueDateModal',
  props: {
    visible: Boolean,
    task: {
      type: Object,
      default: null
    }
  },
  emits: ['update:visible', 'date-updated'],
  setup(props, { emit }) {
    const newDueDate = ref(null)
    const minDate = ref(new Date())

    const formatDate = (dateString) => {
      if (!dateString) return 'No definida'
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }

    const updateDate = () => {
      if (newDueDate.value) {
        emit('date-updated', {
          taskId: props.task.id,
          newDueDate: newDueDate.value
        })
        closeModal()
      }
    }

    const closeModal = () => {
      newDueDate.value = null
      emit('update:visible', false)
    }

    // Resetear la fecha cuando se abre el modal con una nueva tarea
    watch(() => props.task, (newTask) => {
      if (newTask) {
        newDueDate.value = newTask.dueDate ? new Date(newTask.dueDate) : null
      }
    })

    return {
      newDueDate,
      minDate,
      formatDate,
      updateDate,
      closeModal
    }
  }
}
</script>

<style scoped>
.modal-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-label {
  font-weight: 600;
  color: var(--color-gray-700);
  font-size: 0.9rem;
}

.task-title {
  font-weight: 500;
  color: var(--color-gray-800);
  margin: 0;
  padding: 0.5rem;
  background: var(--color-gray-50, #f8f9fa);
  border-radius: 4px;
  border: 1px solid var(--color-gray-300, #e5e7eb);
}

.collaborator-info {
  color: var(--color-gray-600);
  margin: 0;
  padding: 0.5rem;
  background: var(--color-gray-50, #f8f9fa);
  border-radius: 4px;
  border: 1px solid var(--color-gray-300, #e5e7eb);
}

.current-date {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  margin-top: 0.5rem;
}

.current-date-label {
  font-weight: 500;
  color: #856404;
}

.current-date-value {
  font-weight: 600;
  color: #856404;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.cancel-btn {
  min-width: 100px;
}

.confirm-btn {
  min-width: 150px;
}
</style>