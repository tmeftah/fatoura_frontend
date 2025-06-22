import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from 'boot/axios'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref([])
  const isLoading = ref(false)
  const isAdding = ref(false)
  const isUpdating = ref(false)

  async function fetchSettings(key) {
    isLoading.value = true
    try {
      const res = await api.get(`/settings/`)
      settings.value = res.data
    } catch (e) {
      // handle as needed
      console.log(e)
    } finally {
      isLoading.value = false
    }
  }

  function fetchSetting(key) {
    return api.get(`/settings/${key}`).then((res) => res.data)
  }

  async function updateSetting(key, value) {
    isUpdating.value = true
    try {
      const payload = { key: key, value: value } //  Only send the value keyed against "value"
      console.log(payload)
      await api.put(`/settings/${key}`, payload)
      await fetchSettings()
    } finally {
      isUpdating.value = false
    }
  }

  async function deleteSetting(key) {
    isLoading.value = true
    try {
      await api.delete(`/settings/${key}`)
      await fetchSettings()
    } finally {
      isLoading.value = false
    }
  }

  return {
    settings,
    isLoading,
    isAdding,
    isUpdating,
    fetchSettings,
    fetchSetting,
    updateSetting,
    deleteSetting,
  }
})
