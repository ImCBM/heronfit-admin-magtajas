<!--
  OTPVerification.vue
  Purpose: Handles OTP verification for new user registration
-->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { supabase } from '../../services/supabase'

const props = defineProps<{
  email: string
}>()

const emit = defineEmits<{
  (e: 'verified'): void
  (e: 'back'): void
}>()

const otp = ref('')
const error = ref('')
const countdown = ref(60)
const canResend = ref(false)
const verifying = ref(false)

let countdownInterval: number | null = null

const startCountdown = () => {
  countdown.value = 60
  canResend.value = false
  countdownInterval = window.setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      canResend.value = true
      if (countdownInterval) {
        clearInterval(countdownInterval)
      }
    }
  }, 1000)
}

const handleVerify = async () => {
  if (!otp.value) {
    error.value = 'Please enter the OTP'
    return
  }

  verifying.value = true
  error.value = ''

  try {
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email: props.email,
      token: otp.value,
      type: 'signup'
    })

    if (verifyError) throw verifyError

    if (data?.user) {
      emit('verified')
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to verify OTP'
  } finally {
    verifying.value = false
  }
}

const handleResend = async () => {
  if (!canResend.value) return

  try {
    const { error: resendError } = await supabase.auth.signInWithOtp({
      email: props.email
    })

    if (resendError) throw resendError

    startCountdown()
  } catch (err: any) {
    error.value = err.message || 'Failed to resend OTP'
  }
}

onMounted(() => {
  startCountdown()
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})
</script>

<template>
  <div class="space-y-4">
    <div class="text-center">
      <h3 class="text-lg font-medium text-text-primary">Verify Your Email</h3>
      <p class="text-sm text-text-light mt-2">
        We've sent a verification code to {{ email }}
      </p>
    </div>

    <div>
      <label class="block text-sm font-medium text-text-light">Enter Verification Code</label>
      <input 
        type="text" 
        v-model="otp"
        placeholder="Enter 6-digit code"
        class="mt-1 block w-full rounded-md border border-table p-2"
        maxlength="6"
        :disabled="verifying"
      >
      <p v-if="error" class="mt-1 text-sm text-error">{{ error }}</p>
    </div>

    <div class="flex justify-between items-center">
      <button 
        type="button"
        @click="emit('back')"
        class="text-sm text-text-light hover:text-text-primary"
        :disabled="verifying"
      >
        ← Back
      </button>
      <button 
        type="button"
        @click="handleResend"
        class="text-sm text-primary hover:text-primary-dark"
        :disabled="!canResend || verifying"
      >
        {{ canResend ? 'Resend Code' : `Resend in ${countdown}s` }}
      </button>
    </div>

    <div class="pt-4">
      <button 
        type="button"
        @click="handleVerify"
        class="w-full px-4 py-2 text-sm font-medium text-text-white bg-primary rounded-md hover:bg-primary-dark disabled:opacity-50"
        :disabled="verifying"
      >
        {{ verifying ? 'Verifying...' : 'Verify' }}
      </button>
    </div>
  </div>
</template> 