<template>
  <pv-card class="milestones-card">
    <template #title>
      <div class="card-title">
        Próximos Hitos
        <span class="badge" :class="upcomingMilestones.length > 0 ? 'urgent' : 'normal'">
          {{ upcomingMilestones.length }}
        </span>
      </div>
    </template>
    <template #content>
      <div class="milestones-list">
        <div
            v-for="milestone in upcomingMilestones"
            :key="milestone.id"
            class="milestone-item"
        >
          <div class="milestone-info">
            <span class="milestone-name">{{ milestone.title }}</span>
            <span class="milestone-date">{{ formatDueDate(milestone.dueDate) }}</span>
            <span class="milestone-progress">Progreso: {{ calculateMilestoneProgress(milestone) }}%</span>
          </div>
        </div>
      </div>
      <div v-if="upcomingMilestones.length === 0" class="no-milestones">
        <i class="pi pi-check-circle" style="font-size: 2rem; color: var(--color-success); margin-bottom: 0.5rem;"></i>
        <p>No hay hitos próximos</p>
      </div>

      <!-- NUEVO: Botón Ver Todos los Hitos -->
      <div class="view-all">
        <pv-button
            label="Ver Todos los Hitos"
            text
            icon="pi pi-list"
            @click="handleViewAllMilestones"
        />
      </div>
    </template>
  </pv-card>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useProjectDetailStore } from '../../../../application/project-detail.store.js';

const route = useRoute();
const store = useProjectDetailStore();

// Emit para navegación - NUEVO
const emit = defineEmits(['view-all-milestones']);

// ✅ CORREGIDO: Función para calcular el progreso real del hito basado en sus tareas
const calculateMilestoneProgress = (milestone) => {
  if (!milestone.milestoneTasks || milestone.milestoneTasks.length === 0) {
    return milestone.progress || 0;
  }

  const completedTasks = milestone.milestoneTasks.filter(task =>
      task.status === 'completed' || task.progress === 100
  ).length;

  return Math.round((completedTasks / milestone.milestoneTasks.length) * 100);
};

// ✅ CORREGIDO: Función para verificar si un hito está realmente completado
const isMilestoneCompleted = (milestone) => {
  // Si ya está marcado como completado en el status
  if (milestone.status === 'completed') {
    return true;
  }

  // Si el progreso del hito es 100%
  if (milestone.progress === 100) {
    return true;
  }

  // ✅ NUEVO: Verificar si todas las tareas del hito están completadas
  if (milestone.milestoneTasks && milestone.milestoneTasks.length > 0) {
    const allTasksCompleted = milestone.milestoneTasks.every(task =>
        task.status === 'completed' || task.progress === 100
    );

    if (allTasksCompleted) {
      return true;
    }
  }

  return false;
};

// Computed property para obtener hitos próximos/urgentes - ✅ CORREGIDO: Excluir hitos realmente completados
const upcomingMilestones = computed(() => {
  if (!store.project?.milestones || !Array.isArray(store.project.milestones)) {
    return [];
  }

  const now = new Date();
  const urgentThreshold = new Date();
  urgentThreshold.setDate(urgentThreshold.getDate() + 7); // 7 días en el futuro

  return store.project.milestones
      .filter(milestone => {
        // ✅ CORREGIDO: Excluir hitos realmente completados
        if (isMilestoneCompleted(milestone)) {
          return false;
        }

        if (!milestone.dueDate) return false;

        const dueDate = new Date(milestone.dueDate);
        return dueDate <= urgentThreshold && dueDate >= now; // Solo hitos futuros (no vencidos)
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
});

// Verificar si un hito está vencido
const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  const now = new Date();
  const due = new Date(dueDate);
  return due < now;
};

// Formatear la fecha de vencimiento
const formatDueDate = (dueDate) => {
  if (!dueDate) return 'Sin fecha';

  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `Vencido hace ${Math.abs(diffDays)} día${Math.abs(diffDays) !== 1 ? 's' : ''}`;
  } else if (diffDays === 0) {
    return 'Vence hoy';
  } else if (diffDays === 1) {
    return 'Vence mañana';
  } else {
    return `Vence en ${diffDays} días`;
  }
};

// NUEVO: Manejar clic en "Ver Todos los Hitos"
const handleViewAllMilestones = () => {
  console.log('🔄 Navegando a la pestaña de Milestones');
  emit('view-all-milestones');
};

// Debug
onMounted(() => {
  console.log('📋 Upcoming Milestones Loaded:', upcomingMilestones.value);
  // Debug adicional para ver todos los hitos
  console.log('🔍 All Milestones:', store.project?.milestones?.map(m => ({
    id: m.id,
    title: m.title,
    status: m.status,
    progress: m.progress,
    dueDate: m.dueDate,
    isCompleted: isMilestoneCompleted(m),
    tasks: m.milestoneTasks?.map(t => ({
      title: t.title,
      status: t.status,
      progress: t.progress
    }))
  })));
});
</script>

<style scoped>
/* Estilos existentes se mantienen y se agrega el nuevo */
.milestones-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.milestone-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--color-gray-200);
  background: white;
  transition: all 0.2s ease;
}

.milestone-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.milestone-item.overdue {
  border-left: 4px solid #dc2626;
  background: #fef2f2;
}

.milestone-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.milestone-name {
  font-weight: 600;
  color: var(--color-gray-800);
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.milestone-date {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-warning);
  margin-bottom: 0.25rem;
}

.milestone-date.overdue {
  color: #dc2626;
  font-weight: bold;
}

.milestone-progress {
  font-size: 0.75rem;
  color: var(--color-gray-600);
}

.no-milestones {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--color-gray-500);
  margin-bottom: 1rem;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge.urgent {
  background: var(--color-error);
  color: white;
}

.badge.normal {
  background: var(--color-success);
  color: white;
}

/* NUEVO: Estilos para el botón Ver Todos */
.view-all {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
  border-top: 1px solid var(--color-gray-200);
  padding-top: 1rem;
}
</style>