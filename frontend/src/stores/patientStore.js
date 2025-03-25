import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePatientStore = defineStore('patient', () => {
  const currentPatient = ref('patient1')
  const isLoading = ref(false)

  const setCurrentPatient = (patient) => {
    currentPatient.value = patient
  }

  const setLoading = (status) => {
    isLoading.value = status
  }

  return {
    currentPatient,
    isLoading,
    setCurrentPatient,
    setLoading
  }
})