<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { auth } from '../auth'
import { errorMessage } from '../api'

const route = useRoute()
const router = useRouter()
const form = ref({ email: '', password: '' })
const error = ref('')
const busy = ref(false)

async function submit() {
  busy.value = true
  error.value = ''
  try {
    await auth.login(form.value)
    router.push(route.query.redirect || '/')
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <form class="card auth-box" @submit.prevent="submit">
    <h1>Login</h1>
    <p class="muted">Welcome back! Log in to join events.</p>
    <label for="email">Email</label>
    <input id="email" v-model="form.email" type="email" required autofocus />
    <label for="password">Password</label>
    <input id="password" v-model="form.password" type="password" required />
    <div v-if="error" class="alert error">{{ error }}</div>
    <button class="btn block" style="margin-top:18px" :disabled="busy">{{ busy ? 'Logging in…' : 'Login' }}</button>
    <p class="muted" style="text-align:center">
      No account? <RouterLink :to="{ name: 'register', query: route.query }">Sign up</RouterLink>
    </p>
  </form>
</template>
