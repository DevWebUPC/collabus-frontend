<script setup lang="js">
import { Rating as PvRating } from 'primevue';
import { ref, onMounted } from 'vue';
import { useProfileStore } from '../../../profile-management/application/profile-store.js';

const props = defineProps({
  comment: {
    type: Object,
    required: true
  }
});

const profileStore = useProfileStore();
const commenterProfile = ref(null);

// 🔥 NUEVO: Obtener el perfil del usuario que comentó
const loadCommenterProfile = async () => {
  try {
    // Buscar el perfil del usuario que hizo el comentario
    const profile = await profileStore.getProfileByUserId(props.comment.userId);
    commenterProfile.value = profile;
  } catch (error) {
    console.error('Error loading commenter profile:', error);
  }
};

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });
}

onMounted(() => {
  loadCommenterProfile();
});
</script>

<template>
  <div class="comment-card">
    <div class="comment-user-info">
      <!-- Placeholder for user image -->
      <img
          :src="commenterProfile?.avatar || 'https://ui-avatars.com/api/?name=' + (commenterProfile?.username || 'U')"
          alt='Profile Image'
          class="comment-img"
      />
      <div class="user-details">
        <!-- 🔥 CORREGIDO: Mostrar el nombre real del usuario -->
        <div class="user-name">{{ commenterProfile?.username || 'Usuario' }}</div>
        <div class="text-xs text-gray-500">{{ formatDate(comment.createdAt) }}</div>
      </div>
    </div>
    <div class="comment-content">
      <div class="flex items-center gap-2">
        <pv-rating :modelValue="comment.rating" readonly/>
        <span>{{ comment.rating }}/5</span>
      </div>
      <div>
        <p class="comment-text">
          {{ comment.comment }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comment-card {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  align-items: flex-start;
  max-width: 500px;
  width: 100%;
}

.comment-user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.user-details {
  text-align: center;
  margin-top: 0.5rem;
}

.user-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: #374151;
}

.comment-img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-content {
  flex: 1;
}

.comment-text {
  margin-top: 0.5rem;
  line-height: 1.5;
  color: #4b5563;
}
</style>