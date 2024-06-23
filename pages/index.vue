<template>
  <div class="w-full sm:w-9/10 md:max-w-custom mx-auto my-20 rounded-sm shadow-custom bg-white text-center py-5">
    <p>ようこそ！</p>
    <component :is="shouldShowLoginForm ? LoginForm : SignupForm" />
    <p class="text-sm mt-4">
      {{ shouldShowLoginForm ? '初めての方は' : 'アカウントをお持ちの方は' }}
      <span @click="toggleForm" class="text-blue-500 cursor-pointer underline">
        こちら
      </span>
      をクリック
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LoginForm from '@/components/LoginForm.vue'
import SignupForm from '@/components/SignupForm.vue'

const shouldShowLoginForm = ref(false)

const toggleForm = () => {
  shouldShowLoginForm.value = !shouldShowLoginForm.value
}
</script>
