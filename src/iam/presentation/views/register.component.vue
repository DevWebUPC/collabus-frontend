<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../application/user-store.js'; // Ajusta la ruta según tu estructura
import { Button as PvButton, InputText } from "primevue";
import languageSwitcher from '../../../shared/presentation/components/language-switcher.vue';

const router = useRouter();
const userStore = useUserStore();

const fullName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const { t } = useI18n();

const goBack = () => {
  router.push('/');
};

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    alert(t('auth.register.passwordsNoMatch'));
    return;
  }

  try {
    const registrationData = {
      fullName: fullName.value,
      email: email.value,
      password: password.value
    };

    await userStore.register(registrationData);

    // Redirigir al onboarding después del registro exitoso
    router.push('/create-account');
    } catch (error) {
    console.error('Error en registro:', error);
    alert(error.message || t('auth.register.error'));
  }
};
</script>

<template>
  <header class="login-header">
    <div class="header-content">
      <div class="logo">
        <img src="/logo.png" :alt="$t('auth.logoAlt')" class="logo">
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

  <div class="register-container">
    <!-- Panel izquierdo -->
    <div class="card-left">
      <div class="logo-section">
        <img src="/logo.png" :alt="$t('auth.logoAlt')" class="logo-image" />
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
      <div class="register-content">
        <div class="register-header">
          <h1 class="main-title">{{ $t('auth.register.title') }}</h1>
        </div>

        <form @submit.prevent="handleRegister" class="register-form">
          <div class="form-group">
      <label for="fullName">{{ $t('auth.register.fullNameLabel') }}</label>
      <pv-input-text
                type="text"
                id="fullName"
                v-model="fullName"
        :placeholder="$t('auth.register.fullNamePlaceholder')"
                required
                class="w-full text-input"
            />
          </div>

          <div class="form-group">
      <label for="email">{{ $t('auth.register.emailLabel') }}</label>
      <pv-input-text
                type="email"
                id="email"
                v-model="email"
        :placeholder="$t('auth.register.emailPlaceholder')"
                required
                class="w-full text-input"
            />
          </div>

          <div class="form-group">
      <label for="password">{{ $t('auth.register.passwordLabel') }}</label>
      <pv-input-text
                type="password"
                id="password"
                v-model="password"
        :placeholder="$t('auth.register.passwordPlaceholder')"
                required
                class="w-full password-input"
            />
          </div>

          <div class="form-group">
      <label for="confirmPassword">{{ $t('auth.register.confirmPasswordLabel') }}</label>
      <pv-input-text
                type="password"
                id="confirmPassword"
                v-model="confirmPassword"
        :placeholder="$t('auth.register.confirmPasswordPlaceholder')"
                required
                class="w-full password-input"
            />
          </div>

      <pv-button
        type="submit"
        class="register-button w-full"
        :label="$t('auth.register.save')"
        :loading="userStore.loading"
      />
        </form>

        <div class="footer">
          <p class="copyright">Todos los derechos reservados CollabUs © 2025</p>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- Los estilos se mantienen igual -->
<style scoped>
.register-container {
  display: flex;
  min-height: 100vh;
  background: white;
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

.register-content {
  width: 100%;
  max-width: 400px;
}

.register-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.main-title {
  font-size: 2rem;
  font-weight: 700;
  color: #6C63FF;
  margin-bottom: 0.5rem;
}

.register-form {
  width: 100%;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.text-input, .password-input {
  width: 100%;
  border: 1px solid #d1d5db !important;
  border-radius: 6px !important;
  padding: 0.75rem !important;
}

.text-input:focus, .password-input:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1) !important;
}

.register-button {
  background: #FF7A30 !important;
  border: none !important;
  border-radius: 6px !important;
  padding: 0.75rem !important;
  color: white !important;
  font-weight: 600 !important;
  width: 100%;
  margin-top: 0.5rem;
}

.footer {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.copyright {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.login-header {
  background-color: white;
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
  .register-container {
    flex-direction: column;
    justify-content: center;
    min-height: calc(100vh - 80px);
  }

  .card-left {
    display: none;
  }

  .card-right {
    width: 100%;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .register-content {
    max-width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .mobile-only {
    display: block;
  }

  .desktop-only {
    display: none;
  }

  .main-title {
    font-size: 1.5rem;
  }

  .header-content {
    padding: 0 1rem;
  }
}

@media (max-width: 480px) {
  .register-container {
    min-height: calc(100vh - 70px);
  }

  .card-right {
    padding: 1rem;
  }

  .register-content {
    padding: 0;
  }

  .main-title {
    font-size: 1.25rem;
  }
}
</style>