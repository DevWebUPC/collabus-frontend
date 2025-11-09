<script>
export default {
  name: "CollaboratorItem",
  props: {
    collaborator: {
      type: Object,
      required: true
    }
  },
  methods: {
    viewProfile() {
      console.log('Ver perfil de:', this.collaborator.id);
      // Aquí puedes implementar la navegación al perfil
      this.$emit('view-profile', this.collaborator.id);
    }
  }
}
</script>

<template>
  <div class="collaborator-item">
    <div class="collaborator-header">
      <div class="avatar">
      </div>
      <div class="collaborator-info">
        <h3 class="name">{{ collaborator.name }}</h3>
        <p class="position">{{ collaborator.position }}</p>
      </div>
    </div>

    <div class="collaborator-details">
      <div class="score">
        <span class="score-label">{{ $t('profile.collaborator.scoreLabel') }}</span>
        <span class="score-value">{{ collaborator.score }}{{ $t('profile.collaborator.pointsSuffix') }}</span>
      </div>

      <div class="skills">
        <span
            v-for="skill in collaborator.skills"
            :key="skill"
            class="skill-tag"
        >
          {{ skill }}
        </span>
      </div>

      <button
          class="profile-button"
          @click="viewProfile"
      >
        {{ $t('profile.collaborator.viewProfile') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.collaborator-item {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin-bottom: 1rem;
}

.collaborator-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.collaborator-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white, #FFFFFF);
  font-weight: bold;
  font-size: 1rem;
}

.collaborator-info {
  flex: 1;
}

.name {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
}

.position {
  margin: 0;
  font-size: 0.9rem;
  color: #718096;
}

.collaborator-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.score {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.score-label {
  font-size: 0.9rem;
  color: #718096;
}

.score-value {
  font-weight: 600;
  color: #2d3748;
  background: #f7fafc;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.skill-tag {
  background: #edf2f7;
  color: #4a5568;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.8rem;
  border: 1px solid #e2e8f0;
}

.profile-button {
  background: #4299e1;
  color: var(--color-white, #FFFFFF);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  align-self: flex-start;
  margin-top: 0.5rem;
}

.profile-button:hover {
  background: #3182ce;
}

/* Responsive */
@media (max-width: 768px) {
  .collaborator-item {
    padding: 1rem;
  }

  .collaborator-header {
    gap: 0.75rem;
  }

  .avatar {
    width: 40px;
    height: 40px;
    font-size: 0.9rem;
  }

  .name {
    font-size: 1rem;
  }

  .position {
    font-size: 0.85rem;
  }
}
</style>