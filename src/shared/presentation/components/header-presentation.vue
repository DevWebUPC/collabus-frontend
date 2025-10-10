<!-- shared/presentation/components/header-presentation.vue -->
<template>
  <div class="header-presentation">
    <div class="presentation-card">
      <!-- Logo y Título -->
      <div class="logo-section">
        <div class="logo">
          <span class="logo-icon">👥</span>
        </div>
        <h1 class="title">Collabus</h1>
      </div>

      <!-- Mensaje inspirador -->
      <div class="message-section">
        <p class="message-line">Colabora con los mejores</p>
        <p class="message-line">y ten buen éxito</p>
        <p class="message-line">de tus proyectos</p>
      </div>

      <!-- Línea decorativa -->
      <div class="divider">
        <div class="line"></div>
        <div class="arrow">❯</div>
        <div class="line"></div>
      </div>

      <!-- Estadísticas rápidas -->
      <div class="stats-section">
        <div class="stat-item">
          <span class="stat-number">500+</span>
          <span class="stat-label">Colaboradores</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">95%</span>
          <span class="stat-label">Éxito</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HeaderPresentation',
  setup() {
    return {
      // Podrías agregar props si necesitas datos dinámicos
    }
  }
}
</script>

<style scoped>
.header-presentation {
  width: 100%;
  margin-bottom: 2rem;
}

.presentation-card {
  background: linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%);
  border-radius: 16px;
  padding: 2rem;
  color: white;
  box-shadow: 0 8px 32px rgba(108, 99, 255, 0.3);
  position: relative;
  overflow: hidden;
}

/* Efecto de fondo decorativo */
.presentation-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  z-index: 1;
}

.presentation-card::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -10%;
  width: 150px;
  height: 150px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  z-index: 1;
}

/* Logo Section */
.logo-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 2;
}

.logo {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.logo-icon {
  font-size: 1.5rem;
}

.title {
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #FFFFFF 0%, #F0F0F0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Message Section */
.message-section {
  margin-bottom: 2rem;
  position: relative;
  z-index: 2;
}

.message-line {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  line-height: 1.3;
  text-align: center;
  opacity: 0.95;
}

.message-line:first-child {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.message-line:last-child {
  margin-top: 0.25rem;
  opacity: 0.9;
}

/* Divider */
.divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 2rem 0;
  position: relative;
  z-index: 2;
}

.line {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
}

.arrow {
  font-size: 1.2rem;
  opacity: 0.8;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateX(0);
  }
  40% {
    transform: translateX(5px);
  }
  60% {
    transform: translateX(3px);
  }
}

/* Stats Section */
.stats-section {
  display: flex;
  justify-content: space-around;
  position: relative;
  z-index: 2;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #FFFFFF 0%, #E0E0E0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 0.85rem;
  opacity: 0.9;
  font-weight: 500;
}

/* Efectos de hover */
.presentation-card {
  transition: all 0.3s ease;
}

.presentation-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(108, 99, 255, 0.4);
}

/* Responsive */
@media (max-width: 1200px) {
  .presentation-card {
    padding: 1.5rem;
  }

  .title {
    font-size: 1.8rem;
  }

  .message-line {
    font-size: 1.2rem;
  }

  .message-line:first-child {
    font-size: 1.4rem;
  }
}

@media (max-width: 768px) {
  .header-presentation {
    margin-bottom: 1.5rem;
  }

  .presentation-card {
    padding: 1.25rem;
    border-radius: 12px;
  }

  .logo-section {
    margin-bottom: 1rem;
  }

  .logo {
    width: 40px;
    height: 40px;
  }

  .logo-icon {
    font-size: 1.25rem;
  }

  .title {
    font-size: 1.6rem;
  }

  .message-section {
    margin-bottom: 1.5rem;
  }

  .message-line {
    font-size: 1.1rem;
  }

  .message-line:first-child {
    font-size: 1.3rem;
  }

  .divider {
    margin: 1.5rem 0;
  }

  .stat-number {
    font-size: 1.3rem;
  }

  .stat-label {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .presentation-card {
    padding: 1rem;
  }

  .logo-section {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .title {
    font-size: 1.4rem;
  }

  .message-line {
    font-size: 1rem;
  }

  .message-line:first-child {
    font-size: 1.2rem;
  }

  .stats-section {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>