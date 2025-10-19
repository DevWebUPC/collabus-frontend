<!-- TaskList.component.vue (ACTUALIZADO) -->
<template>
  <div class="task-list">
    <!-- Encabezados de la tabla -->
    <div class="table-headers">
      <div class="header-col colaborador">Colaborador</div>
      <div class="header-col tarea">Tarea</div>
      <div class="header-col vencimiento">Vencimiento</div>
      <div class="header-col estado">Estado</div>
      <div class="header-col acciones">Acciones</div>
    </div>

    <!-- Línea separadora -->
    <div class="separator"></div>

    <!-- Lista de tareas -->
    <div class="tasks-content">
      <div
          v-for="task in tasks"
          :key="task.id"
          class="task-row"
      >
        <div class="task-col colaborador">
          <div class="collaborator-info">
            <span class="collaborator-name">{{ task.assignedToName }}</span>
            <span class="collaborator-role">{{ task.role }}</span>
          </div>
        </div>

        <div class="task-col tarea">
          <div class="task-title">{{ task.title }}</div>
          <div class="task-description">{{ task.description }}</div>
        </div>

        <div class="task-col vencimiento">
          <div class="due-date">
            {{ formatDate(task.dueDate) }}
          </div>
        </div>

        <div class="task-col estado">
          <span
              class="status-badge"
              :class="getStatusClass(getActualStatus(task))"
          >
            {{ getStatusText(getActualStatus(task)) }}
          </span>
        </div>

        <div class="task-col acciones">
          <div class="action-buttons">
            <!-- Botón "Ver Tarea" - HABILITADO cuando hay submission -->
            <pv-button
                v-if="getActualStatus(task) !== 'retrasado'"
                :label="taskHasSubmission(task) ? 'Ver Entrega' : 'Ver Tarea'"
                :class="['view-task-btn', { 'has-submission': taskHasSubmission(task) }]"
                :disabled="!taskHasSubmission(task)"
                @click="handleViewTask(task)"
            />

            <!-- Solo mostrar botones para tareas retrasadas -->
            <template v-if="getActualStatus(task) === 'retrasado'">
              <div class="vertical-buttons">
                <pv-button
                    label="Eliminar"
                    severity="danger"
                    class="action-btn delete-btn"
                    @click="$emit('delete', task)"
                />
                <pv-button
                    label="Cambiar Fecha"
                    severity="secondary"
                    class="action-btn date-btn"
                    @click="$emit('updateDate', task)"
                />
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-if="tasks.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <p class="empty-text">No hay tareas asignadas</p>
        <pv-button
            class="create-first-task-btn"
            @click="$emit('create')"
        >
          Crear primera tarea
        </pv-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskList',
  props: {
    tasks: {
      type: Array,
      default: () => []
    },
    taskHasSubmission: {
      type: Function,
      default: () => false
    }
  },
  emits: ['delete', 'updateDate', 'create', 'view', 'view-submission'],
  methods: {
    formatDate(dateString) {
      if (!dateString) return 'Sin fecha'

      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    },

    isOverdue(task) {
      if (!task.dueDate || task.status === 'completed') return false

      const dueDate = new Date(task.dueDate)
      const today = new Date()
      return dueDate < today
    },

    getStatusClass(status) {
      const statusClasses = {
        'completed': 'status-completed',
        'pending': 'status-pending',
        'retrasado': 'status-overdue'
      }
      return statusClasses[status] || 'status-pending'
    },

    getStatusText(status) {
      const statusTexts = {
        'completed': 'Completado',
        'pending': 'Pendiente',
        'retrasado': 'Retrasado'
      }
      return statusTexts[status] || 'Pendiente'
    },

    /**
     * Determinar el estado real de la tarea considerando la fecha de vencimiento
     */
    getActualStatus(task) {
      if (task.status === 'completed') return 'completed';

      // ✅ USAR EL MÉTODO DE LA ENTIDAD EN LUGAR DE CÁLCULO MANUAL
      if (task.isOverdue && task.isOverdue()) {
        return 'retrasado';
      }

      // ✅ VERIFICAR DIRECTAMENTE SI LA FECHA ESTÁ VENCIDA
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Solo comparar fechas, no horas

        if (dueDate < today) {
          return 'retrasado';
        }
      }

      return task.status || 'pending';
    },

    /**
     * Manejar el clic en "Ver Tarea" - redirige a submission si existe
     */
    handleViewTask(task) {
      if (this.taskHasSubmission(task)) {
        // Si hay submission, emitir evento para ver la entrega
        this.$emit('view-submission', task);
      } else {
        // Si no hay submission, emitir evento para ver la tarea normal
        this.$emit('view', task);
      }
    }
  }
}
</script>

<style scoped>
/* Los estilos permanecen iguales */
.task-list {
  width: 100%;
}

.table-headers {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr 100px;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

.header-col {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  text-align: left;
}

.separator {
  height: 1px;
  background: #e5e7eb;
  margin: 0.5rem 0;
}

.tasks-content {
  min-height: 200px;
}

.task-row {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr 100px;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  align-items: start;
}

.task-row:hover {
  background: #fafafa;
}

.task-col {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.collaborator-info {
  display: flex;
  flex-direction: column;
}

.collaborator-name {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.collaborator-role {
  font-size: 0.75rem;
  color: #6b7280;
}

.task-title {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.task-description {
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1.3;
}

.due-date {
  font-size: 0.875rem;
  color: #374151;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
  display: inline-block;
  width: fit-content;
}

.status-completed {
  background: #d1fae5;
  color: #065f46;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-overdue {
  background: #fecaca;
  color: #991b1b;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  align-items: center;
}

.vertical-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

/* Botón "Ver Tarea" - ESTILOS ACTUALIZADOS */
.view-task-btn {
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

/* Estado deshabilitado (sin submission) */
.view-task-btn:disabled {
  background: #9ca3af !important;
  color: white !important;
  cursor: not-allowed;
  opacity: 0.6;
}

.view-task-btn:disabled:hover {
  background: #9ca3af !important;
  transform: none !important;
}

/* Estado habilitado (con submission) */
.view-task-btn.has-submission:not(:disabled) {
  background: var(--color-primary) !important;
  color: white !important;
}

.view-task-btn.has-submission:not(:disabled):hover {
  background: var(--color-primary-dark) !important;
  transform: translateY(-1px);
}

.action-btn {
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.delete-btn {
  background: #ef4444 !important;
  color: white !important;
}

.delete-btn:hover {
  background: #dc2626 !important;
  transform: translateY(-1px);
}

.date-btn {
  background: #8b5cf6 !important;
  color: white !important;
}

.date-btn:hover {
  background: #7c3aed !important;
  transform: translateY(-1px);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-text {
  color: #6b7280;
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.create-first-task-btn {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  cursor: pointer;
}

/* Responsive */
@media (max-width: 768px) {
  .table-headers {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 1rem;
    display: none;
  }

  .task-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    margin-bottom: 0.75rem;
  }

  .action-buttons {
    justify-content: flex-start;
    margin-top: 0.5rem;
    flex-wrap: wrap;
  }

  .vertical-buttons {
    width: 100%;
  }

  .view-task-btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .action-btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}
</style>