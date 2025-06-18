<template>
  <q-page class="flex flex-center">
    <q-card class="q-pa-lg" style="min-width: 300px">
      <q-card-section>
        <div class="text-h6">Login</div>
      </q-card-section>
      <q-card-section>
        <q-input v-model="username" label="Username" />
        <q-input v-model="password" type="password" label="Password" class="q-mt-md" />
        <div v-if="auth.error" class="text-negative q-mt-md">{{ auth.error }}</div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn label="Login" color="primary" :loading="auth.loading" @click="login" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'

const router = useRouter()
const auth = useAuthStore()
const username = ref('')
const password = ref('')

async function login() {
  await auth.login(username.value, password.value)
  if (auth.token) {
    router.push('/')
  }
}
</script>
