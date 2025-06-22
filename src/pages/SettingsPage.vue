<template>
  <q-page class="settings-page">
    <!-- SETTINGS TABLE -->
    <div class="q-pa-lg settings-table-wrapper">
      <q-card flat class="settings-table-card desktop-table">
        <q-table
          flat
          :rows="settings"
          :columns="columns"
          row-key="key"
          :loading="isLoading"
          :rows-per-page-options="[5, 10, 20]"
          :rows-per-page="5"
          class="professional-table"
          style="border-radius: 12px"
        >
          <template v-slot:top>
            <div class="full-width row items-center q-pa-md">
              <q-icon name="settings" size="md" color="primary" class="q-mr-md" />
              <div class="text-h6 text-weight-medium">Application Settings</div>
              <q-space />
              <div class="text-caption text-grey-6">
                {{ settings.length }} Setting{{ settings.length !== 1 ? 's' : '' }}
              </div>
            </div>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <div class="row q-gutter-xs no-wrap">
                <q-btn
                  color="secondary"
                  icon="edit"
                  size="sm"
                  flat
                  round
                  @click="openUpdateDialog(props.row.key)"
                >
                  <q-tooltip>Edit Setting</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <template v-slot:loading>
            <q-inner-loading :showing="isLoading">
              <q-spinner-gears size="44px" color="primary" />
            </q-inner-loading>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- UPDATE SETTING DIALOG -->
    <q-dialog v-model="updateDialog" maximized persistent>
      <q-card class="product-form-card">
        <q-card-section class="product-form-header bg-secondary text-white">
          <div class="row items-center">
            <q-icon name="edit" size="md" class="q-mr-sm" />
            <div>
              <div class="text-h5 text-weight-bold">Update Setting</div>
              <div class="text-caption opacity-80">Modify setting value below</div>
            </div>
            <q-space />
            <q-btn icon="close" flat round v-close-popup />
          </div>
        </q-card-section>

        <q-card-section>
          <div class="row justify-center">
            <div class="col-12 col-md-10 col-lg-8">
              <form @submit.prevent="updateSettingValue">
                <q-card flat bordered class="form-section">
                  <q-card-section>
                    <div class="section-title">
                      <q-icon name="info" color="secondary" class="q-mr-sm" />
                      Setting Value
                    </div>

                    <div class="q-mt-md">
                      <q-input
                        v-model="updateValue"
                        :label="`New value for ${updateKey}`"
                        outlined
                        type="textarea"
                        rows="3"
                        class="form-input"
                        dense
                        autofocus
                      />
                    </div>
                  </q-card-section>
                </q-card>

                <q-card-actions class="product-form-actions q-pa-md q-gutter-x-md">
                  <q-btn flat label="Cancel" color="grey-7" size="md" v-close-popup />
                  <q-space />
                  <q-btn
                    type="submit"
                    color="secondary"
                    label="Update"
                    unelevated
                    :loading="isUpdating"
                    icon-right="save"
                    size="md"
                  />
                </q-card-actions>
              </form>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useSettingsStore } from 'stores/settings'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const isLoading = ref(false)
const isUpdating = ref(false) // For loading indicator on Update button in dialog

const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

const columns = [
  { name: 'key', label: 'Setting', field: 'key', align: 'left' },
  { name: 'value', label: 'Value', field: 'value', align: 'left' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right' },
]

// Update Dialog related refs
const updateDialog = ref(false)
const updateKey = ref('')
const updateValue = ref('')

const openUpdateDialog = (key) => {
  updateKey.value = key
  updateValue.value = getSettingValue(key)
  updateDialog.value = true
}

const getSettingValue = (key) => {
  const setting = settings.value.find((setting) => setting.key === key)
  return setting ? setting.value : '' // Return empty string if not found
}

const updateSettingValue = async () => {
  isUpdating.value = true
  try {
    await settingsStore.updateSetting(updateKey.value, updateValue.value)
    updateDialog.value = false
    $q.notify({
      message: 'Setting updated successfully!',
      color: 'positive',
      icon: 'check',
    })
  } catch (error) {
    console.error('Error updating setting:', error)
    $q.notify({
      message: `Error updating setting: ${error.message}`,
      color: 'negative',
      icon: 'warning',
    })
  } finally {
    isUpdating.value = false
  }
}

onMounted(async () => {
  isLoading.value = true
  try {
    await settingsStore.fetchSettings()
  } catch (error) {
    console.error('Error fetching settings:', error)
    $q.notify({
      message: `Error fetching settings: ${error.message}`,
      color: 'negative',
      icon: 'warning',
    })
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.settings-page {
  background: linear-gradient(135deg, #f8fafb 0%, #f1f6fe 100%);
  min-height: 100vh;
}

.settings-table-wrapper {
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.settings-table-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-bottom: 4vw;
}

.page-header {
  padding-bottom: 0 !important;
}

.professional-table .q-table__top {
  border-bottom: 1px solid #e0e0e0;
}

.product-form-header {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}

.form-section {
  background: #fbfbfe;
  border-radius: 8px;
  border: 1px solid #e9edfb;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #37474f;
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.form-input {
  margin-bottom: 12px;
}

.product-form-actions {
  background: #f7faff;
  border-top: 1px solid #e0e0e0;
  border-radius: 0 0 12px 12px;
}
</style>
