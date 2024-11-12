<script setup>
import TableView from './TableView.vue';
import { ref } from 'vue';

var isTableViewVisible = ref(false)
var toggleTableView = () => {
    isTableViewVisible.value = !isTableViewVisible.value;
  }

</script>

<template>
    <nav class="navbar navbar-expand-md navbar-dark w-100 bg-dark">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">中医病案可视分析</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarCollapse">
      <ul class="navbar-nav me-auto mb-2 mb-md-0">
        <!-- <li class="nav-item">
          <a class="nav-link active" aria-current="page" href="#">Home</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">Link</a>
        </li>
        <li class="nav-item">
          <a class="nav-link disabled" aria-disabled="true">Disabled</a>
        </li> -->
      </ul>
      <button class="btn btn-success me-2" type="submit">上传</button>
      <button @click="toggleTableView" :class="isTableViewVisible?'btn btn-success':'btn btn-outline-success'" type="submit">用药字典</button>
    </div>
  </div>
</nav>
<TableView v-if="isTableViewVisible"/>
</template>