<!--
  Dashboard.vue
  Purpose: Main administrative dashboard interface
  Features:
  - Overview of key metrics and statistics
  - Quick access to important administrative functions
  - System status and monitoring
  - Recent activity feed
-->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Card from '../components/ui/Card.vue'
import Table from '../components/ui/Table.vue'
import type { Column } from '../components/ui/Table.vue'
import { DashboardController } from '../controllers/DashboardController'
import { 
  UsersIcon, 
  UserGroupIcon, 
  CalendarDaysIcon, 
  TicketIcon 
} from '@heroicons/vue/24/outline'

const totalUsers = ref('0')

const stats = [
  { 
    label: 'Total Users', 
    value: totalUsers,
    icon: UsersIcon,
    iconClass: 'text-primary bg-primary/10 p-3 rounded-lg'
  },
  { 
    label: 'Current Occupancy', 
    value: '10/15 (65% full)',
    icon: UserGroupIcon,
    iconClass: 'text-primary bg-primary/10 p-3 rounded-lg'
  },
  { 
    label: "Today's Bookings", 
    value: '48',
    icon: CalendarDaysIcon,
    iconClass: 'text-primary bg-primary/10 p-3 rounded-lg'
  },
  { 
    label: 'Pending Tickets', 
    value: '48',
    icon: TicketIcon,
    iconClass: 'text-primary bg-primary/10 p-3 rounded-lg'
  }
]

const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const sessions = [
  { date: currentDate, time: '8:00 am - 10:00 am', capacity: '10/15 spots left' },
  { date: currentDate, time: '8:00 am - 10:00 am', capacity: '12/15 spots left' },
  { date: currentDate, time: '8:00 am - 10:00 am', capacity: '8/15 spots left' },
  { date: currentDate, time: '8:00 am - 10:00 am', capacity: '13/15 spots left' }
]

const bookings = [
  {
    name: 'John Case',
    date: '2024-10-15 8:00 AM',
    status: 'Pending',
    ticketId: 'Verified'
  },
  {
    name: 'John Case',
    date: '2024-10-15 8:00 AM',
    status: 'Pending',
    ticketId: 'Verified'
  },
  {
    name: 'John Case',
    date: '2024-10-15 8:00 AM',
    status: 'Pending',
    ticketId: 'Verified'
  }
]

const columns: Column[] = [
  { key: 'name', label: 'Name' },
  { key: 'date', label: 'Date & Time' },
  { 
    key: 'status', 
    label: 'Booking Status',
    type: 'status',
    statusColors: {
      'Pending': { bg: 'bg-pending', text: 'text-pending' }
    }
  },
  { 
    key: 'ticketId', 
    label: 'Ticket ID',
    type: 'status',
    statusColors: {
      'Verified': { bg: 'bg-verified', text: 'text-verified' }
    }
  },
  { key: 'actions', label: 'Actions', type: 'actions' }
]

const router = useRouter()

const navigateTo = (route: string) => {
  router.push(`/dashboard/${route}`)
}

onMounted(() => {
  DashboardController.startUserCountUpdate((count) => {
    totalUsers.value = count
  })
})

onUnmounted(() => {
  DashboardController.stopUserCountUpdate()
})
</script>

<template>
  <div class="p-6 bg-background">
    <h1 class="text-4xl ml-5 font-bold text-primary mb-6">Admin Dashboard</h1>

    <!-- Stats Cards -->
    <div class="grid grid-cols-4 gap-4 mb-6 ">
      <Card v-for="stat in stats" :key="stat.label" padding="p-4">
        <div class="flex items-start space-x-4">
          <div class="p-3 rounded-lg bg-primary/10">
            <component 
              :is="stat.icon" 
              class="w-6 h-6 text-primary"
            />
          </div>
          <div>
            <span class="block text-2xl font-semibold">{{ typeof stat.value === 'string' ? stat.value : stat.value.value }}</span>
            <p class="text-text-light text-sm">{{ stat.label }}</p>
          </div>
        </div>
      </Card>
    </div>

    <!-- Upcoming Sessions -->
    <h2 class="text-xl font-semibold mb-4 text-text">Upcoming Sessions</h2>
    <div class="grid grid-cols-4 gap-4 mb-6">
      <Card v-for="session in sessions" :key="session.date" padding="p-4">
        <div>
          <p class="font-medium">{{ session.date }}</p>
          <p class="text-text-light">{{ session.time }}</p>
          <p class="text-success mt-2">{{ session.capacity }}</p>
        </div>
      </Card>
    </div>

    <!-- Recent Bookings -->
    <div class="mb-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-text">Recent Bookings</h2>
        <div class="flex gap-4">
          <select class="rounded-md border border-table p-2">
            <option>Filter by Status</option>
          </select>
          <input type="date" class="rounded-md border border-table p-2">
        </div>
      </div>
      <Card>
        <Table 
          :columns="columns" 
          :data="bookings"
          max-height="300px"
        >
          <template #actions>
            <button class="text-review hover:text-review/80 mr-2">Review</button>
            <button class="text-decline hover:text-decline/80">Decline</button>
          </template>
        </Table>
      </Card>
    </div>

    <!-- Overview Section -->
    <div class="grid grid-cols-2 gap-6">
      <!-- User Management Overview -->
      <Card title="User Management">
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-text">View All Users</span>
            <span class="font-semibold text-text">{{ totalUsers }} users</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-text">New Registrations (This Week)</span>
            <span class="font-semibold text-text">1,234 users</span>
          </div>
          <button 
            @click="navigateTo('users')"
            class="text-primary hover:text-primary-dark"
          >
            View More →
          </button>
        </div>
      </Card>

      <!-- Schedule Management Overview -->
      <Card title="Schedule Management">
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-text">Today's Sessions</span>
            <span class="font-semibold text-text">8 sessions</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-text">This Week's Bookings</span>
            <span class="font-semibold text-text">123 bookings</span>
          </div>
          <button 
            @click="navigateTo('sessions')"
            class="text-primary hover:text-primary-dark"
          >
            View More →
          </button>
        </div>
      </Card>

      <!-- Recent Announcements -->
      <Card title="Recent Announcements">
        <div class="space-y-4">
          <div>
            <h4 class="font-medium text-text">Gym Closure Notice</h4>
            <p class="text-sm text-text-light">Sent 2 days ago</p>
          </div>
          <div>
            <h4 class="font-medium text-text">Holiday Hours</h4>
            <p class="text-sm text-text-light">Draft</p>
          </div>
          <button 
            @click="navigateTo('announcements')"
            class="text-primary hover:text-primary-dark"
          >
            Manage Announcements →
          </button>
        </div>
      </Card>

      <!-- Data Reports Preview -->
      <Card title="Data Reports Preview">
        <div class="space-y-4">
          <div>
            <h4 class="font-medium text-text">Peak Hours</h4>
            <p class="text-lg font-semibold text-text">3pm - 5pm</p>
          </div>
          <div>
            <h4 class="font-medium text-text">User Retention Rate</h4>
            <p class="text-lg font-semibold text-text">78%</p>
          </div>
          <button 
            @click="navigateTo('analytics')"
            class="text-primary hover:text-primary-dark"
          >
            View Data Reports →
          </button>
        </div>
      </Card>
    </div>
  </div>
</template>