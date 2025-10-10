<script setup lang="js">
  defineProps({
  title: {
  type: String,
  default: 'Hoy'
}
});
</script>

<template>
  <div class="notification-card">
    <div class="card-header">
      <h3 class="card-title">{{ title }}</h3>
    </div>
    <div class="card-content">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.notification-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #d3d3d3;
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.card-header {
  padding: 1rem 1.5rem;
  background-color: #FF7A30;
  border-bottom: 1px solid #d3d3d3;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: white;
}

.card-content {
  padding: 0;
}
</style>