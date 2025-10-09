<script setup lang="js">
import {Rating as PvRating} from 'primevue'
/*Se necesita un objeto usuario para enlazar los comentarios.
* Este comentario será removido para la versión final.*/
const commentInfo = {
  img: "",
  name: "Mike",
  date: "13/09/2025",
  ratingValue: 4.5,
  comment: "Trabaja bien, no tarda tanto como los demas. Excelente trabajo."
}
</script>

<template>
  <div class="border-2 flex flex-row justify-between gap-2">
    <div>
      <div><img src='{{commentInfo.img}}' alt='Profile Image'/></div>
      <div>{{commentInfo.name}}</div>
    </div>
    <div>
      <div>
        <pv-rating v-model="commentInfo.ratingValue" readonly/>
        <span>{{commentInfo.ratingValue}}</span>
      </div>
      <div>
        <p>
          {{commentInfo.comment}}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>