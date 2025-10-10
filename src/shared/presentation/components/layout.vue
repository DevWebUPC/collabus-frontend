<script setup>
import { ref, computed, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import FooterContent from "./footer-content.vue";

import PlanActual from "../../../subscription/presentation/components/PlanActual.vue";
import PlanesModal from "../../../subscription/presentation/components/PlanesModal.vue";

const { t } = useI18n();
const route = useRoute();

const menuItems = [
  { label: "nav.home", to: "/home", key: "home" },
  { label: "nav.projects", to: "/projects", key: "projects" },
  { label: "nav.collaborators", to: "/collaborators", key: "collaborators" },
  { label: "nav.notifications", to: "/notifications", key: "notifications" },
];

const drawer = ref(false);
const showPlansModal = ref(false); // Estado para controlar el modal

const toggleDrawer = () => (drawer.value = !drawer.value);

// Función para cerrar drawer y abrir modal de planes
const handlePlanModalOpen = () => {
  drawer.value = false;
  // Usar nextTick para asegurar que el drawer se cierre antes de abrir el modal
  nextTick(() => {
    showPlansModal.value = true;
  });
};

// Función para cerrar el modal de planes
const handlePlanModalClose = () => {
  showPlansModal.value = false;
};

// Función para manejar selección de plan
const handlePlanSelect = (newPlan) => {
  console.log('Plan seleccionado:', newPlan);
  showPlansModal.value = false;
};

// Función para manejar clic en enlaces del drawer
const handleDrawerLinkClick = () => {
  drawer.value = false;
};

// Cerrar drawer cuando se hace clic fuera (backdrop)
const handleDrawerHide = () => {
  drawer.value = false;
};
</script>

<template>
  <div class="app-layout">
    <!-- Toast & Dialog Components -->
    <pv-toast />
    <pv-confirm-dialog />

    <!-- Drawer móvil -->
    <pv-drawer
        v-model:visible="drawer"
        class="mobile-drawer"
        @hide="handleDrawerHide"
    >
      <div class="drawer-content p-3">
        <router-link
            v-for="item in menuItems"
            :key="'drawer-' + item.key"
            :to="item.to"
            class="drawer-nav-link"
            :class="{ 'drawer-nav-link-active': $route.name === item.key }"
            @click="handleDrawerLinkClick"
        >
          {{ t(item.label) }}
        </router-link>

        <!-- PlanActual en drawer móvil - disponible en todas las páginas -->
        <div class="drawer-plan">
          <PlanActual @plan-modal-open="handlePlanModalOpen" />
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
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <footer-content />
    </footer>

    <!-- Modal de planes GLOBAL - fuera del drawer -->
    <PlanesModal
        v-if="showPlansModal"
        @close="handlePlanModalClose"
        @select="handlePlanSelect"
    />
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
  margin-top: 1rem;
  padding: 1rem 0;
  border-top: 1px solid #e5e7eb;
}

/* Responsive */
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
}

@media (max-width: 480px) {
  .drawer-plan {
    margin-top: 0.5rem;
    padding: 0.5rem 0;
  }
}
</style>