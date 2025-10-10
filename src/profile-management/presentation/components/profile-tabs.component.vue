<script setup lang="js">
import { ref } from 'vue';

const selectedOption = ref(2);
const selectedProjectView = ref('my-projects'); // 'my-projects' o 'favorites'
</script>

<template>
  <div class="flex justify-content-center flex-column align-items-center">
    <!-- Tabs principales -->
    <div class="tabs-container mb-4">
      <div
          class="tab-option"
          :class="{ 'tab-active': selectedOption === 1 }"
          @click="selectedOption = 1"
      >
        {{ $t('profile.options.projects') }}
      </div>
      <div
          class="tab-option"
          :class="{ 'tab-active': selectedOption === 2 }"
          @click="selectedOption = 2"
      >
        {{ $t('profile.options.comments') }}
      </div>
    </div>

    <!-- Sub-tabs para proyectos (solo visible cuando selectedOption === 1) -->
    <div v-if="selectedOption === 1" class="sub-tabs-container">
      <div
          class="sub-tab-option"
          :class="{ 'sub-tab-active': selectedProjectView === 'my-projects' }"
          @click="selectedProjectView = 'my-projects'"
      >
        Mis Proyectos
      </div>
      <div
          class="sub-tab-option"
          :class="{ 'sub-tab-active': selectedProjectView === 'favorites' }"
          @click="selectedProjectView = 'favorites'"
      >
        Favoritos
      </div>
    </div>

    <!-- Contenido dinámico -->
    <div class="tab-content">
      <div v-if="selectedOption === 1">
        <div v-if="selectedProjectView === 'my-projects'">
          <!-- Contenido de Mis Proyectos -->
          <p>Mostrando mis proyectos...</p>
        </div>
        <div v-else-if="selectedProjectView === 'favorites'">
          <!-- Contenido de Favoritos -->
          <p>Mostrando proyectos favoritos...</p>
        </div>
      </div>

      <div v-else-if="selectedOption === 2">
        <!-- Contenido de Comentarios -->
        <p>Mostrando comentarios...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tabs-container {
  display: flex;
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 4px;
  width: fit-content;
}

.tab-option {
  font-size: 20px;
  flex: 1;
  text-align: center;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 10px;
}

.tab-active {
  color: #6C63FF;
}

.sub-tabs-container {
  display: flex;
  background-color: #ffffff;
  color: #4A41CC;
  border-radius: 8px;
  padding: 2px;
  margin-bottom: 1rem;
  width: fit-content;
  gap: 40px;
}

.sub-tab-option {
  border: 2px solid #4A41CC;
  flex: 1;
  text-align: center;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  min-width: 180px;
}

.sub-tab-active {
  background-color: #6C63FF;
  color: #E0E0E0;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.tab-content {
  min-height: 200px;
  padding: 1rem;
  width: 100%;
  text-align: center;
}
</style>