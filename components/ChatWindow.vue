<template>
    <div class="chat-window" ref="chatContainer">
        <div v-if="messages && messages.length" class="messages" ref="messageList">
            <div v-for="message in messages" :key="message.id" :class="['message-wrapper', messageClass(message)]">
                <div v-if="message.content" class="message-inner" @dblclick="handleDoubleClick(message)"
                    @touchstart="handleTouchStart($event, message)" @touchend="handleTouchEnd($event, message)"
                    @contextmenu.prevent="handleContextMenu($event, message)">
                    <div class="message-header">
                        <span class="name">{{ message.name }}</span>
                    </div>
                    <div class="message-content-wrapper">
                        <span class="message-content">{{ message.content }}</span>
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
    <!-- 削除確認モーダル -->
    <div v-if="showDeleteModal" class="modal-overlay">
        <div class="modal-content">
            <h2 class="modal-title">メッセージを削除</h2>
            <p class="modal-message">「{{ truncateMessage(selectedMessage) }}」のメッセージを削除してもよろしいですか？</p>
            <div class="modal-actions">
                <button @click="cancelDelete" class="btn-secondary">キャンセル</button>
                <button @click="confirmDelete" class="btn-danger">削除</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUpdated } from 'vue'
import { useNuxtApp } from '#app'
import { useCookiesAuth } from '../composables/useCookiesAuth'
import { formatDistanceToNow, isValid } from 'date-fns'
import { ja } from 'date-fns/locale'

const props = defineProps({
    messages: {
        type: Array,
        required: true,
        default: () => []
    }
})

const emit = defineEmits(['updateMessages', 'deleteMessage', 'showToast'])

const { $axios, $cable } = useNuxtApp()
const { getAuthData } = useCookiesAuth()

const chatContainer = ref(null)
const messageList = ref(null)
let lastTapTime = 0
let touchStartTime = 0
let longPressTimer: number | null = null
const scrolledToBottom = ref(false)
const scrollToBottomCalled = ref(0)

const showDeleteModal = ref(false)
const selectedMessage = ref(null)

const messages = ref(props.messages)

const messageClass = (message) => {
    const authData = getAuthData();
    return message && authData.user && message.user_id === authData.user.id ? 'sent' : 'received';
}

const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (!isValid(date)) {
        return '';
    }
    return formatDistanceToNow(date, { addSuffix: true, locale: ja })
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

const showToastNotification = (message) => {
    emit('showToast', message);
}

const createLike = async (message) => {
    try {
        if (!message || !message.id) {
            console.error('Invalid message object:', message);
            showToastNotification('メッセージが無効です。');
            return;
        }

        // クライアント側でメッセージの存在を確認
        const messageExists = messages.value.some(m => m.id === message.id);
        if (!messageExists) {
            console.error('Message does not exist in the client state');
            showToastNotification('このメッセージは既に削除されています。');
            return;
        }

        const authData = getAuthData();
        const res = await $axios.post(`/messages/${message.id}/likes`, {});

        if (!res || !res.data) {
            console.error('いいね操作に失敗しました');
            showToastNotification('いいね操作に失敗しました。');
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
        updateMessage(updatedMessage);
    } catch (error) {
        console.error('いいね操作エラー:', error);
        if (error.response && error.response.status === 404) {
            console.error('メッセージが見つかりません。削除された可能性があります。');
            showToastNotification('このメッセージは既に削除されています。');
            deleteMessage(message.id);
        } else {
            showToastNotification('いいね操作に失敗しました。');
        }
    }
};

const handleDoubleClick = (message) => {
    createLike(message);
}

const handleTouchStart = (event, message) => {
    touchStartTime = new Date().getTime();
    if (message.sent_by_current_user) {
        longPressTimer = setTimeout(() => {
            handleLongPress(message);
        }, 500);
    }
}

const handleTouchEnd = (event, message) => {
    const touchEndTime = new Date().getTime();
    const touchDuration = touchEndTime - touchStartTime;

    if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
    }

    if (touchDuration < 300) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTapTime;
        if (tapLength < 300 && tapLength > 0) {
            event.preventDefault();
            createLike(message);
        }
        lastTapTime = currentTime;
    }
}

const handleLongPress = (message) => {
    if (message.sent_by_current_user) {
        selectedMessage.value = message;
        showDeleteModal.value = true;
    }
}

const handleContextMenu = (event, message) => {
    if (message.sent_by_current_user) {
        event.preventDefault();
        selectedMessage.value = message;
        showDeleteModal.value = true;
    }
}

const cancelDelete = () => {
    showDeleteModal.value = false;
    selectedMessage.value = null;
}

const confirmDelete = () => {
    if (selectedMessage.value) {
        emit('deleteMessage', selectedMessage.value.id);
    }
    showDeleteModal.value = false;
    selectedMessage.value = null;
}

const truncateMessage = (message) => {
    if (!message || !message.content) return '';
    return message.content.length > 6
        ? message.content.slice(0, 6) + '...'
        : message.content;
}

const updateMessage = (updatedMessage) => {
    const index = messages.value.findIndex(m => m.id === updatedMessage.id);
    if (index !== -1) {
        messages.value[index] = updatedMessage;
    } else {
        messages.value.push(updatedMessage);
    }
    emit('updateMessages', messages.value);
}

const deleteMessage = (messageId) => {
    messages.value = messages.value.filter(m => m.id !== messageId);
    emit('updateMessages', messages.value);
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
            if (data.type === 'delete_message') {
                deleteMessage(data.id);
            } else if (data.type === 'new_message') {
                updateMessage(data);
            } else if (data.type === 'like_created' || data.type === 'like_deleted') {
                updateMessage(data);
            }
        }
    });
};

watch(() => props.messages, (newMessages) => {
    messages.value = newMessages.filter(message => message && message.content);
}, { deep: true })

watch(messages, () => {
    console.log('Messages updated, scheduling scroll');
    nextTick(() => {
        console.log('Next tick, scrolling to bottom');
        scrollToBottom()
    })
}, { deep: true })

onMounted(() => {
    console.log('Component mounted, scrolling to bottom');
    scrollToBottom();
    setupRoomChannel();
})

onUpdated(() => {
    console.log('Component updated, scrolling to bottom');
    scrollToBottom()
})

defineExpose({ scrollToBottom, scrolledToBottom, scrollToBottomCalled })
</script>
