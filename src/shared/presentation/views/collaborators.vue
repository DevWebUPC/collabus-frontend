<script>
import WelcomeHeader from '../components/welcome-header.component.vue'
import SearchFilters from '../../../profile-management/presentation/components/search-filters.component.vue'
import PersonalStats from '../../../profile-management/presentation/components/personal-stasts.component.vue'
import RankingCard from '../../../profile-management/presentation/components/ranking-card-button.component.vue'
import CollaboratorsList from '../../../profile-management/presentation/components/collaborators-list.component.vue'
import { useProfileStore } from '../../../profile-management/application/profile-store.js'

export default {
  name: 'Collaborators',
  components: {
    WelcomeHeader,
    SearchFilters,
    PersonalStats,
    RankingCard,
    CollaboratorsList
  },
  data() {
    return {
      personalStats: {
        score: 220,
        ranking: 500,
        activeProjects: 2
      },
      filteredCollaborators: [],
      isSearching: false
    }
  },
  methods: {
    async handleSearch(filters) {
      console.log('Filtros de búsqueda:', filters)
      this.isSearching = true

      try {
        const profileStore = useProfileStore()
        const filteredProfiles = await profileStore.searchProfiles(filters)

        // Mapear los perfiles filtrados al formato que espera el componente
        this.filteredCollaborators = filteredProfiles.map(profile => ({
          id: profile.id,
          name: profile.username,
          position: profile.role,
          score: profile.points,
          skills: profile.abilities
        }))

        console.log('Resultados filtrados:', this.filteredCollaborators.length)
      } catch (error) {
        console.error('Error en búsqueda:', error)
        this.filteredCollaborators = []
      } finally {
        this.isSearching = false
      }
    },

    async handleClear() {
      console.log('Filtros limpiados')
      this.filteredCollaborators = []
      this.isSearching = false
    }
  }
}
</script>

<template>
  <div class="collaborators-container">
    <div class="search-section">
      <SearchFilters
          @search="handleSearch"
          @clear="handleClear"
      />
    </div>

    <!-- Estado de búsqueda -->
    <div v-if="isSearching" class="search-state">
      Buscando colaboradores...
    </div>

    <div class="layout-grid">
      <div class="left-column hidden-on-responsive">
        <WelcomeHeader />
      </div>

      <!-- COLUMNA CENTRAL -->
      <div class="center-column">
        <CollaboratorsList
            :collaborators="filteredCollaborators"
            :is-filtered="filteredCollaborators.length > 0"
        />
      </div>

      <div class="right-column hidden-on-responsive">
        <div class="stats-ranking-container">
          <PersonalStats :stats="personalStats" />
          <RankingCard />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.collaborators-container {
  padding: 1rem;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.search-state {
  text-align: center;
  padding: 1rem;
  color: #6b7280;
  font-style: italic;
}

.layout-grid {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 2rem;
  align-items: start;
  margin-top: 1.5rem;
}

.left-column, .center-column, .right-column {
  min-height: 200px;
}

.center-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-height: 80vh;
  overflow-y: auto;
  padding-right: 0.5rem;
}

/* Personalizar la barra de scroll */
.center-column::-webkit-scrollbar {
  width: 6px;
}

.center-column::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.center-column::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.center-column::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.right-column {
  display: flex;
  flex-direction: column;
}

.stats-ranking-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
  width: 100%;
}

.stats-ranking-container > * {
  width: 100%;
  margin: 0;
}

.hidden-on-responsive {
  display: block;
}

/* Media query para tablets grandes (1200px) - OCULTAR */
@media (max-width: 1200px) {
  .layout-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .center-column {
    grid-column: auto;
    order: 1;
    max-height: none;
    overflow-y: visible;
    padding-right: 0;
  }

  .hidden-on-responsive {
    display: none !important;
  }
}

@media (max-width: 1024px) {
  .layout-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .center-column {
    grid-column: auto;
    order: 1;
  }
}

@media (max-width: 768px) {
  .collaborators-container {
    padding: 0.5rem;
  }

  .layout-grid {
    gap: 1rem;
  }
}
</style>