<template>
  <div class="progress-stepper">
    <div
        v-for="step in totalSteps"
        :key="step"
        :class="[
        'step',
        {
          active: step === currentStep,
          completed: step < currentStep,
          upcoming: step > currentStep
        }
      ]"
    >
      <!-- Círculo del paso -->
      <div class="step-circle">
        <span v-if="step === currentStep" class="inner-dot"></span>
        <span v-else-if="step < currentStep" class="checkmark">✓</span>
      </div>

      <!-- Línea conectora (excepto para el último paso) -->
      <div v-if="step < totalSteps" class="step-connector"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  currentStep: {
    type: Number,
    required: true,
    validator: (value) => value > 0
  },
  totalSteps: {
    type: Number,
    required: true,
    validator: (value) => value > 0
  }
})
</script>

<style scoped>
.progress-stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 0;
}

.step {
  display: flex;
  align-items: center;
  flex: 1;
  position: relative;
}

.step-circle {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  z-index: 2;
  transition: all 0.3s ease;
  background-color: #f3f4f6;
  border: 2px solid #d1d5db;
  color: #9ca3af;
}

/* Paso activo - círculo morado con punto blanco */
.step.active .step-circle {
  background-color: #6C63FF;
  border-color: #6C63FF;
  color: white;
  box-shadow: 0 0 0 4px rgba(108, 99, 255, 0.2);
}

/* Punto blanco dentro del círculo morado */
.inner-dot {
  width: 8px;
  height: 8px;
  background-color: white;
  border-radius: 50%;
  display: inline-block;
}

/* Paso completado - círculo verde con check */
.step.completed .step-circle {
  background-color: #10b981;
  border-color: #10b981;
  color: white;
}

.step.completed .checkmark {
  font-weight: bold;
  font-size: 1rem;
}

/* Paso futuro - círculo gris */
.step.upcoming .step-circle {
  background-color: #f3f4f6;
  border-color: #d1d5db;
  color: #9ca3af;
}

.step-connector {
  flex: 1;
  height: 2px;
  background-color: #e5e7eb;
  margin: 0 0.5rem;
  position: relative;
  transition: background-color 0.3s ease;
}

.step.completed .step-connector {
  background-color: #10b981;
}

.step.active .step-connector {
  background: linear-gradient(90deg, #10b981 50%, #e5e7eb 50%);
}

@media (max-width: 768px) {
  .progress-stepper {
    gap: 0.25rem;
  }

  .step-circle {
    width: 2rem;
    height: 2rem;
  }

  .inner-dot {
    width: 6px;
    height: 6px;
  }

  .step.completed .checkmark {
    font-size: 0.875rem;
  }

  .step-connector {
    margin: 0 0.25rem;
  }
}

@media (max-width: 480px) {
  .progress-stepper {
    justify-content: space-between;
  }

  .step {
    flex: 0 0 auto;
  }
}
</style>