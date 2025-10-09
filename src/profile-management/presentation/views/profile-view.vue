<script setup lang="js">
import {ref} from 'vue';
import {useI18n} from 'vue-i18n';
const {t} = useI18n();

const profileData = {
  name: 'Vitaly Baca',
  roles: [],
  mainRole: 'Desarrollador Frontend',
  points: 20,
  projects: [{
    title: 'Plataforma de E-Learning',
    date: '13/05/2025',
    available_jobs: ['Desarrollador UX', 'Desarrollador UI', 'Analista de Datos'],
    areas: ['Tecnología','Desarrollo Web'],
    duration: '3 months',
    tags: ['Remoto', 'Junior', 'Tiempo Remoto'],
    liked: true, /*Se quedara en true como prueba*/
    likesCounted: 20000
  }],
  comments: [{
    img: "",
    name: "Mike",
    date: "13/09/2025",
    ratingValue: 4.5,
    comment: "Trabaja bien, no tarda tanto como los demas. Excelente trabajo."
  }],
  description: 'Soy desarrollador frontend con experiencia en Vue.js y Node.js, apasionado por crear interfaces modernas, intuitivas y funcionales. Me motiva diseñar experiencias de usuario fluidas que combinen estética y usabilidad...',
  skills: ['JavaScript', 'Vue.js', 'UI/UX', 'Git'],
  experiences: [
    { company: 'Empresa 1', role: 'Desarrollador UX', duration: '1 year' },
  ]
};

const experiencesOpen = ref(false);
const selectedOption = ref(2);

</script>

<template>
  <div class="gap-2 align-content-center flex flex-row mb-4">
    <div class="col-12 md:col-3 flex flex-column gap-2">
      <div class="p-card p-8 mb-4 text-center border-round-xl shadow-1">
        <img src='' alt="Avatar" class="h-6rem w-6rem border-circle object-fit-cover shadow-2 mb-2" />
        <h2 class="text-xl font-bold m-0 p-0">{{ profileData.name }}</h2>
        <p class="text-600 text-sm mt-1 mb-0">{{ profileData.mainRole }}</p>
      </div>
      <button
          class="text-xl border-round-xl
          font-semibold border-2 py-4 mb-3 shadow-2 color-bg-white color-border color-text">
        {{t('profile.see-CV')}}
      </button>
      <button
          class="color-bg-white
          text-xl
          font-semibold border-2
          py-4 mb-3
          shadow-2
          color-border
          color-text
          border-round-xl
          ">
        {{t('profile.portfolio')}}
      </button>
    </div>
    <div class="col-12 md:col-9 gap-1">
      <div class="grid mb-4 justify-content-left">
        <div class="col-3">
          <div class="p-2 text-center border-round-xl shadow-1">
            <span class="text-2xl font-extrabold text-gray-900">{{ profileData.points }} {{t('profile.points')}}</span>
          </div>
        </div>

        <div class="col-3">
          <div class="p-card p-2 text-center border-round-xl shadow-1">
            <span class="text-2xl font-extrabold text-gray-900">{{ profileData.projects.length }}
              {{t('profile.projects')}}</span>
          </div>
        </div>
      </div>

      <div class="p-card p-4 mb-4 border-round shadow-1">
        <h3 class="text-xl font-semibold color-text mb-3">{{t('profile.personal-description')}}</h3>
        <p class="text-gray-700 line-height-3">{{ profileData.description }}</p>
      </div>

      <div class="p-card p-4 mb-4 border-round shadow-1">
        <h3 class="text-xl font-semibold color-text mb-3">{{t('profile.skills')}}</h3>
        <div class="flex gap-5">
            <span v-for="skill in profileData.skills" :key="skill" class="text-900 pl-3 pr-3
             color-bg font-medium border-round-xl">
              {{ skill }}
            </span>
        </div>
      </div>

      <div>
        <div class="flex flex-row justify-content-between align-content-center p-4 mb-4
         border-round-xl shadow-1">
          <span class="text-xl">{{t('profile.experiences')}}</span>
          <i @click="experiencesOpen = !experiencesOpen" :class="['cursor-pointer' +
           ' align-self-center pi text-primary', experiencesOpen? 'pi-angle-up' : 'pi-angle-down']"></i>
        </div>

        <div class="card" v-if="experiencesOpen">
          <!-- Header -->
          <div class="flex flex-row justify-content-around p-3 mb-2">
            <div class="col-2">
              <div class="p-2 text-center border-round-xl shadow-1 bg-gray-300">
                {{t('profile.experience-tab.company')}}</div>
            </div>
            <div class="col-2">
              <div class="p-2 text-center border-round-xl shadow-1 bg-gray-300">{{t('profile.experience-tab.role')}}</div>
            </div>
            <div class="col-2">
              <div class="p-2 text-center border-round-xl shadow-1 bg-gray-300">{{t('profile.experience-tab.duration')}}</div>
            </div>
          </div>

          <!-- Rows -->
          <div
              v-for="experience in profileData.experiences"
              :key="experience"
              class="text-xl p-3 mb-2 flex flex-row justify-content-around align-items-center
               border-round-xl shadow-2 p-2"
          >
            <div class="col-2">
              <div class="rounded-cell content-cell text-center">
                {{ experience.company }}
              </div>
            </div>
            <div class="col-2">
              <div class="rounded-cell content-cell text-center">
                {{ experience.role }}
              </div>
            </div>
            <div class="col-2">
              <div class="rounded-cell content-cell text-center ">
                {{ experience.duration }}
              </div>
            </div>
            </div>
        </div>
      </div>
    </div>
  </div>
  <div class="flex justify-content-center">
    <div class="flex flex-row justify-content-center align-content-center gap-8">
      <button @click = "selectedOption = 1" :class="['shadow-2 px-7 border-round-lg border-2', selectedOption === 1 ? 'color-border' : 'color-bg-white color-border color-text']">{{t('profile.options.my-projects')}}</button>
      <span class="text-3xl text-400">|</span>
      <button @click = "selectedOption = 2" :class="['shadow-2 px-7 border-round-lg border-2', selectedOption === 2 ? 'color-border' : 'color-bg-white color-border color-text']">{{t('profile.options.comments')}}</button>
    </div>
    <div v-if="selectedOption === 1">

    </div>
    <div v-else >

    </div>
  </div>
</template>

<style scoped>
.color-text {
  color: #6C63FF
}
.color-bg {
  background-color: #6C63FF
}
.color-border {
  border-color: #6C63FF
}
.color-bg-white {
  background-color: #fff
}
</style>