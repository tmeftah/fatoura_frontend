<template>
  <q-page class="flex flex-center login-bg">
    <div class="login-container">
      <q-card class="login-card shadow-8">
        <q-card-section class="text-center q-pa-none">
          <q-img
            src="icons/icon-96x96.png"
            width="72px"
            class="q-mt-lg q-mb-lg"
            style="filter: grayscale(0.16)"
            spinner-color="primary"
          />
          <h2 class="text-h5 text-weight-bold text-dark">
            Fatoura<span class="text-primary">.</span>
          </h2>
          <div class="text-subtitle2 text-grey-7 q-mt-xs q-mb-md">
            Welcome back! Please log in to your account.
          </div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="username"
            label="Username"
            outlined
            dense
            rounded
            color="primary"
            :rules="[(val) => !!val || 'Username is required']"
            autocomplete="username"
            class="login-input"
            autofocus
          />
          <q-input
            v-model="password"
            type="password"
            label="Password"
            outlined
            dense
            rounded
            color="primary"
            autocomplete="current-password"
            :rules="[(val) => !!val || 'Password is required']"
            class="login-input"
            @keydown.enter="login"
          />
          <transition name="fade">
            <div
              v-if="auth.error"
              class="text-negative text-caption q-mt-xs q-mb-xs"
              style="letter-spacing: 0.2px"
            >
              {{ auth.error }}
            </div>
          </transition>
        </q-card-section>

        <q-card-actions align="between" class="q-px-md q-pb-md q-pt-xs">
          <q-btn
            flat
            size="sm"
            label="Forgot password?"
            color="primary"
            class="text-caption"
            tabindex="-1"
            style="opacity: 0.88"
          />
          <q-btn
            label="Login"
            color="primary"
            class="login-btn"
            :loading="auth.loading"
            @click="login"
            unelevated
            rounded
            no-caps
            :disable="!username || !password"
            size="lg"
          />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import { useQuasar } from 'quasar'

const router = useRouter()
const auth = useAuthStore()
const username = ref('')
const password = ref('')
const $q = useQuasar()

async function login() {
  try {
    await auth.login(username.value, password.value)
    if (auth.token) {
      router.push('/')
    }
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Incorrect username or password',
      icon: 'warning',
    })
  }
}
</script>

<style scoped>
/* ---------- Gradient background ---------- */
.login-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #ece9ff 0%, #e3f0ff 100%);
}
/* ---------- Center container and card --------- */
.login-container {
  width: 100vw;
  max-width: 440px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 6vw 2vw;
}
.login-card {
  width: 100%;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow:
    0 4px 32px rgba(40, 80, 156, 0.14),
    0 1.5px 8px rgba(44, 76, 161, 0.1);
  min-width: 0;
  max-width: 100vw;
  min-height: 0;
  transition: box-shadow 0.2s;
}
.login-card:focus-within,
.login-card:hover {
  box-shadow:
    0 8px 36px rgba(40, 80, 156, 0.17),
    0 3px 12px rgba(44, 76, 161, 0.11);
}
.login-input {
  margin-bottom: 14px;
  font-size: 1rem;
}
.login-btn {
  font-weight: 600;
  letter-spacing: 0.5px;
  min-width: 110px;
  padding: 0 24px;
  border-radius: 24px;
  font-size: 1.07em;
}
/* ---------- Animations ---------- */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
/* ---------- Responsive Tweaks --------- */
@media (max-width: 600px) {
  .login-container {
    max-width: 99vw;
    padding: 0.5rem 0.5rem 2.5rem 0.5rem;
  }
  .login-card {
    border-radius: 12px;
    padding: 0;
    box-shadow:
      0 2px 14px #b7bcdc48,
      0 1px 4px #a6bedc47;
  }
}
</style>
