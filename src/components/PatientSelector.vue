<script setup>
import { computed } from 'vue';
import { usePatientStore } from '../stores/patientStore';

const patientStore = usePatientStore();
const patients = Array.from({ length: 36 }, (_, i) => `patient${i + 1}`);

const handlePatientChange = (patient) => {
  patientStore.setCurrentPatient(patient);
  patientStore.setLoading(true);
};

const selectedPatient = computed(() => patientStore.currentPatient);
</script>

<template>
  <li class="nav-item dropdown">
    <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
      当前患者：{{ selectedPatient }}
    </a>
    <ul class="dropdown-menu dropdown-menu-end" style="max-height: 280px; overflow-y: auto;">
      <li v-for="patient in patients" :key="patient">
        <a class="dropdown-item" href="#" @click="handlePatientChange(patient)">
          {{ patient }}
        </a>
      </li>
    </ul>
  </li>
</template>
