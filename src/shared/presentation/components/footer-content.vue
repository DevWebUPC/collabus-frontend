<script setup>
  import {useI18n} from "vue-i18n";

  const { t } = useI18n();
</script>

<template>
  <div class="footer-simple">
    <p class="footer-text">{{ t('footer.copyright') }}</p>
  </div>
</template>

<style scoped>
.footer-simple {
  border-top: 1px solid #dee2e6;
  padding: 1rem;
  text-align: center;
  margin-top: auto;
}

.footer-text {
  margin: 0;
  color: #6c757d;
  font-size: 0.875rem;
}
</style>