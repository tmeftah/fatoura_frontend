const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: 'products', component: () => import('pages/ProductsList.vue') },
      { path: 'invoices', component: () => import('pages/InvoicesList.vue') },
      { path: 'customers', component: () => import('pages/CustomersList.vue') },
      { path: 'settings', component: () => import('pages/SettingsPage.vue') },
      { path: '', component: () => import('pages/IndexPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
