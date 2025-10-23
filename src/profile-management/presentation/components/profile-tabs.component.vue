<script setup lang="js">

import { ref, onMounted, computed } from 'vue';
import { useProfileStore } from '../../application/profile-store.js';
import { useUserStore } from '../../../iam/application/user-store.js';
import { useRoute } from 'vue-router';
import CommentCardList from './comment-card-list.component.vue';
import CommentModal from '../../../shared/presentation/components/modal-comment.component.vue';

const selectedOption = ref(2);
const selectedProjectView = ref('my-projects'); // 'my-projects' o 'favorites'

const profileStore = useProfileStore();
const userStore = useUserStore();
const route = useRoute();
const showCommentModal = ref(false);

const profileId = computed(() => route.params.id);
const comments = computed(() => profileStore.comments);

const handleOpenCommentModal = () => {
  showCommentModal.value = true;
};

const handleCloseCommentModal = () => {
  showCommentModal.value = false;
};

const handleSubmitComment = async ({ rating, comment }) => {
  if (!profileId.value || !userStore.currentUser?.id) return;
  await profileStore.addComment({
    profileId: profileId.value,
    userId: userStore.currentUser.id,
    rating,
    comment
  });
  showCommentModal.value = false;
};

onMounted(async () => {
  if (profileId.value) {
    await profileStore.fetchComments(profileId.value);
  }
});
</script>

<template>
  <div class="flex justify-content-center flex-column align-items-center">
    <!-- Tabs principales -->
    <div class="tabs-container mb-4">
      <div
          class="tab-option"
          :class="{ 'tab-active': selectedOption === 1 }"
          @click="selectedOption = 1"
      >
        {{ $t('profile.options.projects') }}
      </div>
      <div
          class="tab-option"
          :class="{ 'tab-active': selectedOption === 2 }"
          @click="selectedOption = 2"
      >
        {{ $t('profile.options.comments') }}
      </div>
    </div>

    <!-- Sub-tabs para proyectos (solo visible cuando selectedOption === 1) -->
    <div v-if="selectedOption === 1" class="sub-tabs-container">
      <div
          class="sub-tab-option"
          :class="{ 'sub-tab-active': selectedProjectView === 'my-projects' }"
          @click="selectedProjectView = 'my-projects'"
      >
        Mis Proyectos
      </div>
      <div
          class="sub-tab-option"
          :class="{ 'sub-tab-active': selectedProjectView === 'favorites' }"
          @click="selectedProjectView = 'favorites'"
      >
        Favoritos
      </div>
    </div>

    <!-- Contenido dinámico -->
    <div class="tab-content">
      <div v-if="selectedOption === 1">
        <div v-if="selectedProjectView === 'my-projects'">
          <!-- Contenido de Mis Proyectos -->
          <p>Mostrando mis proyectos...</p>
        </div>
        <div v-else-if="selectedProjectView === 'favorites'">
          <!-- Contenido de Favoritos -->
          <p>Mostrando proyectos favoritos...</p>
        </div>
      </div>

      <div v-else-if="selectedOption === 2" class="comments-container">
        <!-- Contenido de Comentarios -->
        <div class="comments-section">
          <template v-if="comments.length > 0">
            <CommentCardList :comments="comments" />
          </template>
          <template v-else>
            <div class="no-comments">{{ $t('profile.comments.empty') }}</div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-comments {
  color: #888;
  font-size: 1.1rem;
  text-align: center;
  margin: 2rem 0;
}

.comments-container{
  width: 100%;
}

.comments-section {
  margin-top: 2rem;
  width: 100%;
}
.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.add-comment-btn {
  background: #6C63FF;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.add-comment-btn:hover {
  background: #5a52d5;
}
</style>

<style scoped>
.tabs-container {
  display: flex;
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 4px;
  width: fit-content;
}

.tab-option {
  font-size: 20px;
  flex: 1;
  text-align: center;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 10px;
  width: 150px;
}

.tab-active {
  color: #6C63FF;
}

.sub-tabs-container {
  display: flex;
  background-color: #ffffff;
  color: #4A41CC;
  border-radius: 8px;
  padding: 2px;
  margin-bottom: 1rem;
  width: fit-content;
  gap: 40px;
}

.sub-tab-option {
  border: 2px solid #4A41CC;
  flex: 2;
  text-align: center;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  min-width: 150px;
}

.sub-tab-active {
  background-color: #6C63FF;
  color: #E0E0E0;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.tab-content {
  min-height: 200px;
  padding: 1rem;
  width: 100%;
  text-align: center;
}
</style>