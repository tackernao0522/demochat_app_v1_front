<template>
    <client-only>
        <div class="min-h-screen bg-bodyBg text-bodyText flex flex-col items-center">
            <div class="chat-container">
                <Navbar :username="username" :userEmail="userEmail" />
                <ChatWindow :messages="messages" />
                <NewChatForm @newMessage="sendMessage" />
            </div>
        </div>
    </client-only>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useNuxtApp } from '#app'
import Navbar from '../components/Navbar.vue'
import ChatWindow from '../components/ChatWindow.vue'
import NewChatForm from '../components/NewChatForm.vue'
import { useCookiesAuth } from '../composables/useCookiesAuth'
import { useRedirect } from '../composables/useRedirect' // useRedirectをインポート

definePageMeta({
    middleware: ['auth'],
    requiresAuth: true
})

const messages = ref([])
const username = ref('')
const userEmail = ref('')

const { $axios, $cable } = useNuxtApp()
const { getAuthData, isAuthenticated } = useCookiesAuth()
const { redirectToLogin } = useRedirect() // redirectToLoginを使用

const getMessages = async () => {
    try {
        const authData = getAuthData()
        console.log("Auth Data in getMessages:", authData);  // デバッグログを追加
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
        messages.value = res.data.map((message) => ({
            ...message,
            sent_by_current_user: message.user_id === authData.user.id
        }))
        console.log('Fetched messages:', messages.value)
    } catch (err) {
        console.error('メッセージ一覧を取得できませんでした', err)
    }
}

const sendMessage = (message) => {
    const authData = getAuthData()
    const user = authData.user
    if (!user.email) return

    messageChannel.perform('receive', { message, email: user.email })
}

let messageChannel

onMounted(() => {
    if (!isAuthenticated()) {
        // トークンが無効または期限切れの場合、再ログインを促す
        redirectToLogin() // redirectToLoginを使用
        return
    }

    const authData = getAuthData()
    console.log("Auth Data on Mounted:", authData);  // デバッグログを追加
    if (authData.user.name) {
        username.value = authData.user.name
    }
    if (authData.uid) {
        userEmail.value = authData.uid
    }

    messageChannel = $cable.subscriptions.create('RoomChannel', {
        connected() {
            getMessages()
        },
        received(data) {
            const authData = getAuthData()
            const isSentByCurrentUser = data.email === authData.user.email

            messages.value.push({
                ...data,
                sent_by_current_user: isSentByCurrentUser
            })

            console.log('Received message:', data)
        }
    })
})

onBeforeUnmount(() => {
    if (messageChannel) {
        messageChannel.unsubscribe()
    }
})
</script>
