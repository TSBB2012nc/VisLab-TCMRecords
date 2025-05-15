<script setup>
import Navbar from './components/Navbar.vue';
</script>

<template>
  <div class="d-flex flex-column min-vh-100">
    <nav class="fixed-top">
      <Navbar :showPatientSelector="false" />
    </nav>

    <main class="flex-grow-1 mt-5 pt-3 w-100">
      <router-view></router-view>
    </main>
  </div>
</template>

<style scoped>
main {
  padding: 1rem;
  width: 100%;
}
</style>
