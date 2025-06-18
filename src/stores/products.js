import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'boot/axios'

export const useProductsStore = defineStore('products', () => {
  const products = ref([])
  const isLoading = ref(false)
  const isAdding = ref(false)
  const isUpdating = ref(false)

  async function fetchProducts() {
    isLoading.value = true
    try {
      const res = await api.get('/products')
      products.value = res.data
    } catch (e) {
      // handle as needed
      console.log(e)
    } finally {
      isLoading.value = false
    }
  }

  function fetchProduct(id) {
    return api.get(`/products/${id}`).then((res) => res.data)
  }

  async function addProduct(product) {
    isAdding.value = true
    try {
      await api.post('/products', product)
      await fetchProducts()
    } finally {
      isAdding.value = false
    }
  }

  async function updateProduct(id, product) {
    isUpdating.value = true
    try {
      await api.put(`/products/${id}`, product)
      await fetchProducts()
    } finally {
      isUpdating.value = false
    }
  }

  async function deleteProduct(id) {
    isLoading.value = true
    try {
      await api.delete(`/products/${id}`)
      await fetchProducts()
    } finally {
      isLoading.value = false
    }
  }

  return {
    products,
    isLoading,
    isAdding,
    isUpdating,
    fetchProducts,
    fetchProduct,
    addProduct,
    updateProduct,
    deleteProduct,
  }
})
