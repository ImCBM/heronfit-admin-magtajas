<script setup lang="ts">
import { useRouter } from 'vue-router'
import { 
  LayoutDashboard, 
  CalendarRange, 
  Users, 
  Timer, 
  Megaphone, 
  BarChart3, 
  LogOut 
} from 'lucide-vue-next'

const router = useRouter()

const navigation = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Booking Management', path: '/dashboard/booking', icon: CalendarRange },
  { name: 'User Management', path: '/dashboard/users', icon: Users },
  { name: 'Session Management', path: '/dashboard/sessions', icon: Timer },
  { name: 'Announcements', path: '/dashboard/announcements', icon: Megaphone },
  { name: 'Data Reports', path: '/dashboard/analytics', icon: BarChart3 }
]

const handleLogout = () => {
  router.push('/authentication')
}
</script>

<template>
  <aside class="bg-sidebar text-text-white h-screen fixed left-0 w-64 flex flex-col">
    <div class="p-4 flex items-center">
      <img src="/src/assets/img/logo_heronfit.png" alt="HeronFit" class="h-20 mb-4">
      <h1 class="text-default mr-5 text-4xl font-bold">HeronFit</h1>
    </div>
    <nav class="pl-2 text-default flex-1 overflow-y-auto">
      <router-link
        v-for="item in navigation"
        :key="item.name"
        :to="item.path"
        class="flex items-center px-4 py-2 hover:bg-primary-dark transition-colors"
        :class="$route.path === item.path ? 'bg-primary-dark' : ''"
      >
        <component :is="item.icon" class="w-5 h-5 mr-2" />
        {{ item.name }}
      </router-link>
    </nav>
    <button 
      @click="handleLogout"
      class="text-default m-4 p-2 bg-primary-dark hover:bg-primary-light transition-colors rounded text-center flex items-center justify-center gap-2"
    >
      <LogOut class="w-5 h-5" />
      Logout
    </button>
  </aside>
</template>