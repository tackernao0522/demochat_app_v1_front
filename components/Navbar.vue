<template>
    <nav class="navbar flex flex-col sm:flex-row items-center justify-between p-2 sm:p-4">
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
import { ref, onMounted } from 'vue'
import { useLogout } from '../composables/useLogout'
import { useCookiesAuth } from '../composables/useCookiesAuth'

const { getAuthData } = useCookiesAuth()
const username = ref('ゲスト')
const userEmail = ref('不明なメールアドレス')

onMounted(() => {
    const authData = getAuthData()
    if (authData.user && authData.user.name) {
        username.value = authData.user.name
    }
    if (authData.uid) {
        userEmail.value = authData.uid
    }
    console.log("Navbar Auth Data:", authData) // デバッグ用ログ
})

const { logout, error } = useLogout()
const errorMessage = ref('')

const handleLogout = async () => {
    try {
        await logout()
        // ログアウト処理は useLogout 内で行われるため、
        // ここでは追加のリダイレクト処理は不要です
    } catch (err) {
        errorMessage.value = error.value || 'ログアウトに失敗しました'
        console.error("Logout Error:", err)
    }
}
</script>
