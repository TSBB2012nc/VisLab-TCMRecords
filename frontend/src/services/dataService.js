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
    const patients = await apiClient.get('/patients')
    patientList.value = patients
    isLoading.value = false
    return patients
  } catch (error) {
    console.error('Failed to load patient list:', error)
    isLoading.value = false
    return []
  }
}

// 获取单个患者信息
export async function getPatient(patientId) {
  try {
    const patient = await apiClient.get(`/patients/${patientId}`)
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

    const data = await apiClient.post('/patients/batch-visits', { patientIds })
    patientDataMap.value = data
    isPatientDataLoaded.value = true
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
    const visits = await apiClient.get(`/patients/${patientId}/visits`)
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
    const [bookColorData, expColorData, medDataData, sympLocData, attrLocData] = 
      await Promise.all([
        apiClient.get('/data/book_color'),
        apiClient.get('/data/exp_color'),
        apiClient.get('/data/med_data'),
        apiClient.get('/data/symp_loc'),
        apiClient.get('/data/attr_loc')
      ])

    bookColor.value = bookColorData
    expColor.value = expColorData
    medData.value = medDataData
    sympLoc.value = sympLocData
    attrLoc.value = attrLocData

    isStaticDataLoaded.value = true
    return true
  } catch (error) {
    console.error('Error loading static data:', error)
    isStaticDataLoaded.value = false
    return false
  }
}

// 患者管理API (CRUD操作)
export async function createPatient(patientData) {
  try {
    const result = await apiClient.post('/patients', patientData)
    // 重新加载患者列表
    await loadPatientList()
    return result
  } catch (error) {
    console.error('Failed to create patient:', error)
    throw error
  }
}

export async function updatePatient(patientId, patientData) {
  try {
    const result = await apiClient.put(`/patients/${patientId}`, patientData)
    // 重新加载患者列表
    await loadPatientList()
    return result
  } catch (error) {
    console.error('Failed to update patient:', error)
    throw error
  }
}

export async function deletePatient(patientId) {
  try {
    const result = await apiClient.delete(`/patients/${patientId}`)
    // 重新加载患者列表
    await loadPatientList()
    return result
  } catch (error) {
    console.error('Failed to delete patient:', error)
    throw error
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
