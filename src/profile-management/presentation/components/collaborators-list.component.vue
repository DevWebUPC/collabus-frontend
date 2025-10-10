<script>
import CollaboratorItem from '../components/colaborador-item.component.vue';

export default {
  name: "CollaboratorsList",
  components: {
    CollaboratorItem
  },
  data() {
    return {
      collaborators: [
        {
          id: 1,
          name: 'Roberto Tello',
          position: 'Gerente de Proyectos',
          score: 120,
          skills: ['Gestión de Proyectos', 'Serum'],
        },
        {
          id: 2,
          name: 'Mariana Paredes',
          position: 'Desarrollador Full Stack',
          score: 110,
          skills: ['SEO', 'Google Ads'],
        },
        {
          id: 3,
          name: 'Luis Gutiérrez',
          position: 'Ingeniero de Datos',
          score: 105,
          skills: ['Spring Boot', 'Java'],
        },
        {
          id: 4,
          name: 'Camila Rodríguez',
          position: 'Analista de Marketing Digital',
          score: 100,
          skills: ['Python', 'SQL'],
        },
        {
          id: 5,
          name: 'Valeria Torres',
          position: 'UX Researcher',
          score: 90,
          skills: ['Design Thinking', 'Prototipado'],
        },
        {
          id: 6,
          name: 'Andrés Ramírez',
          position: 'Serum Master',
          score: 85,
          skills: ['SEO', 'Kenban'],
        },
        {
          id: 7,
          name: 'Natalia Silva',
          position: 'Arquitecta de Software',
          score: 80,
          skills: ['Spring Boot', 'AWS'],
        },
        {
          id: 8,
          name: 'Fernando Aguilar',
          position: 'Diseñador UI',
          score: 75,
          skills: ['Figma', 'Adobe'],
        },
        {
          id: 9,
          name: 'Lucía Castro',
          position: 'Ingeniera de QA',
          score: 70,
          skills: ['Cypress', 'Selenium'],
        },
        {
          id: 10,
          name: 'Mateo Vargas',
          position: 'Data Scientist',
          score: 68,
          skills: ['Machine Learning', 'SQL'],
        }
      ]
    }
  },
  methods: {
    getInitials(name) {
      return name
          .split(' ')
          .map(word => word.charAt(0))
          .join('')
          .toUpperCase();
    },
    handleViewProfile(collaboratorId) {
      console.log('Ver perfil del colaborador:', collaboratorId);
      // Aquí puedes implementar la navegación al perfil
    }
  }
}
</script>

<template>
  <div class="collaborators-list-container">
    <h1>Lista de Colaboradores</h1>
    <div class="collaborators-grid">
      <CollaboratorItem
          v-for="collaborator in collaborators"
          :key="collaborator.id"
          :collaborator="collaborator"
          @view-profile="handleViewProfile"
      />
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

/* Loading state */
.collaborators-grid:empty::before {
  content: "Cargando colaboradores...";
  display: block;
  text-align: center;
  font-size: 1.2rem;
  padding: 3rem;
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