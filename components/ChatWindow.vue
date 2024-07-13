<template>
    <div class="chat-window" ref="chatContainer">
        <div v-if="props.messages.length" class="messages" ref="messageList">
            <div v-for="message in props.messages" :key="message.id"
                :class="['message-wrapper', messageClass(message)]">
                <div class="message-inner cursor-pointer" @dblclick="createLike(message)"
                    @touchend="handleTouch(message)">
                    <div class="message-header">
                        <span class="name">{{ message.name }}</span>
                        <span class="created-at">{{ formatDate(message.created_at) }}</span>
                    </div>
                    <div class="message-content-wrapper">
                        <span class="message-content">{{ message.content || '(空のメッセージ)' }}</span>
                        <div class="like-container group" v-if="message.likes && message.likes.length > 0">
                            <div class="like-button">
                                <font-awesome-icon :icon="['fas', 'heart']"
                                    class="heart-icon text-red-500 cursor-pointer" @click.stop="createLike(message)" />
                                <span class="like-count">{{ message.likes.length }}</span>
                            </div>
                            <div class="chat-tooltip">
                                {{ getLikeUsers(message) }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="text-gray-500">メッセージがありません。</div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount, onUpdated } from 'vue'
import { useNuxtApp } from '#app'
import { useCookiesAuth } from '../composables/useCookiesAuth'
import debounce from 'lodash/debounce'

const props = defineProps({
    messages: {
        type: Array,
        required: true
    }
})

const emit = defineEmits(['updateMessages'])

const { $axios } = useNuxtApp()
const { getAuthData } = useCookiesAuth()

const chatContainer = ref(null)
const messageList = ref(null)
let lastTapTime = 0

const messageClass = (message) => {
    const authData = getAuthData();
    return message && authData.user && message.user_id === authData.user.id ? 'sent' : 'received';
}

const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('ja-JP')
}

const scrollToBottom = () => {
    if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
}

const hasLiked = (message) => {
    const authData = getAuthData();
    return message && message.likes && Array.isArray(message.likes) &&
        authData.user && authData.user.email &&
        message.likes.some(like => like.email === authData.user.email);
}

const getLikeUsers = (message) => {
    if (!message.likes || message.likes.length === 0) return '';
    const likeUsers = message.likes.map(like => like.name || like.email).join(', ');
    return `いいねしたユーザー: ${likeUsers}`;
}

const createLike = debounce(async (message) => {
    try {
        const authData = getAuthData();
        const res = await $axios.post(`/messages/${message.id}/likes`, {});

        if (!res || !res.data) {
            throw new Error('いいね操作に失敗しました');
        }

        let updatedLikes;
        if (hasLiked(message)) {
            updatedLikes = message.likes.filter(like => like.email !== authData.user.email);
        } else {
            updatedLikes = [...(message.likes || []), { id: res.data.id, email: authData.user.email, name: authData.user.name }];
        }

        const updatedMessage = {
            ...message,
            likes: updatedLikes
        };
        emit('updateMessages', updatedMessage);

    } catch (error) {
        console.error('いいね操作エラー:', error);
        if (error.response) {
            console.error('エラーレスポンス:', error.response.data);
            console.error('エラーステータス:', error.response.status);
            console.error('エラーヘッダー:', error.response.headers);
        }
        alert('いいね操作に失敗しました。もう一度お試しください。');
    }
}, 300);

const handleTouch = (message) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;
    if (tapLength < 500 && tapLength > 0) {
        // ダブルタップとみなす
        createLike(message);
    }
    lastTapTime = currentTime;
}

const disableZoom = () => {
    // metaタグでズームを無効にする
    const metaTag = document.createElement('meta')
    metaTag.name = 'viewport'
    metaTag.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
    document.head.appendChild(metaTag)

    // CSSでズームを無効にする
    const style = document.createElement('style')
    style.innerHTML = `
    body {
      touch-action: none;
    }
  `
    document.head.appendChild(style)

    // JavaScriptでズームを無効にする
    const preventZoom = (event) => {
        // Shift + Enter での改行を許可する
        if (event.shiftKey && event.key === 'Enter') {
            return
        }

        if (event.ctrlKey || event.metaKey || event.key === 'Control' || event.key === 'Meta') {
            event.preventDefault()
        }
    }

    const preventWheelZoom = (event) => {
        if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
        }
    }

    document.addEventListener('wheel', preventWheelZoom, { passive: false })
    document.addEventListener('keydown', preventZoom, { passive: false })

    return { metaTag, style, preventZoom, preventWheelZoom }
}

const enableZoom = (zoomSettings) => {
    document.head.removeChild(zoomSettings.metaTag)
    document.head.removeChild(zoomSettings.style)
    document.removeEventListener('wheel', zoomSettings.preventWheelZoom)
    document.removeEventListener('keydown', zoomSettings.preventZoom)
}

let zoomSettings;

watch(() => props.messages, async (newMessages) => {
    console.log('Messages in ChatWindow:', newMessages)
    await nextTick()
    scrollToBottom()
}, { deep: true })

onMounted(() => {
    scrollToBottom()
    zoomSettings = disableZoom()
})

onBeforeUnmount(() => {
    if (messageChannel) {
        messageChannel.unsubscribe()
    }
    if (zoomSettings) {
        enableZoom(zoomSettings)
    }
})

onUpdated(() => {
    scrollToBottom()
})
</script>
