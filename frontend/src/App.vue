<script setup>
import Navbar from './components/Navbar.vue';
import VisView from './components/VisView.vue';
</script>
<template>
  <div class="d-flex flex-column min-vh-100">
    <!-- Navbar with fixed height -->
    <nav class="fixed-top">
      <Navbar />
    </nav>
    
    <!-- Main content with top padding to account for fixed navbar -->
    <main class="flex-grow-1 mt-2 pt-3 w-100">
      <VisView />
    </main>
  </div>
</template>
