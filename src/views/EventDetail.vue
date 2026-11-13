<script setup>
import { ref, onMounted, watch } from 'vue'
import { live } from '../live'
import { useRoute } from 'vue-router'
import api, { errorMessage } from '../api'
import { auth } from '../auth'
import { formatDate, statusText, coverStyle, initials } from '../format'

const props = defineProps({ id: { type: String, required: true } })
const route = useRoute()

const event = ref(null)
const loading = ref(true)
const error = ref('')

const form = ref({ phone: auth.user?.phone || '', note: '' })
const joining = ref(false)
const joinError = ref('')
const joinSuccess = ref('')

async function load(silent = false) {
  if (!silent) loading.value = true
  try {
    const { data } = await api.get(`/events/${props.id}`)
    event.value = data
    error.value = ''
  } catch (e) {
    error.value = e.response?.status === 404 ? 'Event not found.' : errorMessage(e)
  } finally {
    loading.value = false
  }
}

async function join() {
  joining.value = true
  joinError.value = ''
  try {
    const { data } = await api.post(`/events/${props.id}/join`, form.value)
    joinSuccess.value = data.message
    event.value.my_registration = data.registration
  } catch (e) {
    joinError.value = errorMessage(e)
  } finally {
    joining.value = false
  }
}

onMounted(() => load())

// Real-time: spot counts change, or admin approved/rejected my request -> refresh quietly
watch(() => [live.eventsTick, live.myTick], () => {
  joinSuccess.value = ''
  load(true)
})
</script>

<template>
  <RouterLink to="/" class="muted">← Back to events</RouterLink>

  <div v-if="error" class="alert error">{{ error }}</div>
  <p v-else-if="loading" class="muted">Loading…</p>

  <div v-else class="detail" style="margin-top:16px">
    <section>
      <div class="hero" :style="coverStyle(event)">
        <span v-if="!event.image_url" class="cover-initials big">{{ initials(event.title) }}</span>
        <div class="hero-caption">
          <h1>{{ event.title }}</h1>
          <span>📍 {{ event.location }}</span>
        </div>
      </div>
      <div class="meta" style="margin-bottom:16px">
        <span>📅 {{ formatDate(event.start_at) }}<template v-if="event.end_at"> → {{ formatDate(event.end_at) }}</template></span>
        <span>📍 {{ event.location }}</span>
        <span v-if="event.capacity">👥 {{ event.approved_count }} / {{ event.capacity }} joined · {{ event.spots_left }} spots left</span>
        <span v-else>👥 {{ event.approved_count }} joined · unlimited spots</span>
      </div>
      <p class="description">{{ event.description || 'No description.' }}</p>
    </section>

    <aside class="card">
      <h3 style="margin-top:0">Join this event</h3>

      <!-- Already requested -->
      <template v-if="event.my_registration">
        <div v-if="joinSuccess" class="alert success">{{ joinSuccess }}</div>
        <p>Your status:
          <span class="badge" :class="event.my_registration.status">{{ statusText[event.my_registration.status] }}</span>
        </p>
        <RouterLink to="/my-events">View my events →</RouterLink>
      </template>

      <p v-else-if="event.has_started" class="alert info">This event has already started.</p>
      <p v-else-if="event.is_full" class="alert info">Sorry, this event is full.</p>

      <!-- Not logged in -->
      <template v-else-if="!auth.loggedIn">
        <p class="muted">Please log in to request a spot.</p>
        <RouterLink :to="{ name: 'login', query: { redirect: route.fullPath } }" class="btn block" style="text-align:center">Login to join</RouterLink>
        <p class="muted" style="font-size:14px">No account? <RouterLink :to="{ name: 'register', query: { redirect: route.fullPath } }">Sign up</RouterLink></p>
      </template>

      <!-- Join form -->
      <form v-else @submit.prevent="join">
        <label for="phone">Phone</label>
        <input id="phone" v-model="form.phone" placeholder="Your phone number" />
        <label for="note">Message to organizer (optional)</label>
        <textarea id="note" v-model="form.note" placeholder="Anything we should know?"></textarea>
        <div v-if="joinError" class="alert error">{{ joinError }}</div>
        <button class="btn block" style="margin-top:14px" :disabled="joining">
          {{ joining ? 'Sending…' : 'Request to join' }}
        </button>
        <p class="muted" style="font-size:13px">The admin will approve or reject your request.</p>
      </form>
    </aside>
  </div>
</template>
