<!-- ModalDecision.component.vue -->
<template>
  <pv-dialog
      :visible="visible"
      @update:visible="$emit('update:visible', $event)"
      modal
      :header="title"
      :style="{ width: '400px' }"
  >
    <div class="modal-content">
      <div class="modal-icon">
        <i class="pi" :class="iconClass"></i>
      </div>
      <p class="modal-message">{{ message }}</p>
    </div>

    <template #footer>
      <div class="modal-actions">
        <pv-button
            :label="cancelText"
            text
            @click="$emit('cancel')"
            class="cancel-btn"
        />
        <pv-button
            :label="confirmText"
            :severity="confirmSeverity"
            @click="$emit('confirm')"
            class="confirm-btn"
        />
      </div>
    </template>
  </pv-dialog>
</template>

<script>
export default {
  name: 'ModalDecision',
  props: {
    visible: Boolean,
    title: {
      type: String,
      default: 'Confirmar acción'
    },
    message: {
      type: String,
      default: '¿Estás seguro de que quieres realizar esta acción?'
    },
    icon: {
      type: String,
      default: 'warning' // warning, danger, info, success
    },
    cancelText: {
      type: String,
      default: 'Cancelar'
    },
    confirmText: {
      type: String,
      default: 'Confirmar'
    },
    confirmSeverity: {
      type: String,
      default: 'primary'
    }
  },
  emits: ['update:visible', 'cancel', 'confirm'],
  computed: {
    iconClass() {
      const iconMap = {
        warning: 'pi-exclamation-triangle text-yellow-500',
        danger: 'pi-exclamation-circle text-red-500',
        info: 'pi-info-circle text-blue-500',
        success: 'pi-check-circle text-green-500'
      }
      return iconMap[this.icon] || iconMap.warning
    }
  }
}
</script>

<style scoped>
.modal-content {
  text-align: center;
  padding: 1rem 0;
}

.modal-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.modal-message {
  color: var(--color-gray-700);
  line-height: 1.5;
  margin: 0;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.cancel-btn {
  min-width: 80px;
}

.confirm-btn {
  min-width: 80px;
}
</style>