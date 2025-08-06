<script setup>
import { defineProps, computed } from 'vue';
import { DataLine } from '@element-plus/icons-vue'

const props = defineProps({
    data: {
        type: Object,
        default: () => ({})
    },
});

const tableData = computed(() => {
    return Object.entries(props.data).map(([index, visit]) => {
        const scriptsText = Object.entries(visit.scripts || {})
            .map(([name, info]) => `${name}(${info.amount})`)
            .join('、');
        
        return {
            visit_num: parseInt(index) + 1,
            date: visit.date,
            creatinine: visit.metrics?.肌酐 ?? '/',
            protein_mg: visit.metrics?.蛋白量mg ?? '/',
            protein_qual: visit.metrics?.蛋白定性 ?? '/',
            blood_qual: visit.metrics?.血尿定性 ?? '/',
            scripts: scriptsText,
            herb_count: visit.味数,
            dose_count: visit.剂数,
            frequency: visit.频次 || '/',
            route: visit.途径
        };
    });
});

const columns = [
    { prop: 'visit_num', label: '诊次', width: '80', align: 'center' },
    { prop: 'date', label: '日期', width: '120' },
    {prop: 'creatinine', label: '肌酐', width: '100' },
    { prop: 'protein_mg', label: '蛋白量mg', width: '100' },
    { prop: 'protein_qual', label: '蛋白定性', width: '100' },
    { prop: 'blood_qual', label: '血尿定性', width: '100' },
    { prop: 'scripts', label: '药方', minWidth: '300' },
    { prop: 'herb_count', label: '味数', width: '80' },
    { prop: 'dose_count', label: '剂数', width: '80' },
    { prop: 'frequency', label: '频次', width: '80' },
    { prop: 'route', label: '途径', width: '120' }
];
</script>

<template>
    <div class="container-fluid p-0">
        <div class="section-title">
            <el-icon class="section-icon"><List /></el-icon>
            <span>看诊数据</span>
        </div>
        
        <el-table
            class="visit-table"
            :data="tableData"
            height="500"
            :border="true"
            stripe
        >
            <el-table-column
                v-for="col in columns"
                :key="col.prop"
                :prop="col.prop"
                :label="col.label"
                :width="col.width"
                :min-width="col.minWidth"
                :align="col.align"
            />
        </el-table>
    </div>
</template>

<style scoped>


.visit-table {
    width: 90%;
    margin: auto;
}

.el-table {
    --el-table-header-bg-color: var(--el-fill-color-light);
}

.el-table .cell {
    white-space: nowrap;
}
</style>