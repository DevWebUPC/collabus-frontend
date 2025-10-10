<script setup>
import { ref } from 'vue';
import NotificationHeader from '../../../notifications/presentation/components/notification-header.vue';
import NotificationFilter from '../../../notifications/presentation/components/notification-filter.vue';
import NotificationListCard from '../../../notifications/presentation/components/notification-card-list.vue';

const notifications = ref({
  hoy: [
    {
      id: 1,
      title: 'Tu postulación fue ACEPTADA',
      description: '´Plataforma de E-Learning´ - Rol: Frontend. El owner te agregó al equipo.',
      project: 'Proyecto',
      actionText: 'Ir a Proyecto',
      timestamp: 'hace 5 min',
      type: 'accepted'
    },
    {
      id: 2,
      title: 'Tu postulación fue RECHAZADA',
      description: '‘Marketplace’ - Rol: Analista de datos. Gracias por postular.',
      project: 'Proyecto',
      actionText: 'Ver Detalles',
      timestamp: 'hace 20 min',
      type: 'rejected'
    },
    {
      id: 3,
      title: 'Plataforma de E-Learning - Hito Completado',
      description: 'Sprint 4 finalizado 12/12 tareas completadas',
      project: 'Actividades',
      actionText: 'Ver Hito',
      timestamp: 'hace 3 h',
      type: 'milestone'
    },
    {
      id: 4,
      title: 'Plataforma de E-Learning',
      description: 'Nuevo hito en marcha',
      project: 'Actividades',
      actionText: 'Ver Hito',
      timestamp: 'hace 4 h',
      type: 'new-milestone'
    },
    {
      id: 5,
      title: 'Plataforma de E-Learning - Nueva Tarea',
      description: 'Se te asigno una nueva tarea',
      project: 'Actividades',
      actionText: 'Ver Tarea',
      timestamp: 'hace 5 h',
      type: 'task'
    }
  ],
  estaSemana: [
    {
      id: 6,
      title: 'Plataforma de gestión financiera - Tarea marcada como hecha',
      description: 'Tarea #123 * ‘Implementar login’ ha sido completada.',
      project: 'Actividades',
      actionText: 'Ver Tarea',
      timestamp: 'Dom 10:32',
      type: 'task-completed'
    }
  ]
});

const handleMarkAllRead = () => {
  console.log('Marcar todo leído');
};

const handleFilterChange = (filterId) => {
  console.log('Filtro cambiado:', filterId);
};

const handleNotificationAction = (notificationId) => {
  console.log('Acción en notificación:', notificationId);
};
</script>

<template>
  <div class="notifications-container">
    <div class="notifications-view">
      <NotificationHeader @mark-all-read="handleMarkAllRead" />

      <div class="notifications-layout">
        <aside class="filters-sidebar">
          <NotificationFilter @filter-change="handleFilterChange" />
        </aside>

        <main class="notifications-main">
          <!-- Card Principal Única -->
          <div class="main-card">
            <!-- Sección Hoy -->
            <div class="section">
              <h2 class="section-title">Hoy</h2>
              <div class="notifications-list">
                <NotificationListCard
                    v-for="notification in notifications.hoy"
                    :key="notification.id"
                    :title="notification.title"
                    :description="notification.description"
                    :project="notification.project"
                    :action-text="notification.actionText"
                    :timestamp="notification.timestamp"
                    :type="notification.type"
                    @action-click="() => handleNotificationAction(notification.id)"
                />
              </div>
            </div>

            <!-- Sección Esta Semana -->
            <div class="section">
              <h2 class="section-title">Esta semana</h2>
              <div class="notifications-list">
                <NotificationListCard
                    v-for="notification in notifications.estaSemana"
                    :key="notification.id"
                    :title="notification.title"
                    :description="notification.description"
                    :project="notification.project"
                    :action-text="notification.actionText"
                    :timestamp="notification.timestamp"
                    :type="notification.type"
                    @action-click="() => handleNotificationAction(notification.id)"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Contenedor principal que abarca toda la pantalla */
.notifications-container {
  background-color: #F8FAFC;
  min-height: 100vh;
  width: 100%;
}

.notifications-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
}

.notifications-layout {
  display: flex;
  gap: 2rem;
}

.filters-sidebar {
  flex: 0 0 250px;
}

.notifications-main {
  flex: 1;
  min-width: 0;
}

.main-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #d3d3d3;
  padding: 2rem;
}

.section {
  margin-bottom: 2rem;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 1.3rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
  color: #FF7A30;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (max-width: 768px) {
  .notifications-view {
    padding: 1rem;
  }

  .notifications-layout {
    flex-direction: column;
    gap: 1rem;
  }

  .filters-sidebar {
    flex: none;
    width: 100%;
  }

  .main-card {
    padding: 1rem;
  }
}
</style>