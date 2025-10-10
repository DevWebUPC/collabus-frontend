<script>
import WelcomeHeader from '../components/welcome-header.component.vue'
import SearchFilters from '../../../profile-management/presentation/components/search-filters.component.vue'

export default {
  name: 'Collaborators',
  components: {
    WelcomeHeader,
    SearchFilters
  },
  data() {
    return {
      // Por ahora solo tenemos datos vacíos
      // Los iremos agregando paso a paso
    }
  },
  methods: {
    handleSearch(filters) {
      console.log('Filtros de búsqueda:', filters)
      // Aquí implementarás la lógica de búsqueda más adelante
    },
    handleClear() {
      console.log('Filtros limpiados')
      // Aquí implementarás la lógica para limpiar más adelante
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
      <div class="left-column">
        <WelcomeHeader />
      </div>
    </div>
  </div>
</template>

<style scoped>
.collaborators-container {
  padding: 1rem;
  width: 100%;
}

.layout-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; /* Dos columnas de igual tamaño */
  gap: 2rem;
  align-items: start;
}

.left-column, .right-column {
  min-height: 200px;
}

/* Media query para dispositivos móviles */
@media (max-width: 1024px) {
  .layout-grid {
    grid-template-columns: 1fr; /* Una sola columna */
  }

  .left-column {
    display: none; /* Oculta el welcome header en móviles */
  }
}
</style>