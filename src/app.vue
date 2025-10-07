<script setup lang="js">
import { computed } from "vue";
import { useRoute } from "vue-router";
import Layout from "./shared/presentation/components/layout.vue";

const route = useRoute();

// Determinar si mostrar el layout basado en la ruta
const showLayout = computed(() => {
  return route.name !== 'login' && route.name !== 'recovery-password' && route.name !== 'register'
      && route.name !== 'create-account';
});
</script>

<template>
  <layout v-if="showLayout"></layout>
  <router-view v-else />
</template>