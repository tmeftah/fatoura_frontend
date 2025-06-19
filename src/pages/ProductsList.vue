<template>
  <q-page class="products-page">
    <!-- HEADER -->
    <div class="page-header q-pa-lg">
      <div class="row items-center justify-between">
        <q-btn
          color="primary"
          label="Add Product"
          icon="dashboard_customize"
          size="md"
          unelevated
          class="add-product-btn"
          @click="showAddDialog"
        />
      </div>
    </div>

    <!-- SEARCH BAR -->
    <div class="q-pa-none q-mb-md">
      <q-card flat class="search-card">
        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-8">
              <q-input
                v-model="filter"
                debounce="400"
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

    <!-- PRODUCTS TABLE (Desktop) -->
    <div class="q-pa-none products-table-wrapper">
      <q-card flat class="products-table-card desktop-table">
        <q-table
          :rows="filteredProducts"
          :columns="columns"
          row-key="id"
          :filter="filter"
          flat
          :loading="isLoading"
          :rows-per-page-options="[10, 25, 50]"
          :rows-per-page="10"
          class="professional-table"
          style="border-radius: 12px"
        >
          <template v-slot:top>
            <div class="full-width row items-center q-pa-md">
              <q-icon name="inventory" size="md" color="primary" class="q-mr-md" />
              <div class="text-h6 text-weight-medium">Products</div>
              <q-space />
              <div class="text-caption text-grey-6">
                {{ filteredProducts.length }} Product{{ filteredProducts.length !== 1 ? 's' : '' }}
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
              <q-spinner-gears size="44px" color="primary" />
            </q-inner-loading>
          </template>
        </q-table>
      </q-card>

      <!-- PRODUCTS CARDS (MOBILE) -->
      <div class="q-gutter-md mobile-table">
        <q-card
          v-for="row in filteredProducts"
          :key="row.id"
          class="product-mobile-card"
          flat
          bordered
        >
          <q-card-section class="q-pa-sm">
            <div class="row items-center justify-between">
              <div class="text-h6 text-primary text-weight-medium">
                {{ row.name }}
              </div>
              <div class="text-weight-medium text-right" style="min-width: 85px">
                <q-badge align="top" color="primary" class="q-pa-xs">
                  ${{ row.unit_price.toFixed(2) }}
                </q-badge>
              </div>
            </div>
            <div class="text-grey-8 q-mt-xs" v-if="row.description">
              {{ row.description }}
            </div>
          </q-card-section>
          <q-card-actions align="right" class="q-pa-xs">
            <q-btn
              dense
              flat
              round
              icon="edit"
              color="secondary"
              size="md"
              @click="showUpdateDialog(row)"
            >
              <q-tooltip>Edit</q-tooltip>
            </q-btn>
            <q-btn
              dense
              flat
              round
              icon="delete"
              color="negative"
              size="md"
              @click="deleteProduct(row.id)"
            >
              <q-tooltip>Delete</q-tooltip>
            </q-btn>
          </q-card-actions>
        </q-card>
        <div
          v-if="filteredProducts.length === 0 && !isLoading"
          class="text-grey-6 text-center q-pt-xl"
        >
          <q-icon name="sentiment_dissatisfied" size="40px" />
          <div class="q-mt-sm">No products found.</div>
        </div>
      </div>
    </div>

    <!-- ADD PRODUCT DIALOG -->
    <q-dialog v-model="addDialog" maximized persistent>
      <q-card class="product-form-card">
        <q-card-section class="product-form-header bg-primary text-white">
          <div class="row items-center">
            <q-icon name="add_box" size="md" class="q-mr-sm" />
            <div>
              <div class="text-h5 text-weight-bold">Add New Product</div>
              <div class="text-caption opacity-80">Fill in product information below</div>
            </div>
            <q-space />
            <q-btn icon="close" flat round v-close-popup />
          </div>
        </q-card-section>

        <q-card-section>
          <div class="row justify-center">
            <div class="col-12 col-md-10 col-lg-8">
              <form @submit.prevent="addNewProduct">
                <q-card flat bordered class="form-section">
                  <q-card-section>
                    <div class="section-title">
                      <q-icon name="info" color="primary" class="q-mr-sm" />
                      Product Information
                    </div>

                    <div class="q-mt-md">
                      <q-input
                        v-model="addForm.name"
                        label="Product Name *"
                        outlined
                        class="form-input q-mb-md"
                        :rules="[(val) => (val && val.length > 0) || 'Name is required']"
                        autofocus
                        dense
                      />
                      <q-input
                        v-model="addForm.description"
                        label="Description"
                        type="textarea"
                        outlined
                        rows="3"
                        class="form-input q-mb-md"
                        dense
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
                        dense
                      />
                    </div>
                  </q-card-section>
                </q-card>

                <q-card-actions class="product-form-actions q-pa-md q-gutter-x-md">
                  <q-btn flat label="Cancel" color="grey-7" size="md" v-close-popup />
                  <q-space />
                  <q-btn
                    type="submit"
                    color="primary"
                    label="Add"
                    unelevated
                    :loading="isAdding"
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

    <!-- UPDATE PRODUCT DIALOG -->
    <q-dialog v-model="updateDialog" maximized persistent>
      <q-card class="product-form-card">
        <q-card-section class="product-form-header bg-secondary text-white">
          <div class="row items-center">
            <q-icon name="edit" size="md" class="q-mr-sm" />
            <div>
              <div class="text-h5 text-weight-bold">Update Product</div>
              <div class="text-caption opacity-80">Modify product information below</div>
            </div>
            <q-space />
            <q-btn icon="close" flat round v-close-popup />
          </div>
        </q-card-section>

        <q-card-section>
          <div class="row justify-center">
            <div class="col-12 col-md-10 col-lg-8">
              <form @submit.prevent="updateExistingProduct">
                <q-card flat bordered class="form-section">
                  <q-card-section>
                    <div class="section-title">
                      <q-icon name="info" color="secondary" class="q-mr-sm" />
                      Product Information
                    </div>

                    <div class="q-mt-md">
                      <q-input
                        v-model="updateForm.name"
                        label="Product Name *"
                        outlined
                        class="form-input q-mb-md"
                        :rules="[(val) => (val && val.length > 0) || 'Name is required']"
                        dense
                        autofocus
                      />
                      <q-input
                        v-model="updateForm.description"
                        label="Description"
                        type="textarea"
                        outlined
                        rows="3"
                        class="form-input q-mb-md"
                        dense
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
                        dense
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
  background: linear-gradient(135deg, #f8fafb 0%, #f1f6fe 100%);
  min-height: 100vh;
}
.products-table-wrapper {
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

/* Show table on desktop, cards on mobile */
.desktop-table {
  display: block;
}
.mobile-table {
  display: none;
}

/* Hide table and show cards for small screens */
@media (max-width: 800px) {
  .desktop-table {
    display: none;
  }
  .mobile-table {
    display: block;
    margin: 0 0.5rem 2rem 0.5rem;
  }
}

.product-mobile-card {
  border-radius: 10px;
  box-shadow: 0 1px 6px #7c99c025;
  background: #fff;
}

.page-header {
  padding-bottom: 0 !important;
}

.add-product-btn {
  font-weight: 500;
  border-radius: 14px;
  min-width: 140px;
}

.search-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  max-width: 860px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 28px;
}

.products-table-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-bottom: 4vw;
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

.search-input {
  max-width: 440px;
  width: 100%;
}

@media (max-width: 900px) {
  .products-table-card,
  .search-card {
    max-width: 98vw;
  }
  .q-card-section {
    padding: 16px !important;
  }
}
@media (max-width: 600px) {
  .page-header {
    padding: 16px !important;
  }
  .search-card,
  .products-table-card {
    border-radius: 8px;
    padding-left: 2px !important;
    padding-right: 2px !important;
  }
  .section-title {
    font-size: 1em;
  }
  .add-product-btn {
    min-width: 100px;
    font-size: 0.91em;
    padding: 0 10px;
  }
  .q-dialog .q-card {
    border-radius: 10px !important;
  }
  .product-mobile-card .text-h6 {
    font-size: 1.05em;
  }
}
</style>
