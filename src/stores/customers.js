import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'boot/axios'

export const useCustomersStore = defineStore('customers', () => {
  const customers = ref([])
  const isLoading = ref(false)
  const isSaving = ref(false)
  const isDeleting = ref(false)

  async function fetchCustomers() {
    isLoading.value = true
    try {
      const res = await api.get('/customers')
      customers.value = res.data
    } finally {
      isLoading.value = false
    }
  }

  async function fetchCustomer(id) {
    return await api.get(`/customers/${id}`).then((res) => res.data)
  }

  async function addCustomer(customer) {
    isSaving.value = true
    try {
      await api.post('/customers', customer)
      await fetchCustomers()
    } finally {
      isSaving.value = false
    }
  }

  async function updateCustomer(id, customer) {
    isSaving.value = true
    try {
      await api.put(`/customers/${id}`, customer)
      await fetchCustomers()
    } finally {
      isSaving.value = false
    }
  }

  async function deleteCustomer(id) {
    isDeleting.value = true
    try {
      await api.delete(`/customers/${id}`)
      await fetchCustomers()
    } finally {
      isDeleting.value = false
    }
  }

  return {
    customers,
    isLoading,
    isSaving,
    isDeleting,
    fetchCustomers,
    fetchCustomer,
    addCustomer,
    updateCustomer,
    deleteCustomer,
  }
})
