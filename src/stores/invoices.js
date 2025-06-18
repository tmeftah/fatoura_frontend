import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'boot/axios'

import { useCustomersStore } from './customers'

export const useInvoicesStore = defineStore('invoices', () => {
  const invoices = ref([])
  const isLoading = ref(false)
  const isSaving = ref(false)
  const isDeleting = ref(false)
  const isPrinting = ref(false)

  async function fetchInvoices() {
    isLoading.value = true
    try {
      const response = await api.get('/invoices')
      invoices.value = response.data
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchInvoice(id) {
    return await api.get(`/invoices/${id}`).then((res) => res.data)
  }

  async function createInvoice(data) {
    isSaving.value = true
    try {
      const response = await api.post('/invoices', data)
      await fetchInvoices()
      return response.data
    } finally {
      isSaving.value = false
    }
  }

  async function updateInvoice(id, data) {
    isSaving.value = true
    try {
      await api.put(`/invoices/${id}`, data)
      await fetchInvoices()
    } finally {
      isSaving.value = false
    }
  }

  async function deleteInvoice(id) {
    isDeleting.value = true
    try {
      await api.delete(`/invoices/${id}`)
      await fetchInvoices()
    } finally {
      isDeleting.value = false
    }
  }

  async function printInvoice(id) {
    isPrinting.value = true
    try {
      const response = await api.post(
        `/generate_invoice2/${id}`,
        {},
        {
          responseType: 'blob', // Important!  Tells axios to expect a blob response.  Or 'arraybuffer' depending on your backend
        },
      )

      return response // Return the response to the component
    } catch (error) {
      console.error('Error printing invoice:', error)
      throw error // Re-throw the error so the component's catch block is executed.
    } finally {
      isPrinting.value = false
    }
  }

  // Search logic depends on useCustomersStore for display names
  function searchInvoices(term) {
    if (!term) return invoices.value
    term = term.toLowerCase()
    const customersStore = useCustomersStore()
    return invoices.value.filter((inv) => {
      const cust = customersStore.fetchCustomer(inv.customer_id)
      const name = cust?.name?.toLowerCase() || ''
      return (
        inv.invoice_number?.toLowerCase().includes(term) ||
        inv.invoice_date?.toLowerCase().includes(term) ||
        inv.due_date?.toLowerCase().includes(term) ||
        String(inv.customer_id).includes(term) ||
        name.includes(term)
      )
    })
  }

  return {
    invoices,
    isLoading,
    isSaving,
    isDeleting,
    fetchInvoices,
    fetchInvoice,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    searchInvoices,
    printInvoice,
  }
})
