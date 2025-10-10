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
        {{ $t('profile.skills') }}
      </h3>
      <div class="flex flex-wrap gap-2">
        <pv-tag
            v-for="skill in profileData.skills"
            :key="skill"
            :value="skill"
            class="color-bg text-white font-medium border-round-xl" />
      </div>
    </template>
  </pv-card>
</template>

<style scoped>
.color-text {
  color: #6C63FF;
}
.color-bg {
  background-color: #6C63FF !important;
}
</style>