<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useProjectsStore } from '../../application/projects.store.js';
import { useAuthStore } from '../../../iam/application/auth-store.js';
import { useProfileStore } from '../../../profile-management/application/profile-store.js';

const route = useRoute();
const projectsStore = useProjectsStore();
const authStore = useAuthStore();
const profileStore = useProfileStore();
const profilesStore = useProjectsStore();
const project = ref(null);
const loading = ref(true);

// 🔑 NUEVO: El estado que guarda qué roles están abiertos (sus IDs o índices)
const openRoles = ref([]);

// 🧡 NUEVO: Estados para los iconos de interacción
const isLiked = ref(false);
const isSaved = ref(false);

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// 🐝 NUEVO: Función para abrir o cerrar un rol
const toggleRole = (roleKey) => {
  const index = openRoles.value.indexOf(roleKey);
  if (index > -1) {
    // Cerrar: si está en la lista, lo quitamos
    openRoles.value.splice(index, 1);
  } else {
    // Abrir: si no está en la lista, lo agregamos
    openRoles.value.push(roleKey);
  }
};

// 🐝 NUEVO: Función para verificar si un rol está abierto
const isRoleOpen = (roleKey) => {
  return openRoles.value.includes(roleKey);
};

// 🧡 NUEVO: Funciones para manejar los iconos de interacción
const toggleLike = () => {
  isLiked.value = !isLiked.value;
  // Aquí podrías agregar lógica para guardar el like en tu backend
};

const toggleSave = async () => {
  const userId = authStore.currentUser?.id;
  let profileId = null;

  console.log('⭐ Toggle Save - UserId:', userId);

  if (userId) {
    if (!profileStore.allProfiles.length) {
      await profileStore.fetchAllProfiles();
    }
    const profile = profileStore.allProfiles.find(p => String(p.userId) === String(userId));
    profileId = profile?.id;
    console.log('👤 Profile found:', profile, 'ProfileId:', profileId);
  }

  const projectId = project.value?.id;

  console.log('📋 Toggle Save - ProfileId:', profileId, 'ProjectId:', projectId);

  if (!profileId || !projectId) {
    console.log('❌ No se pudo obtener profileId o projectId');
    alert('No se pudo obtener la información necesaria');
    return;
  }

  try {
    // 🔥 NUEVO: Verificar estado actual antes de cambiar
    const currentIsSaved = projectsStore.favorites.some(fav =>
        fav.profileId === profileId && fav.projectId === projectId
    );

    console.log('🔍 Current favorite status:', currentIsSaved);

    if (currentIsSaved) {
      // Ya está guardado, vamos a eliminar
      console.log('➖ Eliminando de favoritos...');
      await projectsStore.removeFavorite(profileId, projectId);
      isSaved.value = false;
      console.log('✅ Eliminado de favoritos');
    } else {
      // No está guardado, vamos a agregar
      console.log('➕ Agregando a favoritos...');
      await projectsStore.addFavorite(profileId, projectId);
      isSaved.value = true;
      console.log('✅ Agregado a favoritos');
    }
  } catch (error) {
    console.error('❌ Error al cambiar estado de favorito:', error);

    // 🔥 MEJORADO: Mensajes de error más específicos
    let errorMessage = 'Error al actualizar favoritos';
    if (error.response?.status === 400) {
      errorMessage = 'No se pudo agregar a favoritos (posible duplicado)';
    } else if (error.response?.data) {
      errorMessage = error.response.data;
    }

    alert(errorMessage);

    // Revertir el estado visual basado en el estado real
    const actualIsSaved = projectsStore.favorites.some(fav =>
        fav.profileId === profileId && fav.projectId === projectId
    );
    isSaved.value = actualIsSaved;
  }
};

onMounted(async () => {
  try {
    console.log('🟡 Iniciando carga del proyecto...');

    const projectId = route.params.id;
    console.log('🔍 Project ID:', projectId);

    // Obtener el userId del usuario autenticado
    const userId = authStore.currentUser?.id;
    console.log('👤 User ID:', userId);

    let profileId = null;
    if (userId) {
      if (!profileStore.allProfiles.length) {
        console.log('🔄 Cargando perfiles...');
        await profileStore.fetchAllProfiles();
      }
      const profile = profileStore.allProfiles.find(p => String(p.userId) === String(userId));
      profileId = profile?.id;
      console.log('📝 Profile ID:', profileId);
    }

    console.log('📡 Fetching project from store...');
    project.value = await projectsStore.fetchProjectById(projectId);

    console.log('✅ Proyecto cargado:', project.value);
    console.log('🎓 Academic Level:', project.value?.academicLevel);
    console.log('👥 Roles:', project.value?.roles);
    console.log('📊 Roles length:', project.value?.roles?.length);

    // Verificar si el proyecto ya está en favoritos
    if (profileId && project.value?.id) {
      console.log('⭐ Verificando favoritos...');
      await projectsStore.fetchFavorites(profileId);
      isSaved.value = projectsStore.favorites.some(fav => fav.projectId === project.value.id);
    }
  } catch (error) {
    console.error('❌ Error loading project:', error);
    console.error('Error details:', error.response?.data || error.message);
  } finally {
    loading.value = false;
    console.log('🏁 Carga completada');
  }
});

</script>

<template>
  <div class="project-detail-container">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <span>{{ $t('projects.detail.loading') }}</span>
    </div>

    <div v-else-if="project" class="project-content">
      <!-- 🧡 NUEVO: Contenedor para los iconos de interacción -->
      <div class="interaction-icons">
        <button
            class="icon-button"
            :class="{ 'saved': isSaved }"
            @click="toggleSave"
            aria-label="Guardar como favorito"
        >
          <span class="save-icon">{{ isSaved ? '📌' : '📍' }}</span>
        </button>
      </div>

      <div class="project-header">
        <h1 class="project-title">{{ project.title }}</h1>
        <div class="project-meta">
          <span class="meta-label">Publicado</span>
          <span class="meta-separator">•</span>
          <span class="author-name">{{ project.authorName || 'Usuario' }}</span>
          <span class="meta-separator">•</span>
          <span class="publish-date">{{ formatDate(project.createdAt) }}</span>
        </div>
      </div>

      <section class="project-section">
        <h2 class="section-title">Resumen del proyecto</h2>
        <p class="summary-text">{{ project.summary || project.description }}</p>
      </section>

      <div class="section-divider"></div>

      <section class="project-section">
        <h3 class="subsection-title">Nivel Académico</h3>
        <div class="academic-level">
          <strong>{{ project.academicLevel }}</strong>
        </div>
      </section>

      <div class="section-divider"></div>

      <section class="project-section">
        <h3 class="subsection-title">Roles Disponibles</h3>
        <div class="roles-container">
          <div
              v-for="(role, index) in project.roles"
              :key="role.id || index"
              class="role-card"
          >
            <div
                class="role-header"
                @click="toggleRole(role.id || index)"
                :class="{ 'is-open': isRoleOpen(role.id || index) }"
            >
              <h4 class="role-title">{{ role.title || role.name }}</h4>
              <span class="toggle-icon">{{ isRoleOpen(role.id || index) ? '▲' : '▼' }}</span>
            </div>

            <div
                v-show="isRoleOpen(role.id || index)"
                class="role-content"
            >
              <div class="role-cards-grid">
                <div
                    v-for="(card, cardIndex) in role.cards"
                    :key="card.id || cardIndex"
                    class="info-card"
                >
                  <h5 class="card-title">{{ card.title }}</h5>
                  <ul class="card-items">
                    <li
                        v-for="(item, itemIndex) in card.items"
                        :key="itemIndex"
                        class="card-item"
                    >
                      {{ item }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="section-divider"></div>

      <section class="project-section">
        <h3 class="subsection-title">Beneficios</h3>
        <ul class="benefits-list">
          <li
              v-for="(benefit, index) in project.benefits.split('\n').filter(b => b.trim())"
              :key="index"
              class="benefit-item"
          >
            <span class="benefit-icon">✓</span>
            <span class="benefit-text">{{ benefit }}</span>
          </li>
        </ul>
      </section>

      <div class="section-divider"></div>

      <section class="project-section">
        <h3 class="subsection-title">Habilidades Técnicas</h3>
        <div class="skills-container">
          <div
              v-for="(skill, index) in project.skills"
              :key="index"
              class="skill-item"
          >
            <span class="skill-text">{{ skill }}</span>
          </div>
        </div>
      </section>

    </div>

    <div v-else class="error-container">
      <p>No se pudo cargar la información del proyecto.</p>
    </div>
  </div>
</template>

<style scoped>
/* TODO EL CSS ANTERIOR VA AQUÍ, y al final le agregamos ESTO: */

/* 🧡 NUEVO: Estilos para los iconos de interacción */
.interaction-icons {
  position: absolute;
  top: 2rem;
  right: 2rem;
  display: flex;
  gap: 0.5rem;
  z-index: 10;
}

.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.icon-button:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.heart-icon, .save-icon {
  font-size: 1.2rem;
}

.icon-button.liked {
  background-color: #fef2f2;
  border-color: #fecaca;
}

.icon-button.saved {
  background-color: #f0f9ff;
  border-color: #bae6fd;
}

/* Roles Container */
.roles-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-top: 1rem;
}

.role-card {
  padding: 1.5rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.role-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 🍎 NUEVO: Estilo para el encabezado clickeable (role-header) */
.role-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer; /* Hace que se vea como que se puede hacer clic */
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--color-primary); /* La línea debajo del título */
  margin-bottom: 1rem; /* Espacio antes del contenido que se esconde */
  transition: background-color 0.2s;
}

.role-header:hover {
  background-color: #f1f5f9; /* Un pequeño cambio al pasar el mouse */
  border-radius: 8px 8px 0 0;
}

/* 🍎 MODIFICADO: Quitamos la línea del h4 original porque ya la tiene el role-header */
.role-card .role-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  padding-bottom: 0;
  border-bottom: none;
}

/* 🍎 NUEVO: Estilo para el icono de abrir/cerrar */
.toggle-icon {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--color-primary);
  margin-left: 1rem;
  min-width: 15px; /* Para que no se mueva el texto */
  transition: transform 0.3s ease;
}

/* 🍎 NUEVO: Estilo para el contenedor del contenido que se muestra/esconde */
.role-content {
  padding-top: 0.5rem;
}

/* Role Cards Grid */
.role-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 0; /* Lo ajustamos para que no tenga tanto espacio arriba */
}

/* ... (Todo el CSS restante continúa sin cambios) ... */

/* Añadir el resto del CSS de tu archivo, asegurándote de que no se repitan las clases que ya modificamos. */
/* Aquí está el resto del CSS para que lo tengas completo: */

.project-detail-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: #ffffff;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  position: relative; /* 🧡 NUEVO: Necesario para posicionar los iconos absolutamente */
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error State */
.error-container {
  text-align: center;
  padding: 4rem 2rem;
  color: #ef4444;
}

/* Project Header */
.project-header {
  margin-bottom: 2.5rem;
  text-align: center;
}

.project-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1rem 0;
  line-height: 1.2;
}

.project-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.95rem;
  flex-wrap: wrap;
}

.meta-label {
  font-weight: 500;
}

.meta-separator {
  color: #d1d5db;
}

.author-name {
  color: var(--color-primary);
  font-weight: 500;
}

.publish-date {
  color: #6b7280;
}

/* Sections */
.project-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.subsection-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.summary-text {
  font-size: 1.1rem;
  color: #4b5563;
  line-height: 1.7;
  text-align: justify;
}

/* Section Divider */
.section-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
  margin: 2rem 0;
}

/* Academic Level */
.academic-level {
  font-size: 1.1rem;
  color: var(--color-primary);
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid var(--color-primary);
}


/* Role Cards Grid */
.role-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.info-card {
  padding: 1.25rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: transform 0.2s ease;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.75rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.card-items {
  list-style: none;
  padding: 0;
  margin: 0;
}

.card-item {
  padding: 0.5rem 0;
  color: #4b5563;
  line-height: 1.5;
  border-bottom: 1px solid #f8fafc;
}

.card-item:last-child {
  border-bottom: none;
}

.card-item::before {
  content: "•";
  color: var(--color-primary);
  font-weight: bold;
  display: inline-block;
  width: 1em;
  margin-left: -1em;
}

/* Benefits List */
.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.benefit-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.benefit-item:last-child {
  border-bottom: none;
}

.benefit-icon {
  color: #10b981;
  font-weight: bold;
  font-size: 1.1rem;
  min-width: 20px;
}

.benefit-text {
  color: #4b5563;
  line-height: 1.6;
}

/* Skills Container */
.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

.skill-item {
  padding: 0.5rem 1rem;
  background: #e0f2fe;
  color: #0369a1;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid #bae6fd;
}



/* Responsive Design */
@media (max-width: 768px) {
  .project-detail-container {
    padding: 1rem;
  }

  .project-title {
    font-size: 2rem;
  }

  .project-meta {
    flex-direction: column;
    gap: 0.25rem;
  }

  .role-cards-grid {
    grid-template-columns: 1fr;
  }

  /* 🧡 NUEVO: Ajustes responsivos para los iconos */
  .interaction-icons {
    top: 1rem;
    right: 1rem;
  }

  .icon-button {
    width: 36px;
    height: 36px;
  }

  .summary-text {
    font-size: 1rem;
    text-align: left;
  }

  .role-card {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .project-title {
    font-size: 1.75rem;
  }

  .section-title {
    font-size: 1.3rem;
  }

  .subsection-title {
    font-size: 1.1rem;
  }

  .role-title {
    font-size: 1.1rem;
  }

  .info-card {
    padding: 1rem;
  }
}
</style>