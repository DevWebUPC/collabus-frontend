<!-- CommentModal.vue -->
<script setup>
import { useI18n } from 'vue-i18n';
import { ref, computed, onMounted } from 'vue';
import { useProfileStore } from '../../../profile-management/application/profile-store.js';
import { useUserStore } from '../../../iam/application/user-store.js';
import { useRoute } from 'vue-router';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'submit']);

const currentRating = ref(0);
const commentText = ref('');

const profileStore = useProfileStore();
const userStore = useUserStore();
const route = useRoute();
const profileId = computed(() => route.params.id);

onMounted(() => {
  if (!userStore.currentUser) {
    userStore.initializeUser?.();
  }
});

const { t } = useI18n();

const ratingText = computed(() => {
  const ratings = {
    0: t('profile.ratingSelect'),
    1: t('profile.rating1'),
    2: t('profile.rating2'),
    3: t('profile.rating3'),
    4: t('profile.rating4'),
    5: t('profile.rating5')
  };
  return ratings[currentRating.value];
});

const setRating = (rating) => {
  currentRating.value = rating;
};

const closeModal = () => {
  resetForm();
  emit('close');
};

const submitComment = async () => {
  if (!profileId.value || !userStore.currentUser?.id) {
    closeModal();
    return;
  }

  await profileStore.addComment({
    profileId: profileId.value,
    userId: userStore.currentUser.id,
    rating: currentRating.value,
    comment: commentText.value
  });
  closeModal();
};

const resetForm = () => {
  currentRating.value = 0;
  commentText.value = '';
};
</script>

<template>
  <div v-if="visible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <!-- Modal Header -->
      <div class="modal-header">
        <h2>{{ $t('profile.leaveCommentTitle') }}</h2>
        <button class="close-button" @click="closeModal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- Modal Content -->
      <div class="modal-content">
        <!-- Star Rating -->
        <div class="rating-section">
          <h3>{{ $t('profile.ratingTitle') }}</h3>
          <div class="stars-container">
            <button
                v-for="star in 5"
                :key="star"
                class="star-button"
                @click="setRating(star)"
                :class="{ 'active': star <= currentRating }"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
            </button>
          </div>
          <p class="rating-text">{{ ratingText }}</p>
        </div>

        <!-- Comment Textarea -->
        <div class="comment-section">
          <h3>{{ $t('profile.yourComment') }}</h3>
          <textarea
              v-model="commentText"
              :placeholder="$t('profile.commentPlaceholder')"
              class="comment-textarea"
              rows="6"
              maxlength="500"
          ></textarea>
          <div class="character-count">
            {{ commentText.length }}/500 {{ $t('profile.characters') }}
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <button class="cancel-button" @click="closeModal">
          {{ $t('profile.cancel') }}
        </button>
        <button
            class="submit-button"
            @click="submitComment"
            :disabled="!currentRating || !commentText.trim()"
        >
          {{ $t('profile.submitComment') }}
        </button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: var(--color-white, #FFFFFF);
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: modalAppear 0.3s ease-out;
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0;
  border-bottom: 1px solid var(--color-gray-300, #e5e7eb);
  padding-bottom: 1rem;
}

.modal-header h2 {
  margin: 0;
  color: var(--color-gray-900, #374151);
  font-size: 1.5rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #6b7280;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #f3f4f6;
  color: var(--color-gray-900, #374151);
}

.modal-content {
  padding: 1.5rem;
}

.rating-section {
  margin-bottom: 2rem;
}

.rating-section h3 {
  margin: 0 0 1rem 0;
  color: var(--color-gray-900, #374151);
  font-size: 1.1rem;
  font-weight: 600;
}

.stars-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.star-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  color: #d1d5db;
}

.star-button:hover {
  transform: scale(1.1);
  color: #fbbf24;
}

.star-button.active {
  color: #f59e0b;
}

.rating-text {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
  font-style: italic;
}

.comment-section h3 {
  margin: 0 0 1rem 0;
  color: var(--color-gray-900, #374151);
  font-size: 1.1rem;
  font-weight: 600;
}

.comment-textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--color-gray-300, #e5e7eb);
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.comment-textarea:focus {
  outline: none;
  border-color: #6C63FF;
}

.comment-textarea::placeholder {
  color: #9ca3af;
}

.character-count {
  text-align: right;
  color: #6b7280;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid var(--color-gray-300, #e5e7eb);
}

.cancel-button, .submit-button {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.cancel-button {
  background: #f3f4f6;
  color: var(--color-gray-900, #374151);
}

.cancel-button:hover {
  background: var(--color-gray-300, #e5e7eb);
}

.submit-button {
  background: #6C63FF;
  color: var(--color-white, #FFFFFF);
}

.submit-button:hover:not(:disabled) {
  background: #5a52d5;
  transform: translateY(-1px);
}

.submit-button:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  transform: none;
}

/* Responsive */
@media (max-width: 640px) {
  .modal-container {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }

  .modal-header {
    padding: 1rem 1rem 0;
  }

  .modal-content {
    padding: 1rem;
  }

  .modal-footer {
    padding: 1rem 1rem 1rem;
    flex-direction: column;
  }

  .stars-container {
    justify-content: center;
  }

  .star-button {
    transform: scale(0.9);
  }
}
</style>