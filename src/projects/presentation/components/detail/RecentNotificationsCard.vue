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