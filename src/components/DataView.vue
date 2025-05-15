<!-- TODO: 保存的逻辑 -->

<template>
  <div class="page-container">
    <div class="side-controls">
      <el-tooltip content="添加新记录" placement="right">
        <el-button type="primary" circle @click="addRow">
          <el-icon>
            <Plus />
          </el-icon>
        </el-button>
      </el-tooltip>

      <el-tooltip content="删除选中记录" placement="right">
        <el-button type="danger" circle :disabled="!hasSelection" @click="deleteSelected">
          <el-icon>
            <Delete />
          </el-icon>
        </el-button>
      </el-tooltip>

      <el-tooltip content="对选中记录进行聚合分析" placement="right">
        <el-button type="warning" circle :disabled="!hasSelection" @click="analyzeSelected">
          <el-icon>
            <DataAnalysis />
          </el-icon>
        </el-button>
      </el-tooltip>
    </div>
    <div class="table-container">
      <div class="table-wrapper">
        <el-table :data="items" style="width: 100%" v-loading="loading" @selection-change="handleSelectionChange"
          height="calc(100vh - 200px)" :header-cell-style="{ background: '#f5f7fa' }" fixed-header>
          <el-table-column type="selection" width="55" fixed="left">
          </el-table-column>
          <el-table-column v-for="header in headers" :key="header.value" :prop="header.value" :label="header.text"
            sortable>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <el-button size="small" @click="handleView(scope.row)">
                查看
              </el-button>
              <el-button size="small" type="primary" @click="handleEdit(scope.row)">
                编辑
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <el-dialog v-model="showDialog" :title="editingItem ? '编辑记录' : '添加记录'" width="30%">
        <el-form :model="currentItem" label-width="100px">
          <el-form-item v-for="header in headers" :key="header.value" :label="header.text">
            <el-input v-model="currentItem[header.value]" :placeholder="getPlaceholder(header.value)" />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="showDialog = false">取消</el-button>
            <el-button type="primary" @click="saveItem">确认</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import Papa from 'papaparse';
import type { ElTable } from 'element-plus'
import { Plus, Delete, DataAnalysis } from '@element-plus/icons-vue'

interface Header {
  text: string;
  value: string;
}

interface TableItem {
  PID: string;
  性别: string;
  病理: string;
  'Oxford分型': string;
  亚组: string;
  [key: string]: string;
}

const loading = ref(true);
const items = ref<TableItem[]>([]);
const selectedItems = ref<TableItem[]>([]);
const showDialog = ref(false);
const currentItem = ref<Partial<TableItem>>({});
const editingItem = ref<TableItem | null>(null);

const headers: Header[] = [
  { text: "患者ID", value: "PID" },
  { text: "性别", value: "性别" },
  { text: "病理", value: "病理" },
  { text: "Oxford分型", value: "Oxford分型" },
  { text: "亚组", value: "亚组" }
];

const getPlaceholder = (field: string) => {
  switch (field) {
    case 'PID':
      return '例如: 001';
    case '性别':
      return 'M 或 F';
    case 'Oxford分型':
      return '例如: M1S1E0T0';
    case '亚组':
      return 'S';
    default:
      return '';
  }
};

const loadCsvData = async () => {
  try {
    const response = await fetch('/overview.csv');
    const csvText = await response.text();
    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    });
    items.value = result.data as TableItem[];
    loading.value = false;
  } catch (error) {
    console.error('Error loading CSV:', error);
    loading.value = false;
  }
};

const handleSelectionChange = (selection: TableItem[]) => {
  selectedItems.value = selection;
};

const addRow = () => {
  editingItem.value = null;
  currentItem.value = {};
  showDialog.value = true;
};

const deleteSelected = () => {
  if (!selectedItems.value.length) return;

  // 获取需要删除的ID列表
  const idsToDelete = selectedItems.value.map(item => item.PID);
  console.log('要删除的ID列表:', idsToDelete);

  // TODO: 实际删除逻辑
  items.value = items.value.filter(item =>
    !selectedItems.value.includes(item)
  );
};

const saveItem = () => {
  if (editingItem.value) {
    const index = items.value.indexOf(editingItem.value);
    if (index !== -1) {
      items.value[index] = { ...currentItem.value } as TableItem;
    }
  } else {
    items.value.push({ ...currentItem.value } as TableItem);
  }
  showDialog.value = false;
};

const saveChanges = async () => {
  const csv = Papa.unparse(items.value);
  localStorage.setItem('tableData', csv);
};

const router = useRouter();

const handleView = (row: TableItem) => {
  router.push(`/patient/${row.PID}`);
};

const handleEdit = (row: TableItem) => {
  editingItem.value = row;
  currentItem.value = { ...row };
  showDialog.value = true;
};

// 添加选择状态计算属性
const hasSelection = computed(() => selectedItems.value.length > 0);

// 添加聚合分析功能
const analyzeSelected = () => {
  if (!selectedItems.value.length) return;
  const idsToAnalyze = selectedItems.value.map(item => item.PID);
  router.push({
    name: 'EnsembleView',
    query: {
      ids: idsToAnalyze.join(',')
    }
  });
};

onMounted(() => {
  loadCsvData();
});
</script>

<style scoped>
.page-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
}

.side-controls {
  position: fixed;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 1000;
}

.table-container {
  width: 80%;
  margin: 0 auto;
  margin-top: 30px;
}


.table-wrapper {
  margin-bottom: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>