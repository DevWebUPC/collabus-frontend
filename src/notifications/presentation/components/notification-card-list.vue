<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  project: {
    type: String,
    default: ''
  },
  actionText: {
    type: String,
    default: ''
  },
  timestamp: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'default'
  }
});

const emit = defineEmits(['action-click']);

const handleActionClick = () => {
  emit('action-click');
};

const getTypeIcon = (type, title) => {
  if (title.includes('ACEPTADA')) return '✅';
  if (title.includes('RECHAZADA')) return '❌';
  if (title.includes('Hito Completado')) return '🏆';
  if (title.includes('Nuevo hito')) return '🚀';
  if (title.includes('Tarea')) return '📝';
  if (title.includes('Tarea marcada')) return '✅';
  return '📢';
};
</script>

<template>
  <div class="notification-card-list">
    <div class="notification-content">
      <div class="notification-header">
        <div class="title-with-icon">
          <span class="notification-icon">{{ getTypeIcon(type, title) }}</span>
          <h4 class="notification-title">{{ title }}</h4>
        </div>
        <span v-if="timestamp" class="notification-timestamp">{{ timestamp }}</span>
      </div>
      <p class="notification-description">{{ description }}</p>
      <div class="notification-footer">
        <div class="project-tag">{{ project }}</div>
        <button v-if="actionText" class="action-btn" @click="handleActionClick">
          {{ actionText }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notification-card-list {
  background: #F8F8F8;
  border: 1px solid #d3d3d3;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.notification-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.title-with-icon {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  flex: 1;
}

.notification-icon {
  font-size: 1.2rem;
  margin-top: 0.1rem;
  flex-shrink: 0;
}

.notification-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: #333;
  flex: 1;
}

.notification-timestamp {
  font-size: 0.8rem;
  color: #666;
  font-weight: 500;
}

.notification-description {
  margin: 0;
  color: #555;
  line-height: 1.4;
  font-size: 0.9rem;
  margin-left: 1.7rem; /* Para alinear con el texto después del ícono */
}

.notification-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-left: 1.7rem; /* Para alinear con el texto después del ícono */
}

.project-tag {
  background-color: #D2AFFF;
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 500;
}

.action-btn {
  background: transparent;
  border: 1px solid #6C63FF;
  color: #6C63FF;
  padding: 0.4rem 1rem;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
}

.action-btn:hover {
  background-color: #6C63FF;
  color: white;
}
</style>