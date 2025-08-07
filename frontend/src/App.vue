<script setup>
import Navbar from './components/Navbar.vue';
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();
const showPatientSelector = computed(() => route.path.startsWith('/patient/'));
const showFullWidth = computed(() => route.path === '/va');
</script>

<template>
  <div class="d-flex flex-column min-vh-100">
    <nav v-if="!showFullWidth" class="fixed-top">
      <Navbar :showPatientSelector="showPatientSelector" />
    </nav>

    <main v-if="showFullWidth" class="va-main">
      <router-view></router-view>
    </main>
    
    <main v-else class="flex-grow-1 mt-5 pt-3 standard-width">
      <router-view></router-view>
    </main>
  </div>
</template>

<style scoped>
.standard-width {
  width: 90%;
  margin: auto;
  margin-top: 5rem;
}

.va-main {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
