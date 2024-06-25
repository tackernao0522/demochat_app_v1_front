<template>
    <nav class="flex flex-col sm:flex-row items-center justify-between p-2 sm:p-4">
        <div class="text-center sm:text-left mb-2 sm:mb-0">
            <p class="text-base sm:text-lg text-gray-700">こんにちは、{{ username }}さん</p>
            <p class="text-xs sm:text-sm text-gray-400">現在、{{ userEmail }}でログイン中です</p>
            <p class="text-red-500">{{ errorMessage }}</p>
        </div>
        <button @click="handleLogout" class="btn-primary">
            ログアウト
        </button>
    </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useLogout } from '../composables/useLogout'

const username = ref('')
const userEmail = ref('')
const { logout, error } = useLogout()
const errorMessage = ref('')

onMounted(() => {
    username.value = localStorage.getItem('name') || 'ゲスト'
    userEmail.value = localStorage.getItem('uid') || '不明なメールアドレス'
})

watch(error, (newError) => {
    errorMessage.value = newError || ''
})

const handleLogout = async () => {
    await logout()
}
</script>
