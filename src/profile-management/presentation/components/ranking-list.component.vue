<!-- components/ranking-list.component.vue -->
<template>
  <div class="ranking-list-container">
    <div class="ranking-header">
      <h1 style="color: white;">Ranking de Colaboradores</h1>
      <p class="ranking-subtitle" style="color: white;">Colabora con los mejores y ten buen éxito en tus proyectos</p>
    </div>

    <div class="ranking-content">
      <RankingItem
          v-for="(collaborator, index) in rankedCollaborators"
          :key="collaborator.id"
          :rank="index + 1"
          :collaborator="collaborator"
      />
    </div>
  </div>
</template>

<script>
import RankingItem from './ranking-item.component.vue'

export default {
  name: "RankingList",
  components: {
    RankingItem
  },
  data() {
    return {
      rankedCollaborators: [
        {
          id: 1,
          name: "Christian Gonzalez",
          role: "Arquitecto de Software",
          score: 2000,
          skills: ["C#", ".NET", "Azure"]
        },
        {
          id: 2,
          name: "Diana Briceño",
          role: "Desarrollador Full Stack",
          score: 1992,
          skills: ["JavaScript", "React", "Node.js"]
        },
        {
          id: 3,
          name: "Mario Baca",
          role: "Desarrollador de Videojuegos",
          score: 1550,
          skills: ["C++", "Unity", "Unreal Engine"]
        },
        {
          id: 4,
          name: "Jesli Bautista",
          role: "Analista de datos",
          score: 1460,
          skills: ["Python", "SQL", "Power BI"]
        },
        {
          id: 5,
          name: "Mike Shinoda",
          role: "UX Researcher",
          score: 1330,
          skills: ["Figma", "User Testing", "Prototyping"]
        },
        {
          id: 6,
          name: "Brand Delson",
          role: "Scrum Master",
          score: 1200,
          skills: ["Agile", "JIRA", "Leadership"]
        },
        {
          id: 7,
          name: "Luis Cardenas",
          role: "Ingeniero de telecomunicaciones",
          score: 1100,
          skills: ["Networking", "Cisco", "5G"]
        },
        {
          id: 8,
          name: "Didier Meza",
          role: "Diseñador UI",
          score: 1050,
          skills: ["Figma", "Adobe XD", "Illustrator"]
        },
        {
          id: 9,
          name: "Dayron Rios",
          role: "Ingeniería de QA",
          score: 1020,
          skills: ["Testing", "Selenium", "Jest"]
        },
        {
          id: 10,
          name: "Vitaly Baca",
          role: "Data Scientist",
          score: 1000,
          skills: ["Python", "Machine Learning", "TensorFlow"]
        }
      ]
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
}
</style>