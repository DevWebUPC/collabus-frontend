<script setup lang="js">
import { ref } from 'vue';

const experiencesOpen = ref(false);

defineProps({
  profileData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['toggle-experiences']);

const toggleExperiences = () => {
  experiencesOpen.value = !experiencesOpen.value;
  emit('toggle-experiences', experiencesOpen.value);
};
</script>

<template>
  <div>
    <pv-card class="p-4 mb-4 border-round-xl shadow-1">
      <template #content>
        <div class="flex flex-row justify-content-between align-items-center">
          <span class="text-xl font-semibold">{{ $t('profile.experiences') }}</span>
          <div @click="toggleExperiences" class="cursor-pointer">
              <svg width="40" height="40" viewBox="0 0 20 20"
                :transform="experiencesOpen ? 'rotate(0)' : 'rotate(180)'"
                style="transition: transform 0.3s ease; fill: var(--color-primary-700);">
              <polygon points="10,5 15,15 5,15" />
            </svg>
          </div>
        </div>
      </template>
    </pv-card>

    <div v-if="experiencesOpen">
      <!-- Tabla de experiencias -->
      <div class="experience-table">
        <!-- Encabezados -->
        <div class="table-header grid mb-2">
          <div class="col-4">
            <div class="header-cell p-3 text-center font-semibold border-round-top border-1 border-300 bg-gray-100">
              {{ $t('profile.experience-tab.company') }}
            </div>
          </div>
          <div class="col-4">
            <div class="header-cell p-3 text-center font-semibold border-round-top border-1 border-300 bg-gray-100">
              {{ $t('profile.experience-tab.role') }}
            </div>
          </div>
          <div class="col-4">
            <div class="header-cell p-3 text-center font-semibold border-round-top border-1 border-300 bg-gray-100">
              {{ $t('profile.experience-tab.duration') }}
            </div>
          </div>
        </div>

        <!-- Filas de datos -->
        <div v-for="(experience, index) in profileData.experiences"
             :key="index"
             class="table-row grid mb-2">
          <div class="col-4">
            <div class="data-cell p-3 text-center border-1 border-300 border-round-bottom bg-white">
              {{ experience.company }}
            </div>
          </div>
          <div class="col-4">
            <div class="data-cell p-3 text-center border-1 border-300 border-round-bottom bg-white">
              {{ experience.role }}
            </div>
          </div>
          <div class="col-4">
            <div class="data-cell p-3 text-center border-1 border-300 border-round-bottom bg-white">
              {{ experience.startDate }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.experience-table {
  border: 1px solid var(--color-gray-300);
  border-radius: 12px;
  overflow: hidden;
}

.table-header {
  margin-bottom: 0 !important;
}

.header-cell {
  border-bottom: 2px solid var(--color-gray-300, #e5e7eb);
  background-color: var(--color-gray-50);
}

.data-cell {
  border-top: none;
  border-bottom: 1px solid var(--color-gray-300);
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-white);
}

.table-row:last-child .data-cell {
  border-bottom: none;
}

.bg-gray-100 {
  background-color: #f3f4f6;
}
</style>