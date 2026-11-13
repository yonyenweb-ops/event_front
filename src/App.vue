<script setup>
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from './auth'
import { live, connectLive } from './live'

const router = useRouter()

// Connect to the WebSocket server; reconnect with the right identity on login / logout.
watch(() => auth.user?.id, () => connectLive(auth.user), { immediate: true })

async function logout() {
  await auth.logout()
  router.push({ name: 'events' })
}
</script>

<template>
  <header class="topbar">
    <div class="container topbar-inner">
      <RouterLink to="/" class="brand">🎟 Events</RouterLink>
      <nav>
        <span class="live-pill" :class="{ on: live.connected }" :title="live.connected ? 'Real-time updates on' : 'Offline'">
          <span class="dot"></span>{{ live.connected ? 'Live' : 'Offline' }}
        </span>
        <RouterLink to="/">Browse</RouterLink>
        <template v-if="auth.loggedIn">
          <RouterLink to="/my-events">My Events</RouterLink>
          <span class="who">Hi, {{ auth.user.name }}</span>
          <button class="btn ghost sm" @click="logout">Logout</button>
        </template>
        <template v-else>
          <RouterLink to="/login">Login</RouterLink>
          <RouterLink to="/register" class="btn sm">Sign up</RouterLink>
        </template>
      </nav>
    </div>
  </header>

  <main class="container">
    <RouterView />
  </main>

  <TransitionGroup name="toast" tag="div" class="toasts">
    <div v-for="t in live.toasts" :key="t.id" class="toast" :class="t.kind">{{ t.message }}</div>
  </TransitionGroup>
</template>
