
<script setup lang="js">
import { Rating as PvRating } from 'primevue';
const props = defineProps({
  comment: {
    type: Object,
    required: true
  }
});
function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });
}
</script>

<template>
  <div class="comment-card">
    <div>
      <!-- Placeholder for user image -->
  <div><img :src="comment.img || 'https://ui-avatars.com/api/?name=' + (comment.userId || 'U')" alt='Profile Image' class="comment-img"/></div>
      <div>{{ comment.name || 'Usuario' }}</div>
      <div class="text-xs text-gray-500">{{ formatDate(comment.createdAt) }}</div>
    </div>
    <div>
      <div class="flex items-center gap-2">
        <pv-rating :modelValue="comment.rating" readonly/>
        <span>{{ comment.rating }}</span>
      </div>
      <div>
        <p>
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
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  align-items: flex-start;
  max-width: 500px;
  width: 100%;
}
.comment-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 0.5rem;
}
</style>
