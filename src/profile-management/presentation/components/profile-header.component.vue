<script setup lang="js">
defineProps({
  profileData: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <div class="col-12 md:col-3 flex flex-column gap-2">
    <pv-card class="p-8 mb-4 text-center border-round-xl shadow-1">
      <template #content>
        <img src='' alt="Avatar" class="h-6rem w-6rem border-circle object-fit-cover shadow-2 mb-2" />
        <h2 class="text-xl font-bold m-0 p-0">{{ profileData.name }}</h2>
        <p class="text-600 text-sm mt-1 mb-0">{{ profileData.mainRole }}</p>
      </template>
    </pv-card>

    <pv-button
        class="text-xl border-round-xl font-semibold border-2 py-3 mb-3 shadow-2 purple-button"
        outlined
        severity="secondary">
      {{ $t('profile.see-CV') }}
    </pv-button>

    <pv-button
        class="text-xl border-round-xl font-semibold border-2 py-3 mb-3 shadow-2 purple-button"
        outlined
        severity="secondary">
      {{ $t('profile.portfolio') }}
    </pv-button>
  </div>
</template>

<style scoped>
.purple-button {
  border-color: #6C63FF !important;
  color: #6C63FF !important;
}

.purple-button:hover {
  background-color: #6C63FF !important;
  color: white !important;
}
</style>