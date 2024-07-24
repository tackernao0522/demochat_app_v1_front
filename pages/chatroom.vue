<template>
    <div class="page-container">
        <div class="chat-container">
            <Navbar :username="username" :userEmail="userEmail" />
            <ChatWindow :messages="messages" @updateMessages="updateMessages" />
            <NewChatForm @newMessage="sendMessage" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useNuxtApp } from '#app'
import Navbar from '../components/Navbar.vue'
import ChatWindow from '../components/ChatWindow.vue'
import NewChatForm from '../components/NewChatForm.vue'
import { useCookiesAuth } from '../composables/useCookiesAuth'
import { useRedirect } from '../composables/useRedirect'

// definePageMetaの呼び出しを条件付きで行う
if (typeof definePageMeta !== 'undefined') {
    definePageMeta({
        middleware: ['auth'],
        requiresAuth: true
    })
}

const messages = ref([])
const username = ref('')
const userEmail = ref('')

const { $axios, $cable } = useNuxtApp()
const { getAuthData, isAuthenticated } = useCookiesAuth()
const { redirectToLogin } = useRedirect()

const getMessages = async () => {
    try {
        const authData = getAuthData();
        console.log("Auth Data in getMessages:", authData);
        if (!authData.token || !authData.client || !authData.uid) {
            console.error("認証情報が不足しています");
            return;
        }
        const res = await $axios.get('/messages');
        if (!res || !res.data) {
            throw new Error('メッセージ一覧を取得できませんでした');
        }
        messages.value = res.data.map((message) => ({
            ...message,
            sent_by_current_user: message.user_id === authData.user?.id
        }));
        console.log('Fetched messages:', messages.value);
    } catch (err) {
        console.error('メッセージ一覧を取得できませんでした', err);
        alert('メッセージの取得に失敗しました。ページをリロードしてください。');
    }
}

const sendMessage = (message) => {
    const authData = getAuthData();
    const user = authData.user;
    if (!user || !user.email) {
        console.error('User data is missing');
        return;
    }

    messageChannel.perform('receive', { content: message, email: user.email });
}

const updateMessages = (updatedMessage) => {
    const index = messages.value.findIndex(m => m.id === updatedMessage.id);
    if (index !== -1) {
        messages.value[index] = updatedMessage;
    }
}

let messageChannel

const setupActionCable = () => {
    messageChannel = $cable.subscriptions.create('RoomChannel', {
        connected() {
            console.log('Connected to RoomChannel');
            getMessages();
        },
        disconnected() {
            console.log('Disconnected from RoomChannel');
            setTimeout(() => {
                console.log('Attempting to reconnect...');
                setupActionCable();
            }, 3000);
        },
        received(data) {
            console.log('Raw received data:', data);
            const authData = getAuthData()
            const isSentByCurrentUser = data.email === authData.user.email

            const newMessage = {
                ...data,
                sent_by_current_user: isSentByCurrentUser
            }

            console.log('Processed received message:', newMessage);

            const existingIndex = messages.value.findIndex(m => m.id === newMessage.id);
            if (existingIndex !== -1) {
                messages.value[existingIndex] = newMessage;
            } else {
                messages.value.push(newMessage);
            }
        }
    })
}

onMounted(() => {
    if (!isAuthenticated()) {
        redirectToLogin();
        return;
    }

    const authData = getAuthData();
    if (authData.user) {
        username.value = authData.user.name || '';
        userEmail.value = authData.user.email || '';
    } else {
        console.error('User data is missing');
        redirectToLogin();
        return;
    }

    setupActionCable();
})

onBeforeUnmount(() => {
    if (messageChannel) {
        messageChannel.unsubscribe()
    }
})
</script>
