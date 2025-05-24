<!--
  UserManagement.vue
  Purpose: Main user management interface for administrators
  Features:
  - User listing with search and sort functionality
  - Detailed user profile view with tabs (Profile, Activity, Security)
  - User information editing capabilities
  - User deletion functionality
  - Real-time user list updates (30-second intervals)
-->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import Tabs from '../components/ui/Tabs.vue'
import TabPanel from '../components/ui/TabPanel.vue'
import Table from '../components/ui/Table.vue'
import Dropdown from '../components/ui/Dropdown.vue'
import Modal from '../components/ui/Modal.vue'
import NewUserForm from '../components/forms/NewUserForm.vue'
import { User } from '../models/User'
import { UserController } from '../controllers/UserController'

const showDetails = ref(false)
const currentTab = ref('profile')
const users = ref<(User & { status: string })[]>([])
const loading = ref(true)
const selectedUser = ref<User | null>(null)
const loadingUserDetails = ref(false)
const savingUser = ref(false)
const deletingUser = ref(false)
const searchQuery = ref('')
const sortField = ref('created_at')
const sortDirection = ref<'asc' | 'desc'>('desc')
const showNewUserModal = ref(false)
const creatingUser = ref(false)

// Computed properties for form fields
const firstName = computed({
  get: () => selectedUser.value?.first_name ?? '',
  set: (value: string) => {
    if (selectedUser.value) {
      selectedUser.value = { ...selectedUser.value, first_name: value }
    }
  }
})

const lastName = computed({
  get: () => selectedUser.value?.last_name ?? '',
  set: (value: string) => {
    if (selectedUser.value) {
      selectedUser.value = { ...selectedUser.value, last_name: value }
    }
  }
})

const email = computed({
  get: () => selectedUser.value?.email_address ?? '',
  set: (value: string) => {
    if (selectedUser.value) {
      selectedUser.value = { ...selectedUser.value, email_address: value }
    }
  }
})

const phone = computed({
  get: () => selectedUser.value?.phone ?? '',
  set: (value: string) => {
    if (selectedUser.value) {
      selectedUser.value = { ...selectedUser.value, phone: value }
    }
  }
})

const tabs = [
  { name: 'Profile', key: 'profile' },
  { name: 'Activity', key: 'activity' },
  { name: 'Security', key: 'security' }
]

const columns = [
  { key: 'first_name', label: 'First Name' },
  { key: 'last_name', label: 'Last Name' },
  { key: 'email_address', label: 'Email' },
  { 
    key: 'status', 
    label: 'Status',
    type: 'status' as const,
    statusColors: {
      'Active': { bg: 'bg-active', text: 'text-active' },
      'Inactive': { bg: 'bg-inactive', text: 'text-inactive' }
    }
  },
  { key: 'actions', label: 'Actions', type: 'actions' as const }
]

const sortOptions = [
  { label: 'First Name', value: 'first_name' },
  { label: 'Last Name', value: 'last_name' },
  { label: 'Email', value: 'email_address' },
  { label: 'Account Created', value: 'created_at' },
  { label: 'Status', value: 'status' }
]

const directionOptions = [
  { label: 'Ascending', value: 'asc' },
  { label: 'Descending', value: 'desc' }
]

const updateUsers = (updatedUsers: (User & { status: string })[]) => {
  users.value = updatedUsers
  loading.value = false
}

const openUserDetails = async (userId: string) => {
  loadingUserDetails.value = true
  try {
    const userData = await UserController.getUserById(userId)
    if (userData) {
      selectedUser.value = userData
      showDetails.value = true
    }
  } catch (error) {
    console.error('Error loading user details:', error)
  } finally {
    loadingUserDetails.value = false
  }
}

const handleSave = async () => {
  if (!selectedUser.value?.id) return

  savingUser.value = true
  try {
    const updatedUser = await UserController.updateUser(selectedUser.value.id, {
      first_name: selectedUser.value.first_name,
      last_name: selectedUser.value.last_name,
      email_address: selectedUser.value.email_address,
      phone: selectedUser.value.phone
    })
    
    if (updatedUser) {
      selectedUser.value = updatedUser
    }
  } catch (error) {
    console.error('Error saving user:', error)
  } finally {
    savingUser.value = false
  }
}

const handleDelete = async () => {
  if (!selectedUser.value?.id || !confirm('Are you sure you want to delete this user?')) return

  deletingUser.value = true
  try {
    const success = await UserController.deleteUser(selectedUser.value.id)
    if (success) {
      showDetails.value = false
    }
  } catch (error) {
    console.error('Error deleting user:', error)
  } finally {
    deletingUser.value = false
  }
}

const handleSearch = (event: Event) => {
  const query = (event.target as HTMLInputElement).value
  searchQuery.value = query
  loading.value = true
  UserController.searchUsers(query, updateUsers)
}

const handleCreateUser = async (userData: Partial<User>) => {
  creatingUser.value = true
  try {
    const newUser = await UserController.createUser(userData)
    if (newUser) {
      showNewUserModal.value = false
      await UserController.fetchUsers()
    }
  } catch (error) {
    console.error('Error creating user:', error)
  } finally {
    creatingUser.value = false
  }
}

// Apply sorting whenever sort field or direction changes
watch([sortField, sortDirection], () => {
  UserController.setSortOptions({ field: sortField.value, direction: sortDirection.value })
})

onMounted(() => {
  // Start periodic updates every 30 seconds
  UserController.startUserListUpdate(updateUsers, 30000)
})

onUnmounted(() => {
  // Clean up the interval when component is unmounted
  UserController.stopUserListUpdate()
})
</script>

<template>
  <div class="p-6">
    <div v-if="!showDetails">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-primary">User Management</h1>
        <button 
          @click="showNewUserModal = true"
          class="bg-primary text-text-white px-4 py-2 rounded-md hover:bg-primary-dark"
        >
          Add New User
        </button>
      </div>

      <div class="bg-surface rounded-lg shadow">
        <div class="p-4 space-y-4">
          <div class="flex gap-4">
            <div class="flex-1">
              <input 
                type="text" 
                placeholder="Search users..."
                class="w-full rounded-md border border-table p-2"
                :value="searchQuery"
                @input="handleSearch"
              >
            </div>
          </div>
          
          <div class="flex gap-4">
            <div class="w-48">
              <Dropdown
                v-model="sortField"
                :options="sortOptions"
                placeholder="Sort by..."
                label="Sort Field"
              />
            </div>
            <div class="w-48">
              <Dropdown
                v-model="sortDirection"
                :options="directionOptions"
                placeholder="Direction..."
                label="Sort Direction"
              />
            </div>
          </div>
        </div>
        
        <div v-if="loading" class="p-4 text-center text-text-light">
          Loading users...
        </div>
        
        <Table 
          v-else
          :columns="columns" 
          :data="users"
          max-height="400px"
        >
          <template #actions="{ row }">
            <button 
              @click="openUserDetails(row.id)"
              class="text-primary hover:text-primary-dark"
              :disabled="loadingUserDetails"
            >
              {{ loadingUserDetails ? 'Loading...' : 'View Details' }}
            </button>
          </template>
        </Table>
      </div>
    </div>

    <div v-else>
      <div class="flex items-center mb-6">
        <button 
          @click="showDetails = false"
          class="text-primary hover:text-primary-dark mr-2"
        >
          ← Back
        </button>
        <h1 class="text-2xl font-bold text-primary">Profile Details</h1>
      </div>

      <Tabs
        v-model="currentTab"
        :tabs="tabs"
        class="mb-4"
      >
        <TabPanel name="profile" :selected-tab="currentTab">
          <div class="bg-surface rounded-lg shadow p-6">
            <form class="space-y-4" @submit.prevent="handleSave">
              <div>
                <label class="block text-sm font-medium text-text-light">First Name</label>
                <input 
                  type="text" 
                  class="mt-1 block w-full rounded-md border border-table p-2" 
                  v-model="firstName"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-text-light">Last Name</label>
                <input 
                  type="text" 
                  class="mt-1 block w-full rounded-md border border-table p-2" 
                  v-model="lastName"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-text-light">Email</label>
                <input 
                  type="email" 
                  class="mt-1 block w-full rounded-md border border-table p-2" 
                  v-model="email"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-text-light">Phone</label>
                <input 
                  type="tel" 
                  class="mt-1 block w-full rounded-md border border-table p-2" 
                  v-model="phone"
                >
              </div>
              <div class="pt-2">
                <p class="text-sm text-text-light">User ID: {{ selectedUser?.id }}</p>
                <p class="text-sm text-text-light">Registration Date: {{ selectedUser?.created_at }}</p>
                <p class="text-sm text-text-light">Gender: {{ selectedUser?.gender }}</p>
                <p class="text-sm text-text-light">Fitness Goal: {{ selectedUser?.goal }}</p>
                <p class="text-sm text-text-light">Height: {{ selectedUser?.height }}cm</p>
                <p class="text-sm text-text-light">Weight: {{ selectedUser?.weight }}kg</p>
              </div>
              <div class="flex gap-4">
                <button 
                  type="submit" 
                  class="bg-primary text-text-white px-4 py-2 rounded-md hover:bg-primary-dark"
                  :disabled="savingUser"
                >
                  {{ savingUser ? 'Saving...' : 'Save' }}
                </button>
                <button 
                  type="button" 
                  class="bg-error text-text-white px-4 py-2 rounded-md hover:bg-error/80"
                  :disabled="deletingUser"
                  @click="handleDelete"
                >
                  {{ deletingUser ? 'Deleting...' : 'Delete' }}
                </button>
              </div>
            </form>
          </div>
        </TabPanel>

        <TabPanel name="activity" :selected-tab="currentTab">
          <div class="bg-surface rounded-lg shadow p-6">
            <h3 class="text-lg font-medium mb-4">Activity History</h3>
            <div class="space-y-4">
              <div class="border-l-4 border-primary pl-4">
                <p class="text-sm text-text-light">Last Session: October 15 2024</p>
                <p class="text-sm text-text-light">Status: Present</p>
              </div>
              <div class="border-l-4 border-primary pl-4">
                <p class="text-sm text-text-light">Last Session: October 19 2024</p>
                <p class="text-sm text-text-light">Status: Present</p>
              </div>
            </div>
          </div>
        </TabPanel>

        <TabPanel name="security" :selected-tab="currentTab">
          <div class="bg-surface rounded-lg shadow p-6">
            <div class="flex justify-center">
              <button type="button" class="bg-primary-light text-lazy-white px-8 py-2 rounded-md hover:bg-primary-dark">
                Reset Password
              </button>
            </div>
          </div>
        </TabPanel>
      </Tabs>
    </div>

    <!-- New User Modal -->
    <Modal
      :is-open="showNewUserModal"
      title="Create New User"
      @close="showNewUserModal = false"
    >
      <NewUserForm
        @submit="handleCreateUser"
        @cancel="showNewUserModal = false"
      />
    </Modal>
  </div>
</template>