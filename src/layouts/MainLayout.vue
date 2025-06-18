<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Fatoura </q-toolbar-title>

        <div><q-btn @click="handleLogout" color="white" text-color="black" label="Logout" /></div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <div class="q-ma-sm"><q-img fit="cover" src="~assets/logo.png" /></div>

        <q-item-label header> welcome to Fatoura </q-item-label>

        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />

        <q-item class="fixed-bottom">
          <q-item-section>
            <q-select
              v-model="theme"
              :options="themeOptions"
              label="Theme"
              emit-value
              map-options
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, watch } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'

const router = useRouter()
const auth = useAuthStore()

const themeOptions = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'orange', value: 'orange' },
]
const theme = ref('light')
watch(theme, (val) => document.body.setAttribute('data-theme', val), { immediate: true })

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
  auth.logout() // Clears token + store + headers
  router.push('/login') // Redirect back to login page
}
</script>
