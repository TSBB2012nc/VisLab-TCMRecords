<script setup>
import { ref, onMounted } from 'vue';

const herbs = ref([]);

onMounted(async () => {
    const response = await fetch('/Table.json');
    herbs.value = await response.json();
});
</script>


<template>
    <div id="HerbTable" class="table-container table-responsive w-25">
        <table class="table table-hover w-100 table-light">
            <thead>
                <tr>
                    <th>药名</th>
                    <th>性味归经</th>
                    <th>功效</th>
                    <th>主治</th>
                    <th>教材分类</th>
                    <th>名医对于药物的用法</th>
                    <th>专家分类</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="herb in herbs" :key="herb.id">
                    <td>{{ herb['药名'] }}</td>
                    <td>{{ herb['性味归经'] }}</td>
                    <td>{{ herb['功效'] }}</td>
                    <td>{{ herb['主治'] }}</td>
                    <td>{{ herb['教材分类'] }}</td>
                    <td>{{ herb['名医对于药物的用法'] }}</td>
                    <td>{{ herb['专家分类'] }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<style>
.table-container {
  position: relative !important;
  right: 0;
  margin-left: auto;
}

.table-responsive {
  max-height: 100vh;
  overflow: scroll;
}
</style>
