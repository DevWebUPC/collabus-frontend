<!-- components/ranking-item.component.vue -->
<template>
  <div class="ranking-item">
    <div class="ranking-number" :class="getRankClass(rank)">
      {{ rank }}
    </div>

    <div class="avatar-container">
      <img
          :src="getAvatarUrl(collaborator.id, collaborator.name)"
          :alt="collaborator.name"
          class="avatar-image"
      />
    </div>

    <div class="collaborator-content">
      <div class="collaborator-info">
        <h3 class="collaborator-name">{{ collaborator.name }}</h3>
        <p class="collaborator-role">{{ collaborator.role }}</p>
        <div class="skills-tags">
          <span
              v-for="skill in limitedSkills"
              :key="skill"
              class="skill-tag"
          >
            {{ skill }}
          </span>
          <span v-if="collaborator.skills.length > 3" class="skill-tag-more">
            +{{ collaborator.skills.length - 3 }} {{ $t('common.more') }}
          </span>
        </div>
      </div>

        <div class="score-section">
        <div class="score-value">{{ collaborator.score }} {{ $t('profile.collaborator.pointsSuffix') }}</div>
        <button class="profile-btn" @click="viewProfile">{{ $t('profile.collaborator.viewProfile') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "RankingItem",
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
  computed: {
    limitedSkills() {
      return this.collaborator.skills.slice(0, 3);
    }
  },
  methods: {
    getAvatarUrl(id, name) {
      const seed = name.replace(/\s+/g, '-').toLowerCase();
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&radius=50&size=50`;
    },

    getRankClass(rank) {
      if (rank === 1) return 'rank-first';
      if (rank === 2) return 'rank-second';
      if (rank === 3) return 'rank-third';
      return '';
    },

    viewProfile() {
      this.$emit('view-profile', this.collaborator.id);
    }
  }
}
</script>

<style scoped>
.ranking-item {
  display: flex;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 2px solid #e9ecef;
  gap: 1.5rem;
  background: var(--color-white, #FFFFFF);
  transition: all 0.3s ease;
}

.ranking-item:hover {
  background: var(--color-gray-50, #f8f9fa);
  transform: translateX(5px);
}

.ranking-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #6C63FF;
  min-width: 40px;
  text-align: center;
  background: #f0f0ff;
  border-radius: 8px;
  padding: 0.5rem;
  transition: all 0.3s ease;
}

.rank-first {
  background: linear-gradient(135deg, #FFD700, #FFEC8B);
  color: #B8860B;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.rank-second {
  background: linear-gradient(135deg, #C0C0C0, #E8E8E8);
  color: #696969;
  box-shadow: 0 4px 12px rgba(192, 192, 192, 0.3);
}

.rank-third {
  background: linear-gradient(135deg, #CD7F32, #E8B886);
  color: #8B4513;
  box-shadow: 0 4px 12px rgba(205, 127, 50, 0.3);
}

.avatar-container {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #6C63FF;
  flex-shrink: 0;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.collaborator-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex: 1;
  gap: 1rem;
}

.collaborator-info {
  flex: 1;
  min-width: 0;
}

.collaborator-name {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #2d3748;
}

.collaborator-role {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #718096;
  font-weight: 500;
}

.skills-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.skill-tag {
  background: #e9ecef;
  color: #495057;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;
}

.skill-tag:hover {
  background: #6C63FF;
  color: var(--color-white, #FFFFFF);
  transform: translateY(-1px);
}

.skill-tag-more {
  background: #6C63FF;
  color: var(--color-white, #FFFFFF);
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
}

.score-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
  flex-shrink: 0;
  min-width: 150px;
}

.score-value {
  font-weight: 600;
  color: #2d3748;
  background: #f7fafc;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  font-size: 0.9rem;
  text-align: center;
}

.profile-btn {
  background: #6C63FF;
  color: var(--color-white, #FFFFFF);
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.profile-btn:hover {
  background: #5a52d5;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 99, 255, 0.3);
}

/* Responsive para móviles */
@media (max-width: 768px) {
  .ranking-item {
    padding: 1rem;
    gap: 1rem;
  }

  .ranking-number {
    font-size: 1.2rem;
    min-width: 35px;
  }

  .avatar-container {
    width: 45px;
    height: 45px;
  }

  .collaborator-content {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .collaborator-name {
    font-size: 1.1rem;
  }

  .collaborator-role {
    font-size: 0.9rem;
  }

  .score-section {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    min-width: auto;
  }

  .score-value {
    font-size: 0.85rem;
    padding: 0.4rem 0.8rem;
  }

  .profile-btn {
    width: auto;
    min-width: 120px;
  }
}

@media (max-width: 480px) {
  .ranking-item {
    padding: 0.8rem;
    flex-direction: column;
    align-items: flex-start;
  }

  .ranking-number {
    align-self: flex-start;
  }

  .avatar-container {
    width: 40px;
    height: 40px;
  }

  .skills-tags {
    gap: 0.3rem;
  }

  .skill-tag {
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
  }

  .score-section {
    flex-direction: column;
    gap: 0.8rem;
    width: 100%;
  }

  .profile-btn {
    width: 100%;
  }
}
</style>