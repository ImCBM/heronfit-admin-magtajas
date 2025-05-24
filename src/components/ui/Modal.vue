<!--
  Modal.vue
  Purpose: Reusable modal/popup component for displaying content over the main interface
-->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  isOpen: boolean
  title: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="emit('close')"></div>

    <!-- Modal -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div class="relative transform overflow-hidden rounded-lg bg-surface shadow-xl transition-all w-full max-w-md">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-table">
          <h3 class="text-lg font-medium text-text-primary">{{ title }}</h3>
        </div>

        <!-- Content -->
        <div class="px-6 py-4">
          <slot></slot>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-table">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </div>
</template> 