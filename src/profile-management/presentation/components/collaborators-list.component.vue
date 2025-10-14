<script>
import CollaboratorItem from '../components/colaborador-item.component.vue';
import { useProfileStore } from '../../application/profile-store.js';

export default {
  name: "CollaboratorsList",
  components: {
    CollaboratorItem
  },
  props: {
    collaborators: {
      type: Array,
      default: () => []
    },
    isFiltered: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      localCollaborators: [],
      loading: false,
      error: null
    }
  },
  watch: {
    collaborators: {
      handler(newCollaborators) {
        if (newCollaborators && newCollaborators.length > 0) {
          this.localCollaborators = newCollaborators;
        }
      },
      immediate: true
    }
  },
  async mounted() {
    // Solo cargar todos los colaboradores si no hay una búsqueda activa
    if (!this.isFiltered && this.collaborators.length === 0) {
      await this.loadCollaborators();
    }
  },
  methods: {
    async loadCollaborators() {
      this.loading = true;
      this.error = null;

      try {
        const profileStore = useProfileStore();

        // Obtener todos los perfiles desde la API
        await profileStore.fetchAllProfiles();

        // Mapear los perfiles al formato que espera el componente
        this.localCollaborators = profileStore.allProfiles.map(profile => ({
          id: profile.id,
          name: profile.username,
          position: profile.role,
          score: profile.points,
          skills: profile.abilities
        }));

      } catch (err) {
        console.error('Error loading collaborators:', err);
        this.error = 'Error al cargar los colaboradores';
      } finally {
        this.loading = false;
      }
    },

    getInitials(name) {
      return name
          .split(' ')
          .map(word => word.charAt(0))
          .join('')
          .toUpperCase();
    },

    handleViewProfile(collaboratorId) {
      console.log('Ver perfil del colaborador:', collaboratorId);
      // Navegar al perfil del colaborador
      this.$router.push(`/profile/${collaboratorId}`);
    }
  }
}
</script>

<template>
  <div class="collaborators-list-container">
    <h1>Lista de Colaboradores</h1>

    <!-- Estado de carga -->
    <div v-if="loading" class="loading-state">
      Cargando colaboradores...
    </div>

    <!-- Estado de error -->
    <div v-else-if="error" class="error-state">
      {{ error }}
      <button @click="loadCollaborators" class="retry-btn">Reintentar</button>
    </div>

    <!-- Lista de colaboradores -->
    <div v-else class="collaborators-grid">
      <div v-if="isFiltered && localCollaborators.length === 0" class="empty-search-state">
        No se encontraron colaboradores que coincidan con tu búsqueda
      </div>

      <CollaboratorItem
          v-for="collaborator in localCollaborators"
          :key="collaborator.id"
          :collaborator="collaborator"
          @view-profile="handleViewProfile"
      />

      <!-- Mensaje cuando no hay colaboradores (solo para carga inicial) -->
      <div v-if="!isFiltered && localCollaborators.length === 0" class="empty-state">
        No se encontraron colaboradores
      </div>
    </div>
  </div>
</template>

<style scoped>
.collaborators-list-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.collaborators-list-container h1 {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 2rem;
  font-weight: 700;
  color: #2d3748;
}

.collaborators-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.loading-state,
.error-state,
.empty-state,
.empty-search-state {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: #6b7280;
}

.error-state {
  color: #e53e3e;
}

.empty-search-state {
  color: #6b7280;
  font-style: italic;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #6C63FF;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.retry-btn:hover {
  background: #5a52d5;
}

/* Responsive */
@media (max-width: 768px) {
  .collaborators-list-container {
    padding: 0.5rem;
  }

  .collaborators-list-container h1 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
  }
}

@media (max-width: 480px) {
  .collaborators-list-container {
    padding: 0.25rem;
  }

  .collaborators-list-container h1 {
    font-size: 1.6rem;
  }
}
</style>