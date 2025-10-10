<script setup lang="js">
import { ref } from 'vue'

const emit = defineEmits(['search', 'clear'])

const searchQuery = ref('')
const selectedRole = ref('')
const score = ref('')
const minScore = ref('')
const maxScore = ref('')

const search = () => {
  const filters = {
    query: searchQuery.value,
    role: selectedRole.value,
    score: score.value,
    minScore: minScore.value,
    maxScore: maxScore.value
  }
  emit('search', filters)
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedRole.value = ''
  score.value = ''
  minScore.value = ''
  maxScore.value = ''
  emit('clear')
}
</script>

<template>
  <div class="search-filters">
    <div class="filters-container">
      <!-- Campo de búsqueda por nombre o habilidad -->
      <div class="filter-group">
        <label for="search-query">Buscar por nombre o habilidad</label>
        <input
            id="search-query"
            type="text"
            v-model="searchQuery"
            placeholder="Ej: Juan Pérez o JavaScript"
            class="filter-input"
        >
      </div>

      <!-- Tipo de Rol -->
      <div class="filter-group">
        <label for="role-type">Filtrar por rol</label>
        <input
            id="role-type"
            type="text"
            v-model="selectedRole"
            placeholder="Ej: Ingeniero, Marketing, Gerente"
            class="filter-input"
            list="role-options"
        >
        <datalist id="role-options">
          <option>General de Proyectos</option>
          <option>Secretaría</option>
          <option>Ingeniero</option>
          <option>Marketing Digital</option>
          <option>Gerente</option>
          <option>Profesional</option>
        </datalist>
      </div>


      <!-- Mínimo -->
      <div class="filter-group">
        <label for="min-score">Puntuación mínima</label>
        <input
            id="min-score"
            type="number"
            v-model="minScore"
            placeholder="Mínimo"
            class="filter-input"
        >
      </div>

      <!-- Máximo -->
      <div class="filter-group">
        <label for="max-score">Puntuación máxima</label>
        <input
            id="max-score"
            type="number"
            v-model="maxScore"
            placeholder="Máximo"
            class="filter-input"
        >
      </div>

      <!-- Botones -->
      <div class="filter-actions">
        <button class="search-btn" @click="search">
          Buscar
        </button>
        <button class="clear-btn" @click="clearFilters">
          Limpiar
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-filters {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.filters-container {
  display: flex;
  gap: 1rem;
  align-items: end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 120px;
  flex: 1;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #374151;
}

.filter-select,
.filter-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  min-height: 40px;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: #6C63FF;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

.search-btn,
.clear-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 40px;
}

.search-btn {
  background: #6C63FF;
  color: white;
}

.search-btn:hover {
  background: #ffffff;
  color: #4A41CC;
}

.clear-btn {
  background: #6b7280;
  color: white;
}

.clear-btn:hover {
  background: #4b5563;
}

/* Responsive mejorado */
@media (max-width: 1024px) {
  .filters-container {
    gap: 0.75rem;
  }

  .filter-group {
    min-width: 100px;
  }
}

@media (max-width: 768px) {
  .search-filters {
    padding: 1rem;
  }

  .filters-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    align-items: end;
  }

  .filter-group {
    min-width: auto;
  }

  .filter-actions {
    grid-column: 1 / -1;
    margin-left: 0;
    justify-content: stretch;
    margin-top: 0.5rem;
  }

  .search-btn,
  .clear-btn {
    flex: 1;
  }
}

@media (max-width: 480px) {
  .filters-container {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .filter-group label {
    font-size: 0.8rem;
    margin-bottom: 0.25rem;
  }

  .filter-select,
  .filter-input {
    padding: 0.4rem 0.6rem;
    font-size: 0.8rem;
    min-height: 36px;
  }

  .search-btn,
  .clear-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
    min-height: 36px;
  }
}
</style>