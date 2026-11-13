<script setup>
import { ref, onMounted, watch } from 'vue'
import { live } from '../live'
import api, { errorMessage } from '../api'
import { formatDate, statusText } from '../format'

const items = ref([])
const loading = ref(true)
const error = ref('')
const message = ref('')

async function load(silent = false) {
  if (!silent) loading.value = true
  try {
    const { data } = await api.get('/my-registrations')
    items.value = data
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}

async function cancel(reg) {
  if (!confirm(`Cancel your request for "${reg.event.title}"?`)) return
  try {
    const { data } = await api.delete(`/registrations/${reg.id}`)
    message.value = data.message
    items.value = items.value.filter((r) => r.id !== reg.id)
  } catch (e) {
    error.value = errorMessage(e)
  }
}

onMounted(() => load())

// Real-time: status badge flips the moment the admin approves / rejects
watch(() => live.myTick, () => load(true))
</script>

<template>
  <h1>My Events</h1>
  <p class="muted">Track the status of your join requests.</p>

  <div v-if="message" class="alert success">{{ message }}</div>
  <div v-if="error" class="alert error">{{ error }}</div>
  <p v-if="loading" class="muted">Loading…</p>
  <p v-else-if="!items.length" class="muted">
    You haven't joined any events yet. <RouterLink to="/">Browse events →</RouterLink>
  </p>

  <div v-else class="list">
    <div v-for="r in items" :key="r.id" class="card list-item">
      <div>
        <RouterLink :to="`/events/${r.event.id}`"><strong>{{ r.event.title }}</strong></RouterLink>
        <div class="meta">
          <span>📅 {{ formatDate(r.event.start_at) }}</span>
          <span>📍 {{ r.event.location }}</span>
        </div>
      </div>
      <div style="display:flex;gap:10px;align-items:center">
        <span class="badge" :class="r.status">{{ statusText[r.status] }}</span>
        <button v-if="r.status === 'pending'" class="btn danger sm" @click="cancel(r)">Cancel</button>
      </div>
    </div>
  </div>
</template>
