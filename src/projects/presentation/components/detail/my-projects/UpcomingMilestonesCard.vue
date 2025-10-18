<template>
  <pv-card class="milestones-card">
    <template #title>
      Próximos Hitos
    </template>
    <template #content>
      <div class="milestones-list">
        <div v-for="milestone in milestones" :key="milestone.id" class="milestone-item">
          <div class="milestone-info">
            <span class="milestone-name">{{ milestone.name }}</span>
            <span class="milestone-date">{{ milestone.date }}</span>
          </div>
          <pv-button icon="pi pi-ellipsis-h" text rounded />
        </div>
      </div>
    </template>
  </pv-card>
</template>

<script setup>

</script>

<style scoped>
.milestones-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.milestone-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-gray-200);
}

.milestone-item:last-child {
  border-bottom: none;
}

.milestone-info {
  display: flex;
  flex-direction: column;
}

.milestone-name {
  font-weight: 500;
  color: var(--color-gray-800);
  font-size: 0.9rem;
}

.milestone-date {
  font-size: 0.8rem;
  color: var(--color-gray-600);
}
</style>