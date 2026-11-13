<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { auth } from '../auth'
import { errorMessage } from '../api'

const route = useRoute()
const router = useRouter()
const form = ref({ name: '', email: '', phone: '', password: '', password_confirmation: '' })
const error = ref('')
const busy = ref(false)

async function submit() {
  busy.value = true
  error.value = ''
  try {
    await auth.register(form.value)
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
    <h1>Create account</h1>
    <p class="muted">Sign up to join events.</p>
    <label for="name">Full name</label>
    <input id="name" v-model="form.name" required autofocus />
    <label for="email">Email</label>
    <input id="email" v-model="form.email" type="email" required />
    <label for="phone">Phone (optional)</label>
    <input id="phone" v-model="form.phone" />
    <label for="password">Password</label>
    <input id="password" v-model="form.password" type="password" minlength="6" required />
    <label for="password_confirmation">Confirm password</label>
    <input id="password_confirmation" v-model="form.password_confirmation" type="password" required />
    <div v-if="error" class="alert error">{{ error }}</div>
    <button class="btn block" style="margin-top:18px" :disabled="busy">{{ busy ? 'Creating…' : 'Sign up' }}</button>
    <p class="muted" style="text-align:center">
      Have an account? <RouterLink :to="{ name: 'login', query: route.query }">Login</RouterLink>
    </p>
  </form>
</template>
