<template>
    <div class="min-h-screen bg-bodyBg text-bodyText flex flex-col items-center">
        <div class="w-full max-w-4xl mx-auto p-2 sm:p-4 bg-white rounded-lg shadow-md mt-4 sm:mt-16">
            <Navbar :username="username" :userEmail="userEmail" @logout="handleLogout" />
        </div>
        <!-- Chatroom content will go here -->
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Navbar from '@/components/Navbar.vue'

const username = ref('ユーザー名') // ここは実際のユーザー名に置き換えてください
const userEmail = ref('user@example.com') // ここは実際のユーザーメールに置き換えてください

const handleLogout = () => {
    // ログアウト処理をここに実装してください
    console.log('ログアウト処理')
}
</script>
