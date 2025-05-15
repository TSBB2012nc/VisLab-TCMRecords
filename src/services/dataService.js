import { ref } from 'vue'
import Papa from 'papaparse'

export const patientList = ref([])
export const currentPatient = ref(null)
export const isLoading = ref(true)

export async function loadPatientList() {
  try {
    const response = await fetch('/overview.csv')
    const csvText = await response.text()
    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    })
    patientList.value = result.data
    isLoading.value = false
    return patientList.value
  } catch (error) {
    console.error('Failed to load patient list:', error)
    isLoading.value = false
    return []
  }
}

export async function loadPatientData(patientId) {
  try {
    const response = await fetch(`/data/patients/${patientId}.json`)
    currentPatient.value = await response.json()
    return currentPatient.value
  } catch (error) {
    console.error('Failed to load patient data:', error)
    return null
  }
}
