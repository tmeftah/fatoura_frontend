<template>
  <q-page class="customers-page">
    <!-- Header Section -->
    <div class="page-header q-pa-lg">
      <div class="row items-center justify-between">
        <div>
          <h4 class="text-h4 text-weight-bold q-ma-none text-primary">Customer Management</h4>
          <p class="text-subtitle1 text-grey-7 q-mb-none">Manage your customer database</p>
        </div>
        <q-btn
          color="primary"
          label="Add Customer"
          icon="person_add"
          size="lg"
          unelevated
          @click="openAddCustomerDialog"
        />
      </div>
    </div>

    <!-- Search Section -->
    <div class="q-pa-lg">
      <q-card flat class="search-card">
        <q-card-section class="q-pa-lg">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-8">
              <q-input
                v-model="search"
                placeholder="Search customers by name, email, phone, or address..."
                debounce="500"
                outlined
                dense
                class="search-input"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="grey-6" />
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Customers Table -->
    <div class="q-pa-lg">
      <q-card flat class="customers-table-card">
        <q-table
          :rows="filteredCustomers"
          :columns="columns"
          row-key="id"
          flat
          :loading="isLoading"
          :rows-per-page-options="[10, 25, 50]"
          class="professional-table"
        >
          <template v-slot:top>
            <div class="full-width row items-center q-pa-md">
              <q-icon name="people" size="md" color="primary" class="q-mr-md" />
              <div class="text-h6 text-weight-medium">All Customers</div>
              <q-space />
              <div class="text-caption text-grey-6">
                {{ filteredCustomers.length }} customer{{
                  filteredCustomers.length !== 1 ? 's' : ''
                }}
              </div>
            </div>
          </template>

          <template v-slot:body-cell-name="props">
            <q-td :props="props">
              <div class="text-weight-medium text-primary">{{ props.value }}</div>
            </q-td>
          </template>

          <template v-slot:body-cell-email="props">
            <q-td :props="props">
              <div class="text-weight-medium">{{ props.value }}</div>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <div class="row q-gutter-xs no-wrap">
                <q-btn
                  color="primary"
                  icon="visibility"
                  size="sm"
                  flat
                  round
                  @click="viewCustomer(props.row)"
                >
                  <q-tooltip>View Customer</q-tooltip>
                </q-btn>
                <q-btn
                  color="secondary"
                  icon="edit"
                  size="sm"
                  flat
                  round
                  @click="editCustomer(props.row)"
                >
                  <q-tooltip>Edit Customer</q-tooltip>
                </q-btn>
                <q-btn
                  color="negative"
                  icon="delete"
                  size="sm"
                  flat
                  round
                  @click="deleteCustomer(props.row)"
                >
                  <q-tooltip>Delete Customer</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <template v-slot:loading>
            <q-inner-loading :showing="isLoading">
              <q-spinner-gears size="50px" color="primary" />
            </q-inner-loading>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- Add/Edit Customer Dialog -->
    <q-dialog v-model="addCustomerDialog" maximized persistent>
      <q-card class="customer-form-card">
        <q-card-section class="customer-form-header bg-primary text-white">
          <div class="row items-center">
            <q-icon name="person" size="md" class="q-mr-md" />
            <div>
              <div class="text-h5 text-weight-bold">
                {{ editingCustomerId ? 'Edit Customer' : 'Add New Customer' }}
              </div>
              <div class="text-caption opacity-80">
                {{
                  editingCustomerId
                    ? 'Update customer details'
                    : 'Fill in the customer information below'
                }}
              </div>
            </div>
            <q-space />
            <q-btn icon="close" flat round v-close-popup />
          </div>
        </q-card-section>

        <q-card-section class="q-pa-xl">
          <div class="row justify-center">
            <div class="col-12 col-md-8 col-lg-6">
              <q-card flat bordered class="form-section">
                <q-card-section>
                  <div class="section-title">
                    <q-icon name="contact_page" color="primary" class="q-mr-sm" />
                    Customer Information
                  </div>

                  <q-form ref="customerFormRef" @submit="saveCustomer">
                    <div class="q-mt-lg">
                      <q-input
                        v-model="customerForm.name"
                        label="Customer Name *"
                        outlined
                        class="form-input q-mb-lg"
                        :rules="nameRules"
                        lazy-rules
                      />
                      <q-input
                        v-model="customerForm.email"
                        label="Email Address"
                        type="email"
                        outlined
                        class="form-input q-mb-lg"
                        :rules="emailRules"
                        lazy-rules
                      />
                      <q-input
                        v-model="customerForm.phone"
                        label="Phone Number"
                        outlined
                        class="form-input q-mb-lg"
                        :rules="phoneRules"
                        lazy-rules
                        mask="phone"
                        hint="Format: (123) 456-7890 or +1234567890"
                      />
                      <q-input
                        v-model="customerForm.address"
                        label="Address"
                        type="textarea"
                        outlined
                        rows="3"
                        class="form-input"
                      />
                    </div>
                  </q-form>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-card-actions class="customer-form-actions q-pa-xl">
          <q-btn flat label="Cancel" color="grey-7" size="lg" v-close-popup />
          <q-space />
          <q-btn
            color="primary"
            :label="editingCustomerId ? 'Update Customer' : 'Add Customer'"
            size="lg"
            unelevated
            @click="saveCustomer"
            :loading="isSaving"
            icon-right="save"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- View Customer Dialog -->
    <q-dialog v-model="viewCustomerDialog" maximized>
      <q-card class="customer-view-card">
        <q-card-section class="customer-view-header bg-grey-1">
          <div class="row items-center">
            <q-icon name="person_outline" size="md" color="primary" class="q-mr-md" />
            <div>
              <div class="text-h5 text-weight-bold text-grey-8">Customer Details</div>
              <div class="text-subtitle2 text-grey-6">{{ viewedCustomer.name }}</div>
            </div>
            <q-space />
            <q-btn icon="close" flat round v-close-popup />
          </div>
        </q-card-section>

        <q-card-section class="q-pa-xl">
          <div class="row justify-center">
            <div class="col-12 col-md-8 col-lg-6">
              <!-- Customer Information -->
              <q-card flat bordered class="view-section">
                <q-card-section>
                  <div class="section-title q-mb-md">Customer Information</div>
                  <div class="customer-info">
                    <div class="info-item">
                      <div class="info-label">
                        <q-icon name="person" class="q-mr-sm" />
                        Full Name
                      </div>
                      <div class="info-value">{{ viewedCustomer.name }}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">
                        <q-icon name="email" class="q-mr-sm" />
                        Email Address
                      </div>
                      <div class="info-value">{{ viewedCustomer.email || 'Not provided' }}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">
                        <q-icon name="phone" class="q-mr-sm" />
                        Phone Number
                      </div>
                      <div class="info-value">{{ viewedCustomer.phone || 'Not provided' }}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">
                        <q-icon name="location_on" class="q-mr-sm" />
                        Address
                      </div>
                      <div class="info-value">{{ viewedCustomer.address || 'Not provided' }}</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-card-actions class="q-pa-xl">
          <q-space />
          <q-btn
            color="primary"
            label="Edit Customer"
            icon="edit"
            outline
            size="lg"
            @click="editCustomerFromView"
          />
          <q-btn flat label="Close" color="grey-7" size="lg" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="deleteConfirmationDialog">
      <q-card class="delete-dialog">
        <q-card-section class="text-center q-pt-xl">
          <q-icon name="warning" size="4rem" color="negative" />
          <div class="text-h6 q-mt-md">Confirm Delete</div>
          <div class="text-body2 text-grey-7 q-mt-sm">
            Are you sure you want to delete this customer? This action cannot be undone.
          </div>
        </q-card-section>

        <q-card-actions class="q-pa-lg">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup class="q-mr-sm" />
          <q-space />
          <q-btn
            color="negative"
            label="Delete Customer"
            unelevated
            @click="confirmDeleteCustomer"
            :loading="isDeleting"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useCustomersStore } from 'stores/customers'

const $q = useQuasar()
const customerFormRef = ref(null)
const search = ref('')
const addCustomerDialog = ref(false)
const viewCustomerDialog = ref(false)
const deleteConfirmationDialog = ref(false)
const viewedCustomer = ref({})
const editingCustomerId = ref(null)
const customerForm = ref({ name: '', address: '', email: '', phone: '' })
const customerToDelete = ref(null)

const customersStore = useCustomersStore()

const isLoading = computed(() => customersStore.isLoading)
const isSaving = computed(() => customersStore.isSaving)
const isDeleting = computed(() => customersStore.isDeleting)
const customers = computed(() => customersStore.customers)

// Validation rules
const nameRules = [
  (val) => (val && val.length > 0) || 'Name is required',
  (val) => (val && val.length >= 2) || 'Name must be at least 2 characters long',
  (val) => (val && val.length <= 100) || 'Name must be less than 100 characters',
]

const emailRules = [
  (val) =>
    !val || val.length === 0 || /.+@.+\..+/.test(val) || 'Please enter a valid email address',
  (val) =>
    !val || val.length === 0 || val.length <= 100 || 'Email must be less than 100 characters',
]

const phoneRules = [
  (val) => !val || val.length === 0 || isValidPhone(val) || 'Please enter a valid phone number',
]

// Phone validation function
function isValidPhone(phone) {
  if (!phone) return true // Optional
  const cleanPhone = phone.replace(/\D/g, '')
  if (cleanPhone.length < 10 || cleanPhone.length > 15) return false
  const phonePattern = /^[+]?[1-9][\d]{0,15}$/
  return phonePattern.test(cleanPhone)
}

const columns = [
  {
    name: 'name',
    align: 'left',
    label: 'Customer Name',
    field: 'name',
    sortable: true,
    style: 'width: 200px',
  },
  {
    name: 'email',
    align: 'left',
    label: 'Email',
    field: 'email',
    sortable: true,
    style: 'width: 200px',
  },
  {
    name: 'phone',
    align: 'left',
    label: 'Phone',
    field: 'phone',
    sortable: true,
    style: 'width: 150px',
  },
  {
    name: 'address',
    align: 'left',
    label: 'Address',
    field: 'address',
    sortable: true,
    style: 'width: 250px',
  },
  {
    name: 'actions',
    align: 'center',
    label: 'Actions',
    field: 'actions',
    style: 'width: 150px',
  },
]

onMounted(() => {
  customersStore.fetchCustomers()
})

const filteredCustomers = computed(() => {
  if (!search.value) return customers.value
  const searchTerm = search.value.toLowerCase()
  return customers.value.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm) ||
      (customer.address && customer.address.toLowerCase().includes(searchTerm)) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm)) ||
      (customer.phone && customer.phone.toLowerCase().includes(searchTerm)),
  )
})

function openAddCustomerDialog() {
  editingCustomerId.value = null
  customerForm.value = { name: '', address: '', email: '', phone: '' }
  addCustomerDialog.value = true
}

async function viewCustomer(customer) {
  try {
    viewedCustomer.value = await customersStore.fetchCustomer(customer.id)
    viewCustomerDialog.value = true
  } catch (error) {
    console.log(error)
    $q.notify({
      color: 'red-5',
      textColor: 'white',
      icon: 'warning',
      message: 'Failed to load customer details',
    })
  }
}

function editCustomer(customer) {
  editingCustomerId.value = customer.id
  customerForm.value = { ...customer }
  addCustomerDialog.value = true
}

function editCustomerFromView() {
  viewCustomerDialog.value = false
  editCustomer(viewedCustomer.value)
}

async function saveCustomer() {
  // Validate form
  if (!customerForm.value.name || customerForm.value.name.trim().length < 2) {
    $q.notify({
      color: 'red-5',
      textColor: 'white',
      icon: 'warning',
      message: 'Customer name is required and must be at least 2 characters',
    })
    return
  }
  if (
    customerForm.value.email &&
    customerForm.value.email.trim().length > 0 &&
    !/.+@.+\..+/.test(customerForm.value.email)
  ) {
    $q.notify({
      color: 'red-5',
      textColor: 'white',
      icon: 'warning',
      message: 'Please enter a valid email address',
    })
    return
  }
  if (
    customerForm.value.phone &&
    customerForm.value.phone.trim().length > 0 &&
    !isValidPhone(customerForm.value.phone)
  ) {
    $q.notify({
      color: 'red-5',
      textColor: 'white',
      icon: 'warning',
      message: 'Please enter a valid phone number',
    })
    return
  }

  // Save/add logic
  try {
    if (editingCustomerId.value) {
      await customersStore.updateCustomer(editingCustomerId.value, {
        ...customerForm.value,
      })
      $q.notify({
        color: 'green-4',
        textColor: 'white',
        icon: 'cloud_done',
        message: 'Customer updated successfully',
      })
    } else {
      await customersStore.addCustomer({
        ...customerForm.value,
      })
      $q.notify({
        color: 'green-4',
        textColor: 'white',
        icon: 'cloud_done',
        message: 'Customer added successfully',
      })
    }
    customerForm.value = { name: '', address: '', email: '', phone: '' }
    addCustomerDialog.value = false
    editingCustomerId.value = null
  } catch (error) {
    console.log(error)
    $q.notify({
      color: 'red-5',
      textColor: 'white',
      icon: 'warning',
      message: 'Failed to save customer',
    })
  }
}

function deleteCustomer(customer) {
  customerToDelete.value = customer
  deleteConfirmationDialog.value = true
}

async function confirmDeleteCustomer() {
  if (!customerToDelete.value) return
  try {
    await customersStore.deleteCustomer(customerToDelete.value.id)
    $q.notify({
      color: 'green-4',
      textColor: 'white',
      icon: 'cloud_done',
      message: 'Customer deleted successfully',
    })
    customerToDelete.value = null
    deleteConfirmationDialog.value = false
  } catch (error) {
    console.log(error)
    $q.notify({
      color: 'red-5',
      textColor: 'white',
      icon: 'warning',
      message: 'Failed to delete customer',
    })
  }
}
</script>

<style scoped>
.customers-page {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  /* Clean flat design without background */
}

.search-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.customers-table-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.professional-table {
  border-radius: 8px;
}

.professional-table .q-table__top {
  border-bottom: 1px solid #e0e0e0;
}

.customer-form-header {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
}

.form-section {
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #37474f;
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.form-input {
  margin-bottom: 8px;
}

.customer-form-actions {
  background: #f5f5f5;
  border-top: 1px solid #e0e0e0;
}

.customer-view-header {
  border-bottom: 1px solid #e0e0e0;
}

.view-section {
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.customer-info {
  space-y: 16px;
}

.info-item {
  margin-bottom: 20px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
}

.info-label {
  font-size: 0.875rem;
  color: #757575;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.info-value {
  font-size: 1rem;
  font-weight: 500;
  color: #212121;
  word-break: break-word;
}

.delete-dialog {
  min-width: 400px;
}

.search-input {
  max-width: 500px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .q-pa-xl {
    padding: 16px !important;
  }

  .page-header {
    padding: 16px !important;
  }

  .section-title {
    font-size: 1rem;
  }
}
</style>
