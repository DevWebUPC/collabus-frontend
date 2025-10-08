<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import FooterContent from "./footer-content.vue";

import PlanActual from "../../../subscription/presentation/components/PlanActual.vue";

const { t } = useI18n();
const route = useRoute();

const menuItems = [
  { label: "nav.home", to: "/home", key: "home" },
  { label: "nav.projects", to: "/projects", key: "projects" },
  { label: "nav.collaborators", to: "/collaborators", key: "collaborators" },
  { label: "nav.notifications", to: "/notifications", key: "notifications" },
];

const drawer = ref(false);
const toggleDrawer = () => (drawer.value = !drawer.value);
</script>

<template>
  <div class="app-layout">
    <!-- Toast & Dialog Components -->
    <pv-toast />
    <pv-confirm-dialog />

    <!-- Drawer móvil -->
    <pv-drawer v-model:visible="drawer" class="mobile-drawer">
      <div class="drawer-content p-3">
        <router-link
            v-for="item in menuItems"
            :key="'drawer-' + item.key"
            :to="item.to"
            class="drawer-nav-link"
            :class="{ 'drawer-nav-link-active': $route.name === item.key }"
            @click="drawer = false"
        >
          {{ t(item.label) }}
        </router-link>

        <!-- Plan Actual (solo visible en Home) -->
        <div class="drawer-plan card" v-if="route.name === 'home'">
          <PlanActual />
        </div>
      </div>
    </pv-drawer>

    <!-- Header -->
    <pv-toolbar class="header-toolbar">
      <template #start>
        <pv-button
            class="mobile-menu-btn p-button-text"
            icon="pi pi-bars"
            @click="toggleDrawer"
        />
        <router-link to="/home" class="logo-link">
          <h3 class="logo-text">CollabUs</h3>
        </router-link>
      </template>

      <template #center>
        <div class="nav-container desktop-nav">
          <router-link
              v-for="item in menuItems"
              :key="item.key"
              :to="item.to"
              class="nav-link"
              :class="{ 'nav-link-active': $route.name === item.key }"
          >
            {{ t(item.label) }}
          </router-link>
        </div>
      </template>

      <template #end>
        <pv-avatar icon="pi pi-user" class="user-avatar" shape="circle" />
      </template>
    </pv-toolbar>

    <!-- Contenido principal -->
    <main class="main-content" role="main">
      <div class="content-grid">
        <!-- CONTENIDO principal -->
        <section class="content-container">
          <router-view />
        </section>
      </div>

      <!-- PlanActual posicionado en esquina inferior izquierda -->
      <div class="floating-plan" v-if="route.name === 'home'">
        <div class="card">
          <PlanActual />
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <footer-content />
    </footer>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* Header */
.header-toolbar {
  padding: 0.75rem 2rem;
  background-color: var(--color-gray-50);
  border: none;
}

.logo-link {
  text-decoration: none;
}
.logo-text {
  margin: 0;
  color: #6c63ff;
  font-weight: 700;
  font-size: 1.5rem;
}

.nav-container {
  display: flex;
  gap: 2rem;
  align-items: center;
}
.desktop-nav {
  display: flex;
}
.mobile-menu-btn {
  display: none;
  color: #6c63ff;
  margin-right: 1rem;
}

.nav-link {
  text-decoration: none;
  color: #374151;
  font-weight: 500;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s;
}
.nav-link:hover {
  color: #6c63ff;
}
.nav-link-active {
  color: #6c63ff;
  font-weight: 600;
  background: rgba(108, 99, 255, 0.1);
}

.user-avatar {
  color: white;
}

/* Grid principal */
.main-content {
  flex: 1;
  padding: 1rem;
  position: relative;
}
.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  align-items: start;
}

.content-container {
  min-height: 60vh;
}

/* PlanActual flotante en esquina inferior izquierda */
.floating-plan {
  position: fixed;
  bottom: 100px; /* Espacio suficiente para evitar choque con footer */
  left: 20px;
  width: 300px;
  z-index: 10;
  animation: fadeInUp 0.5s ease-out;
}

.card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

/* Footer */
.app-footer {
  margin-top: auto;
  position: relative;
  z-index: 5;
}

/* Drawer móvil */
.mobile-drawer {
  width: 300px;
}
.drawer-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.drawer-nav-link {
  display: block;
  text-decoration: none;
  color: #374151;
  font-weight: 500;
  font-size: 1rem;
  padding: 1rem;
  border-radius: 8px;
  transition: all 0.2s;
}
.drawer-nav-link:hover {
  background: rgba(108, 99, 255, 0.05);
  color: #6c63ff;
}
.drawer-nav-link-active {
  color: #6c63ff;
  font-weight: 600;
  background: rgba(108, 99, 255, 0.1);
}
.drawer-plan {
  margin-top: 0.5rem;
}

/* Animación para el PlanActual flotante */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .floating-plan {
    width: 280px;
    left: 15px;
    bottom: 90px;
  }
}

@media (max-width: 768px) {
  .header-toolbar {
    padding: 0.5rem 1rem;
  }
  .logo-text {
    font-size: 1.2rem;
  }
  .user-avatar {
    width: 32px;
    height: 32px;
  }
  .desktop-nav {
    display: none;
  }
  .mobile-menu-btn {
    display: inline-flex;
  }

  /* En móviles, el PlanActual se coloca centrado en la parte inferior */
  .floating-plan {
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    width: calc(100% - 40px);
    max-width: 320px;
  }
}

@media (max-width: 480px) {
  .floating-plan {
    width: calc(100% - 30px);
    bottom: 70px;
  }
}
</style>
