<template>
    <div class="chat-window" ref="chatContainer">
        <div v-if="props.messages.length" class="messages" ref="messageList">
            <div v-for="message in props.messages" :key="message.id"
                :class="['message-wrapper', messageClass(message)]">
                <div class="message-inner" @dblclick="handleDoubleClick(message)"
                    @touchstart="handleTouchStart($event, message)" @touchend="handleTouchEnd($event, message)">
                    <div class="message-header">
                        <span class="name">{{ message.name }}</span>
                        <span class="created-at">{{ formatDate(message.created_at) }}</span>
                    </div>
                    <div class="message-content-wrapper">
                        <span class="message-content">{{ message.content || '(空のメッセージ)' }}</span>
                        <div class="like-container group" v-if="message.likes && message.likes.length > 0">
                            <div class="like-button" @click.stop="handleLikeClick(message)">
                                <font-awesome-icon :icon="['fas', 'heart']"
                                    class="heart-icon text-red-500 cursor-pointer" />
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
import { ref, watch, nextTick, onMounted, onUpdated } from 'vue'
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
let touchStartTime = 0

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

const handleDoubleClick = (message) => {
    createLike(message);
}

const handleTouchStart = (event, message) => {
    touchStartTime = new Date().getTime();
}

const handleTouchEnd = (event, message) => {
    const touchEndTime = new Date().getTime();
    const touchDuration = touchEndTime - touchStartTime;

    if (touchDuration < 300) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTapTime;
        if (tapLength < 300 && tapLength > 0) {
            // ダブルタップとみなす
            createLike(message);
        }
        lastTapTime = currentTime;
    }
}

const handleLikeClick = (message) => {
    createLike(message);
}

watch(() => props.messages, async (newMessages) => {
    console.log('Messages in ChatWindow:', newMessages)
    await nextTick()
    scrollToBottom()
}, { deep: true })

onMounted(() => {
    scrollToBottom()
})

onUpdated(() => {
    scrollToBottom()
})
</script>
