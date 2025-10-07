<template>
  <teleport to="body">
    <div class="pm-backdrop" @click.self="$emit('close')">
      <div class="pm-sheet" role="dialog" aria-modal="true" aria-label="Selecciona un plan">
        <header class="pm-header">
          <h2>Selecciona un plan</h2>
          <button class="pm-close" @click="$emit('close')" aria-label="Cerrar">✕</button>
        </header>

        <div class="pm-grid">
          <!-- GRATUITO -->
          <article class="card">
            <div class="card-head">
              <h3>Plan Gratuito</h3>
              <p class="price indigo">$0 <span>/ siempre gratis</span></p>
            </div>

            <hr class="sep" />

            <div class="section">
              <p class="section-title indigo">👤 Para Emprendedores</p>
              <ul class="list indigo">
                <li>✓ Hasta <b>5 proyectos activos</b></li>
                <li>✓ Mínimo <b>2 Reward</b></li>
                <li>✓ Invitar hasta <b>3 colaboradores</b></li>
                <li>✓ Hasta <b>3 tareas</b> y <b>2 hitos</b></li>
              </ul>
            </div>

            <div class="section">
              <p class="section-title indigo">🤝 Para Colaboradores</p>
              <ul class="list indigo">
                <li>✓ Solo participar hasta <b>2 proyectos</b></li>
                <li>✓ Completar hasta <b>2 tareas</b></li>
                <li>✓ Completar solo <b>2 tareas</b> de <b>2 hitos</b></li>
              </ul>
            </div>

            <button class="cta indigo" @click="select('Gratuito')">Seleccionar plan</button>
          </article>

          <!-- PREMIUM -->
          <article class="card">
            <div class="card-head">
              <h3>Plan Premium</h3>
              <p class="price orange">$5 <span>/ mensual</span></p>
            </div>

            <hr class="sep" />

            <div class="section">
              <p class="section-title orange">👤 Para Emprendedores</p>
              <ul class="list orange">
                <li>✓ <b>Proyectos ilimitados</b></li>
                <li>✓ <b>Reward</b> ilimitado</li>
                <li>✓ Mentorías y <b>soporte prioritario</b></li>
                <li>✓ <b>Tareas</b> e <b>hitos</b> ilimitados</li>
              </ul>
            </div>

            <div class="section">
              <p class="section-title orange">🤝 Para Colaboradores</p>
              <ul class="list orange">
                <li>✓ <b>Participación ilimitada</b> de proyectos</li>
                <li>✓ Completar <b>tareas ilimitadas</b></li>
                <li>✓ Completar diferentes tareas de <b>hitos ilimitados</b></li>
              </ul>
            </div>

            <button class="cta orange" @click="select('Premium')">Suscribirse ahora</button>
          </article>
        </div>

        <footer class="pm-foot">© CollabUs · 2025</footer>
      </div>
    </div>
  </teleport>
</template>

<script setup>
const emit = defineEmits(['close','select'])
function select(name){ emit('select', name) }
</script>

<style scoped>
/* Backdrop + Sheet */
.pm-backdrop{position:fixed;inset:0;background:rgba(16,18,30,.55);backdrop-filter:blur(6px);
  display:grid;place-items:center;padding:16px;z-index:1000}
.pm-sheet{width:min(1100px,100%);background:#fff;border-radius:22px;overflow:hidden;
  box-shadow:0 30px 80px rgba(0,0,0,.25);animation:pop .18s ease}
@keyframes pop{from{transform:translateY(10px) scale(.98);opacity:.6}to{transform:none;opacity:1}}

.pm-header{display:flex;align-items:center;justify-content:center;position:relative;
  padding:22px 56px;border-bottom:1px solid #f0f0f5}
.pm-header h2{margin:0;font-size:32px;color:#6c63ff;font-weight:900;letter-spacing:.2px}
.pm-close{position:absolute;right:18px;top:18px;width:40px;height:40px;border-radius:12px;border:none;
  background:#f4f4fe;cursor:pointer;font-size:18px}
.pm-close:hover{background:#ececff}

/* Grid de tarjetas */
.pm-grid{display:grid;grid-template-columns:1fr 1fr;gap:26px;padding:22px}
.card{background:#fff;border:1px solid #e6e7f2;border-radius:22px;padding:0 0 18px;
  box-shadow:0 14px 28px rgba(0,0,0,.06);overflow:hidden}
.card-head{padding:18px 22px 10px;text-align:center}
.card-head h3{margin:0 0 6px;font-size:18px;font-weight:800;color:#111827}
.price{margin:0 0 10px;font-weight:900;font-size:30px}
.price span{font-size:12px;color:#6b7280;font-weight:600}
.price.indigo{color:#5b61f6}
.price.orange{color:#ff8a3d}

.sep{border:none;border-top:1px solid #e6e7f2;margin:0}

.section{padding:14px 22px 4px}
.section-title{margin:0 0 4px;font-weight:800;font-size:14px}
.section-title.indigo{color:#5b61f6}
.section-title.orange{color:#ff8a3d}

.list{margin:4px 0 6px;padding-left:18px;line-height:1.55;color:#374151}
.list li{margin:8px 0}
.list.indigo b{color:#5b61f6}
.list.orange b{color:#ff8a3d}

.cta{margin:10px 18px 14px;width:calc(100% - 36px);padding:12px 16px;border:none;border-radius:999px;
  color:#fff;font-weight:800;cursor:pointer;box-shadow:0 10px 22px rgba(0,0,0,.08)}
.cta.indigo{background:#5b61f6}.cta.indigo:hover{background:#4c52f4}
.cta.orange{background:#ff8a3d}.cta.orange:hover{background:#ff7a1f}

.pm-foot{padding:14px 22px;text-align:center;font-size:12px;color:#8a8a96;border-top:1px solid #f0f0f5}

@media (max-width: 900px){ .pm-grid{grid-template-columns:1fr} }
</style>