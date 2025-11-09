<!-- Login.component.vue -->
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../application/user-store.js'; // Ajusta la ruta según tu estructura
import ModalForgetPassword from '../components/modal-forget-password.component.vue';
import languageSwitcher from '../../../shared/presentation/components/language-switcher.vue';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const userStore = useUserStore();
const showForgotPasswordModal = ref(false);
const email = ref('');
const password = ref('');
const loginError = ref('');
const { t } = useI18n();

const goBack = () => {
  window.location.href = 'https://devwebupc.github.io/landing-page/';
};

const openForgotPasswordModal = () => {
  showForgotPasswordModal.value = true;
};

const goToRegister = () => {
  router.push('/register');
};

const handleLogin = async () => {
  try {
    loginError.value = '';

    // Validaciones básicas
    if (!email.value || !password.value) {
      loginError.value = t('auth.login.fillFields');
      return;
    }

    console.log('🔐 Attempting login for:', email.value);

    // Usar el user store para hacer login con el backend real
    await userStore.login(email.value, password.value);

    console.log('✅ Login successful, redirecting...');

    // Redirigir al home después del login exitoso
    router.push('/home');

  } catch (error) {
    console.error('❌ Login error:', error);
    loginError.value = error.message || t('auth.login.error');
  }
};

const handlePasswordRecovery = (email) => {
  console.log('Password recovery for:', email);
  // Aquí iría tu lógica de recuperación de contraseña
};
</script>

<template>
  <header class="login-header">
    <div class="header-content">
      <div class="logo">
  <img src="/logo.png" :alt="$t('auth.logoAlt')" class="logo-image">
      </div>
      <div class="right-container">
        <language-switcher />
        <button
            @click="goBack"
            class="back-button"
            text
            icon="pi pi-arrow-left"
        >
          {{ $t('auth.back') }}
        </button>
      </div>
    </div>
  </header>

  <div class="login-container">
    <div class="login-card">
      <div class="login-card-header">
        <h1 class="logo-text">CollabUs</h1>
  <p class="login-subtitle">{{ $t('auth.login.subtitle') }}</p>
      </div>

      <!-- Mensaje de error -->
      <div v-if="loginError" class="error-message">
        <i class="pi pi-exclamation-triangle"></i>
        {{ loginError }}
      </div>

      <!-- Loading state -->
      <div v-if="userStore.loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>{{ $t('auth.login.loading') }}</span>
      </div>

      <form @submit.prevent="handleLogin" class="login-form" :class="{ 'disabled': userStore.loading }">
        <div class="form-group">
      <label for="email">{{ $t('auth.login.emailLabel') }}</label>
          <pv-input-text
              type="email"
              id="email"
              v-model="email"
        :placeholder="$t('auth.login.emailPlaceholder')"
              required
              class="w-full"
              :disabled="userStore.loading"
          />
        </div>

        <div class="form-group">
      <label for="password">{{ $t('auth.login.passwordLabel') }}</label>
          <pv-input-text
              type="password"
              id="password"
              v-model="password"
        :placeholder="$t('auth.login.passwordPlaceholder')"
              required
              class="w-full"
              :disabled="userStore.loading"
          />
        </div>

        <div class="forgot-password">
          <a href="#" @click.prevent="openForgotPasswordModal">{{ $t('auth.login.forgotPassword') }}</a>
        </div>

    <pv-button
      type="submit"
      class="login-button w-full"
      :label="userStore.loading ? $t('auth.login.loggingIn') : $t('auth.login.login')"
      :disabled="userStore.loading || !email || !password"
      :loading="userStore.loading"
    />
      </form>

      <div class="register-link">
        <p>{{ $t('auth.login.noAccountPrefix') }} <a href="#" @click.prevent="goToRegister">{{ $t('auth.login.register') }}</a></p>
      </div>

      <div class="footer">
        <p>{{ $t('footer.copyright') }}</p>
      </div>
    </div>
  </div>

  <!-- Modal de Recuperación de Contraseña -->
  <ModalForgetPassword
      :visible="showForgotPasswordModal"
      @update:visible="showForgotPasswordModal = $event"
      @submit="handlePasswordRecovery"
  />
</template>

<style scoped>
.login-header {
  background-color: var(--color-white, #FFFFFF);
  border-bottom: 1px solid #e2e8f0;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.right-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-content {
  max-width: 1200px;
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

.logo-image {
  height: 40px;
  width: auto;
  object-fit: contain;
}

.back-button {
  background: #E0E0E0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6C63FF;
}

.back-button:hover {
  background-color: #f1f5f9;
  color: #334155;
}

/* Main Login Container */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px);
  background-color: var(--color-gray-100, #f5f5f5);
  padding: 20px;
}

.login-card {
  background-color: var(--color-white, #FFFFFF);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-card-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo-text {
  color: #6C63FF;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
}

.login-subtitle {
  color: #666;
  font-size: 16px;
  margin: 0;
}

/* Error Message */
.error-message {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.error-message i {
  font-size: 16px;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #6b7280;
  margin-bottom: 20px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--color-gray-300, #e5e7eb);
  border-top: 3px solid #6C63FF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.login-form {
  margin-bottom: 20px;
}

.login-form.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

:deep(.p-inputtext) {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
}

:deep(.p-inputtext:focus) {
  outline: none;
  border-color: #6C63FF;
  box-shadow: 0 0 0 2px rgba(63, 81, 181, 0.1);
}

:deep(.p-inputtext:disabled) {
  background-color: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.forgot-password {
  text-align: right;
  margin-bottom: 20px;
}

.forgot-password a {
  color: #6C63FF;
  text-decoration: none;
  font-size: 14px;
}

.forgot-password a:hover {
  text-decoration: underline;
}

.login-button {
  padding: 12px;
  background-color: #6C63FF;
  color: var(--color-white, #FFFFFF);
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.3s;
}

.login-button:hover:not(:disabled) {
  background-color: #5a52d5;
}

.login-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

.register-link {
  text-align: center;
  margin-bottom: 30px;
}

.register-link p {
  margin: 0;
  color: #666;
}

.register-link a {
  color: #6C63FF;
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  text-decoration: underline;
}

.footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.footer p {
  margin: 0;
  color: #999;
  font-size: 14px;
}

/* Responsive Design */
@media (max-width: 480px) {
  .login-container {
    padding: 1rem;
  }

  .login-card {
    padding: 1.5rem;
  }

  .header-content {
    padding: 0 1rem;
  }

  .back-button {
    background: #E0E0E0;
    font-size: 0.875rem;
    padding: 0.375rem 0.75rem;
  }

  .logo-image {
    height: 32px;
  }
}
</style>