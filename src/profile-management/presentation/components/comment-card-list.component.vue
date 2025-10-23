
<script setup lang="js">
import CommentCardItemComponent from "./comment-card-item.component.vue";
const props = defineProps({
  comments: {
    type: Array,
    default: () => []
  }
});
</script>


<template>
  <div class="comments-list">
    <CommentCardItemComponent
      v-for="comment in comments"
      :key="comment.id"
      :comment="comment"
    />
  </div>
</template>

<style scoped>
.comments-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}
</style>