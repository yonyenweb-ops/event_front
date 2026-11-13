import { reactive } from 'vue'
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

/**
 * Real-time state shared by all views.
 *  - eventsTick: bumps when events / spot counts change -> lists & details reload
 *  - myTick:     bumps when one of *my* requests was approved / rejected
 *  - toasts:     notifications shown in the corner
 */
export const live = reactive({
  connected: false,
  eventsTick: 0,
  myTick: 0,
  toasts: [],
})

let echo = null
let toastId = 0

export function toast(message, kind = 'info') {
  const id = ++toastId
  live.toasts.push({ id, message, kind })
  setTimeout(() => {
    live.toasts = live.toasts.filter((t) => t.id !== id)
  }, 6000)
}

/** (Re)connect. Call on app start and whenever the logged-in user changes. */
export function connectLive(user) {
  echo?.disconnect()

  const scheme = import.meta.env.VITE_REVERB_SCHEME ?? 'http'
  echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: scheme === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${import.meta.env.VITE_API_URL}/broadcasting/auth`,
    auth: { headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, Accept: 'application/json' } },
  })

  echo.connector.pusher.connection.bind('state_change', ({ current }) => {
    live.connected = current === 'connected'
  })

  // Public: anyone browsing sees new events and spot counts update live.
  echo
    .channel('events')
    .listen('.events.changed', (e) => {
      live.eventsTick++
      if (e.action === 'created') toast(`🎉 New event: ${e.title}`)
    })
    .listen('.registration.status', () => live.eventsTick++)

  // Private: only this client gets their approve / reject notifications.
  if (user) {
    echo.private(`App.Models.User.${user.id}`).listen('.registration.status', (e) => {
      live.myTick++
      if (e.status === 'approved') toast(`✅ You're approved for "${e.event_title}"!`, 'success')
      else if (e.status === 'rejected') toast(`❌ Your request for "${e.event_title}" was rejected.`, 'error')
    })
  }
}
