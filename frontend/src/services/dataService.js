import { ref } from 'vue'
import { apiClient } from './apiClient.js'

// 响应式数据存储
export const patientList = ref([])
export const currentPatient = ref(null)
export const isLoading = ref(true)

export const bookColor = ref({})
export const expColor = ref({})
export const medData = ref({})
export const sympLoc = ref({})
export const attrLoc = ref({})
export const isStaticDataLoaded = ref(false)
export const patientDataMap = ref({})
export const isPatientDataLoaded = ref(false)

// 患者列表相关API
export async function loadPatientList() {
  try {
    isLoading.value = true
    const response = await apiClient.get('/patients')
    patientList.value = response.patients || []
    isLoading.value = false
    return response.patients || []
  } catch (error) {
    console.error('Failed to load patient list:', error)
    isLoading.value = false
    return []
  }
}

// 获取单个患者信息
export async function getPatient(patientId) {
  try {
    const patient = await apiClient.get(`/patient/${patientId}`)
    return patient
  } catch (error) {
    console.error(`Failed to load patient ${patientId}:`, error)
    return null
  }
}

// 批量加载患者访问数据
export async function loadPatientData(patientIds) {
  try {
    if (!Array.isArray(patientIds) || patientIds.length === 0) {
      console.error('Invalid patientIds provided to loadPatientData')
      return false
    }

    console.log(`正在批量加载 ${patientIds.length} 个患者的数据...`)
    isPatientDataLoaded.value = false
    
    // 并行获取所有患者的详细数据
    const promises = patientIds.map(async (patientId) => {
      try {
        const patientData = await getPatient(patientId)
        return { patientId, data: patientData }
      } catch (error) {
        console.warn(`Failed to load patient ${patientId}:`, error)
        return { patientId, data: null }
      }
    })

    const results = await Promise.all(promises)
    
    // 构建患者数据映射
    const dataMap = {}
    let successCount = 0
    
    results.forEach(({ patientId, data }) => {
      if (data && data.records) {
        // 转换数据格式为组件期望的格式
        const patientRecords = {}
        data.records.forEach((record, index) => {
          // 确保 scripts 存在且不为空
          if (record.scripts && typeof record.scripts === 'object') {
            patientRecords[index + 1] = {
              date: record.date,
              metrics: record.metrics || {},
              scripts: record.scripts
            }
          }
        })
        
        // 只有当有有效记录时才添加到数据映射中
        if (Object.keys(patientRecords).length > 0) {
          dataMap[patientId] = patientRecords
          successCount++
        } else {
          console.warn(`No valid records with scripts for patient ${patientId}`)
        }
      } else {
        console.warn(`No valid data for patient ${patientId}`, data)
      }
    })

    patientDataMap.value = dataMap
    isPatientDataLoaded.value = true
    
    console.log(`批量加载完成：成功加载 ${successCount}/${patientIds.length} 个患者的数据`)
    return true
  } catch (error) {
    console.error('Failed to load patient data:', error)
    isPatientDataLoaded.value = false
    return false
  }
}

// 获取单个患者的访问数据
export async function getPatientVisits(patientId) {
  try {
    const visits = await apiClient.get(`/patient/${patientId}/timeline`)
    return visits
  } catch (error) {
    console.error(`Failed to load patient visits for ${patientId}:`, error)
    return null
  }
}

// 加载静态配置数据
export async function loadStaticData() {
  try {
    // 并行获取所有静态数据
    const [colorsData, attrLocData, medDataData] = 
      await Promise.all([
        apiClient.get('/vis/colors'),
        apiClient.get('/vis/attr-locations'),
        apiClient.get('/medicines')
      ])

    bookColor.value = colorsData['book-color'] || {}
    expColor.value = colorsData['exp-color'] || {}
    sympLoc.value = colorsData['symp-loc'] || {}
    attrLoc.value = attrLocData.data || {}
    medData.value = {}
    if (medDataData.medicines) {
      // 转换为以名称为key的对象格式
      medDataData.medicines.forEach(med => {
        medData.value[med.name] = med
      })
    }

    isStaticDataLoaded.value = true
    return true
  } catch (error) {
    console.error('Error loading static data:', error)
    isStaticDataLoaded.value = false
    return false
  }
}

// 患者管理API (CRUD操作) - 暂时禁用，使用模拟响应
export async function createPatient(patientData) {
  try {
    // 暂时返回成功响应，实际后端未实现此功能
    console.warn('创建患者功能暂未实现，返回模拟成功响应');
    return { success: true, message: '创建功能暂未开放' };
  } catch (error) {
    console.error('Failed to create patient:', error);
    throw error;
  }
}

export async function updatePatient(patientId, patientData) {
  try {
    // 暂时返回成功响应，实际后端未实现此功能
    console.warn('更新患者功能暂未实现，返回模拟成功响应');
    return { success: true, message: '编辑功能暂未开放' };
  } catch (error) {
    console.error('Failed to update patient:', error);
    throw error;
  }
}

export async function deletePatient(patientId) {
  try {
    // 暂时返回成功响应，实际后端未实现此功能
    console.warn('删除患者功能暂未实现，返回模拟成功响应');
    return { success: true, message: '删除功能暂未开放' };
  } catch (error) {
    console.error('Failed to delete patient:', error);
    throw error;
  }
}

// 静态数据管理API
export async function updateStaticData(dataType, data) {
  try {
    const result = await apiClient.put(`/data/${dataType}`, { data })
    // 重新加载静态数据
    await loadStaticData()
    return result
  } catch (error) {
    console.error(`Failed to update ${dataType} data:`, error)
    throw error
  }
}

// 健康检查API
export async function checkApiHealth() {
  try {
    const health = await apiClient.get('/health')
    return health
  } catch (error) {
    console.error('API health check failed:', error)
    return { status: 'ERROR', error: error.message }
  }
}
