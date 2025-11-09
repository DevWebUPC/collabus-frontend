<script setup lang="js">
// 👇 ASIGNAR defineProps A UNA VARIABLE
const props = defineProps({
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

// 👇 NUEVA FUNCIÓN: Ver/Descargar CV - CORREGIDA
const viewCV = () => {
  // Ahora podemos usar props.profileData correctamente
  const cvData = props.profileData.cv;

  if (!cvData || !cvData.data) {
    alert('No hay CV disponible');
    return;
  }

  try {
    // Si ya es una URL data (como data:application/pdf;base64,...)
    if (cvData.data.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = cvData.data;
      link.download = cvData.fileName || 'CV.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Si es solo base64, construir la URL data
      const dataUrl = `data:${cvData.fileType};base64,${cvData.data}`;
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = cvData.fileName || 'CV.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    console.error('Error al descargar CV:', error);
    alert('Error al descargar el CV');
  }
};

// 👇 NUEVA FUNCIÓN: Ver Portfolio
const viewPortfolio = () => {
  // Aquí puedes implementar la lógica para ver el portfolio
  alert('Función de portfolio - Próximamente');
};
</script>

<template>
  <div class="profile-header-container">
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

    <!-- Botones del perfil -->
    <div class="profile-buttons">
      <pv-button
          @click="viewCV"
          class="text-xl border-round-xl font-semibold border-2 py-3 mb-3 shadow-2 purple-button"
          outlined
          severity="secondary"
          :disabled="!profileData.cv">
        <template #icon>
          <i class="pi pi-file-pdf mr-2"></i>
        </template>
        {{ $t('profile.see-CV') }}
      </pv-button>

      <pv-button
          @click="viewPortfolio"
          class="text-xl border-round-xl font-semibold border-2 py-3 mb-3 shadow-2 purple-button"
          outlined
          severity="secondary">
        <template #icon>
          <i class="pi pi-briefcase mr-2"></i>
        </template>
        {{ $t('profile.portfolio') }}
      </pv-button>
    </div>
  </div>
</template>

<style scoped>
.profile-header-container {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.profile-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.purple-button {
  border-color: #6C63FF !important;
  color: #6C63FF !important;
  width: 100%;
  justify-content: center;
}

.purple-button:hover:not(:disabled) {
  background-color: #6C63FF !important;
  color: white !important;
}

.purple-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.avatar-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Estilo para el avatar por defecto */
.bg-gray-200 {
  background-color: var(--color-gray-300, #e5e7eb);
}

.cv-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-buttons {
    gap: 0.75rem;
  }

  .purple-button {
    padding: 0.75rem 1rem !important;
    font-size: 1rem !important;
  }
}
</style>