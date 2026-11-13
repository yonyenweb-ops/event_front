import { reactive } from 'vue'
import api from './api'

function readUser() {
  try {
    return JSON.parse(localStorage.getItem('user'))
  } catch {
    return null
  }
}

export const auth = reactive({
  user: readUser(),
  get loggedIn() {
    return !!this.user && !!localStorage.getItem('token')
  },

  save({ user, token }) {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    this.user = user
  },

  async login(form) {
    const { data } = await api.post('/login', form)
    this.save(data)
  },

  async register(form) {
    const { data } = await api.post('/register', form)
    this.save(data)
  },

  async logout() {
    try {
      await api.post('/logout')
    } catch {
      /* token may already be invalid */
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    this.user = null
  },
})
