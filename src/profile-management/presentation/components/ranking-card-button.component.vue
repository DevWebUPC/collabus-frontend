<template>
  <div class="ranking-card">
    <button class="circular-ranking-button" @click="goToRanking">
      <div class="button-text">
        <span class="line-1">{{ $t('profile.ranking.card.line1') }}</span>
        <span class="line-2">{{ $t('profile.ranking.card.line2') }}</span>
      </div>
    </button>
    <p class="ranking-description">{{ $t('profile.ranking.card.description') }}</p>
  </div>
</template>

<script>
export default {
  name: 'RankingCard',
  methods: {
    goToRanking() {
      // Navegar a la vista de ranking completo
      this.$router.push('/ranking-colaboradores');
      // O emitir un evento si prefieres
      // this.$emit('view-ranking');
    }
  }
}
</script>

<style scoped>
.ranking-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex: 1;
  min-height: 180px;
  width: 100%; /* Asegurar que ocupe todo el ancho */
  box-sizing: border-box; /* Incluir padding en el width */
}

.circular-ranking-button {
  background: linear-gradient(135deg, #6C63FF, #6C63FF);
  border: none;
  border-radius: 50%;
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  color: white;
  padding: 1rem;
}

.circular-ranking-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);
}

.circular-ranking-button:active {
  transform: translateY(0);
}

.button-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  line-height: 1.1;
}

.line-1, .line-2 {
  display: block;
  font-weight: 700;
  text-align: center;
}

.line-1 {
  font-size: 1.1rem;
}

.line-2 {
  font-size: 1rem;
}

.ranking-description {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

/* Media query para tablets */
@media (max-width: 1024px) {
  .ranking-card {
    min-height: 160px;
    padding: 1.25rem;
  }

  .circular-ranking-button {
    width: 120px;
    height: 120px;
  }

  .line-1 {
    font-size: 1rem;
  }

  .line-2 {
    font-size: 0.9rem;
  }
}

/* Media query para móviles */
@media (max-width: 768px) {
  .ranking-card {
    min-height: auto;
    padding: 1rem;
  }

  .circular-ranking-button {
    width: 100px;
    height: 100px;
  }

  .line-1 {
    font-size: 0.9rem;
  }

  .line-2 {
    font-size: 0.8rem;
  }
}
</style>