<template>
  <q-page class="products-page">
    <!-- Header Section -->
    <div class="page-header q-pa-lg">
      <div class="row items-center justify-between">
        <div>
          <h4 class="text-h4 text-weight-bold q-ma-none text-primary">Product Management</h4>
          <p class="text-subtitle1 text-grey-7 q-mb-none">Manage your product catalog</p>
        </div>
        <q-btn
          color="primary"
          label="Add Product"
          icon="add"
          size="lg"
          unelevated
          @click="showAddDialog"
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
                v-model="filter"
                debounce="500"
                label="Search"
                placeholder="Search products by name, description..."
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

    <!-- Products Table -->
    <div class="q-pa-lg">
      <q-card flat class="products-table-card">
        <q-table
          :rows="filteredProducts"
          :columns="columns"
          row-key="id"
          :filter="filter"
          flat
          :loading="isLoading"
          :rows-per-page-options="[10, 25, 50]"
          class="professional-table"
        >
          <template v-slot:top>
            <div class="full-width row items-center q-pa-md">
              <q-icon name="inventory" size="md" color="primary" class="q-mr-md" />
              <div class="text-h6 text-weight-medium">All Products</div>
              <q-space />
              <div class="text-caption text-grey-6">
                {{ filteredProducts.length }} product{{ filteredProducts.length !== 1 ? 's' : '' }}
              </div>
            </div>
          </template>

          <template v-slot:body-cell-name="props">
            <q-td :props="props">
              <div class="text-weight-medium text-primary">{{ props.value }}</div>
            </q-td>
          </template>

          <template v-slot:body-cell-unit_price="props">
            <q-td :props="props">
              <div class="text-weight-medium">${{ props.value.toFixed(2) }}</div>
            </q-td>
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
                  @click="showUpdateDialog(props.row)"
                >
                  <q-tooltip>Edit Product</q-tooltip>
                </q-btn>
                <q-btn
                  color="negative"
                  icon="delete"
                  size="sm"
                  flat
                  round
                  @click="deleteProduct(props.row.id)"
                >
                  <q-tooltip>Delete Product</q-tooltip>
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

    <!-- Add Product Dialog -->
    <q-dialog v-model="addDialog" maximized persistent>
      <q-card class="product-form-card">
        <q-card-section class="product-form-header bg-primary text-white">
          <div class="row items-center">
            <q-icon name="add_box" size="md" class="q-mr-md" />
            <div>
              <div class="text-h5 text-weight-bold">Add New Product</div>
              <div class="text-caption opacity-80">Fill in the product information below</div>
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
                    <q-icon name="info" color="primary" class="q-mr-sm" />
                    Product Information
                  </div>

                  <div class="q-mt-lg">
                    <q-input
                      v-model="addForm.name"
                      label="Product Name *"
                      outlined
                      class="form-input q-mb-lg"
                      :rules="[(val) => (val && val.length > 0) || 'Name is required']"
                    />
                    <q-input
                      v-model="addForm.description"
                      label="Description"
                      type="textarea"
                      outlined
                      rows="4"
                      class="form-input q-mb-lg"
                    />
                    <q-input
                      v-model.number="addForm.unit_price"
                      label="Unit Price *"
                      type="number"
                      min="0"
                      step="0.01"
                      outlined
                      prefix="$"
                      class="form-input"
                      :rules="[
                        (val) => (val !== null && val >= 0) || 'Price must be zero or positive',
                      ]"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-card-actions class="product-form-actions q-pa-xl">
          <q-btn flat label="Cancel" color="grey-7" size="lg" v-close-popup />
          <q-space />
          <q-btn
            color="primary"
            label="Add Product"
            size="lg"
            unelevated
            @click="addNewProduct"
            :loading="isAdding"
            icon-right="save"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Update Product Dialog -->
    <q-dialog v-model="updateDialog" maximized persistent>
      <q-card class="product-form-card">
        <q-card-section class="product-form-header bg-secondary text-white">
          <div class="row items-center">
            <q-icon name="edit" size="md" class="q-mr-md" />
            <div>
              <div class="text-h5 text-weight-bold">Update Product</div>
              <div class="text-caption opacity-80">Modify the product information below</div>
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
                    <q-icon name="info" color="secondary" class="q-mr-sm" />
                    Product Information
                  </div>

                  <div class="q-mt-lg">
                    <q-input
                      v-model="updateForm.name"
                      label="Product Name *"
                      outlined
                      class="form-input q-mb-lg"
                      :rules="[(val) => (val && val.length > 0) || 'Name is required']"
                    />
                    <q-input
                      v-model="updateForm.description"
                      label="Description"
                      type="textarea"
                      outlined
                      rows="4"
                      class="form-input q-mb-lg"
                    />
                    <q-input
                      v-model.number="updateForm.unit_price"
                      label="Unit Price *"
                      type="number"
                      min="0"
                      step="0.01"
                      outlined
                      prefix="$"
                      class="form-input"
                      :rules="[
                        (val) => (val !== null && val >= 0) || 'Price must be zero or positive',
                      ]"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-card-actions class="product-form-actions q-pa-xl">
          <q-btn flat label="Cancel" color="grey-7" size="lg" v-close-popup />
          <q-space />
          <q-btn
            color="secondary"
            label="Update Product"
            size="lg"
            unelevated
            @click="updateExistingProduct"
            :loading="isUpdating"
            icon-right="save"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useProductsStore } from 'stores/products'

const $q = useQuasar()

const columns = [
  {
    name: 'name',
    required: true,
    label: 'Product Name',
    align: 'left',
    field: 'name',
    sortable: true,
    style: 'width: 250px',
  },
  {
    name: 'description',
    label: 'Description',
    align: 'left',
    field: 'description',
    sortable: true,
    style: 'width: 300px',
  },
  {
    name: 'unit_price',
    align: 'right',
    label: 'Unit Price',
    field: 'unit_price',
    sortable: true,
    style: 'width: 120px',
  },
  {
    name: 'actions',
    label: 'Actions',
    align: 'center',
    style: 'width: 120px',
  },
]

const filter = ref('')
const addDialog = ref(false)
const updateDialog = ref(false)
const addForm = ref({
  name: '',
  description: '',
  unit_price: 0,
})
const updateForm = ref({
  id: null,
  name: '',
  description: '',
  unit_price: 0,
})

const productsStore = useProductsStore()

const isLoading = computed(() => productsStore.isLoading)
const isAdding = computed(() => productsStore.isAdding)
const isUpdating = computed(() => productsStore.isUpdating)
const products = computed(() => productsStore.products)

const filteredProducts = computed(() => {
  if (!filter.value) return products.value
  const term = filter.value.toLowerCase()
  return products.value.filter(
    (p) => p.name.toLowerCase().includes(term) || p.description?.toLowerCase().includes(term),
  )
})

onMounted(() => {
  productsStore.fetchProducts()
})

function showAddDialog() {
  addForm.value = { name: '', description: '', unit_price: 0 }
  addDialog.value = true
}

async function showUpdateDialog(product) {
  try {
    const prod = await productsStore.fetchProduct(product.id)
    updateForm.value = {
      id: prod.id,
      name: prod.name,
      description: prod.description,
      unit_price: prod.unit_price,
    }
    updateDialog.value = true
  } catch (error) {
    console.log(error)
    $q.notify({
      color: 'red-5',
      textColor: 'white',
      icon: 'warning',
      message: 'Failed to load product for update',
    })
  }
}

async function addNewProduct() {
  if (
    !addForm.value.name ||
    addForm.value.name.length === 0 ||
    addForm.value.unit_price === null ||
    addForm.value.unit_price < 0
  ) {
    $q.notify({
      color: 'red-5',
      textColor: 'white',
      icon: 'warning',
      message: 'Please fill all fields correctly.',
    })
    return
  }

  try {
    await productsStore.addProduct({
      name: addForm.value.name,
      description: addForm.value.description,
      unit_price: parseFloat(addForm.value.unit_price),
    })
    $q.notify({
      color: 'green-4',
      textColor: 'white',
      icon: 'cloud_done',
      message: 'Product added successfully',
    })
    addDialog.value = false
  } catch (error) {
    console.log(error)
    $q.notify({
      color: 'red-5',
      textColor: 'white',
      icon: 'warning',
      message: 'Failed to add product',
    })
  }
}

async function updateExistingProduct() {
  if (
    !updateForm.value.name ||
    updateForm.value.name.length === 0 ||
    updateForm.value.unit_price === null ||
    updateForm.value.unit_price < 0
  ) {
    $q.notify({
      color: 'red-5',
      textColor: 'white',
      icon: 'warning',
      message: 'Please fill all fields correctly.',
    })
    return
  }
  try {
    await productsStore.updateProduct(updateForm.value.id, {
      name: updateForm.value.name,
      description: updateForm.value.description,
      unit_price: parseFloat(updateForm.value.unit_price),
    })
    $q.notify({
      color: 'green-4',
      textColor: 'white',
      icon: 'cloud_done',
      message: 'Product updated successfully',
    })
    updateDialog.value = false
  } catch (error) {
    console.log(error)
    $q.notify({
      color: 'red-5',
      textColor: 'white',
      icon: 'warning',
      message: 'Failed to update product',
    })
  }
}

function deleteProduct(id) {
  $q.dialog({
    title: 'Delete Product',
    message: 'Are you sure you want to delete this product? This action cannot be undone.',
    persistent: true,
    ok: {
      label: 'Delete',
      color: 'negative',
      unelevated: true,
    },
    cancel: {
      label: 'Cancel',
      flat: true,
      color: 'grey-7',
    },
  }).onOk(async () => {
    try {
      await productsStore.deleteProduct(id)
      $q.notify({
        color: 'green-4',
        textColor: 'white',
        icon: 'cloud_done',
        message: 'Product deleted successfully',
      })
    } catch (error) {
      console.log(error)
      $q.notify({
        color: 'red-5',
        textColor: 'white',
        icon: 'warning',
        message: 'Failed to delete product',
      })
    }
  })
}
</script>

<style scoped>
.products-page {
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

.products-table-card {
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

.product-form-header {
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

.product-form-actions {
  background: #f5f5f5;
  border-top: 1px solid #e0e0e0;
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
