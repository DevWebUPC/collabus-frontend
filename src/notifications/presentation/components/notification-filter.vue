<script setup lang="js">
  import { ref } from 'vue';

  const filters = ref([
  { id: 'all', label: 'Todo', count: 12, active: true },
  { id: 'unread', label: 'No leídos', count: null, active: false },
  { id: 'tasks', label: 'Tareas', count: null, active: false },
  { id: 'invitations', label: 'Invitaciones', count: null, active: false },
  { id: 'comments', label: 'Comentarios', count: null, active: false },
  { id: 'milestones', label: 'Hitos', count: null, active: false },
  { id: 'applications', label: 'Postulaciones', count: null, active: false }
  ]);

  const selectedFilter = ref('all');

  const emit = defineEmits(['filter-change']);

  const handleFilterClick = (filterId) => {
  selectedFilter.value = filterId;
  emit('filter-change', filterId);
};
</script>

<template>
  <div class="notification-filter">
    <h3 class="filter-title">Filtros</h3>
    <div class="filter-list">
      <div
          v-for="filter in filters"
          :key="filter.id"
          :class="['filter-item', { active: selectedFilter === filter.id }]"
          @click="handleFilterClick(filter.id)"
      >
        <span class="filter-label">{{ filter.label }}</span>
        <span v-if="filter.count !== null" class="filter-count">
          +{{ filter.count }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notification-filter {
  width: 250px;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #d3d3d3;
}

.filter-title {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #6C63FF;
}

.filter-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: white;
}

.filter-item:hover {
  background-color: #f8f9fa;
}

.filter-item.active {
  background-color: #6C63FF;
  color: white;
}

.filter-label {
  font-weight: 500;
  font-size: 0.9rem;
}

.filter-count {
  font-size: 0.8rem;
  font-weight: 600;
  color: #6C63FF;
}

.filter-item.active .filter-count {
  color: white;
}
</style>