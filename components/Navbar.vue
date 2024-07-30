<template>
    <nav class="bg-gray-100 border-b border-gray-200 p-4">
        <div class="container mx-auto">
            <div class="flex justify-end items-center">
                <button @click="toggleMenu" class="text-gray-700 hover:text-gray-900 focus:outline-none">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path v-if="!isMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16" />
                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <transition enter-active-class="transition ease-out duration-100 transform"
                enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75 transform" leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95">
                <div v-if="isMenuOpen" class="mt-4">
                    <div class="bg-white shadow-md rounded-lg overflow-hidden">
                        <div class="px-4 py-2 bg-gray-50">
                            <p class="text-base sm:text-lg">こんにちは、{{ displayUsername }}さん</p>
                            <p class="text-xs sm:text-sm text-gray-400">現在、{{ displayUserEmail }}でログイン中です</p>
                        </div>
                        <div class="divide-y divide-gray-200">
                            <a href="#" class="block px-4 py-3 hover:bg-gray-50">プロフィール</a>
                            <a href="#" class="block px-4 py-3 hover:bg-gray-50">設定</a>
                            <a href="#" class="block px-4 py-3 hover:bg-gray-50">ヘルプ</a>
                            <button @click="handleLogout"
                                class="w-full text-left px-4 py-3 hover:bg-gray-50 text-red-600">
                                ログアウト
                            </button>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useLogout } from '../composables/useLogout'
import { useCookiesAuth } from '../composables/useCookiesAuth'
import { logger } from '../utils/logger'

const props = defineProps({
    username: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    }
})

const { getAuthData } = useCookiesAuth()
const { logout, error } = useLogout()
const errorMessage = ref('')
const isMenuOpen = ref(false)

const displayUsername = computed(() => props.username || 'ゲスト')
const displayUserEmail = computed(() => props.userEmail || '未登録')

onMounted(() => {
    const authData = getAuthData()
    logger.debug("Navbar Auth Data:", authData)
})

const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value
}

const handleLogout = async () => {
    try {
        await logout()
        isMenuOpen.value = false // メニューを閉じる
    } catch (err) {
        errorMessage.value = error.value || 'ログアウトに失敗しました'
        logger.error("Logout Error:", err)
        alert(errorMessage.value)
    }
}
</script>
