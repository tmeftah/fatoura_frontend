<template>
  <q-page class="q-pa-md">
    <q-select
      v-model="theme"
      :options="themeOptions"
      label="Theme"
      emit-value
      map-options
      style="width: 220px"
    />
    <div class="q-mt-lg">
      <q-btn color="primary" label="Primary" />
      <q-btn color="secondary" class="q-ml-sm" label="Secondary" />
      <q-btn color="accent" class="q-ml-sm" label="Accent" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, watch } from 'vue'
const themeOptions = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'orange', value: 'orange' },
]
const theme = ref('light')
watch(theme, (val) => document.body.setAttribute('data-theme', val), { immediate: true })
</script>
