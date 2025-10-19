<script setup>
import { ref, computed } from 'vue';

// Notificaciones vacías
const staticNotifications = ref([]);

// Computed: Notificaciones recientes (últimas 5)
const recentNotifications = computed(() => {
  return staticNotifications.value
      .slice(0, 5)
      .map(notification => ({
        ...notification,
        formattedDate: formatNotificationDate(notification.date)
      }));
});

// Computed: Total de notificaciones no leídas
const unreadCount = computed(() => {
  return staticNotifications.value.filter(notification => !notification.read).length;
});

// Métodos
const formatNotificationDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 60) {
      return `Hace ${diffMinutes} min`;
    } else if (diffHours < 24) {
      return `Hace ${diffHours} h`;
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  } catch {
    return 'Fecha inválida';
  }
};

const markAsRead = (notificationId) => {
  const notification = staticNotifications.value.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
  }
};

const getNotificationIcon = (type) => {
  const icons = {
    new_application: 'pi pi-user-plus',
    application_accepted: 'pi pi-check-circle',
    application_rejected: 'pi pi-times-circle',
    project_update: 'pi pi-info-circle',
    milestone: 'pi pi-flag',
    task: 'pi pi-check-square',
    default: 'pi pi-bell'
  };
  return icons[type] || icons.default;
};

const getNotificationColor = (type) => {
  const colors = {
    new_application: 'var(--color-primary)',
    application_accepted: 'var(--color-green-500)',
    application_rejected: 'var(--color-red-500)',
    project_update: 'var(--color-blue-500)',
    milestone: 'var(--color-purple-500)',
    task: 'var(--color-orange-500)',
    default: 'var(--color-gray-500)'
  };
  return colors[type] || colors.default;
};
</script>

<template>
  <div class="recent-notifications-card">
    <!-- Header -->
    <div class="card-header">
      <h3 class="card-title">Notificaciones Recientes</h3>
      <div v-if="unreadCount > 0" class="notification-badge">
        {{ unreadCount }}
      </div>
    </div>

    <!-- Lista de notificaciones -->
    <div class="notifications-list">
      <div
          v-for="notification in recentNotifications"
          :key="notification.id"
          :class="['notification-item', { unread: !notification.read }]"
          @click="markAsRead(notification.id)"
      >
        <div class="notification-icon">
          <i :class="getNotificationIcon(notification.type)"
             :style="{ color: getNotificationColor(notification.type) }"></i>
        </div>

        <div class="notification-content">
          <div class="notification-title">
            {{ notification.title }}
          </div>
          <div class="notification-message">
            {{ notification.message }}
          </div>
          <div class="notification-meta">
            <span class="notification-date">{{ notification.formattedDate }}</span>
            <span v-if="!notification.read" class="unread-dot"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-if="recentNotifications.length === 0" class="empty-state">
      <i class="pi pi-bell empty-icon"></i>
      <p>No hay notificaciones recientes</p>
      <small>Las notificaciones aparecerán aquí</small>
    </div>

    <!-- Ver todas las notificaciones -->
    <div v-if="staticNotifications.length > 5" class="view-all-section">
      <pv-button
          label="Ver todas las notificaciones"
          text
          size="small"
          class="view-all-btn"
      />
    </div>
  </div>
</template>

<style scoped>
.recent-notifications-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-gray-800);
  margin: 0;
}

.notification-badge {
  background: var(--color-primary);
  color: white;
  border-radius: 12px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 1.5rem;
  text-align: center;
}

/* Lista de notificaciones */
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.notification-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.notification-item:hover {
  background: var(--color-gray-50);
  border-color: var(--color-gray-200);
}

.notification-item.unread {
  background: var(--color-primary-50);
  border-color: var(--color-primary-100);
}

.notification-icon {
  display: flex;
  align-items: flex-start;
  padding-top: 0.25rem;
  flex-shrink: 0;
}

.notification-icon i {
  font-size: 1.1rem;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  color: var(--color-gray-800);
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  line-height: 1.2;
}

.notification-message {
  color: var(--color-gray-600);
  font-size: 0.8rem;
  line-height: 1.3;
  margin-bottom: 0.5rem;
  word-wrap: break-word;
}

.notification-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-date {
  color: var(--color-gray-500);
  font-size: 0.75rem;
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary);
  flex-shrink: 0;
}

/* Estado vacío */
.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--color-gray-500);
}

.empty-icon {
  font-size: 2.5rem;
  color: var(--color-gray-300);
  margin-bottom: 1rem;
}

.empty-state p {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
}

.empty-state small {
  font-size: 0.8rem;
  color: var(--color-gray-400);
}

/* Ver todas */
.view-all-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-gray-200);
  text-align: center;
}

.view-all-btn {
  color: var(--color-primary);
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 768px) {
  .recent-notifications-card {
    padding: 1rem;
  }

  .notification-item {
    padding: 0.5rem;
  }

  .notification-title {
    font-size: 0.8rem;
  }

  .notification-message {
    font-size: 0.75rem;
  }
}
</style>