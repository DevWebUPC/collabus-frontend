<!-- components/ranking-list.component.vue -->
<template>
  <div class="ranking-list-container">
    <div class="ranking-header">
      <h1 style="color: white;">{{ $t('profile.ranking.title') }}</h1>
      <p class="ranking-subtitle" style="color: white;">{{ $t('profile.ranking.subtitle') }}</p>
    </div>

    <!-- Estados de carga y error -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      {{ $t('profile.ranking.loading') }}
    </div>

    <div v-else-if="error" class="error-state">
      {{ error }}
      <button @click="loadRanking" class="retry-btn">{{ $t('profile.ranking.retry') }}</button>
    </div>

    <!-- Contenido del ranking -->
    <div v-else class="ranking-content">
      <RankingItem
          v-for="(collaborator, index) in rankedCollaborators"
          :key="collaborator.id"
          :rank="index + 1"
          :collaborator="collaborator"
          @view-profile="handleViewProfile"
      />

      <!-- Mensaje cuando no hay colaboradores -->
      <div v-if="rankedCollaborators.length === 0" class="empty-state">
        {{ $t('profile.ranking.empty') }}
      </div>
    </div>
  </div>
</template>

<script>
import RankingItem from './ranking-item.component.vue'
import { useProfileStore } from '../../application/profile-store.js'

export default {
  name: "RankingList",
  components: {
    RankingItem
  },
  data() {
    return {
      loading: false,
      error: null,
      rankedCollaborators: []
    }
  },
  async mounted() {
    await this.loadRanking()
  },
  methods: {
    async loadRanking() {
      this.loading = true
      this.error = null

      try {
        const profileStore = useProfileStore()

        // Cargar todos los perfiles desde la API
        await profileStore.fetchAllProfiles()

        // Ordenar por puntos (descendente) y tomar los primeros 10
        const topProfiles = [...profileStore.allProfiles]
            .sort((a, b) => b.points - a.points)
            .slice(0, 10)
            .map(profile => ({
              id: profile.id,
              name: profile.username,
              role: profile.role,
              score: profile.points,
              skills: profile.abilities,
              userId: profile.userId
            }))

        this.rankedCollaborators = topProfiles
        console.log('✅ Ranking cargado:', this.rankedCollaborators.length, 'colaboradores')

      } catch (err) {
        console.error('Error loading ranking:', err)
        this.error = this.$t('profile.ranking.error')
      } finally {
        this.loading = false
      }
    },

    handleViewProfile(collaboratorId) {
      console.log('Ver perfil del colaborador:', collaboratorId)
      this.$router.push(`/profile/${collaboratorId}`)
    }
  }
}
</script>

<style scoped>
.ranking-list-container {
  width: 100%;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.ranking-header {
  padding: 2.5rem 2rem;
  text-align: center;
  background: linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%);
  color: white;
  position: relative;
  overflow: hidden;
}

.ranking-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.ranking-header h1 {
  margin: 0 0 1rem 0;
  font-size: 2.5rem;
  font-weight: 800;
  position: relative;
  z-index: 2;
  color: white;
}

.ranking-subtitle {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.95;
  font-weight: 500;
  position: relative;
  z-index: 2;
  color: white;
}

.ranking-content {
  padding: 0;
}

/* Estados de carga y error */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  color: #6b7280;
  font-size: 1.1rem;
}

.loading-state {
  flex-direction: row;
  gap: 1rem;
}

.error-state {
  color: #e53e3e;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #6C63FF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #6C63FF;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.retry-btn:hover {
  background: #5a52d5;
}

@media (max-width: 768px) {
  .ranking-list-container {
    border-radius: 12px;
  }

  .ranking-header {
    padding: 2rem 1.5rem;
  }

  .ranking-header h1 {
    font-size: 2rem;
    color: white;
  }

  .ranking-subtitle {
    font-size: 1rem;
    color: white;
  }

  .loading-state,
  .error-state,
  .empty-state {
    padding: 2rem 1rem;
    font-size: 1rem;
  }
}
</style>