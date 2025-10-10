<script>
import WelcomeHeader from '../components/welcome-header.component.vue'
import SearchFilters from '../../../profile-management/presentation/components/search-filters.component.vue'
import PersonalStats from '../../../profile-management/presentation/components/personal-stasts.component.vue'
import RankingCard from '../../../profile-management/presentation/components/ranking-card-button.component.vue'
import CollaboratorsList from '../../../profile-management/presentation/components/collaborators-list.component.vue' // Añade esta importación

export default {
  name: 'Collaborators',
  components: {
    WelcomeHeader,
    SearchFilters,
    PersonalStats,
    RankingCard,
    CollaboratorsList // Registra el componente
  },
  data() {
    return {
      personalStats: {
        score: 220,
        ranking: 500,
        activeProjects: 2
      }
    }
  },
  methods: {
    handleSearch(filters) {
      console.log('Filtros de búsqueda:', filters)
      // Lógica de búsqueda aquí - puedes filtrar la lista de colaboradores
    },
    handleClear() {
      console.log('Filtros limpiados')
      // Lógica para limpiar aquí
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
    <div class="layout-grid">
      <div class="left-column hidden-on-responsive">
        <WelcomeHeader />
      </div>

      <!-- COLUMNA CENTRAL -->
      <div class="center-column">
        <CollaboratorsList />
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
  /* Añadir scroll */
  max-height: 80vh; /* Altura máxima del 80% del viewport */
  overflow-y: auto; /* Scroll vertical */
  padding-right: 0.5rem; /* Espacio para el scroll */
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

/* MEJORAS PARA LA COLUMNA DERECHA */
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

/* Asegurar que los componentes hijos ocupen todo el ancho disponible */
.stats-ranking-container > * {
  width: 100%;
  margin: 0;
}

/* Clase para ocultar elementos en responsive */
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
    max-height: none; /* Quitar altura máxima en responsive */
    overflow-y: visible; /* Quitar scroll en responsive */
    padding-right: 0;
  }

  /* OCULTAR COMPONENTES EN TABLETS GRANDES */
  .hidden-on-responsive {
    display: none !important;
  }
}

/* Media query para tablets (1024px) - YA OCULTOS */
@media (max-width: 1024px) {
  .layout-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .center-column {
    grid-column: auto;
    order: 1;
  }

  /* Los componentes ya están ocultos desde 1200px */
}

/* Media query para dispositivos móviles (768px) - YA OCULTOS */
@media (max-width: 768px) {
  .collaborators-container {
    padding: 0.5rem;
  }

  .layout-grid {
    gap: 1rem;
  }

  /* Los componentes ya están ocultos desde 1200px */
}
</style>