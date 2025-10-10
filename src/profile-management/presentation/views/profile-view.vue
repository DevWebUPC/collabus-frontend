<script setup lang="js">
import { ref } from 'vue';
import ProfileHeader from '../components/profile-header.component.vue';
import ProfileStats from '../components/profile-stats.component.vue';
import ProfileDescription from '../components/profile-description.component.vue';
import ProfileSkills from '../components/profile-skills.component.vue';
import ProfileExperiences from '../components/profile-experiences.component.vue';
import ProfileTabs from '../components/profile-tabs.component.vue';

const profileData = ref({
  name: 'Juan Pérez',
  roles: ['Developer', 'Designer'],
  mainRole: 'Full Stack Developer',
  points: 1250,
  projects: [
    { id: 1, name: 'Project A' },
    { id: 2, name: 'Project B' }
  ],
  comments: [],
  description: 'Soy un desarrollador full stack con 5 años de experiencia en tecnologías modernas.',
  skills: ['JavaScript', 'Vue.js', 'Node.js', 'Python', 'React'],
  experiences: [
    { company: 'Tech Corp', role: 'Senior Developer', duration: '2 años' },
    { company: 'Startup XYZ', role: 'Full Stack Dev', duration: '3 años' }
  ]
});

const experiencesOpen = ref(false);

const toggleExperiences = (isOpen) => {
  experiencesOpen.value = isOpen;
};
</script>

<template>
  <div class="profile-container">
    <!-- Header siempre visible -->
    <ProfileHeader :profile-data="profileData" />

    <!-- Contenido principal - oculto en móvil -->
    <div class="main-content col-12 md:col-9 gap-1 hidden-on-mobile">
      <ProfileStats :profile-data="profileData" />
      <ProfileDescription :profile-data="profileData" />
      <ProfileSkills :profile-data="profileData" />
      <ProfileExperiences
          :profile-data="profileData"
          @toggle-experiences="toggleExperiences"
      />
    </div>
  </div>

  <!-- Tabs siempre visibles -->
  <ProfileTabs :profile-data="profileData" />
</template>

<style scoped>
.profile-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
  margin-bottom: 2rem;
}

/* En pantallas grandes */
@media (min-width: 768px) {
  .profile-container {
    flex-direction: row;
    align-items: flex-start;
  }

  .hidden-on-mobile {
    display: block;
  }
}

/* En pantallas pequeñas */
@media (max-width: 767px) {
  .hidden-on-mobile {
    display: none !important;
  }
}

.color-text {
  color: #6C63FF;
}
.color-bg {
  background-color: #6C63FF;
}
.color-border {
  border-color: #6C63FF;
}
.color-bg-white {
  background-color: #fff;
}
</style>