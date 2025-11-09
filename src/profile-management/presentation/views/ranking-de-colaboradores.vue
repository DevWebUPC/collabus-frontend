<script>
import SearchBarComponent from "../components/search-filters.component.vue";
import RankingList from "../components/ranking-list.component.vue";
import HeaderPresentation from "../../../shared/presentation/components/header-presentation.vue";
import { useProfileStore } from "../../application/profile-store.js";

export default {
  name: "ranking-de-colaboradores",
  components: {
    SearchBarComponent,
    RankingList,
    HeaderPresentation
  },
  data() {
    return {
      searchResults: null
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },

    async handleSearch(filters) {
      console.log('Buscando con filtros:', filters);

      try {
        const profileStore = useProfileStore();
        const filteredProfiles = await profileStore.searchProfiles(filters);

        // Ordenar resultados de búsqueda por puntos
        this.searchResults = filteredProfiles
            .sort((a, b) => b.points - a.points)
            .slice(0, 10)
            .map(profile => ({
              id: profile.id,
              name: profile.username,
              role: profile.role,
              score: profile.points,
              skills: profile.abilities,
              userId: profile.userId
            }));

        console.log('Resultados de búsqueda en ranking:', this.searchResults);

      } catch (error) {
        console.error('Error en búsqueda:', error);
        this.searchResults = [];
      }
    },

    handleClear() {
      console.log('Limpiando filtros');
      this.searchResults = null;
    }
  }
}
</script>

<template>
  <div class="ranking-container">
    <!-- Botón de retroceso -->
    <div class="back-button-container">
  <button class="back-button" @click="goBack">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        {{ $t('common.goBack') }}
      </button>
    </div>

    <!-- Contenido del ranking -->
    <div class="ranking-content">
      <!-- Layout de dos columnas: Ranking izquierda, Collabus derecha -->
      <div class="main-layout">
        <!-- Columna izquierda - Ranking -->
        <div class="left-column">
          <RankingList
              v-if="!searchResults"
              key="default-ranking"
          />
        </div>

        <!-- Columna derecha - Collabus -->
        <div class="right-column">
          <HeaderPresentation />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ranking-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 1rem;
}

.back-button-container {
  margin-bottom: 2rem;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #6C63FF;
  font-weight: 600;
  font-size: 1rem;
  box-shadow: 0 2px 8px rgba(108, 99, 255, 0.1);
}

.back-button:hover {
  background: #6C63FF;
  color: white;
  border-color: #6C63FF;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(108, 99, 255, 0.2);
}

.back-button:active {
  transform: translateY(0);
}

.ranking-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Layout principal de dos columnas - INVERTIDO */
.main-layout {
  display: grid;
  grid-template-columns: 2fr 1fr; /* Ranking más ancho, Collabus más estrecho */
  gap: 2.5rem;
  align-items: start;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Asegurar que HeaderPresentation ocupe el espacio disponible */
.right-column :deep(.header-presentation) {
  height: 100%;
}

.right-column :deep(.presentation-card) {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Animaciones */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.left-column {
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

.right-column {
  animation: fadeInUp 0.6s ease-out 0.4s both;
}

/* Mejoras de sombras y bordes */
.ranking-content > * {
  border-radius: 16px;
}

.main-layout > * > * {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* Responsive mejorado */
@media (max-width: 1024px) {
  .main-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .ranking-content {
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .ranking-container {
    padding: 0.75rem;
  }

  .back-button-container {
    margin-bottom: 1.5rem;
  }

  .back-button {
    padding: 0.65rem 1.25rem;
    font-size: 0.9rem;
  }

  .ranking-content {
    gap: 1.25rem;
  }

  .main-layout {
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .ranking-container {
    padding: 0.5rem;
  }

  .back-button {
    width: 100%;
    justify-content: center;
    padding: 0.75rem 1rem;
  }

  .main-layout > * > * {
    border-radius: 12px;
  }
}

/* Efectos de hover */
.main-layout > * > * {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.main-layout > * > *:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

/* Mejora de legibilidad */
.ranking-content {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Mejoras de accesibilidad */
.back-button:focus {
  outline: 2px solid #6C63FF;
  outline-offset: 2px;
}
</style>