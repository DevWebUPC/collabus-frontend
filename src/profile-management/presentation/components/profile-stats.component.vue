<script setup lang="js">
const props = defineProps({
  profileData: {
    type: Object,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  hasGivenPoint: { // 👈 Nueva prop
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['points-click']);

const handlePointsClick = () => {
  if (props.isPublic) {
    emit('points-click');
  }
};
</script>

<template>
  <div class="grid mb-4 justify-content-left">
    <div class="col-3">
      <pv-card
          class="p-2 text-center border-round-xl shadow-1 points-card"
          :class="{
            'public-points-card': isPublic,
            'points-card--active': hasGivenPoint
          }"
          @click="handlePointsClick"
      >
        <template #content>
          <span class="text-2xl font-extrabold" :class="hasGivenPoint ? 'text-white' : 'text-gray-900'">
            {{ profileData.points }} {{ $t('profile.points') }}
            <i v-if="hasGivenPoint" class="pi pi-star-fill ml-2" style="font-size: 1rem"></i>
          </span>
        </template>
      </pv-card>
    </div>

    <div class="col-3">
      <pv-card class="p-2 text-center border-round-xl shadow-1">
        <template #content>
          <span class="text-2xl font-extrabold text-gray-900">
            {{ profileData.projects.length }} {{ $t('profile.projects') }}
          </span>
        </template>
      </pv-card>
    </div>
  </div>
</template>

<style scoped>
.public-points-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.public-points-card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(108, 99, 255, 0.15) !important;
}

.points-card--active {
  background: linear-gradient(135deg, #6C63FF 0%, #8B84FF 100%) !important;
  border-color: #6C63FF !important;
}
</style>