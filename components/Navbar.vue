<template>
    <nav class="flex flex-col sm:flex-row items-center justify-between p-2 sm:p-4">
        <div class="text-center sm:text-left mb-2 sm:mb-0">
            <p class="text-base sm:text-lg text-gray-700">こんにちは、{{ username }}さん</p>
            <p class="text-xs sm:text-sm text-gray-400">現在、{{ userEmail }}でログイン中です</p>
        </div>
        <button @click="logout" class="btn-primary">
            ログアウト
        </button>
    </nav>
</template>

<script setup lang="ts">
const props = defineProps({
    username: String,
    userEmail: String
})

const emit = defineEmits(['logout'])

const logout = () => {
    emit('logout')
}
</script>
