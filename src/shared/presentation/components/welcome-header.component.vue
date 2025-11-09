<!-- welcome-header.component.vue -->
<template>
  <div class="welcome-card">
    <div class="card-content">
        <h2 class="title">{{ $t('profile.welcomeHeader.title') }}</h2>
        <p class="description">
          {{ $t('profile.welcomeHeader.descriptionLine1') }}
          <br><br>
          {{ $t('profile.welcomeHeader.descriptionLine2Before') }} <strong style="color: #6C63FF">{{ $t('profile.welcomeHeader.brand') }}</strong>{{ $t('profile.welcomeHeader.descriptionLine2After') }}
        </p>

        <div class="image-container">
          <img src="/public/welcome.png" :alt="$t('profile.welcomeHeader.imageAlt')" class="centered-image">
        </div>
      </div>
  </div>
</template>

<script>
export default {
  name: 'WelcomeHeader'
}
</script>

<style scoped>
.welcome-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 5rem;
  max-width: 600px; /* Reducido el ancho máximo */
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.title {
  color: #6C63FF;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-align: center; /* Centrar también el título */
}

.description {
  color: #555;
  line-height: 1.6;
  font-size: 1rem;
  margin: 0;
  text-align: center; /* Esta línea centra el texto del párrafo */
}

.image-container {
  display: flex;
  justify-content: center;
  margin: 1rem 0;
}

.centered-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>