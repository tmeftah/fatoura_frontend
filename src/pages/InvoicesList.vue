<template>
  <q-page class="invoice-page">
    <!-- Header Section -->
    <div class="page-header q-pa-lg">
      <div class="row items-center justify-between">
        <div>
          <h4 class="text-h4 text-weight-bold q-ma-none text-primary">Invoice Management</h4>
          <p class="text-subtitle1 text-grey-7 q-mb-none">Manage your invoices and billing</p>
        </div>
        <q-btn
          color="primary"
          label="Create Invoice"
          icon="add"
          size="lg"
          unelevated
          @click="openAddInvoiceDialog"
        />
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="q-pa-lg">
      <q-card flat class="search-card">
        <q-card-section class="q-pa-lg">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-8">
              <q-input
                v-model="search"
                placeholder="Search invoices by number, customer, or date..."
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

    <!-- Invoice Table -->
    <div class="q-pa-lg">
      <q-card flat class="invoice-table-card">
        <q-table
          :rows="filteredInvoices"
          :columns="columns"
          row-key="id"
          :loading="isLoading"
          flat
          :rows-per-page-options="[10, 25, 50]"
          class="professional-table"
        >
          <template v-slot:top>
            <div class="full-width row items-center q-pa-md">
              <q-icon name="receipt_long" size="md" color="primary" class="q-mr-md" />
              <div class="text-h6 text-weight-medium">All Invoices</div>
              <q-space />
              <div class="text-caption text-grey-6">
                {{ filteredInvoices.length }} invoice{{ filteredInvoices.length !== 1 ? 's' : '' }}
              </div>
            </div>
          </template>

          <template v-slot:body-cell-invoice_number="props">
            <q-td :props="props">
              <div class="text-weight-medium text-primary">{{ props.value }}</div>
            </q-td>
          </template>

          <template v-slot:body-cell-customer_id="props">
            <q-td :props="props">
              <div class="text-weight-medium">
                {{ getCustomerName(props.value) }}
              </div>
              <div class="text-caption text-grey-6">ID: {{ props.value }}</div>
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
                  @click="viewInvoice(props.row)"
                >
                  <q-tooltip>View Invoice</q-tooltip>
                </q-btn>
                <q-btn
                  color="secondary"
                  icon="edit"
                  size="sm"
                  flat
                  round
                  @click="editInvoice(props.row)"
                >
                  <q-tooltip>Edit Invoice</q-tooltip>
                </q-btn>
                <q-btn
                  color="negative"
                  icon="delete"
                  size="sm"
                  flat
                  round
                  @click="deleteInvoice(props.row)"
                >
                  <q-tooltip>Delete Invoice</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- Add/Edit Invoice Dialog -->
    <q-dialog v-model="addInvoiceDialog" maximized persistent>
      <q-card class="invoice-form-card">
        <q-card-section class="invoice-form-header bg-primary text-white">
          <div class="row items-center">
            <q-icon name="receipt" size="md" class="q-mr-md" />
            <div>
              <div class="text-h5 text-weight-bold">
                {{ editingInvoiceId ? 'Edit Invoice' : 'Create New Invoice' }}
              </div>
              <div class="text-caption opacity-80">
                {{
                  editingInvoiceId
                    ? 'Update invoice details'
                    : 'Fill in the invoice information below'
                }}
              </div>
            </div>
            <q-space />
            <q-btn icon="close" flat round v-close-popup />
          </div>
        </q-card-section>

        <q-card-section class="q-pa-xl">
          <div class="row q-col-gutter-xl">
            <!-- Left Column - Invoice Details -->
            <div class="col-12 col-md-8">
              <q-card flat bordered class="form-section">
                <q-card-section>
                  <div class="section-title">
                    <q-icon name="description" color="primary" class="q-mr-sm" />
                    Invoice Information
                  </div>

                  <div class="row q-col-gutter-md q-mt-md">
                    <div class="col-12 col-sm-6">
                      <q-input
                        v-model="invoiceForm.invoice_number"
                        label="Invoice Number *"
                        outlined
                        dense
                        class="form-input"
                        readonly
                      />
                    </div>
                    <div class="col-12 col-sm-6">
                      <q-select
                        v-model="invoiceForm.customer_id"
                        :options="availableCustomers"
                        label="Customer *"
                        option-label="name"
                        option-value="id"
                        emit-value
                        map-options
                        outlined
                        dense
                        class="form-input"
                      />
                    </div>
                    <div class="col-12 col-sm-6">
                      <q-input
                        v-model="invoiceForm.invoice_date"
                        label="Invoice Date *"
                        type="date"
                        outlined
                        dense
                        class="form-input"
                      />
                    </div>
                    <div class="col-12 col-sm-6">
                      <q-input
                        v-model="invoiceForm.due_date"
                        label="Due Date *"
                        type="date"
                        outlined
                        dense
                        class="form-input"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Items Section -->
              <q-card flat bordered class="form-section q-mt-lg">
                <q-card-section>
                  <div class="section-title">
                    <q-icon name="shopping_cart" color="primary" class="q-mr-sm" />
                    Invoice Items
                  </div>

                  <div class="items-container q-mt-md">
                    <div
                      v-for="(item, index) in invoiceForm.items"
                      :key="index"
                      class="item-row q-mb-md"
                    >
                      <q-card flat bordered class="item-card">
                        <q-card-section class="q-pa-md">
                          <div class="row q-col-gutter-md items-end">
                            <div class="col-12 col-sm-4">
                              <q-select
                                v-model="item.product_id"
                                :options="availableProducts"
                                label="Product"
                                option-label="name"
                                option-value="id"
                                emit-value
                                map-options
                                outlined
                                dense
                                @update:model-value="
                                  (productId) => updateItemFromProduct(index, productId)
                                "
                              />
                            </div>
                            <div class="col-12 col-sm-3">
                              <q-input
                                v-model="item.description"
                                label="Description"
                                outlined
                                dense
                              />
                            </div>
                            <div class="col-12 col-sm-2">
                              <q-input
                                v-model="item.unit_price"
                                label="Unit Price"
                                type="number"
                                outlined
                                dense
                                prefix="$"
                              />
                            </div>
                            <div class="col-12 col-sm-2">
                              <q-input
                                v-model="item.quantity"
                                label="Quantity"
                                type="number"
                                outlined
                                dense
                              />
                            </div>
                            <div class="col-12 col-sm-1">
                              <q-btn
                                color="negative"
                                icon="delete"
                                flat
                                round
                                @click="removeItem(index)"
                              >
                                <q-tooltip>Remove Item</q-tooltip>
                              </q-btn>
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>

                    <q-btn
                      color="primary"
                      label="Add Item"
                      icon="add"
                      outline
                      @click="addItem"
                      class="full-width"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Right Column - Financial Details -->
            <div class="col-12 col-md-4">
              <q-card flat bordered class="form-section">
                <q-card-section>
                  <div class="section-title">
                    <q-icon name="calculate" color="primary" class="q-mr-sm" />
                    Financial Details
                  </div>

                  <div class="q-mt-md">
                    <!-- Discount Row -->
                    <div class="row">
                      <div class="col-6">
                        <q-input
                          v-model.number="invoiceForm.discount_value"
                          :label="
                            invoiceForm.discount_type === 'percent'
                              ? 'Discount (%)'
                              : 'Discount (Amount)'
                          "
                          type="number"
                          outlined
                          dense
                          class="form-input q-mb-md"
                          min="0"
                        />
                      </div>
                      <div class="col-6">
                        <q-select
                          v-model="invoiceForm.discount_type"
                          :options="[
                            { label: '%', value: 'percent' },
                            { label: 'Amount', value: 'amount' },
                          ]"
                          dense
                          outlined
                          label="Discount Type"
                          class="form-input q-mb-md"
                          emit-value
                          map-options
                        />
                      </div>
                    </div>

                    <q-input
                      :model-value="discountAmount"
                      label="Discount Amount"
                      prefix="$"
                      dense
                      outlined
                      readonly
                      class="form-input q-mb-md"
                    />
                    <!-- Tax Row -->
                    <q-select
                      v-model="invoiceForm.tax_percent"
                      :options="[0, 7, 10, 19, 20].map((val) => ({ label: val + '%', value: val }))"
                      label="Tax (%)"
                      dense
                      outlined
                      class="form-input q-mb-md"
                      emit-value
                      map-options
                    />
                    <q-input
                      :model-value="calculatedTaxAmount"
                      label="Tax Amount"
                      prefix="$"
                      dense
                      outlined
                      readonly
                      class="form-input q-mb-md"
                    />
                    <!-- Timbre -->
                    <q-input
                      v-model.number="invoiceForm.timbre"
                      label="Timbre"
                      type="number"
                      outlined
                      dense
                      prefix="$"
                      class="form-input q-mb-md"
                      min="0"
                    />
                    <q-input
                      v-model="invoiceForm.notes"
                      label="Notes"
                      type="textarea"
                      outlined
                      rows="4"
                      class="form-input"
                    />
                  </div>

                  <div class="q-mt-lg">
                    <q-input
                      :model-value="ttcTotal"
                      label="Total TTC"
                      prefix="$"
                      outlined
                      dense
                      readonly
                      class="form-input"
                      style="font-weight: bold"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-card-actions class="invoice-form-actions q-pa-xl">
          <q-btn flat label="Cancel" color="grey-7" size="lg" v-close-popup />
          <q-space />
          <q-btn
            color="primary"
            :label="editingInvoiceId ? 'Update Invoice' : 'Create Invoice'"
            size="lg"
            unelevated
            @click="saveInvoice"
            :loading="isSaving"
            icon-right="save"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- View Invoice Dialog -->
    <q-dialog v-model="viewInvoiceDialog" maximized>
      <q-card class="invoice-view-card">
        <q-card-section class="invoice-view-header bg-grey-1">
          <div class="row items-center">
            <q-icon name="receipt_long" size="md" color="primary" class="q-mr-md" />
            <div>
              <div class="text-h5 text-weight-bold text-grey-8">Invoice Details</div>
              <div class="text-subtitle2 text-grey-6">{{ viewedInvoice.invoice_number }}</div>
            </div>
            <q-space />
            <q-btn icon="close" flat round v-close-popup />
          </div>
        </q-card-section>

        <q-card-section class="q-pa-xl">
          <div class="row q-col-gutter-xl">
            <div class="col-12 col-md-8">
              <!-- Invoice Information -->
              <q-card flat bordered class="view-section q-mb-lg">
                <q-card-section>
                  <div class="section-title q-mb-md">Invoice Information</div>
                  <div class="row q-col-gutter-md">
                    <div class="col-6">
                      <div class="info-item">
                        <div class="info-label">Invoice Number</div>
                        <div class="info-value">{{ viewedInvoice.invoice_number }}</div>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="info-item">
                        <div class="info-label">Customer</div>
                        <div class="info-value">
                          {{ getCustomerName(viewedInvoice.customer_id) }}
                        </div>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="info-item">
                        <div class="info-label">Invoice Date</div>
                        <div class="info-value">{{ viewedInvoice.invoice_date }}</div>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="info-item">
                        <div class="info-label">Due Date</div>
                        <div class="info-value">{{ viewedInvoice.due_date }}</div>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- Items Section -->
              <q-card flat bordered class="view-section">
                <q-card-section>
                  <div class="section-title q-mb-md">Invoice Items</div>
                  <q-table
                    :rows="viewedInvoice.items || []"
                    :columns="itemColumns"
                    row-key="id"
                    flat
                    hide-pagination
                    :rows-per-page-options="[0]"
                  >
                    <template v-slot:body-cell-name="props">
                      <q-td :props="props">
                        <div class="text-weight-medium">
                          {{ props.row.name }}
                        </div>
                      </q-td>
                    </template>
                    <template v-slot:body-cell-unit_price="props">
                      <q-td :props="props"> ${{ props.value }} </q-td>
                    </template>
                  </q-table>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-md-4">
              <q-card flat bordered class="view-section">
                <q-card-section>
                  <div class="section-title q-mb-md">Financial Summary</div>
                  <q-list bordered separator>
                    <q-item>
                      <q-item-section v-if="viewedInvoice.discount_type === 'percent'"
                        >Discount ({{ viewedInvoice.discount_value }} %)
                      </q-item-section>
                      <q-item-section v-else
                        >Discount ({{ viewedInvoice.discount_type }})
                      </q-item-section>
                      <q-item-section side>
                        <span> - ${{ viewedInvoice.discount_amount.toFixed(2) }} </span>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>Subtotal After Discount</q-item-section>
                      <q-item-section side>${{ viewedInvoice.subtotal.toFixed(2) }}</q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>
                        <span>Tax({{ viewedInvoice.tax_percent }}%)</span>
                      </q-item-section>
                      <q-item-section side>
                        <span>${{ viewedInvoice.tax_amount.toFixed(2) }}</span>
                      </q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section>Timbre</q-item-section>
                      <q-item-section side>${{ viewedInvoice.timbre.toFixed(2) }}</q-item-section>
                    </q-item>
                    <q-item>
                      <q-item-section class="text-weight-bold">Total TTC</q-item-section>
                      <q-item-section side class="text-weight-bold">
                        ${{ viewedInvoice.total_amount }}
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
              <!-- Notes -->
              <q-card flat bordered class="view-section q-mt-md" v-if="viewedInvoice.notes">
                <q-card-section>
                  <div class="section-title q-mb-md">Notes</div>
                  <div class="notes-content">{{ viewedInvoice.notes }}</div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-card-actions class="q-pa-xl">
          <q-space />
          <q-btn
            color="primary"
            label="Print Invoice"
            icon="print"
            outline
            size="lg"
            @click="printInvoice(viewedInvoice)"
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
            Are you sure you want to delete this invoice? This action cannot be undone.
          </div>
        </q-card-section>

        <q-card-actions class="q-pa-lg">
          <q-btn flat label="Cancel" color="grey-7" v-close-popup class="q-mr-sm" />
          <q-space />
          <q-btn
            color="negative"
            label="Delete Invoice"
            unelevated
            @click="confirmDeleteInvoice"
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
import { useInvoicesStore } from 'stores/invoices'
import { useProductsStore } from 'stores/products'
import { useCustomersStore } from 'stores/customers'

const $q = useQuasar()

// -------- INVOICE NUMBER GENERATION --------
function getDDMMYY(date) {
  const d = typeof date === 'string' ? new Date(date) : date
  const pad = (n) => String(n).padStart(2, '0')
  const dd = pad(d.getDate())
  const mm = pad(d.getMonth() + 1)
  const yy = String(d.getFullYear()).slice(-2)
  return `${dd}${mm}${yy}`
}
function generateInvoiceNumber(invoices, date = new Date()) {
  const dateString = getDDMMYY(date)
  const prefix = `Facture-${dateString}-`
  const sameDayInvoices = invoices
    .map((inv) => inv.invoice_number)
    .filter((num) => typeof num === 'string' && num.startsWith(prefix))
  const counter = sameDayInvoices.length + 1
  const counterPadded = String(counter).padStart(2, '0')
  return `Facture-${dateString}-${counterPadded}`
}

// ============================================

const search = ref('')
const addInvoiceDialog = ref(false)
const viewInvoiceDialog = ref(false)
const deleteConfirmationDialog = ref(false)
const viewedInvoice = ref({})
const editingInvoiceId = ref(null)
let invoiceForm = ref({})
const invoiceToDelete = ref(null)
const invoiceToprint = ref(null)

const invoicesStore = useInvoicesStore()
const productsStore = useProductsStore()
const customersStore = useCustomersStore()

onMounted(() => {
  invoicesStore.fetchInvoices()
  productsStore.fetchProducts()
  customersStore.fetchCustomers()
})

const columns = [
  {
    name: 'invoice_number',
    align: 'left',
    label: 'Invoice #',
    field: 'invoice_number',
    sortable: true,
    style: 'width: 150px',
  },
  {
    name: 'customer_id',
    align: 'left',
    label: 'Customer',
    field: 'customer_id',
    sortable: true,
    style: 'width: 200px',
  },
  {
    name: 'invoice_date',
    align: 'left',
    label: 'Invoice Date',
    field: 'invoice_date',
    sortable: true,
    style: 'width: 120px',
  },
  {
    name: 'due_date',
    align: 'left',
    label: 'Due Date',
    field: 'due_date',
    sortable: true,
    style: 'width: 120px',
  },
  {
    name: 'actions',
    align: 'center',
    label: 'Actions',
    field: 'actions',
    style: 'width: 150px',
  },
]

const itemColumns = [
  {
    name: 'name',
    align: 'left',
    label: 'Product',
    field: 'name',
  },
  {
    name: 'description',
    align: 'left',
    label: 'Description',
    field: 'description',
  },
  {
    name: 'unit_price',
    align: 'right',
    label: 'Unit Price',
    field: 'unit_price',
  },
  {
    name: 'quantity',
    align: 'right',
    label: 'Quantity',
    field: 'quantity',
  },
]

const filteredInvoices = computed(() => invoicesStore.searchInvoices(search.value))

const isLoading = computed(() => invoicesStore.isLoading)
const isSaving = computed(() => invoicesStore.isSaving)
const isDeleting = computed(() => invoicesStore.isDeleting)
const availableProducts = computed(() => productsStore.products)
const availableCustomers = computed(() => customersStore.customers)

function getCustomerName(id) {
  const c = customersStore.customers.find((c) => c.id === id)
  return c ? c.name : ''
}

// function getProductName(id) {
//   const p = productsStore.products.find((p) => p.id === id)
//   return p ? p.name : ''
// }

function openAddInvoiceDialog() {
  editingInvoiceId.value = null

  invoiceForm.value = {
    invoice_number: generateInvoiceNumber(invoicesStore.invoices, new Date()),
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    customer_id: null,
    notes: '',
    timbre: 0,
    items: [],
    discount_type: 'percent',
    discount_value: 0,
    tax_percent: 19,
  }

  invoiceForm.value.discount_amount = discountAmount
  invoiceForm.value.subtotal = subtotalAfterDiscount
  invoiceForm.value.tax_amount = calculatedTaxAmount
  invoiceForm.value.total_amount = ttcTotal

  addInvoiceDialog.value = true
}

async function viewInvoice(invoice) {
  viewedInvoice.value = await invoicesStore.fetchInvoice(invoice.id)
  viewInvoiceDialog.value = true
}

async function editInvoice(invoice) {
  console.log('editInvoice')
  editingInvoiceId.value = invoice.id
  let data = await invoicesStore.fetchInvoice(invoice.id)
  invoiceForm.value = { ...data }
  invoiceForm.value.discount_amount = discountAmount
  invoiceForm.value.subtotal = subtotalAfterDiscount
  invoiceForm.value.tax_amount = calculatedTaxAmount
  invoiceForm.value.total_amount = ttcTotal
  addInvoiceDialog.value = true
}

async function saveInvoice() {
  const payload = {
    ...invoiceForm.value,
  }
  if (editingInvoiceId.value) {
    await invoicesStore.updateInvoice(editingInvoiceId.value, payload)
  } else {
    await invoicesStore.createInvoice(payload)
  }
  addInvoiceDialog.value = false
  editingInvoiceId.value = null
}

function deleteInvoice(invoice) {
  invoiceToDelete.value = invoice
  deleteConfirmationDialog.value = true
}

async function printInvoice(invoice) {
  try {
    const response = await invoicesStore.printInvoice(invoice.id)

    // Check if the response contains the file data
    if (response && response.data) {
      // Create a blob from the response data
      const blob = new Blob([response.data], {
        type: 'application/pdf',
      }) // Adjust type as needed

      console.log(blob)

      // Create a link element
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)

      // Set the download attribute and filename
      link.download = `${invoice.invoice_number}.pdf` // Customize filename

      // Append the link to the document
      //document.body.appendChild(link)
      //window.open(link, '_blank')
      // Trigger the download
      link.click()

      // Remove the link from the document
      // document.body.removeChild(link)
    }

    $q.notify({
      color: 'green-4',
      textColor: 'white',
      icon: 'cloud_done',
      message: 'Invoice printed successfully',
    })
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

async function confirmDeleteInvoice() {
  await invoicesStore.deleteInvoice(invoiceToDelete.value.id)
  invoiceToDelete.value = null
  deleteConfirmationDialog.value = false
}

function addItem() {
  invoiceForm.value.items.push({
    id: null,
    description: '',
    unit_price: 0,
    quantity: 1,
  })
}

function removeItem(index) {
  invoiceForm.value.items.splice(index, 1)
}

async function updateItemFromProduct(index, productId) {
  if (!invoiceForm.value.items[index]) return
  const product = await productsStore.fetchProduct(productId)
  if (product) {
    invoiceForm.value.items[index].id = product.id
    invoiceForm.value.items[index].description = product.description
    invoiceForm.value.items[index].unit_price = product.unit_price
    // quantity stays as is
  }
}

// --- Computed Financial Calculations ---

const itemsTotal = computed(() => {
  return invoiceForm.value.items.reduce((acc, item) => {
    const price = Number(item.unit_price) || 0
    const qty = Number(item.quantity) || 0
    return acc + price * qty
  }, 0)
})

const discountAmount = computed(() => {
  if (invoiceForm.value.discount_type === 'percent') {
    return +(itemsTotal.value * (invoiceForm.value.discount_value / 100)).toFixed(2)
  }
  return +(invoiceForm.value.discount_value || 0)
})

const subtotalAfterDiscount = computed(() => {
  return Math.max(itemsTotal.value - discountAmount.value, 0)
})

const calculatedTaxAmount = computed(() => {
  return +(subtotalAfterDiscount.value * (invoiceForm.value.tax_percent / 100)).toFixed(2)
})

const ttcTotal = computed(() => {
  return +(
    subtotalAfterDiscount.value +
    calculatedTaxAmount.value +
    (Number(invoiceForm.value.timbre) || 0)
  ).toFixed(2)
})
</script>

<style scoped>
.invoice-page {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.search-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.invoice-table-card {
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

.invoice-form-header {
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

.item-card {
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.invoice-form-actions {
  background: #f5f5f5;
  border-top: 1px solid #e0e0e0;
}

.invoice-view-header {
  border-bottom: 1px solid #e0e0e0;
}

.view-section {
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.info-item {
  margin-bottom: 16px;
}

.info-label {
  font-size: 0.875rem;
  color: #757575;
  margin-bottom: 4px;
}

.info-value {
  font-size: 1rem;
  font-weight: 500;
  color: #212121;
}

.financial-summary {
  space-y: 12px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.summary-label {
  font-size: 0.875rem;
  color: #757575;
}

.summary-value {
  font-weight: 600;
  color: #212121;
}

.notes-content {
  background: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
  color: #424242;
  line-height: 1.5;
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
