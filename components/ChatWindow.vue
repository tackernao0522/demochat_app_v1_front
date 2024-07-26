<template>
    <div class="chat-window" ref="chatContainer">
        <div v-if="props.messages && props.messages.length" class="messages" ref="messageList">
            <div v-for="message in props.messages" :key="message.id"
                :class="['message-wrapper', messageClass(message)]">
                <div class="message-inner" @dblclick="handleDoubleClick(message)"
                    @touchstart="handleTouchStart($event, message)" @touchend="handleTouchEnd($event, message)">
                    <div class="message-header">
                        <span class="name">{{ message.name }}</span>
                    </div>
                    <div class="message-content-wrapper">
                        <span class="message-content">{{ message.content || '(空のメッセージ)' }}</span>
                        <div class="like-container group" v-if="message.likes && message.likes.length > 0">
                            <div class="like-button" @click.stop="createLike(message)">
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
                <span class="created-at">{{ formatDate(message.created_at) }}</span>
            </div>
        </div>
        <div v-else class="text-gray-500">メッセージがありません。</div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUpdated } from 'vue'
import { useNuxtApp } from '#app'
import { useCookiesAuth } from '../composables/useCookiesAuth'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

const props = defineProps({
    messages: {
        type: Array,
        required: true,
        default: () => []
    }
})

const emit = defineEmits(['updateMessages'])

const { $axios, $cable } = useNuxtApp()
const { getAuthData } = useCookiesAuth()

const chatContainer = ref(null)
const messageList = ref(null)
let lastTapTime = 0
let touchStartTime = 0
const scrolledToBottom = ref(false)
const scrollToBottomCalled = ref(0)

const messageClass = (message) => {
    const authData = getAuthData();
    return message && authData.user && message.user_id === authData.user.id ? 'sent' : 'received';
}

const formatDate = (dateString) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ja })
}

const scrollToBottom = () => {
    console.log('Scrolling to bottom');
    if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight
        scrolledToBottom.value = true
        scrollToBottomCalled.value++
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

const createLike = async (message) => {
    try {
        const authData = getAuthData();
        const res = await $axios.post(`/messages/${message.id}/likes`, {});

        if (!res || !res.data) {
            console.error('いいね操作に失敗しました');
            return;
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
    }
};

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
            createLike(message);
        }
        lastTapTime = currentTime;
    }
}

let roomChannel;

const setupRoomChannel = () => {
    roomChannel = $cable.subscriptions.create('RoomChannel', {
        connected() {
            console.log('Connected to RoomChannel');
        },
        disconnected() {
            console.log('Disconnected from RoomChannel');
        },
        received(data) {
            console.log('Received update:', data);
            const updatedMessageIndex = props.messages.findIndex(m => m.id === data.id);
            if (updatedMessageIndex !== -1) {
                const updatedMessage = {
                    ...props.messages[updatedMessageIndex],
                    ...data
                };
                emit('updateMessages', updatedMessage);
            }
        }
    });
};

watch(() => props.messages, (newMessages, oldMessages) => {
    console.log('Messages updated, scheduling scroll');
    if (newMessages && (!oldMessages || newMessages.length !== oldMessages.length)) {
        nextTick(() => {
            console.log('Next tick, scrolling to bottom');
            scrollToBottom()
        })
    }
}, { deep: true, immediate: true })

onMounted(() => {
    console.log('Component mounted, scrolling to bottom');
    scrollToBottom();
    setupRoomChannel();
})

onUpdated(() => {
    console.log('Component updated, scrolling to bottom');
    scrollToBottom()
})

// Expose scrollToBottom, scrolledToBottom, and scrollToBottomCalled for testing
defineExpose({ scrollToBottom, scrolledToBottom, scrollToBottomCalled })
</script>
