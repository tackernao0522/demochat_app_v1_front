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
import { ref, watch, onMounted } from 'vue'
import { useLogout } from '../composables/useLogout'
import { useLocalStorage } from '../composables/useLocalStorage'

const { getAuthData } = useLocalStorage()
const username = ref('ゲスト')
const userEmail = ref('不明なメールアドレス')

onMounted(() => {
    const authData = getAuthData()
    if (authData.name) {
        username.value = authData.name
    }
    if (authData.uid) {
        userEmail.value = authData.uid
    }
})

const { logout, error } = useLogout()
const errorMessage = ref('')

watch(error, (newError) => {
    errorMessage.value = newError || ''
})

const handleLogout = async () => {
    await logout()
}
</script>
