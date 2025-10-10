<script setup lang="js">
defineProps({
  unreadCount: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['mark-all-read']);

const handleMarkAllRead = () => {
  emit('mark-all-read');
};
</script>

<template>
  <div class="notification-header">
    <div class="header-content">
      <h1 class="header-title">Notificaciones</h1>
      <pv-button
          class="mark-read-btn"
          @click="handleMarkAllRead"
          text
      >
        Marcar todo leído
      </pv-button>
    </div>
  </div>
</template>

<style scoped>
.notification-header {
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #d3d3d3;
  margin-bottom: 1.5rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
  color: #6C63FF;
}

.mark-read-btn {
  color: #6C63FF !important;
  font-weight: 500;
  text-decoration: none;
  border: 1px solid #d3d3d3;
  border-radius: 9px;
}

.mark-read-btn:hover {
  background-color: transparent !important;
  color: #5a52d5 !important;
}
</style>