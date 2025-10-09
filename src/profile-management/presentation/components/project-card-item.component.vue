<script setup lang="js">
import {useI18n} from "vue-i18n";
const {t} = useI18n();

const projectItem = {
  title: 'Plataforma de E-Learning',
  date: '13/05/2025',
  available_jobs: ['Desarrollador UX', 'Desarrollador UI', 'Analista de Datos'],
  areas: ['Tecnología','Desarrollo Web'],
  duration: '3 months',
  tags: ['Remoto', 'Junior', 'Tiempo Remoto'],
  liked: true, /*Se quedara en true como prueba*/
  likesCounted: 20000
};
</script>

<template>
  <div class="flex flex-column border-2 border-round-lg my-2">
    <div class="flex flex-row justify-content-between py-2">
      <span>{{projectItem.title}}</span>
      <span>{{projectItem.date}}</span>
    </div>
    <div class="flex flex-column justify-content-start align-content-center mb-2">
      <span>{{t('profile.project-info.jobs')}}</span>
      <span v-for="job in projectItem.available_jobs" :key="job">{{job}}</span>
    </div>
    <div class="flex flex-column justify-content-start align-content-center mb-2">
      <span>{{t('profile.project-info.areas')}}</span>
      <span v-for="area in projectItem.areas" :key="area">{{area}}</span>
    </div>
    <div>
      <span>{{t('profile.project-info.duration')}}: {{projectItem.duration}}</span>
    </div>
    <div class="flex flex-row gap-2 justify-end p-2 mb-2">
      <span v-for="tag in projectItem.tags" :key="tag">{{tag}}</span>
    </div>
    <div class="flex flex-row justify-content-between p-2 mb-2">
      <div class="flex flex-row">
        <button icon="pi pi-heart"
                :icon-class="projectItem.liked ? 'pi-heart-fill' : 'pi-heart'"/>
        <span>{{projectItem.likesCounted}}</span>
      </div>
      <div>
        <button class="px-4 py-2">{{t('profile.project-info.see-more')}}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>