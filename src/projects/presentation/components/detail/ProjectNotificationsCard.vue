<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Props
const props = defineProps({
  project: {
    type: Object,
    default: null
  },
  notifications: {
    type: Array,
    default: () => []
  }
});

// Computed
const hasNotifications = computed(() => {
  return props.notifications && props.notifications.length > 0;
});

const recentNotifications = computed(() => {
  return props.notifications.slice(0, 3); // Show only last 3
});

// Methods
const getNotificationIcon = (type) => {
  const iconMap = {
    'task_completed': 'pi-check',
    'milestone_achieved': 'pi-flag',
    'contribution': 'pi-dollar',
    'comment': 'pi-comment',
    'default': 'pi-info-circle'
  };
  return iconMap[type] || iconMap.default;
};

const getNotificationIconClass = (type) => {
  const classMap = {
    'task_completed': 'success',
    'milestone_achieved': 'milestone',
    'contribution': 'money',
    'comment': 'info',
    'default': 'info'
  };
  return classMap[type] || classMap.default;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return t('common.dates.yesterday');
    if (diffDays < 7) {
      const prefix = t('common.dates.days-ago-prefix');
      const daysText = t('common.dates.days-ago');
      return prefix ? `${prefix} ${diffDays} ${daysText}` : `${diffDays} ${daysText}`;
    }
    return date.toLocaleDateString();
  } catch {
    return dateString;
  }
};
</script>

<template>
  <pv-card class="section-card">
    <template #title>{{ $t('projects.detail.sections.recent-notifications') }}</template>
    <template #content>
      <div v-if="hasNotifications">
        <div 
          v-for="notification in recentNotifications" 
          :key="notification.id || notification.message"
          class="notification-item"
        >
          <div :class="['notification-icon', getNotificationIconClass(notification.type)]">
            <i :class="['pi', getNotificationIcon(notification.type)]"></i>
          </div>
          <div class="notification-info">
            <span class="notification-text">{{ notification.message || notification.content }}</span>
            <span v-if="notification.createdAt" class="notification-date">
              {{ formatDate(notification.createdAt) }}
            </span>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-section">
        <div class="empty-icon">
          <i class="pi pi-bell"></i>
        </div>
        <p class="empty-text">{{ $t('projects.detail.empty.no-notifications') }}</p>
        <p class="empty-desc">{{ $t('projects.detail.empty.no-notifications-desc') }}</p>
      </div>
    </template>
  </pv-card>
</template>



<style scoped>
.section-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 100%;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-gray-200);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  font-size: 0.75rem;
  flex-shrink: 0;
}

.notification-icon.success {
  background: var(--color-success);
}

.notification-icon.milestone {
  background: var(--color-info);
}

.notification-icon.money {
  background: var(--color-warning);
}

.notification-icon.info {
  background: var(--color-primary);
}

.notification-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.notification-text {
  font-size: 0.875rem;
  color: var(--color-gray-800);
  line-height: 1.4;
}

.notification-date {
  font-size: 0.75rem;
  color: var(--color-gray-600);
}

.notification-actions {
  display: flex;
  justify-content: center;
  padding-top: 1rem;
  margin-top: 1rem;
  border-top: 1px solid var(--color-gray-200);
}

.view-all-button {
  background: #6366f1 !important;
  color: white !important;
  border: none !important;
  border-radius: 8px !important;
  padding: 0.5rem 1.5rem !important;
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  transition: all 0.2s ease !important;
}

.view-all-button:hover {
  background: #5855eb !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3) !important;
}

.empty-section {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  font-size: 3rem;
  color: var(--color-gray-400);
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-gray-700);
  margin: 0 0 0.5rem 0;
}

.empty-desc {
  font-size: 0.9rem;
  color: var(--color-gray-600);
  margin: 0;
}
</style>