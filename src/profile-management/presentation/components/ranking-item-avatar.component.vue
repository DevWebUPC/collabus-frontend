<!-- components/ranking-item-avatar.component.vue -->
<template>
  <div class="ranking-item">
    <div class="ranking-number">
      {{ rank }}
    </div>

    <div class="avatar-container" :style="{ backgroundColor: getAvatarColor(collaborator.id) }">
      <span class="avatar-initials">{{ getInitials(collaborator.name) }}</span>
    </div>

    <div class="collaborator-info">
      <h3 class="collaborator-name">{{ collaborator.name }}</h3>
      <p class="collaborator-role">{{ collaborator.role }}</p>
    </div>

    <div class="score-section">
      <div class="score-value">{{ collaborator.score }}pts</div>
      <div class="score-actions">
        <button class="action-btn">CUANDO</button>
        <button class="action-btn">TEMPO</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "RankingItemAvatar",
  props: {
    rank: {
      type: Number,
      required: true
    },
    collaborator: {
      type: Object,
      required: true
    }
  },
  methods: {
    getInitials(name) {
      return name
          .split(' ')
          .map(word => word.charAt(0))
          .join('')
          .toUpperCase()
          .substring(0, 2);
    },
    getAvatarColor(id) {
      const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
      ];
      return colors[id % colors.length];
    }
  }
}
</script>

<style scoped>
.ranking-item {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid #e9ecef;
  gap: 1rem;
  background: white;
}

.ranking-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #6C63FF;
  min-width: 40px;
  text-align: center;
}

.avatar-container {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #6C63FF;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
}

.avatar-initials {
  color: white;
}

.collaborator-info {
  flex: 1;
}

.collaborator-name {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
}

.collaborator-role {
  margin: 0;
  font-size: 0.9rem;
  color: #718096;
}

.score-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.score-value {
  font-weight: 600;
  color: #2d3748;
  background: #f7fafc;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.score-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: #6C63FF;
  color: white;
  border: none;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.action-btn:hover {
  background: #5a52d5;
}

@media (max-width: 768px) {
  .ranking-item {
    padding: 1rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .avatar-container {
    width: 50px;
    height: 50px;
    font-size: 1rem;
  }

  .score-section {
    align-items: flex-start;
    width: 100%;
  }

  .score-actions {
    width: 100%;
    justify-content: space-between;
  }

  .action-btn {
    flex: 1;
    text-align: center;
  }
}
</style>