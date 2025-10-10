<!-- Login.component.vue -->
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ModalForgetPassword from '../components/modal-forget-password.component.vue';

const router = useRouter();
const showForgotPasswordModal = ref(false);
const email = ref('');
const password = ref('');

const goBack = () => {
  window.location.href = 'https://devwebupc.github.io/landing-page/';
};

const goToHome = () => {
  router.push('/home');
};

const openForgotPasswordModal = () => {
  showForgotPasswordModal.value = true;
};

const goToRegister = () => {
  router.push('/register');
};

const handleLogin = () => {
  // Aquí iría tu lógica de login
  console.log('Login attempt:', email.value, password.value);
  // router.push('/dashboard'); // Redirigir después del login exitoso
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
        <img src="/logo.png" alt="CollabUs Logo" class="logo-image">
      </div>
      <pv-button
          @click="goBack"
          class="back-button"
          text
          icon="pi pi-arrow-left"
      >
        Regresar
      </pv-button>
    </div>
  </header>

  <div class="login-container">
    <div class="login-card">
      <div class="login-card-header">
        <h1 class="logo-text">CollabUs</h1>
        <p class="login-subtitle">Inicia sesión en tu cuenta</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <pv-input-text
              type="email"
              id="email"
              v-model="email"
              placeholder="ejemplo123@gmail.com"
              required
              class="w-full"
          />
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <pv-input-text
              type="password"
              id="password"
              v-model="password"
              placeholder="Ingresa tu contraseña"
              required
              class="w-full"
          />
        </div>

        <div class="forgot-password">
          <a href="#" @click.prevent="openForgotPasswordModal">¿Olvidaste tu contraseña?</a>
        </div>

        <pv-button
            type="submit"
            class="login-button w-full"
            label="Ingresar"
            @click="goToHome"
        />
      </form>

      <div class="register-link">
        <p>¿No tienes cuenta? <a href="#" @click.prevent="goToRegister">Registrate</a></p>
      </div>

      <div class="footer">
        <p>Todos los derechos reservados CollabUs © 2025</p>
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
  background-color: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
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
  background-color: #f5f5f5;
  padding: 20px;
}

.login-card {
  background-color: white;
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

.login-form {
  margin-bottom: 20px;
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
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: #6C63FF;
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