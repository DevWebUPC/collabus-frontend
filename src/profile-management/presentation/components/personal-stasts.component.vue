<template>
  <div class="personal-stats-card">
    <h3>{{ $t('profile.personalStats.title') }}</h3>
    <div class="stats-content">
      <div class="stat-item">
        <span class="stat-label">{{ $t('profile.personalStats.currentScoreLabel') }}</span>
        <span class="stat-value">{{ stats.score }} {{ $t('profile.collaborator.pointsSuffix') }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">{{ $t('profile.personalStats.rankingLabel') }}</span>
        <span class="stat-value">#{{ stats.ranking }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">{{ $t('profile.personalStats.activeProjectsLabel') }}</span>
        <span class="stat-value">{{ stats.activeProjects }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PersonalStats',
  props: {
    stats: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
.personal-stats-card {
  background: var(--color-white, #FFFFFF);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex: 1;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  width: 100%; /* Asegurar que ocupe todo el ancho */
  box-sizing: border-box; /* Incluir padding en el width */
}

.personal-stats-card h3 {
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.5rem;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  flex: 1;
  justify-content: center;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.stat-value {
  color: #6C63FF;
  font-weight: 700;
  font-size: 1rem;
}

/* Media query para tablets */
@media (max-width: 1024px) {
  .personal-stats-card {
    min-height: 160px;
    padding: 1.25rem;
  }

  .stat-item {
    padding: 0.4rem 0;
  }
}

/* Media query para móviles */
@media (max-width: 768px) {
  .personal-stats-card {
    min-height: auto;
    padding: 1rem;
  }
}
</style>