<script setup>
import { defineProps, onMounted, toRaw, computed, ref, watch } from 'vue';

const isLoading = ref(true);
const error = ref(null);

const props = defineProps({
    data: {
        type: Object,
        default: () => ({})
    },
});

// Check if data is loaded and valid
const isDataLoaded = computed(() => {
    return props.data && Object.keys(props.data).length > 0;
});


// Watch for data changes
watch(
    () => props.data,
    (newData) => {
        try {
            console.log('Data received:', toRaw(newData));
            if (Object.keys(newData).length > 0) {
                isLoading.value = false;
                error.value = null;
            }
        } catch (err) {
            console.error('Error processing data:', err);
            error.value = err.message;
            isLoading.value = false;
        }
    },
    { immediate: true, deep: true }
);

onMounted(() => {
    // Initial data check
    if (isDataLoaded.value) {
        isLoading.value = false;
    }
    console.log('Component mounted, data loaded:', isDataLoaded.value);
});
</script>
<template>
    <div class="container-fluid p-0">
        <div class="w-100 d-flex flex-row border-bottom align-items-center mb-2">
            <i class="fa fa-table"></i>
            <h5 class="ms-2">表格数据</h5>
        </div>
        <!-- Loading state -->
        <div v-if="isLoading" class="d-flex justify-content-center align-items-center my-5">
            <div class="spinner-border text-primary me-2" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <span class="text-primary">Loading data...</span>
        </div>
        <!-- Data table -->
        <div v-else class="table-responsive">
            <table class="table table-sm table-hover">
                <thead class="table-light">
                    <tr>
                        <th scope="col" class="text-center">序号</th>
                        <th scope="col">日期</th>
                        <th scope="col">药方</th>
                        <th v-for="col in getColumnNames(data)" :key="col" scope="col">
                            {{ col }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="visit in data.visits" :key="visit.visit_num">
                        <th scope="row" class="text-center">{{ visit.visit_num + 1 }}</th>
                        <td>{{ visit.date }}</td>
                        <td>{{ visit.scripts }}</td>
                        <td v-for="col in getColumnNames(data)" :key="col">
                            {{ getMetricValue(col, visit) }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

</template>
<script>
function getColumnNames(data) {
    // Get all keys from all metric groups
    const allKeys = new Set();
    const metrics = data.visits?.[0]?.metrics || {};
    if (!metrics) {
        return [];
    }

    // Iterate through each group (group1, group2, etc.)
    Object.values(metrics).forEach(group => {
        // Add each key from the group to our Set
        Object.keys(group).forEach(key => allKeys.add(key));
    });

    return Array.from(allKeys);
}

function getMetricValue(key, visit) {
    // Merge all metric values from all groups
    const mergedMetrics = Object.values(visit.metrics).reduce((acc, group) => {
        return { ...acc, ...group };
    }, {});

    // Return the value for the specified key
    return mergedMetrics[key] ?? '';
}

</script>
<style scoped>
.table-responsive {
    width: 100% !important;
    height: 300px;
    /* 固定高度 */
    overflow-y: auto;
    /* 垂直滚动 */
    overflow-x: auto;
    /* 水平滚动 */
}

.table {
    width: 100% !important;
    /* 强制宽度100% */
    margin-bottom: 0;
}

.table th {
    white-space: nowrap;
    position: sticky;
    top: 0;
    background: #f8f9fa;
    z-index: 1;
}

/* 保持表头宽度与内容列对齐 */
.table th,
.table td {
    min-width: 100px;
    /* 设置最小宽度 */
}

/* 第一列序号列宽度可以小一些 */
.table th:first-child,
.table td:first-child {
    min-width: 60px;
}
</style>