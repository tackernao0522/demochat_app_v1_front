<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useNuxtApp } from '#app'
import Navbar from '../components/Navbar.vue'
import ChatWindow from '../components/ChatWindow.vue'
import NewChatForm from '../components/NewChatForm.vue'
import { useLocalStorage } from '../composables/useLocalStorage'

const messages = ref([])
const username = ref('ゲスト')
const userEmail = ref('不明なメールアドレス')

const { $axios, $cable } = useNuxtApp()
const { getAuthData } = useLocalStorage()

const getMessages = async () => {
    try {
        const authData = getAuthData()
        console.log('Auth Data:', authData)
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

    console.log('Sending message:', message)
    messageChannel.perform('receive', { message, email: user.email })
}

let messageChannel

onMounted(() => {
    const authData = getAuthData()
    if (authData.user.name) {
        username.value = authData.user.name
    }
    if (authData.uid) {
        userEmail.value = authData.uid
    }

    messageChannel = $cable.subscriptions.create('RoomChannel', {
        connected() {
            console.log('Connected to RoomChannel')
            getMessages()
        },
        received(data) {
            console.log('Received data:', data)
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
        console.log('Unsubscribing from RoomChannel')
        messageChannel.unsubscribe()
    }
})

definePageMeta({
    middleware: 'auth'
})
</script>
