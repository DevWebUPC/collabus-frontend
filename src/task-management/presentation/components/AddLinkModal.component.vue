<template>
  <pv-dialog
      :visible="visible"
      @update:visible="$emit('update:visible', $event)"
      modal
      header="Añadir enlace"
      :style="{ width: '500px' }"
  >
    <div class="link-modal-content">
      <div class="form-section">
        <label class="section-label">URL del enlace</label>
        <pv-inputtext
            v-model="linkData.url"
            placeholder="https://ejemplo.com"
            class="w-full"
        />
      </div>

      <div class="form-section">
        <label class="section-label">Descripción (opcional)</label>
        <pv-inputtext
            v-model="linkData.description"
            placeholder="Descripción del enlace"
            class="w-full"
        />
      </div>
    </div>

    <template #footer>
      <pv-button
          label="Cancelar"
          text
          @click="closeModal"
      />
      <pv-button
          label="Añadir enlace"
          @click="addLink"
          :disabled="!linkData.url"
      />
    </template>
  </pv-dialog>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'AddLinkModal',
  props: {
    visible: Boolean
  },
  emits: ['update:visible', 'link-added'],
  setup(props, { emit }) {
    const linkData = ref({
      url: '',
      description: ''
    })

    const addLink = () => {
      emit('link-added', linkData.value)
      closeModal()
    }

    const closeModal = () => {
      linkData.value = { url: '', description: '' }
      emit('update:visible', false)
    }

    return {
      linkData,
      addLink,
      closeModal
    }
  }
}
</script>

<style scoped>
.link-modal-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-label {
  font-weight: 600;
  color: var(--color-gray-800);
  margin-bottom: 0.5rem;
  display: block;
}
</style>