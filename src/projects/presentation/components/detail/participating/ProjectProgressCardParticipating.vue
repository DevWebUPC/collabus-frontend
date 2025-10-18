<!-- ProjectProgressCardParticipating.vue -->
<template>
  <pv-card class="project-progress-card">
    <template #title>
      Avance General del Proyecto
    </template>
    <template #content>
      <div class="progress-content">
        <!-- Círculo de progreso -->
        <div class="progress-circle-container">
          <div class="progress-circle">
            <div class="progress-circle-fill" :style="{ transform: `rotate(${progress * 3.6}deg)` }"></div>
            <div class="progress-circle-mask"></div>
            <div class="progress-text">
              <span class="progress-percentage">{{ (progress * 100).toFixed(2) }}%</span>
              <span class="progress-label">Completado</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </pv-card>
</template>

<script setup>
import { ref } from 'vue';

const progress = ref(0.000); // 0.65%
</script>

<style scoped>

.project-progress-card {
  height: 100%;
}

.progress-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Estilos para el círculo de progreso */
.progress-circle-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.progress-circle {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(
      var(--color-primary) 0% calc(v-bind(progress) * 100%),
      var(--color-gray-200) calc(v-bind(progress) * 100%) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-circle::before {
  content: '';
  position: absolute;
  width: 100px;
  height: 100px;
  background: white;
  border-radius: 50%;
}

.progress-text {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.progress-percentage {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1.2;
}

.progress-label {
  font-size: 0.8rem;
  color: var(--color-gray-600);
  text-align: center;
}

.progress-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-gray-200);
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  color: var(--color-gray-600);
  font-size: 0.9rem;
}

.stat-value {
  font-weight: 600;
  color: var(--color-gray-800);
}
</style>