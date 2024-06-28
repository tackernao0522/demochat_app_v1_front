<template>
    <client-only>
        <div class="min-h-screen bg-bodyBg text-bodyText flex flex-col items-center">
            <div class="w-full max-w-4xl mx-auto p-2 sm:p-4 bg-white rounded-lg shadow-md mt-4 sm:mt-16">
                <Navbar />
                <ChatWindow :messages="messages" />
                <NewChatForm />
            </div>
        </div>
    </client-only>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import Navbar from '../components/Navbar.vue'
import ChatWindow from '../components/ChatWindow.vue'
import NewChatForm from '../components/NewChatForm.vue'
import { useLocalStorage } from '../composables/useLocalStorage'

const messages = ref([])

const { $axios } = useNuxtApp()
const { getAuthData } = useLocalStorage()

const getMessages = async () => {
    try {
        const authData = getAuthData()
        const res = await $axios.get('/messages', {
            headers: {
                uid: authData.uid,
                "access-token": authData.token,
                client: authData.client
            }
        })
        if (!res) {
            throw new Error('メッセージ一覧を取得できませんでした')
        }
        messages.value = res.data
    } catch (err) {
        console.log(err)
    }
}

onMounted(() => {
    getMessages()
})

definePageMeta({
    middleware: 'auth'
})
</script>
