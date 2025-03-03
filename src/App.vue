<script setup lang="ts">
import  HelloWorld from './components/HelloWorld.vue';
// import MarkdownEditor from './components/MarkdownEditor.vue'
import MarkdownEditor from './components/MarkdownEditor.vue';
</script>

<template>
  <div class="app-container">
    <!-- <MarkdownEditor /> -->
    
    <HelloWorld />
    <MarkdownEditor></MarkdownEditor>
  </div>
</template>

<style scoped>
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  height: 90vh;
}
</style>
