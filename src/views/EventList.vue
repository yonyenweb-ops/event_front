<script setup>
import { ref, onMounted, watch } from 'vue'
import { live } from '../live'
import api, { errorMessage } from '../api'
import { formatDate, coverStyle, initials, dateParts } from '../format'

const events = ref([])
const meta = ref({ current_page: 1, last_page: 1 })
const search = ref('')
const loading = ref(true)
const error = ref('')

async function load(page = 1, silent = false) {
  if (!silent) loading.value = true
  error.value = ''
  try {
    const { data } = await api.get('/events', { params: { page, search: search.value || undefined } })
    events.value = data.data
    meta.value = { current_page: data.current_page, last_page: data.last_page }
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => load())

// Real-time: new/edited events or changed spot counts -> refresh quietly
watch(() => live.eventsTick, () => load(meta.value.current_page, true))
</script>

<template>
  <div class="toolbar">
    <div>
      <h1>Upcoming Events</h1>
      <p class="muted" style="margin:0">Find an event and request to join.</p>
    </div>
    <form class="search" @submit.prevent="load(1)">
      <input v-model="search" placeholder="Search title or location…" />
      <button class="btn">Search</button>
    </form>
  </div>

  <div v-if="error" class="alert error">{{ error }}</div>
  <p v-else-if="loading" class="muted">Loading events…</p>
  <p v-else-if="!events.length" class="muted">No upcoming events right now.</p>

  <div v-else class="grid">
    <RouterLink v-for="e in events" :key="e.id" :to="`/events/${e.id}`" class="card event-card">
      <div class="cover" :style="coverStyle(e)">
        <span v-if="!e.image_url" class="cover-initials">{{ initials(e.title) }}</span>
        <div class="date-badge">
          <strong>{{ dateParts(e.start_at).day }}</strong>
          <span>{{ dateParts(e.start_at).month }}</span>
        </div>
        <span v-if="e.is_full" class="badge full cover-tag">Full</span>
      </div>
      <div class="body">
        <h3>{{ e.title }}</h3>
        <div class="meta">
          <span>📅 {{ formatDate(e.start_at) }}</span>
          <span>📍 {{ e.location }}</span>
          <span v-if="e.capacity">👥 {{ e.spots_left }} of {{ e.capacity }} spots left</span>
          <span v-else>👥 Unlimited spots</span>
        </div>
      </div>
    </RouterLink>
  </div>

  <div v-if="meta.last_page > 1" class="pager">
    <button class="btn ghost sm" :disabled="meta.current_page <= 1" @click="load(meta.current_page - 1)">← Prev</button>
    <span class="muted">Page {{ meta.current_page }} / {{ meta.last_page }}</span>
    <button class="btn ghost sm" :disabled="meta.current_page >= meta.last_page" @click="load(meta.current_page + 1)">Next →</button>
  </div>
</template>
