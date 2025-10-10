<script>
import SearchBarComponent from "../components/search-filters.component.vue";
export default {
  name: "ranking-de-colaboradores",
  components: {
    SearchBarComponent
  },
  methods: {
    goBack() {
      // Retroceder en el historial del navegador
      this.$router.go(-1);

      // Alternativa: Si quieres navegar a una ruta específica
      // this.$router.push('/collaborators');
    }
  }
}
</script>

<template>
  <div class="ranking-container">
    <!-- Botón de retroceso -->
    <div class="back-button-container">
      <button class="back-button" @click="goBack">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Volver
      </button>
    </div>

    <!-- Contenido del ranking -->
    <div class="ranking-content">
      <SearchBarComponent></SearchBarComponent>
    </div>
  </div>
</template>

<style scoped>

</style>