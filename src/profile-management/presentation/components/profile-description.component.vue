<script setup lang="js">
defineProps({
  profileData: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <pv-card class="p-4 mb-4 border-round shadow-1">
    <template #content>
      <h3 class="text-xl font-semibold color-text mb-3">
        {{ $t('profile.personal-description') }}
      </h3>
      <p class="text-gray-700 line-height-3 m-0">{{ profileData.description }}</p>
    </template>
  </pv-card>
</template>

<style scoped>
.color-text {
  color: #6C63FF;
}
</style>