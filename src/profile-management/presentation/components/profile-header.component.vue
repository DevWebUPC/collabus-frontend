<script setup lang="js">
defineProps({
  profileData: {
    type: Object,
    required: true
  }
});

// Función para obtener la URL del avatar
const getAvatarUrl = (avatarData) => {
  if (!avatarData) return '';

  // Si ya es una URL data:image
  if (avatarData.startsWith('data:image')) {
    return avatarData;
  }

  // Si es base64 puro, construir la URL
  if (avatarData.startsWith('base64,')) {
    return `data:image/svg+xml;base64,${avatarData.replace('base64,', '')}`;
  }

  return avatarData;
};
</script>

<template>
  <div class="col-12 md:col-3 flex flex-column gap-2">
    <pv-card class="p-8 mb-4 text-center border-round-xl shadow-1">
      <template #content>
        <!-- Avatar con imagen dinámica -->
        <div class="avatar-container mb-2">
          <img
              :src="getAvatarUrl(profileData.avatar)"
              :alt="`Avatar de ${profileData.name}`"
              class="h-6rem w-6rem border-circle object-fit-cover shadow-2 mb-2"
              @error="(e) => { e.target.style.display = 'none'; }"
          />
          <!-- Avatar por defecto si la imagen falla -->
          <div
              v-if="!profileData.avatar"
              class="h-6rem w-6rem border-circle bg-gray-200 flex align-items-center justify-content-center shadow-2 mb-2"
          >
            <i class="pi pi-user text-4xl text-gray-500"></i>
          </div>
        </div>
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

.avatar-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Estilo para el avatar por defecto */
.bg-gray-200 {
  background-color: #e5e7eb;
}
</style>