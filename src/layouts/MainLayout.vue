<template>
  <q-layout view="lHh Lpr lFf" class="main-layout-bg">
    <!-- HEADER -->
    <q-header elevated class="main-header">
      <q-toolbar class="main-toolbar row items-center no-wrap">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="drawer-toggle-btn"
        />

        <q-toolbar-title class="main-title">
          <q-icon name="description" color="primary" class="q-mr-xs" />
          Fatoura
        </q-toolbar-title>

        <q-space />

        <q-btn
          @click="handleLogout"
          class="logout-btn"
          rounded
          color="primary"
          text-color="white"
          icon="logout"
          label="Logout"
          size="md"
        />
      </q-toolbar>
    </q-header>

    <!-- DRAWER (Sidebar) -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered content-class="main-drawer-content">
      <div class="drawer-header flex flex-center q-pt-lg q-pb-md">
        <q-img
          fit="contain"
          src="~assets/logo.png"
          style="max-width: 72px; min-width: 45px; border-radius: 12px; box-shadow: 0 2px 8px #0002"
        />
      </div>
      <q-list class="drawer-list">
        <q-item-label
          header
          class="text-center text-grey-8 text-weight-bold q-mb-sm"
          style="font-size: 1.07em"
        >
          Welcome to Fatoura
        </q-item-label>

        <EssentialLink
          v-for="link in linksList"
          :key="link.title"
          v-bind="link"
          class="essential-link"
        />

        <q-separator spaced class="q-mt-lg" />

        <q-item class="drawer-theme q-mb-md q-pb-xs">
          <q-item-section>
            <q-select
              v-model="theme"
              :options="themeOptions"
              label="Theme"
              emit-value
              map-options
              dense
              outlined
              color="primary"
              class="theme-select"
              options-dense
              popup-content-class="theme-select-popup"
              style="min-width: 130px; width: 100%"
            />
          </q-item-section>
        </q-item>
      </q-list>
      <div class="drawer-footer q-pa-md text-grey-6 text-caption q-pt-lg flex flex-center">
        &copy; {{ new Date().getFullYear() }} Fatoura Solutions
      </div>
    </q-drawer>

    <!-- MAIN CONTENT -->
    <q-page-container class="main-page-container">
      <router-view />
    </q-page-container>

    <!-- Bottom responsive floating theme switch for mobile -->
    <q-fab
      position="bottom-right"
      v-if="$q.screen.lt.md"
      icon="palette"
      color="primary"
      label=""
      class="theme-fab"
      glossy
      flat
      hide-label
    >
      <q-fab-action
        v-for="opt in themeOptions"
        :key="opt.value"
        :color="theme === opt.value ? 'primary' : 'grey-4'"
        :icon="getThemeIcon(opt.value)"
        @click="theme = opt.value"
        :label="opt.label"
        text-color="primary"
        class="theme-fab-action"
      />
    </q-fab>
  </q-layout>
</template>

<script setup>
import { ref, watch } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import { useQuasar } from 'quasar'

const router = useRouter()
const auth = useAuthStore()
const $q = useQuasar()

const themeOptions = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'Orange', value: 'orange' },
]
const theme = ref('light')
watch(theme, (val) => document.body.setAttribute('data-theme', val), { immediate: true })

function getThemeIcon(val) {
  if (val === 'dark') return 'nightlight'
  if (val === 'orange') return 'circle'
  return 'light_mode'
}

const linksList = [
  {
    title: 'Products',
    caption: 'Products',
    icon: 'view_in_ar',
    link: 'products',
  },
  {
    title: 'Customers',
    caption: 'Customers',
    icon: 'contact_mail',
    link: 'customers',
  },
  {
    title: 'Invoices',
    caption: 'Invoices',
    icon: 'receipt_long',
    link: 'invoices',
  },
  {
    title: 'Settings',
    caption: 'Settings',
    icon: 'settings',
    link: 'settings',
  },
]

const leftDrawerOpen = ref(false)
function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
/* --------- Layout Background --------- */
.main-layout-bg {
  min-height: 100vh;
  background: linear-gradient(132deg, #eef1fa 30%, #f2f7ff 70%, #f7ebe9 100%);
}

/* --------- HEADER --------- */
.main-header {
  background: linear-gradient(90deg, #e1e8fa 70%, #f9f9fd 100%);
}

.main-toolbar {
  min-height: 54px;
  padding-left: 2vw;
  padding-right: 2vw;
}
.main-title {
  letter-spacing: 1px;
  font-size: 1.23em;
  font-weight: 700;
  color: #293b5f;
  display: flex;
  align-items: center;
}
.logout-btn {
  font-weight: 500;
  border-radius: 14px;
  min-width: 104px;
  box-shadow: 0 2px 12px #2765be1a;
}

.avatar-section {
  min-width: 40px;
}

.drawer-toggle-btn {
  color: #696997;
}

@media (max-width: 600px) {
  .main-header,
  .main-toolbar {
    min-height: 46px;
    padding: 0 4px;
  }
  .main-title {
    font-size: 1em;
    letter-spacing: 0.4px;
  }
}

/* --------- DRAWER --------- */
.main-drawer-content {
  background: rgba(252, 252, 252, 0.98);
  border-right: 1.5px solid #e3e9f4;
  min-width: 190px;
}

.drawer-header {
  padding-bottom: 0.5rem;
  background: transparent;
}

.essential-link {
  border-radius: 9px;
  margin-bottom: 2px;
  font-weight: 500;
}
.essential-link:hover {
  background: #f9f8fc;
  color: #293b5f !important;
}

.drawer-theme {
  padding-bottom: 3px !important;
  margin-bottom: 8px;
}

.theme-select {
  width: 100%;
  min-width: 0;
  margin-bottom: 0;
}

.theme-select-popup {
  max-width: 170px;
}
/* Drawer footer copyright */
.drawer-footer {
  background: transparent;
  font-size: 0.98em;
  margin-top: 2rem;
}

/* --------- MAIN PAGE --------- */
.main-page-container {
  background: none;
  min-height: 100vh;
  padding: 0;
  max-width: 100vw;
}
/* ---------- Responsive Drawer --- */
@media (max-width: 700px) {
  .main-drawer-content {
    min-width: 150px;
    font-size: 0.97em;
  }
}
@media (max-width: 450px) {
  .drawer-header {
    padding-top: 0.6rem;
    padding-bottom: 0.2rem;
  }
  .main-drawer-content {
    min-width: 99px;
    font-size: 0.89em;
  }
}
/* ---------- THEMING FAB ---------- */
.theme-fab {
  bottom: 20px !important;
  right: 16px !important;
  z-index: 70;
}
.theme-fab-action {
  font-size: 0.8em;
  border-radius: 50%;
}
</style>
