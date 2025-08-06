<script setup>
import Navbar from './components/Navbar.vue';
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();
const showPatientSelector = computed(() => route.path.startsWith('/patient/'));
</script>

<template>
  <div class="d-flex flex-column min-vh-100">
    <nav class="fixed-top">
      <Navbar :showPatientSelector="showPatientSelector" />
    </nav>

    <main class="flex-grow-1 mt-5 pt-3 w-100">
      <router-view></router-view>
    </main>
  </div>
</template>

<style scoped>
main {
  width: 90%;
  margin: auto;
  margin-top: 5rem;
}
</style>
