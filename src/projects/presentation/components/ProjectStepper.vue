<script setup>
// Props
const props = defineProps({
  currentStep: {
    type: Number,
    required: true
  },
  totalSteps: {
    type: Number,
    required: true
  },
  stepLabels: {
    type: Array,
    default: () => []
  }
});
</script>

<template>
  <div class="stepper-container">
    <div class="steps-indicator">
      <div
          v-for="step in totalSteps"
          :key="step"
          class="step-dot"
          :class="{
          'active': step - 1 === currentStep,
          'completed': step - 1 < currentStep
        }"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.stepper-container {
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
}

.steps-indicator {
  display: flex;
  gap: 12px;
  align-items: center;
}

.step-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-gray-300, #e5e7eb);
  transition: all 0.3s ease;
}

.step-dot.active {
  background: #6C63FF;
  transform: scale(1.2);
}

.step-dot.completed {
  background: #22C55E;
}
</style>