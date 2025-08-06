<!-- TODO: 保存的逻辑 -->

<template>
  <div class="page-container">
    <div class="side-controls">
      <el-tooltip content="添加新记录" placement="right">
        <el-button type="primary" circle @click="handleDisabledFeature('添加')" disabled>
          <el-icon>
            <Plus />
          </el-icon>
        </el-button>
      </el-tooltip>

      <el-tooltip content="删除选中记录" placement="right">
        <el-button type="danger" circle @click="handleDisabledFeature('删除')" disabled>
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
              <el-button size="small" type="primary" @click="handleDisabledFeature('编辑')" disabled>
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
import { Plus, Delete, DataAnalysis } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { 
  patientList, 
  isLoading, 
  loadPatientList,
  createPatient,
  updatePatient,
  deletePatient,
  checkApiHealth 
} from '../services/dataService';

interface Header {
  text: string;
  value: string;
}

interface TableItem {
  id: string;
  name: string;
  age: number;
  gender: string;
  diagnosis: string;
  visit_count: number;
  [key: string]: any;
}

const selectedItems = ref<TableItem[]>([]);
const showDialog = ref(false);
const currentItem = ref<Partial<TableItem>>({});
const editingItem = ref<TableItem | null>(null);
const apiConnected = ref(true);

// 更新表头以匹配后端数据结构
const headers: Header[] = [
  { text: "患者ID", value: "id" },
  { text: "姓名", value: "name" },
  { text: "年龄", value: "age" },
  { text: "性别", value: "gender" },
  { text: "诊断", value: "diagnosis" },
  { text: "就诊次数", value: "visit_count" }
];

const getPlaceholder = (field: string) => {
  switch (field) {
    case 'id':
      return '例如: 001';
    case 'name':
      return '患者姓名';
    case 'age':
      return '年龄';
    case 'gender':
      return 'M 或 F';
    case 'diagnosis':
      return '诊断信息';
    case 'visit_count':
      return '就诊次数';
    default:
      return '';
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

const deleteSelected = async () => {
  if (!selectedItems.value.length) return;

  try {
    // 批量删除选中的患者
    const deletePromises = selectedItems.value.map(item => deletePatient(item.id));
    await Promise.all(deletePromises);
    
    ElMessage({
      message: `成功删除 ${selectedItems.value.length} 条记录`,
      type: 'success'
    });
    
    selectedItems.value = [];
  } catch (error) {
    console.error('删除失败:', error);
    ElMessage({
      message: '删除失败，请重试',
      type: 'error'
    });
  }
};

const saveItem = async () => {
  try {
    if (editingItem.value) {
      // 更新现有患者
      await updatePatient(editingItem.value.id, currentItem.value);
      ElMessage({
        message: '更新成功',
        type: 'success'
      });
    } else {
      // 创建新患者
      await createPatient(currentItem.value);
      ElMessage({
        message: '添加成功',
        type: 'success'
      });
    }
    showDialog.value = false;
  } catch (error) {
    console.error('保存失败:', error);
    ElMessage({
      message: '保存失败，请重试',
      type: 'error'
    });
  }
};

const router = useRouter();

const handleView = (row: TableItem) => {
  router.push(`/patient/${row.id}`);
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
  const idsToAnalyze = selectedItems.value.map(item => item.id);
  router.push({
    name: 'EnsembleView',
    query: {
      ids: idsToAnalyze.join(',')
    }
  });
};

const handleDisabledFeature = (feature: string) => {
  ElMessage({
    message: `${feature}功能暂未开放`,
    type: 'warning'
  });
};

const items = computed(() => patientList.value)
const loading = computed(() => isLoading.value)

// 检查API连接状态
const checkConnection = async () => {
  try {
    const health = await checkApiHealth();
    apiConnected.value = health.status === 'OK';
  } catch (error) {
    console.error('API连接检查失败:', error);
    apiConnected.value = false;
  }
};

onMounted(async () => {
  await checkConnection();
  if (apiConnected.value) {
    await loadPatientList();
  } else {
    ElMessage({
      message: '无法连接到后端服务，请确保服务器正在运行',
      type: 'error',
      duration: 5000
    });
  }
})
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
  margin-top: 5rem;
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