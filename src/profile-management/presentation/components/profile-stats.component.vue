<script setup lang="js">
defineProps({
  profileData: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <div class="grid mb-4 justify-content-left">
    <div class="col-3">
      <pv-card class="p-2 text-center border-round-xl shadow-1">
        <template #content>
          <span class="text-2xl font-extrabold text-gray-900">
            {{ profileData.points }} {{ $t('profile.points') }}
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