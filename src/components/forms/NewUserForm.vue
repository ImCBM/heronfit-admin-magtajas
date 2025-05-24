<!--
  NewUserForm.vue
  Purpose: Form component for creating new users
-->
<script setup lang="ts">
import { ref } from 'vue'
import { User } from '../../models/User'
import { UserService } from '../../services/user.service'
import OTPVerification from '../auth/OTPVerification.vue'

const emit = defineEmits<{
  (e: 'submit', userData: Partial<User>): void
  (e: 'cancel'): void
}>()

const formData = ref({
  first_name: '',
  last_name: '',
  email_address: '',
  birthday: '',
  gender: '',
  weight: '',
  height: '',
  goal: ''
})

const fitnessGoals = [
  { label: 'Lose Weight', value: 'lose_weight' },
  { label: 'Build Muscle', value: 'build_muscle' },
  { label: 'Improve Endurance', value: 'improve_endurance' },
  { label: 'General Fitness', value: 'general_fitness' }
]

const showConfirmDialog = ref(false)
const confirmAction = ref<'submit' | 'cancel' | null>(null)
const showOTP = ref(false)
const creatingUser = ref(false)
const error = ref('')

const handleSubmit = async () => {
  if (!formData.value.email_address) {
    error.value = 'Email is required'
    return
  }

  creatingUser.value = true
  error.value = ''

  try {
    const { user, error: createError } = await UserService.createUserWithAuth(formData.value)
    
    if (createError) {
      throw new Error(createError)
    }

    if (user) {
      showOTP.value = true
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to create user'
  } finally {
    creatingUser.value = false
  }
}

const handleCancel = () => {
  confirmAction.value = 'cancel'
  showConfirmDialog.value = true
}

const handleConfirm = () => {
  if (confirmAction.value === 'submit') {
    handleSubmit()
  } else {
    emit('cancel')
  }
  showConfirmDialog.value = false
  confirmAction.value = null
}

const handleCancelConfirm = () => {
  showConfirmDialog.value = false
  confirmAction.value = null
}

const handleOTPVerified = () => {
  emit('submit', formData.value)
}

const handleOTPBack = () => {
  showOTP.value = false
}
</script>

<template>
  <div v-if="!showOTP">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-text-light">First Name</label>
          <input 
            type="text" 
            v-model="formData.first_name"
            placeholder="Enter first name"
            class="mt-1 block w-full rounded-md border border-table p-2"
            required
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-text-light">Last Name</label>
          <input 
            type="text" 
            v-model="formData.last_name"
            placeholder="Enter last name"
            class="mt-1 block w-full rounded-md border border-table p-2"
            required
          >
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-text-light">Email</label>
        <input 
          type="email" 
          v-model="formData.email_address"
          placeholder="Enter email address"
          class="mt-1 block w-full rounded-md border border-table p-2"
          required
        >
      </div>

      <div>
        <label class="block text-sm font-medium text-text-light">Birthday</label>
        <input 
          type="date" 
          v-model="formData.birthday"
          class="mt-1 block w-full rounded-md border border-table p-2"
          required
        >
      </div>

      <div>
        <label class="block text-sm font-medium text-text-light">Gender</label>
        <select 
          v-model="formData.gender"
          class="mt-1 block w-full rounded-md border border-table p-2"
          required
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-text-light">Weight (kg)</label>
          <input 
            type="number" 
            v-model="formData.weight"
            placeholder="Enter weight in kg"
            class="mt-1 block w-full rounded-md border border-table p-2"
            min="0"
            step="0.1"
            required
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-text-light">Height (cm)</label>
          <input 
            type="number" 
            v-model="formData.height"
            placeholder="Enter height in cm"
            class="mt-1 block w-full rounded-md border border-table p-2"
            min="0"
            step="0.1"
            required
          >
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-text-light">Fitness Goal</label>
        <select 
          v-model="formData.goal"
          class="mt-1 block w-full rounded-md border border-table p-2"
          required
        >
          <option value="">Select a goal</option>
          <option v-for="goal in fitnessGoals" :key="goal.value" :value="goal.value">
            {{ goal.label }}
          </option>
        </select>
      </div>

      <p v-if="error" class="text-sm text-error">{{ error }}</p>

      <div class="flex justify-end space-x-4">
        <button 
          type="button"
          @click="handleCancel"
          class="px-4 py-2 text-sm font-medium text-text-light hover:text-text-primary"
          :disabled="creatingUser"
        >
          Cancel
        </button>
        <button 
          type="submit"
          class="px-4 py-2 text-sm font-medium text-text-white bg-primary rounded-md hover:bg-primary-dark disabled:opacity-50"
          :disabled="creatingUser"
        >
          {{ creatingUser ? 'Creating...' : 'Create User' }}
        </button>
      </div>
    </form>
  </div>

  <OTPVerification
    v-else
    :email="formData.email_address"
    @verified="handleOTPVerified"
    @back="handleOTPBack"
  />

  <!-- Confirmation Dialog -->
  <div v-if="showConfirmDialog" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative transform overflow-hidden rounded-lg bg-surface shadow-xl transition-all w-full max-w-md">
        <div class="px-6 py-4">
          <h3 class="text-lg font-medium text-text-primary mb-2">
            {{ confirmAction === 'submit' ? 'Create New User?' : 'Discard Changes?' }}
          </h3>
          <p class="text-sm text-text-light">
            {{ confirmAction === 'submit' 
              ? 'Are you sure you want to create this new user?' 
              : 'Are you sure you want to discard your changes?' }}
          </p>
        </div>
        <div class="px-6 py-4 border-t border-table flex justify-end space-x-4">
          <button 
            @click="handleCancelConfirm"
            class="px-4 py-2 text-sm font-medium text-text-light hover:text-text-primary"
          >
            Cancel
          </button>
          <button 
            @click="handleConfirm"
            class="px-4 py-2 text-sm font-medium text-text-white bg-primary rounded-md hover:bg-primary-dark"
          >
            {{ confirmAction === 'submit' ? 'Create' : 'Discard' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 