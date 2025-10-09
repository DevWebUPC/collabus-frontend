<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import FooterContent from "./footer-content.vue";

const { t } = useI18n();

const menuItems = [
  { label: 'nav.home', to: '/home', key: 'home' },
  { label: 'nav.projects', to: '/projects', key: 'projects' },
  { label: 'nav.collaborators', to: '/collaborators', key: 'collaborators' },
  { label: 'nav.notifications', to: '/notifications', key: 'notifications' }
];

const drawer = ref(false);

const toggleDrawer = () => {
  drawer.value = !drawer.value;
};
</script>

<template>
  <div class="app-layout">
    <!-- Toast & Dialog Components -->
    <pv-toast/>
    <pv-confirm-dialog/>

        <!-- Mobile Drawer -->
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
      </div>
    </pv-drawer>

    <!-- Header -->
    <pv-toolbar class="header-toolbar">
      <template #start>
        <!-- Mobile Menu Button (solo visible en mobile) -->
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
        <!-- Desktop Navigation -->
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
        <router-link
          to='/profile'
          >
          <pv-avatar
            icon="pi pi-user"
            class="user-avatar"
            shape="circle"
          />
        </router-link>
      </template>
    </pv-toolbar>

    <!-- Main Content Area -->
    <main class="main-content" role="main">
      <div class="content-container">
        <router-view/>
      </div>
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <footer-content/>
    </footer>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 1rem;
}

.app-footer {
  margin-top: auto;
}

/* Header Styles */
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
  color: #6C63FF;
  font-weight: 700;
  font-size: 1.5rem;
}

.nav-container {
  display: flex;
  gap: 2rem;
  align-items: center;
}

/* Desktop Navigation - Visible by default */
.desktop-nav {
  display: flex;
}

/* Mobile Menu Button - Hidden by default */
.mobile-menu-btn {
  display: none;
  color: #6C63FF;
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
  color: #6C63FF;
}

.nav-link-active {
  color: #6C63FF;
  font-weight: 600;
  background-color: rgba(108, 99, 255, 0.1);
}

.user-avatar {
  color: white;
}

/* Mobile Drawer Styles */
.mobile-drawer {
  width: 280px;
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
  background-color: rgba(108, 99, 255, 0.05);
  color: #6C63FF;
}

.drawer-nav-link-active {
  color: #6C63FF;
  font-weight: 600;
  background-color: rgba(108, 99, 255, 0.1);
}

/* Responsive Styles */
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

  /* Hide desktop navigation */
  .desktop-nav {
    display: none;
  }

  /* Show mobile menu button */
  .mobile-menu-btn {
    display: inline-flex;
  }
}
</style>