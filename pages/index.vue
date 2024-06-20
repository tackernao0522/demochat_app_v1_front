<template>
  <div class="w-full sm:w-9/10 md:max-w-custom mx-auto my-20 rounded-sm shadow-custom bg-white text-center py-5">
    <p>ようこそ！</p>
    <div v-if="shouldShowLoginForm" class="mt-4 flex flex-col justify-center items-center">
      <LoginForm />
      <p class="text-sm mt-4">初めての方は
        <span @click="shouldShowLoginForm = false" class="text-blue-500 cursor-pointer underline">
          こちら
        </span>
        をクリック
      </p>
    </div>
    <div v-if="!shouldShowLoginForm" class="mt-4 flex flex-col justify-center items-center">
      <SignupForm />
      <p class="text-sm mt-4">アカウントをお持ちの方は
        <span @click="shouldShowLoginForm = true" class="text-blue-500 cursor-pointer underline">
          こちら
        </span>
        をクリック
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const shouldShowLoginForm = ref(false)
</script>
