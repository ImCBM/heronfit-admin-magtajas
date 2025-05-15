<!--
  Analytics.vue
  Purpose: Data visualization and analytics dashboard
  Features:
  - Business metrics and KPIs
  - User engagement statistics
  - Revenue tracking
  - Performance analytics
  - Custom report generation
-->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Card from '../components/ui/Card.vue'
import { Line, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { 
  Users, 
  Calendar, 
  UserCheck, 
  TrendingUp,
  Clock 
} from 'lucide-vue-next'
import { AnalyticsController } from '../controllers/AnalyticsController'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const stats = ref({
  totalUsers: 0,
  activeUsers: 0,
  averageAttendance: 0,
  todaysBookings: 0,
  peakHours: 0
})

const gymUsageData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  datasets: [{
    label: 'Gym Usage',
    data: [30, 45, 60, 70, 85, 95],
    borderColor: 'rgb(67, 56, 202)',
    backgroundColor: 'rgba(67, 56, 202, 0.1)',
    tension: 0.4,
    fill: true
  }]
}

const peakHoursData = {
  labels: ['8 am', '10 am', '12 pm', '2 pm', '4 pm', '6pm'],
  datasets: [{
    label: 'Peak Hours',
    data: [10, 20, 20, 15, 30, 25],
    backgroundColor: 'rgb(67, 56, 202)'
  }]
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.1)'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  },
  plugins: {
    legend: {
      display: false
    }
  }
}

onMounted(() => {
  AnalyticsController.startAnalyticsUpdate((newStats) => {
    stats.value = newStats
  })
})

onUnmounted(() => {
  AnalyticsController.stopAnalyticsUpdate()
})
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Data Reports</h1>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Charts Section -->
      <div class="lg:col-span-2 space-y-6">
        <Card title="Gym Usage This Week">
          <div class="h-[300px] w-full">
            <Line :data="gymUsageData" :options="chartOptions" />
          </div>
        </Card>

        <Card title="Peak Hours">
          <div class="h-[300px] w-full">
            <Bar :data="peakHoursData" :options="chartOptions" />
          </div>
        </Card>
      </div>

      <!-- Stats Cards -->
      <div class="space-y-4">
        <Card padding="p-4">
          <div class="flex items-center space-x-4">
            <div class="p-3 bg-primary/10 rounded-full">
              <Users class="w-6 h-6 text-primary" />
            </div>
            <div>
              <p class="text-sm text-gray-600">Total Users</p>
              <p class="text-2xl font-bold">{{ stats.totalUsers }}</p>
            </div>
          </div>
        </Card>

        <Card padding="p-4">
          <div class="flex items-center space-x-4">
            <div class="p-3 bg-primary/10 rounded-full">
              <Calendar class="w-6 h-6 text-primary" />
            </div>
            <div>
              <p class="text-sm text-gray-600">Today's Bookings</p>
              <p class="text-2xl font-bold">{{ stats.todaysBookings }}</p>
            </div>
          </div>
        </Card>

        <Card padding="p-4">
          <div class="flex items-center space-x-4">
            <div class="p-3 bg-primary/10 rounded-full">
              <UserCheck class="w-6 h-6 text-primary" />
            </div>
            <div>
              <p class="text-sm text-gray-600">Active Users</p>
              <p class="text-2xl font-bold">{{ stats.activeUsers }}</p>
            </div>
          </div>
        </Card>

        <Card padding="p-4">
          <div class="flex items-center space-x-4">
            <div class="p-3 bg-primary/10 rounded-full">
              <TrendingUp class="w-6 h-6 text-primary" />
            </div>
            <div>
              <p class="text-sm text-gray-600">Average Attendance Rate</p>
              <p class="text-2xl font-bold">{{ stats.averageAttendance }}%</p>
            </div>
          </div>
        </Card>

        <Card padding="p-4">
          <div class="flex items-center space-x-4">
            <div class="p-3 bg-primary/10 rounded-full">
              <Clock class="w-6 h-6 text-primary" />
            </div>
            <div>
              <p class="text-sm text-gray-600">Peak Gym Hours</p>
              <p class="text-2xl font-bold">{{ stats.peakHours }}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>