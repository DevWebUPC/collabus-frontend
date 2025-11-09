<template>
  <section class="pa-card">
  <h3 class="pa-title">{{ $t('subscription.currentPlan.title') }}</h3>

    <pv-button
        class="pa-circle"
        @click="openPlansModal"
        :aria-label="$t('subscription.currentPlan.ariaLabel')"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
    >
      <span class="pa-circle__title">{{ isHovered ? $t('subscription.currentPlan.change') : $t('subscription.currentPlan.plan') }}</span>
      <span class="pa-circle__name">{{ isHovered ? $t('subscription.currentPlan.changeSuffix') : $t('subscription.plans.' + currentPlan) }}</span>
    </pv-button>

  <p class="pa-hint">{{ $t('subscription.currentPlan.hint') }}</p>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

// Emit para comunicarse con el componente padre
const emit = defineEmits(['plan-modal-open']);

// Estado reactivo para el plan actual
const currentPlan = ref('Gratuito');
const isHovered = ref(false);

// Computed para verificar si es premium
const isPremium = computed(() => currentPlan.value === 'Premium');

// Cargar plan desde localStorage al montar el componente
onMounted(() => {
  const savedPlan = localStorage.getItem('plan');
  if (savedPlan) {
    currentPlan.value = savedPlan;
  }
});

// Función para abrir el modal de planes
function openPlansModal() {
  // Emitir evento para que el layout maneje la apertura del modal
  emit('plan-modal-open');
}
</script>

<style scoped>
.pa-card{
  background:var(--color-white, #ffffff);
  border-radius:20px;
  padding:20px 18px 28px;
  box-shadow:0 10px 30px rgba(0,0,0,.08);
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:14px
}
.pa-title{
  margin:0;
  font-size:20px;
  font-weight:700;
  color:#5b61f6
}
.pa-circle{
  width:220px;
  height:220px;
  border-radius:999px;
  border:none;
  cursor:pointer;
  color:var(--color-white, #ffffff);
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  background:radial-gradient(110% 110% at 60% 30%,#7c84ff 0%,#5b61f6 45%,#4a2ff1 100%);
  box-shadow:0 16px 40px rgba(91,97,246,.35), inset 0 2px 8px rgba(255,255,255,.25);
  transition:transform .18s ease, box-shadow .18s ease, filter .18s ease, background .18s ease;
}
.pa-circle:hover{
  transform:translateY(-2px) scale(1.02);
  filter:saturate(1.08);
  background:radial-gradient(110% 110% at 60% 30%,#333 0%,#222 45%,#000 100%);
}
.pa-circle__title{
  font-size:18px;
  font-weight:600
}
.pa-circle__name{
  font-size:28px;
  font-weight:800
}
.pa-hint{
  margin:0;
  font-size:12px;
  color:#7a7a7a
}
@media (max-width:480px){
  .pa-circle{
    width:180px;
    height:180px
  }
  .pa-circle__name{
    font-size:24px
  }
}
</style>