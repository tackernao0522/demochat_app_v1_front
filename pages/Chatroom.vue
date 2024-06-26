<template>
    <client-only>
        <div class="min-h-screen bg-bodyBg text-bodyText flex flex-col items-center">
            <div class="w-full max-w-4xl mx-auto p-2 sm:p-4 bg-white rounded-lg shadow-md mt-4 sm:mt-16">
                <Navbar />
            </div>
            <!-- Chatroom content will go here -->
        </div>
    </client-only>
</template>

<script setup lang="ts">
import Navbar from '../components/Navbar.vue'

definePageMeta({
    middleware: 'auth'
})
</script>
