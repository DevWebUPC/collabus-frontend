<template>
  <pv-card class="notifications-card">
    <template #title>
      Notificaciones Recientes
    </template>
    <template #content>
      <div class="notifications-list">
        <div v-for="notification in notifications" :key="notification.id" class="notification-item">
          <span class="notification-text">{{ notification.text }}</span>
          <span class="notification-time">{{ notification.time }}</span>
        </div>
      </div>
    </template>
  </pv-card>
</template>

<script setup>
defineProps({
  notifications: {
    type: Array,
    default: () => [
      { id: 1, text: 'Ariana completó Diseño UI (Tareas).', time: 'Hace 2h' },
      { id: 2, text: 'Hito Entrega de prototipo alcanzado (Hito).', time: 'Hace 4h' },
      { id: 3, text: 'Juan Pérez donó $50 (Contribuciones-Donaciones).', time: 'Hace 6h' },
      { id: 4, text: 'María seleccionó Reward Básico (Contribuciones-Reward).', time: 'Hace 1d' },
      { id: 5, text: 'Carlos R. postuló como Frontend Developer (postulacion).', time: 'Hace 1d' }
    ]
  }
});
</script>

<style scoped>
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.notification-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-gray-200);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-text {
  font-size: 0.85rem;
  color: var(--color-gray-800);
  line-height: 1.4;
}

.notification-time {
  font-size: 0.7rem;
  color: var(--color-gray-500);
}
</style>