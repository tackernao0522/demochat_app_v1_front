<template>
  <client-only>
    <div class="w-full sm:w-9/10 md:max-w-custom mx-auto my-20 rounded-sm shadow-custom bg-white text-center py-8">
      <p class="text-xl font-semibold mb-6">ようこそ！</p>
      <button @click="openModal" class="btn-primary mb-6">
        {{ state.shouldShowLoginForm ? 'ログイン' : '新規登録' }}
      </button>
      <p class="text-sm">
        {{ state.shouldShowLoginForm ? '初めての方は' : 'アカウントをお持ちの方は' }}
        <span @click="toggleForm" class="text-blue-500 cursor-pointer underline">
          こちら
        </span>
        をクリック
      </p>
    </div>

    <Teleport to="body">
      <div v-if="state.showModal" class="fixed inset-0 bg-black flex justify-center items-center z-50"
        @click.self="closeModal">
        <div class="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4 relative max-h-[90vh] overflow-y-auto">
          <button @click="closeModal" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
          <component :is="state.shouldShowLoginForm ? LoginForm : SignupForm" @close="closeModal" />
        </div>
      </div>
    </Teleport>
  </client-only>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import LoginForm from '../components/LoginForm.vue'
import SignupForm from '../components/SignupForm.vue'
import { definePageMeta } from '#imports'

// definePageMetaの呼び出しを分離
/* c8 ignore next 4 */
if (import.meta.env.SSR === false) {
  definePageMeta({
    middleware: ['auth'],
    requiresAuth: false
  })
}

const state = reactive({
  shouldShowLoginForm: false,
  showModal: false
})

const toggleForm = () => {
  state.shouldShowLoginForm = !state.shouldShowLoginForm
}

const openModal = computed(() => () => {
  state.showModal = true
})

const closeModal = computed(() => () => {
  state.showModal = false
})
</script>
