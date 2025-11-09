<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Button as PvButton, InputText } from "primevue";
import languageSwitcher from '../../../shared/presentation/components/language-switcher.vue';

const router = useRouter();
const newPassword = ref('');
const confirmPassword = ref('');
const { t } = useI18n();

const goBack = () => {
  router.push('/');
};

const handlePasswordReset = () => {
  if (newPassword.value !== confirmPassword.value) {
    alert(t('auth.recovery.passwordMismatch'));
    return;
  }

  // Aquí iría tu lógica de restablecimiento de contraseña
  console.log('Password reset attempt:', newPassword.value);

  // Redirigir al login después del restablecimiento exitoso
  router.push('/');
};
</script>

<template>
  <header class="login-header">
    <div class="header-content">
      <div class="logo">
        <img src="/logo.png" alt="CollabUs Logo" class="logo">
      </div>
      <div class="right-container">
        <language-switcher />
        <pv-button
          @click="goBack"
          class="back-button mobile-only"
          :label="$t('auth.back')"
        />
      </div>
    </div>
  </header>

  <div class="recovery-container">
    <!-- Panel izquierdo -->
    <div class="card-left">
      <div class="logo-section">
        <img src="/logo.png" alt="CollabUs Logo" class="logo-image" />
      </div>
      <div class="right-container">
        <pv-button
          @click="goBack"
          class="back-button desktop-only"
          :label="$t('auth.back')"
        />
      </div>
    </div>

    <!-- Panel derecho -->
    <div class="card-right">
      <div class="recovery-content">
        <div class="recovery-header">
          <h1 class="main-title">{{$t('auth.recovery.title')}}</h1>
          <p class="recovery-subtitle">{{$t('auth.recovery.subtitle')}}</p>
        </div>

        <form @submit.prevent="handlePasswordReset" class="recovery-form">
          <div class="form-group">
      <label for="newPassword">{{$t('auth.recovery.newPasswordLabel')}}</label>
      <pv-input-text
        type="password"
        id="newPassword"
        v-model="newPassword"
        :placeholder="$t('auth.recovery.newPasswordPlaceholder')"
        required
        class="w-full password-input"
      />
          </div>

          <div class="form-group">
      <label for="confirmPassword">{{$t('auth.recovery.confirmPasswordLabel')}}</label>
      <pv-input-text
        type="password"
        id="confirmPassword"
        v-model="confirmPassword"
        :placeholder="$t('auth.recovery.confirmPasswordPlaceholder')"
        required
        class="w-full password-input"
      />
          </div>

      <pv-button
        type="submit"
        class="recovery-button w-full"
        :label="$t('auth.recovery.confirmButton')"
      />
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.recovery-container {
  display: flex;
  min-height: 100vh;
  background: var(--color-white, #FFFFFF);
}

/* Panel izquierdo */
.card-left {
  width: 40%;
  background: #CBFCFF;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  border-right: 1px solid #e9ecef;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.logo-image {
  width: 300px;
  height: 300px;
  object-fit: contain;
}

.back-button {
  background: #ffffff !important;
  color: #6C63FF !important;
  border: 2px solid #6C63FF !important;
  padding: 0.75rem 1.5rem !important;
  border-radius: 6px !important;
}

/* Panel derecho */
.card-right {
  width: 60%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.recovery-content {
  width: 100%;
  max-width: 400px;
}

.recovery-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.main-title {
  font-size: 2rem;
  font-weight: 700;
  color: #6C63FF;
  margin-bottom: 0.5rem;
}

.recovery-subtitle {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
}

.recovery-form {
  width: 100%;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--color-gray-900, #374151);
  font-size: 0.9rem;
}

.password-input {
  width: 100%;
  border: 1px solid #d1d5db !important;
  border-radius: 6px !important;
  padding: 0.75rem !important;
}


.recovery-button {
  background: #6C63FF !important;
  border: none !important;
  border-radius: 6px !important;
  padding: 0.75rem !important;
  color: white !important;
  font-weight: 600 !important;
  width: 100%;
  margin-top: 0.5rem;
}

.login-header {
  background-color: var(--color-white, #FFFFFF);
  border-bottom: 1px solid #e2e8f0;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
}

.logo {
  height: 60px;
  width: auto;
  object-fit: contain;
}

/* Clases para control de visibilidad responsive */
.mobile-only {
  display: none;
}

.desktop-only {
  display: block;
}

/* Media queries para responsividad */
@media (max-width: 768px) {
  .recovery-container {
    flex-direction: column;
    justify-content: center; /* Añadido para centrado vertical */
    min-height: calc(100vh - 80px); /* Resta la altura del header */
  }

  .card-left {
    display: none; /* Oculta el panel izquierdo en móviles */
  }

  .card-right {
    width: 100%;
    padding: 1.5rem;
    display: flex;
    align-items: center; /* Asegura centrado vertical */
    justify-content: center; /* Asegura centrado horizontal */
  }

  .recovery-content {
    max-width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center; /* Centra el contenido internamente */
  }

  .mobile-only {
    display: block; /* Muestra el botón en el header en móviles */
  }

  .desktop-only {
    display: none; /* Oculta el botón en el panel izquierdo en móviles */
  }

  .main-title {
    font-size: 1.5rem;
  }

  .header-content {
    padding: 0 1rem;
  }
}

@media (max-width: 480px) {
  .recovery-container {
    min-height: calc(100vh - 70px); /* Ajuste para pantallas más pequeñas */
  }

  .card-right {
    padding: 1rem;
  }

  .recovery-content {
    padding: 0;
  }

  .main-title {
    font-size: 1.25rem;
  }

  .recovery-subtitle {
    font-size: 0.9rem;
  }
}
</style>