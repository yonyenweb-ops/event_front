import { createRouter, createWebHistory } from 'vue-router'
import { auth } from './auth'
import EventList from './views/EventList.vue'
import EventDetail from './views/EventDetail.vue'
import Login from './views/Login.vue'
import Register from './views/Register.vue'
import MyRegistrations from './views/MyRegistrations.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'events', component: EventList },
    { path: '/events/:id', name: 'event', component: EventDetail, props: true },
    { path: '/login', name: 'login', component: Login, meta: { guest: true } },
    { path: '/register', name: 'register', component: Register, meta: { guest: true } },
    { path: '/my-events', name: 'my-events', component: MyRegistrations, meta: { auth: true } },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  if (to.meta.auth && !auth.loggedIn) return { name: 'login', query: { redirect: to.fullPath } }
  if (to.meta.guest && auth.loggedIn) return { name: 'events' }
})

export default router
