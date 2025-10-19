<!-- UpcomingMilestonesCardParticipating.vue -->
<template>
  <pv-card class="upcoming-milestones-card">
    <template #title>
      Próximos Hitos
    </template>
    <template #content>
      <div class="milestones-list">

      </div>
    </template>
  </pv-card>
</template>

<style scoped>
.upcoming-milestones-card {
  height: 100%;
}

.milestones-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.milestone-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  background: var(--color-gray-50);
  border-radius: 8px;
  border-left: 4px solid var(--color-warning);
}

.milestone-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.milestone-title {
  font-weight: 600;
  color: var(--color-gray-800);
  font-size: 0.9rem;
}

.milestone-due-date {
  font-size: 0.8rem;
  color: var(--color-gray-600);
}

.view-milestone-btn {
  color: var(--color-primary);
  font-size: 0.8rem;
  font-weight: 500;
}
</style>