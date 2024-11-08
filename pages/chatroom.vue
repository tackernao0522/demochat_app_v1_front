<template>
    <client-only>
        <div class="page-container">
            <div class="chat-container">
                <Navbar :username="username" :userEmail="userEmail" />
                <ChatWindow :messages="messages" @updateMessages="updateMessages" @deleteMessage="deleteMessage"
                    @showToast="showToast" />
                <NewChatForm @newMessage="sendMessage" :websocketConnected="isConnected" />
            </div>
        </div>
        <div v-if="showToastNotification" class="toast-notification">
            {{ toastMessage }}
        </div>
    </client-only>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useNuxtApp } from '#app'
import Navbar from '../components/Navbar.vue'
import ChatWindow from '../components/ChatWindow.vue'
import NewChatForm from '../components/NewChatForm.vue'
import { useCookiesAuth } from '../composables/useCookiesAuth'
import { useRedirect } from '../composables/useRedirect'
import { logger } from '../utils/logger'

if (typeof definePageMeta !== 'undefined') {
    definePageMeta({
        middleware: ['auth'],
        requiresAuth: true
    })
}

const messages = ref([])
const username = ref('')
const userEmail = ref('')
const isConnected = ref(false)
const reconnectAttempts = ref(0)
const maxReconnectAttempts = 5
const pendingMessages = ref([])

const showToastNotification = ref(false)
const toastMessage = ref('')

const { $axios, $cable } = useNuxtApp()
const { getAuthData, isAuthenticated } = useCookiesAuth()
const { redirectToLogin } = useRedirect()

const showToast = (message) => {
    toastMessage.value = message;
    showToastNotification.value = true;
    setTimeout(() => {
        showToastNotification.value = false;
    }, 3000);
}

const getMessages = async () => {
    try {
        const authData = getAuthData();
        logger.debug("Auth Data in getMessages:", authData);
        if (!authData.token || !authData.client || !authData.uid) {
            logger.error("認証情報が不足しています");
            return;
        }
        const res = await $axios.get('/messages', {
            headers: {
                'access-token': authData.token,
                'client': authData.client,
                'uid': authData.uid
            }
        });
        if (!res || !res.data) {
            throw new Error('メッセージ一覧を取得できませんでした');
        }
        messages.value = res.data.map((message) => ({
            ...message,
            sent_by_current_user: message.user_id === authData.user?.id
        }));
        logger.debug('Fetched messages:', messages.value);
    } catch (err) {
        logger.error('メッセージ一覧を取得できませんでした', err);
        showToast('メッセージの取得に失敗しました。ページをリロードしてください。');
    }
}

const sendMessage = async (message) => {
    const authData = getAuthData();
    const user = authData.user;
    if (!user || !user.email) {
        logger.error('User data is missing');
        console.error('User data is missing');
        return;
    }

    const newMessage = { content: message, email: user.email, timestamp: Date.now() };
    pendingMessages.value.push(newMessage);

    if (!isConnected.value) {
        logger.warn('WebSocket not connected. Message queued.');
        console.warn('WebSocket not connected. Message queued.');
        await reconnectAndSendPendingMessages();
        return;
    }

    try {
        console.log('Attempting to send message:', newMessage);
        await messageChannel.perform('receive', newMessage);
        logger.debug('Message sent successfully:', newMessage);
        console.log('Message sent successfully:', newMessage);
    } catch (error) {
        logger.error('Failed to send message:', error);
        console.error('Failed to send message:', error);
        showToast('メッセージの送信に失敗しました。再度お試しください。');
    }
}

const updateMessages = (updatedMessageOrMessages) => {
    if (Array.isArray(updatedMessageOrMessages)) {
        messages.value = updatedMessageOrMessages;
    } else {
        const index = messages.value.findIndex(m => m.id === updatedMessageOrMessages.id);
        if (index !== -1) {
            messages.value[index] = { ...messages.value[index], ...updatedMessageOrMessages };
        } else {
            messages.value.push(updatedMessageOrMessages);
        }
    }
    messages.value = messages.value.filter(message => message && message.content);
    console.log('Messages updated:', messages.value);
};

const deleteMessage = async (messageId) => {
    try {
        const authData = getAuthData();
        await $axios.delete(`/messages/${messageId}`, {
            headers: {
                'access-token': authData.token,
                'client': authData.client,
                'uid': authData.uid
            }
        });
        messages.value = messages.value.filter(m => m.id !== messageId);
        logger.debug('Message deleted successfully:', messageId);
    } catch (error) {
        logger.error('メッセージの削除に失敗しました:', error);
        if (error.response && error.response.status === 404) {
            logger.warn('メッセージが既に削除されている可能性があります。ローカルの状態を更新します。');
            messages.value = messages.value.filter(m => m.id !== messageId);
        } else {
            showToast('メッセージの削除に失敗しました。');
        }
    }
}

let messageChannel;

const setupActionCable = () => {
    if (messageChannel) {
        messageChannel.unsubscribe();
    }

    const authData = getAuthData();
    messageChannel = $cable.subscriptions.create(
        {
            channel: 'RoomChannel',
            token: authData.token,
            client: authData.client,
            uid: authData.uid
        },
        {
            connected() {
                logger.info('Connected to RoomChannel');
                console.log('WebSocket connected');
                isConnected.value = true;
                reconnectAttempts.value = 0;
                getMessages();
                sendPendingMessages();
            },
            disconnected() {
                logger.warn('Disconnected from RoomChannel');
                console.log('WebSocket disconnected');
                isConnected.value = false;
                reconnectWithBackoff();
            },
            received(data) {
                logger.debug('Received data:', data);
                console.log('Received data:', data);
                const authData = getAuthData()

                const isSentByCurrentUser = data.email === authData.user.email
                const newMessage = {
                    ...data,
                    sent_by_current_user: isSentByCurrentUser
                }

                if (data.type === 'delete_message') {
                    messages.value = messages.value.filter(m => m.id !== data.id);
                } else if (data.type === 'new_message') {
                    updateMessages(newMessage);
                } else if (data.type === 'like_created' || data.type === 'like_deleted') {
                    updateMessages(newMessage);
                } else {
                    // 新しいメッセージやいいねの更新でない場合も、メッセージとして扱う
                    updateMessages(newMessage);
                }
            },
            rejected() {
                logger.error('Connection to RoomChannel was rejected');
                console.error('WebSocket connection rejected');
                isConnected.value = false;
                showToast('チャットルームへの接続が拒否されました。ページをリロードしてください。');
            }
        }
    )
}

const reconnectWithBackoff = () => {
    if (reconnectAttempts.value < maxReconnectAttempts) {
        reconnectAttempts.value++;
        const delay = Math.min(30000, 1000 * Math.pow(2, reconnectAttempts.value));
        logger.info(`Attempting to reconnect in ${delay}ms... (Attempt ${reconnectAttempts.value})`);
        setTimeout(setupActionCable, delay);
    } else {
        logger.error('Max reconnection attempts reached. Please refresh the page.');
        showToast('接続が切断されました。ページをリロードしてください。');
    }
}

const reconnectAndSendPendingMessages = async () => {
    await new Promise(resolve => {
        const checkConnection = () => {
            if (isConnected.value) {
                resolve(true);
            } else {
                setTimeout(checkConnection, 1000);
            }
        };
        checkConnection();
    });
    sendPendingMessages();
}

const sendPendingMessages = () => {
    while (pendingMessages.value.length > 0) {
        const message = pendingMessages.value.shift();
        messageChannel.perform('receive', message);
    }
}

onMounted(async () => {
    if (!await isAuthenticated()) {
        redirectToLogin();
        return;
    }

    const authData = getAuthData();
    if (authData.user) {
        username.value = authData.user.name || '';
        userEmail.value = authData.user.email || '';
    } else {
        logger.error('User data is missing');
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

watch(isConnected, (newValue) => {
    if (newValue) {
        logger.info('WebSocket connected');
        console.log('WebSocket connected');
    } else {
        logger.warn('WebSocket disconnected');
        console.log('WebSocket disconnected');
    }
});
</script>
